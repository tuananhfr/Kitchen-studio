/**
 * Footprint - Thick line along inner edge of walls (chân tường)
 * Renders as tube geometry following the footprint polygon
 */

import React, { useMemo } from 'react';
import * as THREE from 'three';

interface FootprintProps {
  polygon: Array<[number, number]>; // 2D polygon points (X, Z)
  thickness: number; // Wall thickness (e.g., 20cm)
  height: number; // Footprint height (e.g., 0.5cm)
  color?: string;
}

const Footprint: React.FC<FootprintProps> = ({
  polygon,
  thickness,
  height,
  color = '#1a1a1a'
}) => {
  const geometry = useMemo(() => {
    if (polygon.length < 2) return null;

    // Create a closed path from polygon points
    const points: THREE.Vector3[] = [];

    for (let i = 0; i < polygon.length; i++) {
      points.push(new THREE.Vector3(polygon[i][0], 0, polygon[i][1]));
    }

    // Close the loop
    points.push(new THREE.Vector3(polygon[0][0], 0, polygon[0][1]));

    // Create a curve from points
    const curve = new THREE.CatmullRomCurve3(points, false);

    // Create tube geometry (thick line)
    // Tube radius = thickness / 2 to match wall thickness
    const tubeGeometry = new THREE.TubeGeometry(
      curve,
      polygon.length * 4, // segments
      thickness / 2, // radius (half of wall thickness)
      8, // radial segments
      false // not closed tube
    );

    return tubeGeometry;
  }, [polygon, thickness]);

  if (!geometry) return null;

  return (
    <mesh
      position={[0, height / 2, 0]}
      geometry={geometry}
      castShadow
      receiveShadow
    >
      <meshStandardMaterial color={color} />
    </mesh>
  );
};

export default Footprint;
