/**
 * WindowRenderer - Renders a window on the canvas
 */

import React, { useState } from 'react';
import { Group, Rect, Line, Circle, Text } from 'react-konva';
import { useFloorPlanStore } from '../../../stores';
import type { Window } from '../../../types';

interface WindowRendererProps {
  window: Window;
}

const WindowRenderer: React.FC<WindowRendererProps> = ({ window }) => {
  const [isHovered, setIsHovered] = useState(false);
  const selectedItemId = useFloorPlanStore((state) => state.selectedItemId);
  const setSelectedItem = useFloorPlanStore((state) => state.setSelectedItem);
  const getWall = useFloorPlanStore((state) => state.getWall);
  const updateWindow = useFloorPlanStore((state) => state.updateWindow);

  const isSelected = selectedItemId === window.id;

  // Get parent wall
  const wall = getWall(window.wallId);
  if (!wall) return null;

  /**
   * Calculate window position on wall
   */
  const wallDx = wall.end.x - wall.start.x;
  const wallDy = wall.end.y - wall.start.y;
  const wallLength = Math.sqrt(wallDx * wallDx + wallDy * wallDy);

  // Window position along wall (0 to 1)
  const windowX = wall.start.x + wallDx * window.position;
  const windowY = wall.start.y + wallDy * window.position;

  // Wall direction (normalized)
  const dirX = wallDx / wallLength;
  const dirY = wallDy / wallLength;

  // Perpendicular direction
  const perpX = -dirY;
  const perpY = dirX;

  // Window frame points
  const windowStart = {
    x: windowX - dirX * (window.width / 2),
    y: windowY - dirY * (window.width / 2)
  };
  const windowEnd = {
    x: windowX + dirX * (window.width / 2),
    y: windowY + dirY * (window.width / 2)
  };

  // Window sill (inside)
  const sillOffset = wall.thickness / 4;
  const sillStart = {
    x: windowStart.x + perpX * sillOffset,
    y: windowStart.y + perpY * sillOffset
  };
  const sillEnd = {
    x: windowEnd.x + perpX * sillOffset,
    y: windowEnd.y + perpY * sillOffset
  };

  /**
   * Handle window click
   */
  const handleClick = () => {
    setSelectedItem(window.id, 'window');
  };

  /**
   * Handle window drag (move along wall)
   */
  const handleDrag = (x: number, y: number) => {
    // Project cursor position onto wall to find new position (0-1)
    const dx = x - wall.start.x;
    const dy = y - wall.start.y;

    // Dot product to project onto wall direction
    const t = (dx * wallDx + dy * wallDy) / (wallLength * wallLength);

    // Clamp to wall bounds (0-1)
    const newPosition = Math.max(0, Math.min(1, t));

    updateWindow(window.id, { position: newPosition });
  };

  return (
    <Group
      onClick={handleClick}
      onTap={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Window frame (cutout in wall) */}
      <Line
        points={[windowStart.x, windowStart.y, windowEnd.x, windowEnd.y]}
        stroke={isSelected ? '#4a90e2' : '#87ceeb'}
        strokeWidth={isSelected ? 5 : 4}
      />

      {/* Window glass (slightly inside) */}
      <Line
        points={[
          windowStart.x + perpX * 2,
          windowStart.y + perpY * 2,
          windowEnd.x + perpX * 2,
          windowEnd.y + perpY * 2
        ]}
        stroke={isSelected ? '#4a90e2' : '#87ceeb'}
        strokeWidth={2}
        opacity={0.6}
      />

      {/* Window sill */}
      <Rect
        x={Math.min(sillStart.x, sillEnd.x) - 2}
        y={Math.min(sillStart.y, sillEnd.y) - 2}
        width={window.width + 4}
        height={4}
        fill="#8b7355"
        opacity={0.7}
        listening={false}
      />

      {/* Window dividers (for multi-pane windows) */}
      {window.windowType !== 'fixed' && (
        <>
          {/* Vertical divider */}
          <Line
            points={[
              windowX + perpX * 2,
              windowY + perpY * 2,
              windowX - perpX * 2,
              windowY - perpY * 2
            ]}
            stroke="#87ceeb"
            strokeWidth={1}
            opacity={0.5}
            listening={false}
          />

          {/* Horizontal divider */}
          {window.height > 80 && (
            <Line
              points={[
                windowStart.x + dirX * window.width * 0.5,
                windowStart.y + dirY * window.width * 0.5,
                windowEnd.x - dirX * window.width * 0.5,
                windowEnd.y - dirY * window.width * 0.5
              ]}
              stroke="#87ceeb"
              strokeWidth={1}
              opacity={0.5}
              listening={false}
            />
          )}
        </>
      )}

      {/* Drag handle (when selected) */}
      {isSelected && (
        <Circle
          x={windowX}
          y={windowY}
          radius={8}
          fill="#4a90e2"
          stroke="white"
          strokeWidth={2}
          draggable
          onDragMove={(e) => {
            handleDrag(e.target.x(), e.target.y());
          }}
        />
      )}

      {/* Hover/Selected label */}
      {(isSelected || isHovered) && (
        <>
          <Rect
            x={windowX - 30}
            y={windowY - 35}
            width={60}
            height={20}
            fill="white"
            stroke="#87ceeb"
            cornerRadius={3}
            listening={false}
          />
          <Text
            x={windowX - 30}
            y={windowY - 31}
            width={60}
            text={`${window.width}cm`}
            fontSize={11}
            fontFamily="Arial"
            fill="#87ceeb"
            align="center"
            verticalAlign="middle"
            listening={false}
          />
        </>
      )}
    </Group>
  );
};

export default WindowRenderer;
