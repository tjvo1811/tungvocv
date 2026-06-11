import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const EASE_OUT = 'power3.out';
export const EASE_EXPO = 'expo.out';

export const readToken = (name: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim();

export { gsap, ScrollTrigger, SplitText, useGSAP };
