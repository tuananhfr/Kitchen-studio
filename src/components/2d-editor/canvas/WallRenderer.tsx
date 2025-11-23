/**
 * WallRenderer - Renders a wall on the canvas with junction merging
 */

import React, { useState, useMemo } from 'react';
import { Group, Line, Rect, Circle, Text } from 'react-konva';
import { useFloorPlanStore } from '../../../stores';
import type { Wall } from '../../../types';
import { detectJunctions, getAdjustedWallCorners } from '../../../utils/wallJunctions';

interface WallRendererProps {
  wall: Wall;
}

const WallRenderer: React.FC<WallRendererProps> = ({ wall }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [hoveredEndpoint, setHoveredEndpoint] = useState<'start' | 'end' | null>(null);
  const selectedItemId = useFloorPlanStore((state) => state.selectedItemId);
  const setSelectedItem = useFloorPlanStore((state) => state.setSelectedItem);
  const updateWall = useFloorPlanStore((state) => state.updateWall);
  const floorPlan = useFloorPlanStore((state) => state.floorPlan);
  const currentTool = useFloorPlanStore((state) => state.currentTool);
  const hoveredEndpointPoint = useFloorPlanStore((state) => state.hoveredEndpointPoint);
  const setHoveredEndpointPoint = useFloorPlanStore((state) => state.setHoveredEndpointPoint);

  const isSelected = selectedItemId === wall.id;

  // Check if this wall is connected to the hovered endpoint
  const connectionToHoveredEndpoint = useMemo(() => {
    if (!hoveredEndpointPoint) return { connected: false, atStart: false, atEnd: false };
    const tolerance = 2;
    const startMatch =
      Math.abs(wall.start.x - hoveredEndpointPoint.x) < tolerance &&
      Math.abs(wall.start.y - hoveredEndpointPoint.y) < tolerance;
    const endMatch =
      Math.abs(wall.end.x - hoveredEndpointPoint.x) < tolerance &&
      Math.abs(wall.end.y - hoveredEndpointPoint.y) < tolerance;
    return {
      connected: startMatch || endMatch,
      atStart: startMatch,
      atEnd: endMatch
    };
  }, [wall, hoveredEndpointPoint]);

  const isConnectedToHoveredEndpoint = connectionToHoveredEndpoint.connected;

  /**
   * Calculate wall direction and length
   */
  const dx = wall.end.x - wall.start.x;
  const dy = wall.end.y - wall.start.y;
  const length = Math.sqrt(dx * dx + dy * dy);

  /**
   * Calculate wall corners with junction merging
   * Returns: { outer: [4 points], inner: [4 points] }
   */
  const cornerPoints = useMemo(() => {
    if (!floorPlan) return null;

    // Detect all junctions in the floor plan
    const junctions = detectJunctions(floorPlan.walls);

    // Get adjusted corners for this wall (all 4 corners of the wall rectangle)
    const adjustedCorners = getAdjustedWallCorners(wall, floorPlan.walls, junctions);

    // Calculate wall direction
    // const dx = wall.end.x - wall.start.x;
    // const dy = wall.end.y - wall.start.y;
    // const length = Math.sqrt(dx * dx + dy * dy);

    // Perpendicular vector (pointing left from wall direction)
    // const perpX = -dy / length;
    // const perpY = dx / length;
    // const halfThickness = wall.thickness / 2;

    // Outer edge (left side from wall perspective, away from room)
    const outerEdge = [
      adjustedCorners[0], // corner1 (start + perp)
      adjustedCorners[3]  // corner4 (end + perp)
    ];

    // Inner edge (right side from wall perspective, toward room)
    const innerEdge = [
      adjustedCorners[1], // corner2 (start - perp)
      adjustedCorners[2]  // corner3 (end - perp)
    ];

    return {
      all: adjustedCorners,
      outer: outerEdge,
      inner: innerEdge
    };
  }, [wall, floorPlan]);

  /**
   * Handle wall click - toggle select/deselect
   */
  const handleClick = () => {
    if (isSelected) {
      // Already selected → deselect
      setSelectedItem(null, null);
    } else {
      // Not selected → select
      setSelectedItem(wall.id, 'wall');
    }
  };

  /**
   * Handle endpoint drag - move all connected walls
   */
  const handleEndpointDrag = (endpoint: 'start' | 'end', x: number, y: number) => {
    if (!floorPlan) return;

    const oldPoint = endpoint === 'start' ? wall.start : wall.end;
    const newPoint = { x, y };

    // Find all walls that share this endpoint
    const tolerance = 2;
    const connectedWalls = floorPlan.walls.filter(w => {
      if (w.id === wall.id) return true; // Always include current wall

      const startMatch =
        Math.abs(w.start.x - oldPoint.x) < tolerance &&
        Math.abs(w.start.y - oldPoint.y) < tolerance;

      const endMatch =
        Math.abs(w.end.x - oldPoint.x) < tolerance &&
        Math.abs(w.end.y - oldPoint.y) < tolerance;

      return startMatch || endMatch;
    });

    // Update all connected walls
    connectedWalls.forEach(w => {
      const startMatches =
        Math.abs(w.start.x - oldPoint.x) < tolerance &&
        Math.abs(w.start.y - oldPoint.y) < tolerance;

      const endMatches =
        Math.abs(w.end.x - oldPoint.x) < tolerance &&
        Math.abs(w.end.y - oldPoint.y) < tolerance;

      if (startMatches && endMatches) {
        // Both endpoints match - move both
        updateWall(w.id, {
          start: newPoint,
          end: newPoint
        });
      } else if (startMatches) {
        // Only start matches
        updateWall(w.id, {
          start: newPoint
        });
      } else if (endMatches) {
        // Only end matches
        updateWall(w.id, {
          end: newPoint
        });
      }
    });
  };

  // If no corner points calculated, return null
  if (!cornerPoints) return null;

  // Flatten corner points for Konva Line component
  const flatPoints = cornerPoints.all.flatMap(p => [p.x, p.y]);

  return (
    <Group>
      {/* Wall fill (clickable area) with merged corners */}
      <Line
        points={flatPoints}
        closed
        fill={isSelected || isConnectedToHoveredEndpoint ? 'rgba(74, 144, 226, 0.3)' : 'rgba(51, 51, 51, 0.3)'}
        stroke="transparent"
        strokeWidth={0}
        onClick={handleClick}
        onTap={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        perfectDrawEnabled={false}
      />

      {/* Simple double-line strokes (outer + inner) - hides miter */}
      {!isHovered && !isSelected && !isConnectedToHoveredEndpoint && (
        <>
          {/* Outer edge (away from room) */}
          <Line
            points={[
              cornerPoints.outer[0].x, cornerPoints.outer[0].y,
              cornerPoints.outer[1].x, cornerPoints.outer[1].y
            ]}
            stroke="#333333"
            strokeWidth={2.5}
            lineCap="butt"
            listening={false}
            perfectDrawEnabled={false}
          />

          {/* Inner edge (toward room) */}
          <Line
            points={[
              cornerPoints.inner[0].x, cornerPoints.inner[0].y,
              cornerPoints.inner[1].x, cornerPoints.inner[1].y
            ]}
            stroke="#333333"
            strokeWidth={2.5}
            lineCap="butt"
            listening={false}
            perfectDrawEnabled={false}
          />
        </>
      )}

      {/* True miter stroke - only shown on hover/select (but not at hovered endpoint) */}
      {(isHovered || isSelected || isConnectedToHoveredEndpoint) && (
        <>
          {/* If connected to hovered endpoint: draw simple lines instead of miter */}
          {isConnectedToHoveredEndpoint ? (
            <>
              {/* Outer edge (full length) */}
              <Line
                points={[
                  cornerPoints.outer[0].x, cornerPoints.outer[0].y,
                  cornerPoints.outer[1].x, cornerPoints.outer[1].y
                ]}
                stroke={isSelected || isConnectedToHoveredEndpoint ? '#4a90e2' : '#666666'}
                strokeWidth={isSelected || isConnectedToHoveredEndpoint ? 3 : 2}
                lineCap="butt"
                listening={false}
              />

              {/* Inner edge (full length) */}
              <Line
                points={[
                  cornerPoints.inner[0].x, cornerPoints.inner[0].y,
                  cornerPoints.inner[1].x, cornerPoints.inner[1].y
                ]}
                stroke={isSelected || isConnectedToHoveredEndpoint ? '#4a90e2' : '#666666'}
                strokeWidth={isSelected || isConnectedToHoveredEndpoint ? 3 : 2}
                lineCap="butt"
                listening={false}
              />
            </>
          ) : (
            /* Full miter polygon stroke (when NOT connected to hovered endpoint) */
            <Line
              points={flatPoints}
              closed
              stroke={isSelected ? '#4a90e2' : '#666666'}
              strokeWidth={isSelected ? 3 : 2}
              listening={false}
            />
          )}
        </>
      )}

      {/* Wall centerline (for reference) */}
      <Line
        points={[wall.start.x, wall.start.y, wall.end.x, wall.end.y]}
        stroke={isSelected ? '#4a90e2' : '#999999'}
        strokeWidth={1}
        dash={[5, 5]}
        listening={false}
        opacity={0.5}
      />

      {/* Endpoints (always visible in select mode, hover to show) */}
      {currentTool === 'select' && (
        <>
          <Circle
            x={wall.start.x}
            y={wall.start.y}
            radius={hoveredEndpoint === 'start' ? 8 : 6}
            fill={hoveredEndpoint === 'start' ? '#ef4444' : '#4a90e2'}
            stroke="white"
            strokeWidth={2}
            opacity={hoveredEndpoint === 'start' ? 1 : 0.5}
            draggable
            onMouseEnter={() => {
              setHoveredEndpoint('start');
              setHoveredEndpointPoint(wall.start);
            }}
            onMouseLeave={() => {
              setHoveredEndpoint(null);
              setHoveredEndpointPoint(null);
            }}
            onDragMove={(e) => {
              const pos = e.target.position();
              handleEndpointDrag('start', pos.x, pos.y);
            }}
            onDragEnd={(e) => {
              // Reset circle position to wall endpoint
              e.target.position({ x: wall.start.x, y: wall.start.y });
            }}
          />
          <Circle
            x={wall.end.x}
            y={wall.end.y}
            radius={hoveredEndpoint === 'end' ? 8 : 6}
            fill={hoveredEndpoint === 'end' ? '#ef4444' : '#4a90e2'}
            stroke="white"
            strokeWidth={2}
            opacity={hoveredEndpoint === 'end' ? 1 : 0.5}
            draggable
            onMouseEnter={() => {
              setHoveredEndpoint('end');
              setHoveredEndpointPoint(wall.end);
            }}
            onMouseLeave={() => {
              setHoveredEndpoint(null);
              setHoveredEndpointPoint(null);
            }}
            onDragMove={(e) => {
              const pos = e.target.position();
              handleEndpointDrag('end', pos.x, pos.y);
            }}
            onDragEnd={(e) => {
              // Reset circle position to wall endpoint
              e.target.position({ x: wall.end.x, y: wall.end.y });
            }}
          />
        </>
      )}

      {/* Length label - chỉ hiện khi hover hoặc select, không hiện khi hover endpoint */}
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
