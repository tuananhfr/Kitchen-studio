/**
 * UnifiedWallRenderer - Renders connected walls as merged unified shapes
 * Connected walls are merged into single polygons (like 1 wall)
 */

import React from 'react';
import { Group, Line } from 'react-konva';
import type { Wall } from '../../../types';
import { useWallMerge } from '../../../hooks/useWallMerge';

interface UnifiedWallRendererProps {
  walls: Wall[];
  onWallClick?: (wallId: string) => void;
}

const UnifiedWallRenderer: React.FC<UnifiedWallRendererProps> = ({
  walls,
  onWallClick
}) => {
  /**
   * Merge connected walls into unified polygons
   */
  const mergedGroups = useWallMerge(walls);

  return (
    <Group>
      {/* Render each merged group as a single unified shape */}
      {mergedGroups.map((group) => {
        const flatPoints = group.polygon.flatMap(p => [p.x, p.y]);

        return (
          <React.Fragment key={group.id}>
            {/* Merged wall group - appears as 1 wall */}
            <Line
              points={flatPoints}
              closed
              fill="rgba(51, 51, 51, 0.2)"
              stroke="#333333"
              strokeWidth={2}
              onClick={() => {
                // Click any wall in the group
                if (onWallClick && group.wallIds.length > 0) {
                  onWallClick(group.wallIds[0]);
                }
              }}
              onTap={() => {
                if (onWallClick && group.wallIds.length > 0) {
                  onWallClick(group.wallIds[0]);
                }
              }}
            />

            {/* Centerlines for each wall in group (for reference) */}
            {group.wallIds.map(wallId => {
              const wall = walls.find(w => w.id === wallId);
              if (!wall) return null;

              return (
                <Line
                  key={`centerline-${wallId}`}
                  points={[wall.start.x, wall.start.y, wall.end.x, wall.end.y]}
                  stroke="#999999"
                  strokeWidth={1}
                  dash={[5, 5]}
                  listening={false}
                  opacity={0.5}
                />
              );
            })}
          </React.Fragment>
        );
      })}
    </Group>
  );
};

export default UnifiedWallRenderer;
