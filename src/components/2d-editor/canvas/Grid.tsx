/**
 * Grid Component - Renders grid on canvas
 */

import React from 'react';
import { Line } from 'react-konva';

interface GridProps {
  width: number;
  height: number;
  gridSize: number;
  scale: number;
}

const Grid: React.FC<GridProps> = ({ width, height, gridSize, scale }) => {
  const lines: React.ReactElement[] = [];

  // Calculate grid bounds based on current view
  const padding = 1000; // Extra padding for panning
  const startX = -padding;
  const endX = width / scale + padding;
  const startY = -padding;
  const endY = height / scale + padding;

  // Vertical lines
  for (let x = Math.floor(startX / gridSize) * gridSize; x < endX; x += gridSize) {
    const isMajor = x % (gridSize * 5) === 0;

    lines.push(
      <Line
        key={`v-${x}`}
        points={[x, startY, x, endY]}
        stroke={isMajor ? '#d0d0d0' : '#e8e8e8'}
        strokeWidth={isMajor ? 1 / scale : 0.5 / scale}
        listening={false}
      />
    );
  }

  // Horizontal lines
  for (let y = Math.floor(startY / gridSize) * gridSize; y < endY; y += gridSize) {
    const isMajor = y % (gridSize * 5) === 0;

    lines.push(
      <Line
        key={`h-${y}`}
        points={[startX, y, endX, y]}
        stroke={isMajor ? '#d0d0d0' : '#e8e8e8'}
        strokeWidth={isMajor ? 1 / scale : 0.5 / scale}
        listening={false}
      />
    );
  }

  // Origin axes (X and Y at 0)
  lines.push(
    <Line
      key="axis-x"
      points={[startX, 0, endX, 0]}
      stroke="#4a90e2"
      strokeWidth={2 / scale}
      listening={false}
      opacity={0.5}
    />,
    <Line
      key="axis-y"
      points={[0, startY, 0, endY]}
      stroke="#4a90e2"
      strokeWidth={2 / scale}
      listening={false}
      opacity={0.5}
    />
  );

  return <>{lines}</>;
};

export default Grid;
