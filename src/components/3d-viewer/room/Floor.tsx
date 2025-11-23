/**
 * Floor - 3D floor plane (supports both rectangular and polygon shapes)
 */

import React, { useMemo } from "react";
import * as THREE from "three";

interface FloorProps {
  width?: number;
  depth?: number;
  polygon?: Array<[number, number]>; // 2D polygon points (X, Z)
  position?: [number, number, number];
  color?: string;
  height?: number; // If provided, extrude the shape (for footprint)
}

const Floor: React.FC<FloorProps> = ({
  width,
  depth,
  polygon,
  position = [0, 0, 0],
  color = "#cccccc",
  height,
}) => {
  // Create geometry based on polygon or dimensions
  const geometry = useMemo(() => {
    if (polygon && polygon.length >= 3) {
      // Create shape from polygon
      const shape = new THREE.Shape();

      // Start from first point
      shape.moveTo(polygon[0][0], polygon[0][1]);

      // Draw lines to other points
      for (let i = 1; i < polygon.length; i++) {
        shape.lineTo(polygon[i][0], polygon[i][1]);
      }

      // Close the shape
      shape.closePath();

      // If height is provided, extrude the shape (for footprint)
      if (height) {
        const extrudeSettings = {
          depth: height,
          bevelEnabled: false,
        };
        const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

        // ExtrudeGeometry extrudes along Z axis, but we need it along Y axis
        // So we need to rotate it differently
        return geometry;
      }

      // Otherwise, flat shape
      return new THREE.ShapeGeometry(shape);
    } else if (width && depth) {
      // Fallback to rectangular floor
      return new THREE.PlaneGeometry(width, depth);
    }

    // Default fallback
    return new THREE.PlaneGeometry(100, 100);
  }, [polygon, width, depth, height]);

  return (
    <mesh
      position={position}
      rotation={height ? [-Math.PI / 2, 0, 0] : [-Math.PI / 2, 0, 0]}
      receiveShadow
      castShadow
      geometry={geometry}
    >
      <meshStandardMaterial
        color={color}
        side={height ? THREE.DoubleSide : THREE.FrontSide}
      />
    </mesh>
  );
};

export default Floor;
