/**
 * SnapIndicator - Visual indicator for snap points
 * Shows a circle/highlight when hovering near wall endpoints
 */

import React from 'react';
import { Circle, Ring } from 'react-konva';
import type { Point2D } from '../../../types';

interface SnapIndicatorProps {
  point: Point2D;
  snapped: boolean;
}

const SnapIndicator: React.FC<SnapIndicatorProps> = ({ point, snapped }) => {
  if (!snapped) return null;

  return (
    <>
      {/* Outer ring - pulsing effect */}
      <Ring
        x={point.x}
        y={point.y}
        innerRadius={6}
        outerRadius={10}
        fill="#2196F3"
        opacity={0.3}
      />

      {/* Inner circle - solid indicator */}
      <Circle
        x={point.x}
        y={point.y}
        radius={5}
        fill="#2196F3"
        stroke="#FFFFFF"
        strokeWidth={2}
        shadowColor="#2196F3"
        shadowBlur={8}
        shadowOpacity={0.6}
      />
    </>
  );
};

export default SnapIndicator;
