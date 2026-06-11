import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { readToken, prefersReducedMotion } from '../lib/motion';
import { useThemeVersion } from '../hooks/useThemeVersion';

const MOBILE_MQ = '(max-width: 767px)';
const POINTER_FINE_MQ = '(pointer: fine)';

function sageColor(): THREE.Color {
  return new THREE.Color(readToken('--sage') || '#6B7F60');
}

function isInHeadlineBand(
  x: number,
  y: number,
  width: number,
  height: number,
): boolean {
  const centerX = width / 2;
  const centerY = height / 2;
  return (
    Math.abs(x - centerX) < width * 0.2 &&
    Math.abs(y - centerY) < height * 0.18
  );
}

function samplePosition(width: number, height: number): [number, number] {
  let attempts = 0;
  while (attempts < 50) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    if (!isInHeadlineBand(x, y, width, height)) return [x, y];
    attempts++;
  }
  return [Math.random() * width, Math.random() * height];
}

function toSceneCoords(px: number, py: number, width: number, height: number) {
  return {
    x: px - width / 2,
    y: height / 2 - py,
  };
}

type NodeMeta = {
  baseX: number;
  baseY: number;
  amp: number;
  freq: number;
  phase: number;
  size: number;
  repelX: number;
  repelY: number;
};

type EdgePair = [number, number];

function buildEdges(
  bases: { x: number; y: number }[],
  threshold: number,
  maxPerNode: number,
): EdgePair[] {
  const edges: EdgePair[] = [];
  const edgeSet = new Set<string>();
  const counts = new Array(bases.length).fill(0);

  const candidates: { i: number; j: number; dist: number }[] = [];
  for (let i = 0; i < bases.length; i++) {
    for (let j = i + 1; j < bases.length; j++) {
      const dx = bases[i].x - bases[j].x;
      const dy = bases[i].y - bases[j].y;
      const dist = Math.hypot(dx, dy);
      if (dist < threshold) {
        candidates.push({ i, j, dist });
      }
    }
  }
  candidates.sort((a, b) => a.dist - b.dist);

  for (const { i, j } of candidates) {
    if (counts[i] >= maxPerNode || counts[j] >= maxPerNode) continue;
    const key = i < j ? `${i}-${j}` : `${j}-${i}`;
    if (edgeSet.has(key)) continue;
    edgeSet.add(key);
    counts[i]++;
    counts[j]++;
    edges.push([i, j]);
  }

  return edges;
}

const GraphField: React.FC = () => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const themeVersion = useThemeVersion();
  const [webglOk, setWebglOk] = useState(true);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const canvas = canvasRef.current;
    if (!wrapper || !canvas) return;

    const gl =
      canvas.getContext('webgl2') ?? canvas.getContext('webgl');
    if (!gl) {
      setWebglOk(false);
      return;
    }

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: false,
        powerPreference: 'low-power',
      });
    } catch {
      setWebglOk(false);
      return;
    }

    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    camera.position.z = 1;

    const isMobile = () => window.matchMedia(MOBILE_MQ).matches;
    const hasFinePointer = () => window.matchMedia(POINTER_FINE_MQ).matches;
    const reduced = prefersReducedMotion();

    let width = 0;
    let height = 0;
    let nodeCount = 0;
    let nodesMeta: NodeMeta[] = [];
    let edges: EdgePair[] = [];
    let points: THREE.Points | null = null;
    let lines: THREE.LineSegments | null = null;
    let pointsGeo: THREE.BufferGeometry | null = null;
    let linesGeo: THREE.BufferGeometry | null = null;
    let pointsMat: THREE.PointsMaterial | null = null;
    let linesMat: THREE.LineBasicMaterial | null = null;

    let rafId = 0;
    let running = false;
    let visible = true;
    let introProgress = reduced ? 1 : 0;
    const introDuration = 1.2;

    let pointerX = -9999;
    let pointerY = -9999;

    const applyTheme = () => {
      if (!pointsMat || !linesMat) return;
      pointsMat.color.copy(sageColor());
      linesMat.color.copy(sageColor());
      pointsMat.opacity = 0.55 * introProgress;
      linesMat.opacity = 0.16 * introProgress;
      pointsMat.needsUpdate = true;
      linesMat.needsUpdate = true;
    };

    const rebuildScene = () => {
      if (pointsGeo) pointsGeo.dispose();
      if (linesGeo) linesGeo.dispose();
      if (pointsMat) pointsMat.dispose();
      if (linesMat) linesMat.dispose();
      if (points) scene.remove(points);
      if (lines) scene.remove(lines);

      const rect = wrapper.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);

      const dpr = Math.min(
        window.devicePixelRatio,
        isMobile() ? 1.5 : 2,
      );
      renderer.setPixelRatio(dpr);
      renderer.setSize(width, height, false);

      camera.left = -width / 2;
      camera.right = width / 2;
      camera.top = height / 2;
      camera.bottom = -height / 2;
      camera.updateProjectionMatrix();

      nodeCount = isMobile() ? 55 : 110;
      const threshold = isMobile() ? 90 : 120;

      const bases: { x: number; y: number }[] = [];
      nodesMeta = [];

      for (let i = 0; i < nodeCount; i++) {
        const [px, py] = samplePosition(width, height);
        bases.push({ x: px, y: py });
        nodesMeta.push({
          baseX: px,
          baseY: py,
          amp: 6 + Math.random() * 8,
          freq: 0.1 + Math.random() * 0.2,
          phase: Math.random() * Math.PI * 2,
          size: 1.5 + Math.random() * 1.5,
          repelX: 0,
          repelY: 0,
        });
      }

      edges = buildEdges(bases, threshold, 3);

      const positions = new Float32Array(nodeCount * 3);
      const sizes = new Float32Array(nodeCount);

      for (let i = 0; i < nodeCount; i++) {
        const { x, y } = toSceneCoords(bases[i].x, bases[i].y, width, height);
        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = 0;
        sizes[i] = nodesMeta[i].size;
      }

      pointsGeo = new THREE.BufferGeometry();
      pointsGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      pointsGeo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

      pointsMat = new THREE.PointsMaterial({
        color: sageColor(),
        size: 2,
        sizeAttenuation: false,
        transparent: true,
        opacity: reduced ? 0.55 : 0,
        depthWrite: false,
      });

      points = new THREE.Points(pointsGeo, pointsMat);
      scene.add(points);

      const linePositions = new Float32Array(edges.length * 6);
      linesGeo = new THREE.BufferGeometry();
      linesGeo.setAttribute(
        'position',
        new THREE.BufferAttribute(linePositions, 3),
      );

      linesMat = new THREE.LineBasicMaterial({
        color: sageColor(),
        transparent: true,
        opacity: reduced ? 0.16 : 0,
        depthWrite: false,
      });

      lines = new THREE.LineSegments(linesGeo, linesMat);
      scene.add(lines);

      applyTheme();
      if (reduced) {
        renderer.render(scene, camera);
      }
    };

    const updatePositions = (t: number) => {
      if (!pointsGeo || !linesGeo) return;
      const posAttr = pointsGeo.getAttribute('position') as THREE.BufferAttribute;
      const lineAttr = linesGeo.getAttribute('position') as THREE.BufferAttribute;
      const posArr = posAttr.array as Float32Array;
      const lineArr = lineAttr.array as Float32Array;

      const repelRadius = 140;

      for (let i = 0; i < nodeCount; i++) {
        const meta = nodesMeta[i];
        let px =
          meta.baseX +
          meta.amp * Math.sin(t * meta.freq + meta.phase);
        let py =
          meta.baseY +
          meta.amp * Math.cos(t * meta.freq * 0.87 + meta.phase);

        if (hasFinePointer() && pointerX >= 0) {
          const dx = px - pointerX;
          const dy = py - pointerY;
          const dist = Math.hypot(dx, dy);
          let targetRepelX = 0;
          let targetRepelY = 0;
          if (dist < repelRadius && dist > 0.001) {
            const force = (1 - dist / repelRadius) * 28;
            targetRepelX = (dx / dist) * force;
            targetRepelY = (dy / dist) * force;
          }
          meta.repelX += (targetRepelX - meta.repelX) * 0.06;
          meta.repelY += (targetRepelY - meta.repelY) * 0.06;
          px += meta.repelX;
          py += meta.repelY;
        }

        const { x, y } = toSceneCoords(px, py, width, height);
        posArr[i * 3] = x;
        posArr[i * 3 + 1] = y;
      }
      posAttr.needsUpdate = true;

      let li = 0;
      for (const [a, b] of edges) {
        lineArr[li++] = posArr[a * 3];
        lineArr[li++] = posArr[a * 3 + 1];
        lineArr[li++] = 0;
        lineArr[li++] = posArr[b * 3];
        lineArr[li++] = posArr[b * 3 + 1];
        lineArr[li++] = 0;
      }
      lineAttr.needsUpdate = true;
    };

    const tick = (now: number) => {
      if (!running) return;
      const t = now * 0.001;

      if (introProgress < 1) {
        introProgress = Math.min(1, introProgress + 1 / 60 / introDuration);
        if (pointsMat) pointsMat.opacity = 0.55 * introProgress;
        if (linesMat) linesMat.opacity = 0.16 * introProgress;
      }

      updatePositions(t);
      renderer.render(scene, camera);
      rafId = requestAnimationFrame(tick);
    };

    const startLoop = () => {
      if (reduced || running || !visible) return;
      running = true;
      rafId = requestAnimationFrame(tick);
    };

    const stopLoop = () => {
      running = false;
      cancelAnimationFrame(rafId);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!hasFinePointer() || !wrapper) return;
      const rect = wrapper.getBoundingClientRect();
      pointerX = e.clientX - rect.left;
      pointerY = e.clientY - rect.top;
    };

    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        stopLoop();
      } else if (visible) {
        startLoop();
      }
    };

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible && document.visibilityState === 'visible') {
          startLoop();
        } else {
          stopLoop();
        }
      },
      { threshold: 0 },
    );

    const resizeObserver = new ResizeObserver(() => {
      rebuildScene();
    });

    rebuildScene();
    intersectionObserver.observe(wrapper);
    resizeObserver.observe(wrapper);

    if (!reduced) {
      startLoop();
      window.addEventListener('pointermove', onPointerMove, { passive: true });
      document.addEventListener('visibilitychange', onVisibility);
    }

    return () => {
      stopLoop();
      window.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('visibilitychange', onVisibility);
      intersectionObserver.disconnect();
      resizeObserver.disconnect();
      if (pointsGeo) pointsGeo.dispose();
      if (linesGeo) linesGeo.dispose();
      if (pointsMat) pointsMat.dispose();
      if (linesMat) linesMat.dispose();
      renderer.dispose();
    };
  }, [themeVersion]);

  if (!webglOk) return null;

  return (
    <div
      ref={wrapperRef}
      className="absolute inset-0 z-0 pointer-events-none"
      aria-hidden="true"
      data-graph-field
    >
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
};

export default GraphField;
