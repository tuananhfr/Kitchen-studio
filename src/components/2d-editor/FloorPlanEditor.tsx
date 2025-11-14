/**
 * FloorPlanEditor - 2D Floor Plan Editor
 * Main container for 2D editing with React-Konva
 */

import React, { useEffect } from 'react';
import { useFloorPlanStore } from '../../stores';
import Canvas2D from './canvas/Canvas2D';

const FloorPlanEditor: React.FC = () => {
  const floorPlan = useFloorPlanStore((state) => state.floorPlan);
  const createFloorPlan = useFloorPlanStore((state) => state.createFloorPlan);

  /**
   * Initialize floor plan if not exists
   */
  useEffect(() => {
    if (!floorPlan) {
      // Create default floor plan
      createFloorPlan('My Kitchen', 400, 400, 240);
    }
  }, [floorPlan, createFloorPlan]);

  if (!floorPlan) {
    return (
      <div className="canvas-2d-container d-flex align-items-center justify-content-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return <Canvas2D />;
};

export default FloorPlanEditor;
