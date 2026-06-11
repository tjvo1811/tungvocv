import React, { useRef } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { useTabEntrance } from '../hooks/useTabEntrance';
import { useUnderlineDraw, useStaircaseLineDraw } from '../hooks/useScrollEffects';

type TabPanelProps = HTMLMotionProps<'main'> & {
  tabId: string;
  children: React.ReactNode;
};

export const TabPanel: React.FC<TabPanelProps> = ({
  tabId,
  children,
  className,
  ...motionProps
}) => {
  const ref = useRef<HTMLElement>(null);
  useTabEntrance(ref);
  useUnderlineDraw(ref);
  useStaircaseLineDraw(ref, tabId === 'leadership' || tabId === 'work');

  return (
    <motion.main
      ref={ref}
      id={`section-${tabId}`}
      data-tab-panel={tabId}
      className={className}
      {...motionProps}
    >
      {children}
    </motion.main>
  );
};
