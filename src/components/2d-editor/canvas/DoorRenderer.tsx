/**
 * DoorRenderer - Renders a door on the canvas
 */

import React, { useState } from 'react';
import { Group, Rect, Arc, Line, Circle, Text } from 'react-konva';
import { useFloorPlanStore } from '../../../stores';
import type { Door } from '../../../types';

interface DoorRendererProps {
  door: Door;
}

const DoorRenderer: React.FC<DoorRendererProps> = ({ door }) => {
  const [isHovered, setIsHovered] = useState(false);
  const selectedItemId = useFloorPlanStore((state) => state.selectedItemId);
  const setSelectedItem = useFloorPlanStore((state) => state.setSelectedItem);
  const getWall = useFloorPlanStore((state) => state.getWall);
  const updateDoor = useFloorPlanStore((state) => state.updateDoor);

  const isSelected = selectedItemId === door.id;

  // Get parent wall
  const wall = getWall(door.wallId);
  if (!wall) return null;

  /**
   * Calculate door position on wall
   */
  const wallDx = wall.end.x - wall.start.x;
  const wallDy = wall.end.y - wall.start.y;
  const wallLength = Math.sqrt(wallDx * wallDx + wallDy * wallDy);

  // Door position along wall (0 to 1)
  const doorX = wall.start.x + wallDx * door.position;
  const doorY = wall.start.y + wallDy * door.position;

  // Wall direction (normalized)
  const dirX = wallDx / wallLength;
  const dirY = wallDy / wallLength;

  // Door frame points
  const doorStart = {
    x: doorX - dirX * (door.width / 2),
    y: doorY - dirY * (door.width / 2)
  };
  const doorEnd = {
    x: doorX + dirX * (door.width / 2),
    y: doorY + dirY * (door.width / 2)
  };

  /**
   * Calculate door swing arc angle
   */
  const wallAngle = Math.atan2(wallDy, wallDx) * (180 / Math.PI);
  const swingDirection = door.swing === 'inward' ? 1 : -1;

  /**
   * Handle door click
   */
  const handleClick = () => {
    setSelectedItem(door.id, 'door');
  };

  /**
   * Handle door drag (move along wall)
   */
  const handleDrag = (x: number, y: number) => {
    // Project cursor position onto wall to find new position (0-1)
    const dx = x - wall.start.x;
    const dy = y - wall.start.y;

    // Dot product to project onto wall direction
    const t = (dx * wallDx + dy * wallDy) / (wallLength * wallLength);

    // Clamp to wall bounds (0-1)
    const newPosition = Math.max(0, Math.min(1, t));

    updateDoor(door.id, { position: newPosition });
  };

  /**
   * Toggle door swing direction
   */
  const handleDoubleClick = () => {
    const newSwing = door.swing === 'inward' ? 'outward' : 'inward';
    updateDoor(door.id, { swing: newSwing });
  };

  return (
    <Group
      onClick={handleClick}
      onTap={handleClick}
      onDblClick={handleDoubleClick}
      onDblTap={handleDoubleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Door frame (cutout in wall) */}
      <Line
        points={[doorStart.x, doorStart.y, doorEnd.x, doorEnd.y]}
        stroke={isSelected ? '#4a90e2' : '#8b4513'}
        strokeWidth={isSelected ? 4 : 3}
      />

      {/* Door panel (swinging) */}
      {door.doorType === 'single' && (
        <>
          {/* Door swing arc */}
          <Arc
            x={doorStart.x}
            y={doorStart.y}
            innerRadius={0}
            outerRadius={door.width}
            angle={door.swingAngle}
            rotation={wallAngle + (swingDirection > 0 ? 0 : -door.swingAngle)}
            stroke={isSelected ? '#4a90e2' : '#8b4513'}
            strokeWidth={1}
            dash={[3, 3]}
            listening={false}
          />

          {/* Door panel line */}
          <Line
            points={[
              doorStart.x,
              doorStart.y,
              doorStart.x + Math.cos((wallAngle + swingDirection * door.swingAngle) * Math.PI / 180) * door.width,
              doorStart.y + Math.sin((wallAngle + swingDirection * door.swingAngle) * Math.PI / 180) * door.width
            ]}
            stroke={isSelected ? '#4a90e2' : '#8b4513'}
            strokeWidth={2}
            listening={false}
          />
        </>
      )}

      {/* Door type: Sliding */}
      {door.doorType === 'sliding' && (
        <>
          <Rect
            x={doorStart.x - door.width / 4}
            y={doorStart.y - 2}
            width={door.width / 2}
            height={4}
            fill={isSelected ? '#4a90e2' : '#8b4513'}
            opacity={0.6}
          />
          <Line
            points={[
              doorStart.x,
              doorStart.y,
              doorStart.x + dirX * door.width * 0.8,
              doorStart.y + dirY * door.width * 0.8
            ]}
            stroke={isSelected ? '#4a90e2' : '#8b4513'}
            strokeWidth={2}
            dash={[5, 5]}
            listening={false}
          />
        </>
      )}

      {/* Drag handle (when selected) */}
      {isSelected && (
        <Circle
          x={doorX}
          y={doorY}
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
            x={doorX - 25}
            y={doorY - 30}
            width={50}
            height={20}
            fill="white"
            stroke="#8b4513"
            cornerRadius={3}
            listening={false}
          />
          <Text
            x={doorX - 25}
            y={doorY - 26}
            width={50}
            text={`${door.width}cm`}
            fontSize={11}
            fontFamily="Arial"
            fill="#8b4513"
            align="center"
            verticalAlign="middle"
            listening={false}
          />
        </>
      )}
    </Group>
  );
};

export default DoorRenderer;
