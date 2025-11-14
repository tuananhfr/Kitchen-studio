/**
 * WallHighlight - Shows which wall will receive door/window
 */

import React from 'react';
import { Group, Line, Circle, Rect } from 'react-konva';
import type { Wall } from '../../../types';
import { getPointOnWall } from '../../../utils/geometryUtils';

interface WallHighlightProps {
  wall: Wall;
  position: number; // 0-1 position along wall
  width: number; // Width of door/window to place
  type: 'door' | 'window';
  isValid: boolean;
}

const WallHighlight: React.FC<WallHighlightProps> = ({
  wall,
  position,
  width,
  type,
  isValid
}) => {
  // Get point on wall
  const point = getPointOnWall(wall, position);

  // Calculate wall direction
  const dx = wall.end.x - wall.start.x;
  const dy = wall.end.y - wall.start.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  const dirX = dx / length;
  const dirY = dy / length;

  // Highlight area
  const halfWidth = width / 2;
  const highlightStart = {
    x: point.x - dirX * halfWidth,
    y: point.y - dirY * halfWidth
  };
  const highlightEnd = {
    x: point.x + dirX * halfWidth,
    y: point.y + dirY * halfWidth
  };

  // Perpendicular direction
  const perpX = -dirY;
  const perpY = dirX;
  const offset = wall.thickness / 2 + 5;

  const color = isValid ? '#28a745' : '#dc3545'; // Green if valid, red if invalid

  return (
    <Group>
      {/* Highlight on wall */}
      <Line
        points={[highlightStart.x, highlightStart.y, highlightEnd.x, highlightEnd.y]}
        stroke={color}
        strokeWidth={wall.thickness + 4}
        opacity={0.3}
        listening={false}
      />

      {/* Center marker */}
      <Circle
        x={point.x}
        y={point.y}
        radius={5}
        fill={color}
        stroke="white"
        strokeWidth={2}
        listening={false}
      />

      {/* Label */}
      <Rect
        x={point.x + perpX * offset - 30}
        y={point.y + perpY * offset - 12}
        width={60}
        height={24}
        fill={color}
        cornerRadius={4}
        listening={false}
      />

      {/* Info text would go here with react-konva Text component */}
    </Group>
  );
};

export default WallHighlight;
