/**
 * Scene3D - 3D Viewer with React Three Fiber
 */

import React, { Suspense, useMemo, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei';
import { useFloorPlanStore } from '../../stores';
import { floorPlanTo3D } from '../../utils/floorPlanTo3D';
import Room from './room/Room';
import * as THREE from 'three';

/**
 * Camera and Controls component inside Canvas
 */
const CameraRig: React.FC<{ roomBounds: any }> = ({ roomBounds }) => {
  const controlsRef = useRef<any>(null);
  const { gl } = useThree();

  // Calculate initial camera position and orbit target
  const { initialPosition, target, maxDim } = useMemo(() => {
    const centerX = (roomBounds.minX + roomBounds.maxX) / 2;
    const centerZ = (roomBounds.minY + roomBounds.maxY) / 2;
    const width = roomBounds.maxX - roomBounds.minX;
    const depth = roomBounds.maxY - roomBounds.minY;
    const maxDim = Math.max(width, depth);

    return {
      initialPosition: new THREE.Vector3(
        centerX + maxDim * 0.7,
        maxDim * 0.8,
        centerZ + maxDim * 0.7
      ),
      target: new THREE.Vector3(centerX, 100, centerZ),
      maxDim
    };
  }, [roomBounds]);

  // Double-click to fly-to functionality
  const handleDoubleClick = () => {
    // TODO: Implement raycasting to find clicked point and animate camera
    console.log('Double click detected - fly-to not yet implemented');
  };

  React.useEffect(() => {
    gl.domElement.addEventListener('dblclick', handleDoubleClick);
    return () => gl.domElement.removeEventListener('dblclick', handleDoubleClick);
  }, [gl]);

  return (
    <>
      <PerspectiveCamera
        makeDefault
        position={initialPosition}
        fov={60}
      />

      <OrbitControls
        ref={controlsRef}
        target={target}
        enableDamping
        dampingFactor={0.05}
        minDistance={50}
        maxDistance={maxDim * 2}
        maxPolarAngle={Math.PI * 0.49}
        minPolarAngle={0}
        enablePan={true}
        panSpeed={0.5}
        rotateSpeed={0.5}
        zoomSpeed={0.8}
        mouseButtons={{
          LEFT: THREE.MOUSE.ROTATE,
          MIDDLE: THREE.MOUSE.DOLLY,
          RIGHT: THREE.MOUSE.PAN
        }}
      />
    </>
  );
};

const Scene3D: React.FC = () => {
  const floorPlan = useFloorPlanStore((state) => state.floorPlan);

  // Calculate room bounds
  const roomBounds = useMemo(() => {
    if (!floorPlan) return null;

    try {
      const scene3D = floorPlanTo3D(floorPlan);
      return scene3D.bounds;
    } catch (error) {
      return null;
    }
  }, [floorPlan]);

  if (!floorPlan || !roomBounds) {
    return (
      <div className="canvas-3d-container d-flex align-items-center justify-content-center">
        <div className="text-center text-muted">
          <i className="bi bi-exclamation-triangle display-3 mb-3 d-block"></i>
          <h5>No Floor Plan</h5>
          <p>Please create a floor plan in 2D mode first</p>
        </div>
      </div>
    );
  }

  return (
    <div className="canvas-3d-container">
      <Canvas shadows>
        {/* Camera Rig with Orbit Controls */}
        <CameraRig roomBounds={roomBounds} />

        {/* Lights - Interior lighting with shadows */}
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[100, 250, 100]}
          intensity={0.8}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={600}
          shadow-camera-left={-400}
          shadow-camera-right={400}
          shadow-camera-top={400}
          shadow-camera-bottom={-400}
          shadow-bias={-0.0001}
        />
        {/* Fill lights from multiple directions for even lighting */}
        <pointLight position={[200, 150, 0]} intensity={0.25} />
        <pointLight position={[-200, 150, 0]} intensity={0.25} />
        <pointLight position={[0, 150, 200]} intensity={0.25} />
        <pointLight position={[0, 150, -200]} intensity={0.25} />

        {/* Environment (for reflections) */}
        <Environment preset="apartment" />

        {/* 3D Scene Content */}
        <Suspense fallback={null}>
          <Room />
        </Suspense>
      </Canvas>

      {/* HUD Overlay */}
      <div className="scene-hud">
        <div className="camera-controls-ui">
          <div className="small text-muted">
            <i className="bi bi-mouse me-2"></i>
            Chuột trái: Xoay | Chuột phải: Di chuyển | Scroll: Zoom | Double-click: Fly-to
          </div>
        </div>
      </div>
    </div>
  );
};

export default Scene3D;
