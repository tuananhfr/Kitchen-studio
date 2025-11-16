/**
 * DrawingPreview - Shows preview while drawing
 */

import React from 'react';
import { Group, Line, Text, Circle } from 'react-konva';
import type { Point2D, Tool2D } from '../../../types';

interface DrawingPreviewProps {
  start: Point2D;
  end: Point2D;
  tool: Tool2D;
}

const DrawingPreview: React.FC<DrawingPreviewProps> = ({ start, end, tool }) => {
  /**
   * Calculate distance
   */
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  /**
   * Render based on tool type
   */
  if (tool === 'wall') {
    return (
      <Group>
        {/* Preview line */}
        <Line
          points={[start.x, start.y, end.x, end.y]}
          stroke="#4a90e2"
          strokeWidth={3}
          dash={[10, 5]}
          opacity={0.7}
          listening={false}
        />

        {/* Start point */}
        <Circle
          x={start.x}
          y={start.y}
          radius={4}
          fill="#4a90e2"
          listening={false}
        />

        {/* End point */}
        <Circle
          x={end.x}
          y={end.y}
          radius={4}
          fill="#4a90e2"
          listening={false}
        />

        {/* Length label */}
        <Text
          x={(start.x + end.x) / 2 - 30}
          y={(start.y + end.y) / 2 - 20}
          text={`${Math.round(distance)} cm`}
          fontSize={14}
          fill="#4a90e2"
          fontStyle="bold"
          listening={false}
        />

        {/* Angle indicator (if not horizontal/vertical) */}
        {Math.abs(dx) > 5 && Math.abs(dy) > 5 && (
          <Text
            x={start.x + 10}
            y={start.y - 20}
            text={`${Math.round(Math.atan2(dy, dx) * 180 / Math.PI)}°`}
            fontSize={12}
            fill="#666"
            listening={false}
          />
        )}
      </Group>
    );
  }

  if (tool === 'measure') {
    return (
      <Group>
        {/* Measurement line */}
        <Line
          points={[start.x, start.y, end.x, end.y]}
          stroke="#28a745"
          strokeWidth={2}
          dash={[5, 5]}
          listening={false}
        />

        {/* Start marker */}
        <Line
          points={[start.x - 5, start.y - 5, start.x + 5, start.y + 5]}
          stroke="#28a745"
          strokeWidth={2}
          listening={false}
        />
        <Line
          points={[start.x + 5, start.y - 5, start.x - 5, start.y + 5]}
          stroke="#28a745"
          strokeWidth={2}
          listening={false}
        />

        {/* End marker */}
        <Line
          points={[end.x - 5, end.y - 5, end.x + 5, end.y + 5]}
          stroke="#28a745"
          strokeWidth={2}
          listening={false}
        />
        <Line
          points={[end.x + 5, end.y - 5, end.x - 5, end.y + 5]}
          stroke="#28a745"
          strokeWidth={2}
          listening={false}
        />

        {/* Distance label */}
        <Text
          x={(start.x + end.x) / 2 - 40}
          y={(start.y + end.y) / 2 - 25}
          text={`Distance: ${Math.round(distance)} cm`}
          fontSize={14}
          fill="#28a745"
          padding={5}
          fontStyle="bold"
          listening={false}
        />

        {/* Coordinates */}
        <Text
          x={start.x - 50}
          y={start.y + 10}
          text={`(${Math.round(start.x)}, ${Math.round(start.y)})`}
          fontSize={11}
          fill="#666"
          listening={false}
        />
        <Text
          x={end.x - 50}
          y={end.y + 10}
          text={`(${Math.round(end.x)}, ${Math.round(end.y)})`}
          fontSize={11}
          fill="#666"
          listening={false}
        />
      </Group>
    );
  }

  return null;
};

export default DrawingPreview;
