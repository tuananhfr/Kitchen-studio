/**
 * Canvas2D - Main 2D Canvas using React-Konva
 * Handles all 2D drawing including grid, walls, doors, windows
 */

import React, { useRef, useState, useEffect } from "react";
import { Stage, Layer } from "react-konva";
import Konva from "konva";

import { useFloorPlanStore, useUIStore } from "../../../stores";
import Grid from "./Grid";
import WallRenderer from "./WallRenderer";
import DoorRenderer from "./DoorRenderer";
import WindowRenderer from "./WindowRenderer";
import DrawingPreview from "./DrawingPreview";
import WallHighlight from "./WallHighlight";
import type { Point2D, Wall } from "../../../types";
import {
  findClosestWall,
  isValidPlacementPosition,
} from "../../../utils/geometryUtils";
import { DOOR_DEFAULTS, WINDOW_DEFAULTS } from "../../../constants/config";

const Canvas2D: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  // Pan state - for dragging canvas in select mode
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number } | null>(
    null
  );

  // Hover state for door/window placement
  const [hoveredWall, setHoveredWall] = useState<{
    wall: Wall;
    position: number;
    isValid: boolean;
  } | null>(null);

  // Store state
  const currentTool = useFloorPlanStore((state) => state.currentTool);
  const floorPlan = useFloorPlanStore((state) => state.floorPlan);
  const isDrawing = useFloorPlanStore((state) => state.isDrawing);
  const drawingStartPoint = useFloorPlanStore(
    (state) => state.drawingStartPoint
  );
  const drawingEndPoint = useFloorPlanStore((state) => state.drawingEndPoint);
  const startDrawing = useFloorPlanStore((state) => state.startDrawing);
  const updateDrawing = useFloorPlanStore((state) => state.updateDrawing);
  const finishDrawing = useFloorPlanStore((state) => state.finishDrawing);
  const cancelDrawing = useFloorPlanStore((state) => state.cancelDrawing);
  const addDoor = useFloorPlanStore((state) => state.addDoor);
  const addWindow = useFloorPlanStore((state) => state.addWindow);
  const deleteWall = useFloorPlanStore((state) => state.deleteWall);
  const deleteDoor = useFloorPlanStore((state) => state.deleteDoor);
  const deleteWindow = useFloorPlanStore((state) => state.deleteWindow);
  const selectedItemType = useFloorPlanStore((state) => state.selectedItemType);
  const selectedItemId = useFloorPlanStore((state) => state.selectedItemId);

  const showGrid = useUIStore((state) => state.showGrid);
  const snapToGrid = useUIStore((state) => state.snapToGrid);
  const gridSize = useUIStore((state) => state.gridSize);

  /**
   * Update canvas dimensions on resize
   */
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  /**
   * Snap point to grid
   */
  const snapPoint = (point: Point2D): Point2D => {
    if (!snapToGrid) return point;

    return {
      x: Math.round(point.x / gridSize) * gridSize,
      y: Math.round(point.y / gridSize) * gridSize,
    };
  };

  /**
   * Convert screen coordinates to canvas coordinates
   */
  const getCanvasCoordinates = (
    e: Konva.KonvaEventObject<MouseEvent>
  ): Point2D => {
    const stage = e.target.getStage();
    const pointerPosition = stage!.getPointerPosition();

    if (!pointerPosition) return { x: 0, y: 0 };

    // Transform screen coordinates to canvas coordinates
    const transform = stage.getAbsoluteTransform().copy().invert();
    const point = transform.point(pointerPosition);

    return snapPoint(point);
  };

  /**
   * Handle mouse down on canvas
   */
  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage();
    const pointerPosition = stage!.getPointerPosition();

    // Handle panning in select mode
    if (currentTool === "select") {
      setIsPanning(true);
      setPanStart(pointerPosition);
      return;
    }

    const point = getCanvasCoordinates(e);

    // Handle door placement
    if (currentTool === "door" && floorPlan) {
      const result = findClosestWall(point, floorPlan.walls, 30);
      if (result) {
        const isValid = isValidPlacementPosition(
          result.wall,
          result.position,
          DOOR_DEFAULTS.WIDTH
        );

        if (isValid) {
          addDoor({
            name: `Door ${floorPlan.doors.length + 1}`,
            wallId: result.wall.id,
            position: result.position,
            width: DOOR_DEFAULTS.WIDTH,
            height: DOOR_DEFAULTS.HEIGHT,
            thickness: DOOR_DEFAULTS.THICKNESS,
            doorType: DOOR_DEFAULTS.TYPE,
            swing: "inward",
            swingAngle: DOOR_DEFAULTS.SWING_ANGLE,
          });
        }
      }
      return;
    }

    // Handle window placement
    if (currentTool === "window" && floorPlan) {
      const result = findClosestWall(point, floorPlan.walls, 30);
      if (result) {
        const isValid = isValidPlacementPosition(
          result.wall,
          result.position,
          WINDOW_DEFAULTS.WIDTH
        );

        if (isValid) {
          addWindow({
            name: `Window ${floorPlan.windows.length + 1}`,
            wallId: result.wall.id,
            position: result.position,
            width: WINDOW_DEFAULTS.WIDTH,
            height: WINDOW_DEFAULTS.HEIGHT,
            depth: WINDOW_DEFAULTS.DEPTH,
            sillHeight: WINDOW_DEFAULTS.SILL_HEIGHT,
            windowType: WINDOW_DEFAULTS.TYPE,
          });
        }
      }
      return;
    }

    // Handle wall drawing
    if (currentTool === "wall") {
      startDrawing(point);
    }
  };

  /**
   * Handle mouse move on canvas
   */
  const handleMouseMove = (e: any) => {
    const stage = e.target.getStage();
    const pointerPosition = stage.getPointerPosition();

    // Handle panning
    if (isPanning && panStart && pointerPosition) {
      const dx = pointerPosition.x - panStart.x;
      const dy = pointerPosition.y - panStart.y;

      setPosition({
        x: position.x + dx,
        y: position.y + dy,
      });

      setPanStart(pointerPosition);
      return;
    }

    const point = getCanvasCoordinates(e);

    // Update hovered wall for door/window placement
    if ((currentTool === "door" || currentTool === "window") && floorPlan) {
      const width =
        currentTool === "door" ? DOOR_DEFAULTS.WIDTH : WINDOW_DEFAULTS.WIDTH;
      const result = findClosestWall(point, floorPlan.walls, 30);

      if (result) {
        const isValid = isValidPlacementPosition(
          result.wall,
          result.position,
          width
        );
        setHoveredWall({
          wall: result.wall,
          position: result.position,
          isValid,
        });
      } else {
        setHoveredWall(null);
      }
    } else {
      setHoveredWall(null);
    }

    // Handle drawing
    if (isDrawing) {
      updateDrawing(point);
    }
  };

  /**
   * Handle mouse up on canvas
   */
  const handleMouseUp = () => {
    // End panning
    if (isPanning) {
      setIsPanning(false);
      setPanStart(null);
      return;
    }

    if (!isDrawing) return;
    finishDrawing();
  };

  /**
   * Handle wheel for zoom
   */
  const handleWheel = (e: any) => {
    e.evt.preventDefault();

    const scaleBy = 1.1;
    const stage = e.target.getStage();
    const oldScale = stage.scaleX();
    const pointerPosition = stage.getPointerPosition();

    if (!pointerPosition) return;

    const mousePointTo = {
      x: (pointerPosition.x - stage.x()) / oldScale,
      y: (pointerPosition.y - stage.y()) / oldScale,
    };

    const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;

    // Limit zoom
    const clampedScale = Math.max(0.1, Math.min(5, newScale));

    setScale(clampedScale);
    setPosition({
      x: pointerPosition.x - mousePointTo.x * clampedScale,
      y: pointerPosition.y - mousePointTo.y * clampedScale,
    });
  };

  /**
   * Handle keyboard shortcuts
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape to cancel drawing
      if (e.key === "Escape" && isDrawing) {
        cancelDrawing();
      }

      // Delete key to delete selected item
      if (
        (e.key === "Delete" || e.key === "Backspace") &&
        selectedItemId &&
        selectedItemType
      ) {
        e.preventDefault();
        if (selectedItemType === "wall") {
          deleteWall(selectedItemId);
        } else if (selectedItemType === "door") {
          deleteDoor(selectedItemId);
        } else if (selectedItemType === "window") {
          deleteWindow(selectedItemId);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    isDrawing,
    cancelDrawing,
    selectedItemId,
    selectedItemType,
    deleteWall,
    deleteDoor,
    deleteWindow,
    currentTool,
  ]);

  /**
   * Get cursor style based on current tool
   */
  const getCursorStyle = () => {
    switch (currentTool) {
      case "wall":
        return "crosshair";
      case "door":
      case "window":
        return "pointer";
      case "select":
        return isPanning ? "grabbing" : "grab";
      default:
        return "default";
    }
  };

  return (
    <div
      ref={containerRef}
      className={`canvas-2d-container tool-${currentTool}`}
      style={{ cursor: getCursorStyle() }}
    >
      <Stage
        width={dimensions.width}
        height={dimensions.height}
        scaleX={scale}
        scaleY={scale}
        x={position.x}
        y={position.y}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        draggable={currentTool === "pan"}
      >
        {/* Grid Layer */}
        {showGrid && (
          <Layer>
            <Grid
              width={dimensions.width}
              height={dimensions.height}
              gridSize={gridSize}
              scale={scale}
            />
          </Layer>
        )}

        {/* Main Drawing Layer */}
        <Layer>
          {/* Render walls */}
          {floorPlan?.walls.map((wall) => (
            <WallRenderer key={wall.id} wall={wall} />
          ))}

          {/* Render doors */}
          {floorPlan?.doors.map((door) => (
            <DoorRenderer key={door.id} door={door} />
          ))}

          {/* Render windows */}
          {floorPlan?.windows.map((window) => (
            <WindowRenderer key={window.id} window={window} />
          ))}

          {/* Drawing preview (while drawing) */}
          {isDrawing && drawingStartPoint && drawingEndPoint && (
            <DrawingPreview
              start={drawingStartPoint}
              end={drawingEndPoint}
              tool={currentTool}
            />
          )}

          {/* Wall highlight for door/window placement */}
          {hoveredWall &&
            (currentTool === "door" || currentTool === "window") && (
              <WallHighlight
                wall={hoveredWall.wall}
                position={hoveredWall.position}
                width={
                  currentTool === "door"
                    ? DOOR_DEFAULTS.WIDTH
                    : WINDOW_DEFAULTS.WIDTH
                }
                type={currentTool}
                isValid={hoveredWall.isValid}
              />
            )}
        </Layer>
      </Stage>

      {/* Coordinate Display */}
      <div className="coordinate-display">
        <span className="coord-label">X:</span>
        <span className="coord-value">
          {Math.round(drawingEndPoint?.x ?? 0)}
        </span>
        <span className="coord-label ms-3">Y:</span>
        <span className="coord-value">
          {Math.round(drawingEndPoint?.y ?? 0)}
        </span>
      </div>

      {/* Zoom Display */}
      <div className="zoom-display">
        <span className="zoom-value">{Math.round(scale * 100)}%</span>
      </div>
    </div>
  );
};

export default Canvas2D;
