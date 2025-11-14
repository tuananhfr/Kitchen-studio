/**
 * BottomToolbar - Bottom toolbar component
 * Contains grid controls, snap settings, zoom controls, and view options
 */

import React from 'react';
import { ButtonGroup, Button, Form, Badge } from 'react-bootstrap';
import { useUIStore } from '../../stores';

const BottomToolbar: React.FC = () => {
  const viewMode = useUIStore((state) => state.viewMode);
  const showGrid = useUIStore((state) => state.showGrid);
  const snapToGrid = useUIStore((state) => state.snapToGrid);
  const gridSize = useUIStore((state) => state.gridSize);
  const unit = useUIStore((state) => state.unit);
  const showMeasurements = useUIStore((state) => state.showMeasurements);
  const showAxes = useUIStore((state) => state.showAxes);
  const showShadows = useUIStore((state) => state.showShadows);

  const toggleGrid = useUIStore((state) => state.toggleGrid);
  const toggleSnap = useUIStore((state) => state.toggleSnap);
  const setGridSize = useUIStore((state) => state.setGridSize);
  const setUnit = useUIStore((state) => state.setUnit);
  const toggleMeasurements = useUIStore((state) => state.toggleMeasurements);
  const toggleAxes = useUIStore((state) => state.toggleAxes);
  const toggleShadows = useUIStore((state) => state.toggleShadows);

  /**
   * Render 2D Controls
   */
  const render2DControls = () => (
    <>
      {/* Grid Controls */}
      <ButtonGroup size="sm">
        <Button
          variant={showGrid ? 'primary' : 'outline-secondary'}
          onClick={toggleGrid}
          title="Toggle Grid"
        >
          <i className="bi bi-grid-3x3"></i>
          <span className="d-none d-md-inline ms-2">Grid</span>
        </Button>

        <Button
          variant={snapToGrid ? 'primary' : 'outline-secondary'}
          onClick={toggleSnap}
          title="Toggle Snap to Grid"
          disabled={!showGrid}
        >
          <i className="bi bi-magnet"></i>
          <span className="d-none d-md-inline ms-2">Snap</span>
        </Button>
      </ButtonGroup>

      {/* Grid Size */}
      <div className="d-flex align-items-center gap-2">
        <span className="small text-muted d-none d-md-inline">Grid Size:</span>
        <Form.Select
          size="sm"
          value={gridSize}
          onChange={(e) => setGridSize(parseInt(e.target.value))}
          style={{ width: 'auto' }}
          className="d-none d-sm-inline"
        >
          <option value={5}>5 {unit}</option>
          <option value={10}>10 {unit}</option>
          <option value={25}>25 {unit}</option>
          <option value={50}>50 {unit}</option>
          <option value={100}>100 {unit}</option>
        </Form.Select>
      </div>

      {/* Measurements */}
      <Button
        variant={showMeasurements ? 'primary' : 'outline-secondary'}
        size="sm"
        onClick={toggleMeasurements}
        title="Toggle Measurements"
      >
        <i className="bi bi-rulers"></i>
        <span className="d-none d-md-inline ms-2">Measurements</span>
      </Button>
    </>
  );

  /**
   * Render 3D Controls
   */
  const render3DControls = () => (
    <>
      {/* View Options */}
      <ButtonGroup size="sm">
        <Button
          variant={showAxes ? 'primary' : 'outline-secondary'}
          onClick={toggleAxes}
          title="Toggle Axes"
        >
          <i className="bi bi-arrows"></i>
          <span className="d-none d-md-inline ms-2">Axes</span>
        </Button>

        <Button
          variant={showShadows ? 'primary' : 'outline-secondary'}
          onClick={toggleShadows}
          title="Toggle Shadows"
        >
          <i className="bi bi-circle-half"></i>
          <span className="d-none d-md-inline ms-2">Shadows</span>
        </Button>
      </ButtonGroup>

      {/* Camera Info */}
      <div className="d-none d-lg-flex align-items-center gap-2 px-3 py-1 bg-light rounded">
        <i className="bi bi-camera"></i>
        <span className="small">Perspective</span>
      </div>
    </>
  );

  return (
    <>
      {/* Left Section */}
      <div className="d-flex align-items-center gap-2 flex-wrap">
        {viewMode === '2d' ? render2DControls() : render3DControls()}
      </div>

      {/* Center Section - Coordinates/Stats */}
      <div className="d-none d-lg-flex align-items-center gap-3 mx-auto">
        {viewMode === '2d' ? (
          <>
            <div className="small text-muted">
              <i className="bi bi-cursor me-1"></i>
              X: <strong>0</strong> Y: <strong>0</strong>
            </div>
            <div className="vr"></div>
            <div className="small text-muted">
              Zoom: <strong>100%</strong>
            </div>
          </>
        ) : (
          <>
            <div className="small text-muted">
              <i className="bi bi-box me-1"></i>
              Objects: <Badge bg="secondary">0</Badge>
            </div>
            <div className="vr"></div>
            <div className="small text-muted">
              FPS: <Badge bg="success">60</Badge>
            </div>
          </>
        )}
      </div>

      {/* Right Section - Unit & Panel Toggles */}
      <div className="d-flex align-items-center gap-2 ms-auto">
        {/* Unit Selector */}
        <div className="d-none d-md-flex align-items-center gap-2">
          <span className="small text-muted">Unit:</span>
          <Form.Select
            size="sm"
            value={unit}
            onChange={(e) => setUnit(e.target.value as any)}
            style={{ width: 'auto' }}
          >
            <option value="mm">mm</option>
            <option value="cm">cm</option>
            <option value="m">m</option>
            <option value="inch">inch</option>
            <option value="ft">ft</option>
          </Form.Select>
        </div>

        {/* Panel Toggles */}
        <ButtonGroup size="sm" className="d-none d-lg-flex">
          <Button
            variant="outline-secondary"
            onClick={() => useUIStore.getState().toggleLeftSidebar()}
            title="Toggle Left Sidebar"
          >
            <i className="bi bi-layout-sidebar"></i>
          </Button>

          <Button
            variant="outline-secondary"
            onClick={() => useUIStore.getState().toggleRightPanel()}
            title="Toggle Right Panel"
          >
            <i className="bi bi-layout-sidebar-reverse"></i>
          </Button>
        </ButtonGroup>
      </div>
    </>
  );
};

export default BottomToolbar;
