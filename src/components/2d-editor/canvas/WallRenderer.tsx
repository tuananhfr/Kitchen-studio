/**
 * WallRenderer - Renders a wall on the canvas
 */

import React, { useState } from 'react';
import { Group, Line, Rect, Circle, Text } from 'react-konva';
import { useFloorPlanStore } from '../../../stores';
import type { Wall } from '../../../types';

interface WallRendererProps {
  wall: Wall;
}

const WallRenderer: React.FC<WallRendererProps> = ({ wall }) => {
  const [isHovered, setIsHovered] = useState(false);
  const selectedItemId = useFloorPlanStore((state) => state.selectedItemId);
  const setSelectedItem = useFloorPlanStore((state) => state.setSelectedItem);
  const updateWall = useFloorPlanStore((state) => state.updateWall);

  const isSelected = selectedItemId === wall.id;

  /**
   * Calculate wall direction and perpendicular vector
   */
  const dx = wall.end.x - wall.start.x;
  const dy = wall.end.y - wall.start.y;
  const length = Math.sqrt(dx * dx + dy * dy);

  // Perpendicular vector (for thickness)
  const perpX = -dy / length;
  const perpY = dx / length;
  const halfThickness = wall.thickness / 2;

  /**
   * Wall corner points (for filled rectangle)
   */
  const corner1 = {
    x: wall.start.x + perpX * halfThickness,
    y: wall.start.y + perpY * halfThickness
  };
  const corner2 = {
    x: wall.start.x - perpX * halfThickness,
    y: wall.start.y - perpY * halfThickness
  };
  const corner3 = {
    x: wall.end.x - perpX * halfThickness,
    y: wall.end.y - perpY * halfThickness
  };
  const corner4 = {
    x: wall.end.x + perpX * halfThickness,
    y: wall.end.y + perpY * halfThickness
  };

  /**
   * Handle wall click
   */
  const handleClick = () => {
    setSelectedItem(wall.id, 'wall');
  };

  /**
   * Handle endpoint drag
   */
  const handleEndpointDrag = (endpoint: 'start' | 'end', x: number, y: number) => {
    updateWall(wall.id, {
      [endpoint]: { x, y }
    });
  };

  return (
    <Group>
      {/* Wall fill (clickable area) */}
      <Line
        points={[
          corner1.x, corner1.y,
          corner2.x, corner2.y,
          corner3.x, corner3.y,
          corner4.x, corner4.y
        ]}
        closed
        fill={isSelected ? 'rgba(74, 144, 226, 0.2)' : 'rgba(51, 51, 51, 0.2)'}
        stroke={isSelected ? '#4a90e2' : isHovered ? '#666666' : '#333333'}
        strokeWidth={isSelected ? 3 : 2}
        onClick={handleClick}
        onTap={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      />

      {/* Wall centerline (for reference) */}
      <Line
        points={[wall.start.x, wall.start.y, wall.end.x, wall.end.y]}
        stroke={isSelected ? '#4a90e2' : '#999999'}
        strokeWidth={1}
        dash={[5, 5]}
        listening={false}
        opacity={0.5}
      />

      {/* Endpoints (draggable when selected) */}
      {isSelected && (
        <>
          <Circle
            x={wall.start.x}
            y={wall.start.y}
            radius={6}
            fill="#4a90e2"
            stroke="white"
            strokeWidth={2}
            draggable
            onDragMove={(e) => {
              handleEndpointDrag('start', e.target.x(), e.target.y());
            }}
          />
          <Circle
            x={wall.end.x}
            y={wall.end.y}
            radius={6}
            fill="#4a90e2"
            stroke="white"
            strokeWidth={2}
            draggable
            onDragMove={(e) => {
              handleEndpointDrag('end', e.target.x(), e.target.y());
            }}
          />
        </>
      )}

      {/* Length label */}
      {(isSelected || isHovered) && (
        <>
          <Rect
            x={(wall.start.x + wall.end.x) / 2 - 30}
            y={(wall.start.y + wall.end.y) / 2 - 10}
            width={60}
            height={20}
            fill="white"
            stroke="#333"
            cornerRadius={3}
            listening={false}
          />
          <Text
            x={(wall.start.x + wall.end.x) / 2 - 30}
            y={(wall.start.y + wall.end.y) / 2 - 6}
            width={60}
            text={`${Math.round(length)} cm`}
            fontSize={12}
            fontFamily="Arial"
            fill="#333"
            align="center"
            verticalAlign="middle"
            listening={false}
          />
        </>
      )}
    </Group>
  );
};

export default WallRenderer;
