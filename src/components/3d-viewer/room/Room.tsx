/**
 * Room - Complete 3D room from floor plan
 */

import React, { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useFloorPlanStore } from '../../../stores';
import { floorPlanTo3D } from '../../../utils/floorPlanTo3D';
import type { Wall3D } from '../../../utils/floorPlanTo3D';
import Floor from './Floor';
import Wall from './Wall';
import Door from './Door';
import Window from './Window';
import * as THREE from 'three';

/**
 * Wall component with dynamic opacity based on camera position
 */
interface WallWithOpacityProps {
  wall: Wall3D;
  color: string;
  opacityRef: React.MutableRefObject<Record<string, { current: number; target: number }>>;
}

const WallWithOpacity: React.FC<WallWithOpacityProps> = ({ wall, color, opacityRef }) => {
  const [opacityValue, setOpacityValue] = React.useState(1.0);

  // Update opacity value periodically (throttled)
  useFrame(() => {
    if (opacityRef.current[wall.id]) {
      const newOpacity = opacityRef.current[wall.id].current;
      // Only update if changed significantly
      if (Math.abs(newOpacity - opacityValue) > 0.05) {
        setOpacityValue(newOpacity);
      }
    }
  });

  return <Wall wall={wall} color={color} opacityValue={opacityValue} />;
};

// Reusable vectors to avoid creating new objects every frame
const tempWallPos = new THREE.Vector3();
const tempWallNormal = new THREE.Vector3();
const tempWallToCenter = new THREE.Vector3();
const tempWallToCamera = new THREE.Vector3();

/**
 * Calculate if camera is on the "outside" of a wall
 * (the side facing away from room center)
 */
function isWallBetweenCameraAndRoom(
  wall: Wall3D,
  cameraPos: THREE.Vector3,
  roomCenter: THREE.Vector3
): boolean {
  // Wall position (reuse temp vector)
  tempWallPos.set(wall.position[0], wall.position[1], wall.position[2]);

  // Wall rotation angle around Y axis
  const wallAngle = wall.rotation[1];

  // Calculate wall normal (perpendicular to wall, pointing outward)
  // For a wall rotated by angle around Y, the normal is perpendicular
  tempWallNormal.set(
    -Math.sin(wallAngle), // Perpendicular to wall direction
    0,
    Math.cos(wallAngle)
  );

  // Vector from wall to room center
  tempWallToCenter.subVectors(roomCenter, tempWallPos);

  // Determine which direction is "outward" (away from room center)
  // If normal points toward center, flip it
  if (tempWallNormal.dot(tempWallToCenter) > 0) {
    tempWallNormal.negate();
  }

  // Vector from wall to camera
  tempWallToCamera.subVectors(cameraPos, tempWallPos);

  // Distance from camera to wall (perpendicular distance using dot product)
  const distanceToWall = tempWallNormal.dot(tempWallToCamera);

  // Wall should be hidden if camera is on the outside with significant distance
  // Using a threshold to avoid flickering at the boundary
  const threshold = 50; // cm threshold (increased for more stability)
  return distanceToWall > threshold;
}

const Room: React.FC = () => {
  const floorPlan = useFloorPlanStore((state) => state.floorPlan);
  const { camera } = useThree();

  // Ref to track wall opacities (using ref to avoid re-renders)
  const wallOpacitiesRef = useRef<Record<string, { current: number; target: number }>>({});

  // Ref to track wall hidden state with frame counter for stability
  const wallHiddenStateRef = useRef<Record<string, {
    hidden: boolean;
    counter: number;
    lastShouldHide: boolean;
  }>>({});

  // Convert 2D floor plan to 3D
  const scene3D = useMemo(() => {
    if (!floorPlan) return null;
    try {
      return floorPlanTo3D(floorPlan);
    } catch (error) {
      console.error('Error converting floor plan to 3D:', error);
      return null;
    }
  }, [floorPlan]);

  // Calculate room center
  const roomCenter = useMemo(() => {
    if (!scene3D) return new THREE.Vector3(0, 0, 0);
    const centerX = (scene3D.bounds.minX + scene3D.bounds.maxX) / 2;
    const centerZ = (scene3D.bounds.minY + scene3D.bounds.maxY) / 2;
    return new THREE.Vector3(centerX, 100, centerZ);
  }, [scene3D]);

  // Frame counter to throttle calculations
  const frameCounterRef = useRef<number>(0);

  // Update wall opacities based on camera position (IKEA-style wall hiding)
  useFrame((state, delta) => {
    if (!scene3D) return;

    const cameraPos = camera.position;
    const lerpSpeed = 10; // Speed of transition (faster for instant hide/show effect)
    const stabilityFrames = 6; // Number of consistent frames needed to change state
    const checkInterval = 3; // Only check visibility every N frames

    // Increment frame counter
    frameCounterRef.current++;

    scene3D.walls.forEach((wall) => {
      // Initialize opacity tracking for this wall if not exists
      if (!wallOpacitiesRef.current[wall.id]) {
        wallOpacitiesRef.current[wall.id] = { current: 1.0, target: 1.0 };
        wallHiddenStateRef.current[wall.id] = {
          hidden: false,
          counter: 0,
          lastShouldHide: false
        };
      }

      // Only check visibility every N frames to reduce jitter
      if (frameCounterRef.current % checkInterval === 0) {
        // Check if wall should be hidden
        const shouldHide = isWallBetweenCameraAndRoom(wall, cameraPos, roomCenter);

        // Get current state
        const state = wallHiddenStateRef.current[wall.id];

        // Check if shouldHide changed from last check
        if (shouldHide !== state.lastShouldHide) {
          // Reset counter when shouldHide changes
          state.counter = 0;
          state.lastShouldHide = shouldHide;
        } else {
          // Increment counter if shouldHide is stable
          state.counter++;
        }

        // Only change hidden state after stability frames
        if (state.counter >= stabilityFrames && state.hidden !== shouldHide) {
          state.hidden = shouldHide;
        }

        // Set target opacity based on stable hidden state
        // Hide completely (0) instead of partially transparent
        wallOpacitiesRef.current[wall.id].target = state.hidden ? 0 : 1.0;
      }

      // Smooth lerp to target opacity
      const current = wallOpacitiesRef.current[wall.id].current;
      const target = wallOpacitiesRef.current[wall.id].target;
      wallOpacitiesRef.current[wall.id].current = THREE.MathUtils.lerp(
        current,
        target,
        delta * lerpSpeed
      );
    });
  });

  if (!scene3D) {
    return null;
  }

  return (
    <group>
      {/* Floor */}
      <Floor
        width={scene3D.floor.dimensions[0]}
        depth={scene3D.floor.dimensions[1]}
        position={scene3D.floor.position}
        color="#c19a6b"
      />

      {/* Ceiling (optional - can be toggled) */}
      {/* <Floor
        width={scene3D.ceiling.dimensions[0]}
        depth={scene3D.ceiling.dimensions[1]}
        position={scene3D.ceiling.position}
        color="#ffffff"
      /> */}

      {/* Walls */}
      {scene3D.walls.map((wall) => (
        <WallWithOpacity
          key={wall.id}
          wall={wall}
          color="#f5f5f5"
          opacityRef={wallOpacitiesRef}
        />
      ))}

      {/* Doors */}
      {scene3D.doors.map((door) => (
        <Door key={door.id} door={door} color="#8b4513" />
      ))}

      {/* Windows */}
      {scene3D.windows.map((window) => (
        <Window key={window.id} window={window} frameColor="#444444" />
      ))}
    </group>
  );
};

export default Room;
