
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Activity } from 'lucide-react';

// --- GRAPH THEORY DIAGRAM ---
// Represents "Vertex connectivity" and "Zero forcing sets"
export const GraphTheoryDiagram: React.FC = () => {
  // A simple graph structure
  const [activeNodes, setActiveNodes] = useState<number[]>([0]);
  
  // Adjacency list
  const graph = {
    0: [1, 2],
    1: [0, 3, 4],
    2: [0, 4, 5],
    3: [1],
    4: [1, 2],
    5: [2]
  };

  const nodePositions = [
    { x: '50%', y: '20%' }, // 0 Top
    { x: '30%', y: '50%' }, // 1 Left
    { x: '70%', y: '50%' }, // 2 Right
    { x: '10%', y: '80%' }, // 3 Bottom Left
    { x: '50%', y: '70%' }, // 4 Middle Low
    { x: '90%', y: '80%' }, // 5 Bottom Right
  ];

  const toggleNode = (id: number) => {
    // Simple propagation logic for fun: activating a node activates neighbors
    setActiveNodes(prev => {
        if (prev.includes(id)) return prev.filter(n => n !== id);
        return [...prev, id];
    });
  };

  return (
    <div className="flex flex-col items-center p-8 bg-white rounded-xl shadow-sm border border-stone-200 my-8">
      <h3 className="font-serif text-xl mb-4 text-stone-800">Network Dynamics Model</h3>
      
      <div className="relative w-64 h-64 bg-[#F5F4F0] rounded-lg border border-stone-200 p-4">
         
         {/* Edges */}
         <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <line x1="50%" y1="20%" x2="30%" y2="50%" stroke="#d6d3d1" strokeWidth="2" />
            <line x1="50%" y1="20%" x2="70%" y2="50%" stroke="#d6d3d1" strokeWidth="2" />
            <line x1="30%" y1="50%" x2="10%" y2="80%" stroke="#d6d3d1" strokeWidth="2" />
            <line x1="30%" y1="50%" x2="50%" y2="70%" stroke="#d6d3d1" strokeWidth="2" />
            <line x1="70%" y1="50%" x2="50%" y2="70%" stroke="#d6d3d1" strokeWidth="2" />
            <line x1="70%" y1="50%" x2="90%" y2="80%" stroke="#d6d3d1" strokeWidth="2" />
         </svg>

         {/* Nodes */}
         {nodePositions.map((pos, id) => (
             <motion.button
                key={id}
                onClick={() => toggleNode(id)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={`absolute w-8 h-8 -ml-4 -mt-4 rounded-full border-2 flex items-center justify-center transition-all duration-300 z-10 ${activeNodes.includes(id) ? 'bg-stone-800 border-stone-900 text-nobel-gold shadow-lg' : 'bg-white border-stone-300'}`}
                style={{ left: pos.x, top: pos.y }}
             >
                {id}
             </motion.button>
         ))}
      </div>
      <div className="mt-4 text-xs font-mono text-stone-500">
          Visualizing vertex connectivity in graph families.
      </div>
    </div>
  );
};

