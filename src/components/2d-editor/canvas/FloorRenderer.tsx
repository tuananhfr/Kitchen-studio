/**
 * FloorRenderer - Renders floor (sàn) in 2D canvas
 * Uses inner edges of walls to create floor polygon
 */

import React, { useMemo } from 'react';
import { Line } from 'react-konva';
import { useFloorPlanStore } from '../../../stores';
import { getFloorPolygon } from '../../../utils/floorPolygon';

const FloorRenderer: React.FC = () => {
  const floorPlan = useFloorPlanStore((state) => state.floorPlan);

  /**
   * Calculate floor polygon from walls
   */
  const floorPolygon = useMemo(() => {
    if (!floorPlan || floorPlan.walls.length < 2) {
      return null;
    }

    return getFloorPolygon(floorPlan.walls);
  }, [floorPlan?.walls]);

  // If no polygon, don't render
  if (!floorPolygon || floorPolygon.length < 3) {
    return null;
  }

  // Flatten polygon points for Konva
  const points = floorPolygon.flatMap(p => [p.x, p.y]);

  return (
    <Line
      points={points}
      closed
      fill="#c19a6b" // Same color as 3D floor (wood color)
      stroke="#c19a6b" // Stroke same color as fill to cover gap
      strokeWidth={3} // Thick stroke to ensure it touches inner wall edge
      listening={false}
      opacity={0.8}
      perfectDrawEnabled={false}
    />
  );
};

export default FloorRenderer;
