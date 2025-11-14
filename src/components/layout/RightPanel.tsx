/**
 * RightPanel - Right properties panel
 * Shows properties of selected item in 2D mode, Material editor in 3D mode
 */

import React from 'react';
import { Form, Button, Card, Accordion } from 'react-bootstrap';
import { useUIStore, useFloorPlanStore, useFurnitureStore } from '../../stores';

const RightPanel: React.FC = () => {
  const viewMode = useUIStore((state) => state.viewMode);
  const selectedItemId = useFloorPlanStore((state) => state.selectedItemId);
  const selectedItemType = useFloorPlanStore((state) => state.selectedItemType);
  const selectedFurnitureId = useFurnitureStore((state) => state.selectedItemId);

  /**
   * Render 2D Properties Panel
   */
  const render2DProperties = () => {
    if (!selectedItemId || !selectedItemType) {
      return (
        <div className="p-4 text-center text-muted">
          <i className="bi bi-info-circle fs-1 mb-3 d-block"></i>
          <p>Select an item to view properties</p>
        </div>
      );
    }

    return (
      <div className="properties-panel">
        <h6 className="text-secondary text-uppercase small mb-3 fw-semibold border-bottom pb-2">
          <i className="bi bi-sliders me-2"></i>
          Properties
        </h6>

        {selectedItemType === 'wall' && <WallProperties />}
        {selectedItemType === 'door' && <DoorProperties />}
        {selectedItemType === 'window' && <WindowProperties />}
      </div>
    );
  };

  /**
   * Render 3D Material Editor
   */
  const render3DMaterialEditor = () => {
    if (!selectedFurnitureId) {
      return (
        <div className="p-4 text-center text-muted">
          <i className="bi bi-palette fs-1 mb-3 d-block"></i>
          <p>Select a furniture item to edit materials</p>
        </div>
      );
    }

    return (
      <div className="properties-panel">
        <h6 className="text-secondary text-uppercase small mb-3 fw-semibold border-bottom pb-2">
          <i className="bi bi-palette me-2"></i>
          Material Editor
        </h6>

        <MaterialEditor />
      </div>
    );
  };

  return (
    <div className="h-100 overflow-auto">
      {viewMode === '2d' ? render2DProperties() : render3DMaterialEditor()}
    </div>
  );
};

/**
 * Wall Properties Component
 */
const WallProperties: React.FC = () => {
  const selectedItemId = useFloorPlanStore((state) => state.selectedItemId);
  const getWall = useFloorPlanStore((state) => state.getWall);
  const updateWall = useFloorPlanStore((state) => state.updateWall);
  const deleteWall = useFloorPlanStore((state) => state.deleteWall);

  const wall = selectedItemId ? getWall(selectedItemId) : null;

  if (!wall) return null;

  const handleUpdate = (field: string, value: any) => {
    updateWall(wall.id, { [field]: value });
  };

  return (
    <>
      <div className="property-group">
        <Form.Label className="property-label">Name</Form.Label>
        <Form.Control
          type="text"
          size="sm"
          value={wall.name ?? ''}
          onChange={(e) => handleUpdate('name', e.target.value)}
          placeholder="Wall name"
        />
      </div>

      <div className="property-group">
        <Form.Label className="property-label">Thickness (cm)</Form.Label>
        <Form.Control
          type="number"
          size="sm"
          value={wall.thickness}
          onChange={(e) => handleUpdate('thickness', parseFloat(e.target.value))}
          min={10}
          max={50}
        />
      </div>

      <div className="property-group">
        <Form.Label className="property-label">Height (cm)</Form.Label>
        <Form.Control
          type="number"
          size="sm"
          value={wall.height}
          onChange={(e) => handleUpdate('height', parseFloat(e.target.value))}
          min={200}
          max={400}
        />
      </div>

      <div className="property-group">
        <Form.Label className="property-label">Start Point</Form.Label>
        <div className="d-flex gap-2">
          <Form.Control
            type="number"
            size="sm"
            value={wall.start.x}
            onChange={(e) =>
              handleUpdate('start', { ...wall.start, x: parseFloat(e.target.value) })
            }
            placeholder="X"
          />
          <Form.Control
            type="number"
            size="sm"
            value={wall.start.y}
            onChange={(e) =>
              handleUpdate('start', { ...wall.start, y: parseFloat(e.target.value) })
            }
            placeholder="Y"
          />
        </div>
      </div>

      <div className="property-group">
        <Form.Label className="property-label">End Point</Form.Label>
        <div className="d-flex gap-2">
          <Form.Control
            type="number"
            size="sm"
            value={wall.end.x}
            onChange={(e) =>
              handleUpdate('end', { ...wall.end, x: parseFloat(e.target.value) })
            }
            placeholder="X"
          />
          <Form.Control
            type="number"
            size="sm"
            value={wall.end.y}
            onChange={(e) =>
              handleUpdate('end', { ...wall.end, y: parseFloat(e.target.value) })
            }
            placeholder="Y"
          />
        </div>
      </div>

      <div className="property-divider"></div>

      <div className="d-grid gap-2">
        <Button variant="danger" size="sm" onClick={() => deleteWall(wall.id)}>
          <i className="bi bi-trash me-2"></i>
          Delete Wall
        </Button>
      </div>
    </>
  );
};

/**
 * Door Properties Component
 */
const DoorProperties: React.FC = () => {
  const selectedItemId = useFloorPlanStore((state) => state.selectedItemId);
  const getDoor = useFloorPlanStore((state) => state.getDoor);
  const updateDoor = useFloorPlanStore((state) => state.updateDoor);
  const deleteDoor = useFloorPlanStore((state) => state.deleteDoor);

  const door = selectedItemId ? getDoor(selectedItemId) : null;

  if (!door) return null;

  const handleUpdate = (field: string, value: any) => {
    updateDoor(door.id, { [field]: value });
  };

  return (
    <>
      <div className="property-group">
        <Form.Label className="property-label">Name</Form.Label>
        <Form.Control
          type="text"
          size="sm"
          value={door.name ?? ''}
          onChange={(e) => handleUpdate('name', e.target.value)}
          placeholder="Door name"
        />
      </div>

      <div className="property-group">
        <Form.Label className="property-label">Door Type</Form.Label>
        <Form.Select
          size="sm"
          value={door.doorType}
          onChange={(e) => handleUpdate('doorType', e.target.value)}
        >
          <option value="single">Single</option>
          <option value="double">Double</option>
          <option value="sliding">Sliding</option>
          <option value="bifold">Bifold</option>
          <option value="pocket">Pocket</option>
        </Form.Select>
      </div>

      <div className="property-group">
        <Form.Label className="property-label">Width (cm)</Form.Label>
        <Form.Control
          type="number"
          size="sm"
          value={door.width}
          onChange={(e) => handleUpdate('width', parseFloat(e.target.value))}
          min={60}
          max={150}
        />
      </div>

      <div className="property-group">
        <Form.Label className="property-label">Height (cm)</Form.Label>
        <Form.Control
          type="number"
          size="sm"
          value={door.height}
          onChange={(e) => handleUpdate('height', parseFloat(e.target.value))}
          min={180}
          max={240}
        />
      </div>

      {door.swing && (
        <div className="property-group">
          <Form.Label className="property-label">Swing Direction</Form.Label>
          <Form.Select
            size="sm"
            value={door.swing}
            onChange={(e) => handleUpdate('swing', e.target.value)}
          >
            <option value="inward">Inward</option>
            <option value="outward">Outward</option>
            <option value="left">Left</option>
            <option value="right">Right</option>
          </Form.Select>
        </div>
      )}

      <div className="property-divider"></div>

      <div className="d-grid gap-2">
        <Button variant="danger" size="sm" onClick={() => deleteDoor(door.id)}>
          <i className="bi bi-trash me-2"></i>
          Delete Door
        </Button>
      </div>
    </>
  );
};

/**
 * Window Properties Component
 */
const WindowProperties: React.FC = () => {
  const selectedItemId = useFloorPlanStore((state) => state.selectedItemId);
  const getWindow = useFloorPlanStore((state) => state.getWindow);
  const updateWindow = useFloorPlanStore((state) => state.updateWindow);
  const deleteWindow = useFloorPlanStore((state) => state.deleteWindow);

  const window = selectedItemId ? getWindow(selectedItemId) : null;

  if (!window) return null;

  const handleUpdate = (field: string, value: any) => {
    updateWindow(window.id, { [field]: value });
  };

  return (
    <>
      <div className="property-group">
        <Form.Label className="property-label">Name</Form.Label>
        <Form.Control
          type="text"
          size="sm"
          value={window.name ?? ''}
          onChange={(e) => handleUpdate('name', e.target.value)}
          placeholder="Window name"
        />
      </div>

      <div className="property-group">
        <Form.Label className="property-label">Window Type</Form.Label>
        <Form.Select
          size="sm"
          value={window.windowType}
          onChange={(e) => handleUpdate('windowType', e.target.value)}
        >
          <option value="fixed">Fixed</option>
          <option value="casement">Casement</option>
          <option value="sliding">Sliding</option>
          <option value="double-hung">Double Hung</option>
          <option value="awning">Awning</option>
          <option value="bay">Bay</option>
          <option value="bow">Bow</option>
        </Form.Select>
      </div>

      <div className="property-group">
        <Form.Label className="property-label">Width (cm)</Form.Label>
        <Form.Control
          type="number"
          size="sm"
          value={window.width}
          onChange={(e) => handleUpdate('width', parseFloat(e.target.value))}
          min={50}
          max={300}
        />
      </div>

      <div className="property-group">
        <Form.Label className="property-label">Height (cm)</Form.Label>
        <Form.Control
          type="number"
          size="sm"
          value={window.height}
          onChange={(e) => handleUpdate('height', parseFloat(e.target.value))}
          min={60}
          max={200}
        />
      </div>

      <div className="property-group">
        <Form.Label className="property-label">Sill Height (cm)</Form.Label>
        <Form.Control
          type="number"
          size="sm"
          value={window.sillHeight}
          onChange={(e) => handleUpdate('sillHeight', parseFloat(e.target.value))}
          min={60}
          max={150}
        />
      </div>

      <div className="property-divider"></div>

      <div className="d-grid gap-2">
        <Button variant="danger" size="sm" onClick={() => deleteWindow(window.id)}>
          <i className="bi bi-trash me-2"></i>
          Delete Window
        </Button>
      </div>
    </>
  );
};

/**
 * Material Editor Component (for 3D mode)
 */
const MaterialEditor: React.FC = () => {
  return (
    <>
      {/* Material Preview */}
      <div className="material-preview">
        <div className="preview-label">Material Preview</div>
      </div>

      {/* Material Categories */}
      <Accordion defaultActiveKey="color" flush className="mb-3">
        <Accordion.Item eventKey="color">
          <Accordion.Header>
            <i className="bi bi-palette me-2"></i>
            Color
          </Accordion.Header>
          <Accordion.Body>
            <Form.Group>
              <Form.Label className="small">Base Color</Form.Label>
              <Form.Control type="color" defaultValue="#ffffff" />
            </Form.Group>
          </Accordion.Body>
        </Accordion.Item>

        <Accordion.Item eventKey="texture">
          <Accordion.Header>
            <i className="bi bi-image me-2"></i>
            Texture
          </Accordion.Header>
          <Accordion.Body>
            <div className="d-grid gap-2">
              <Button variant="outline-secondary" size="sm">
                <i className="bi bi-folder-open me-2"></i>
                Load Texture
              </Button>
              <Form.Group>
                <Form.Label className="small">Texture Repeat</Form.Label>
                <div className="d-flex gap-2">
                  <Form.Control type="number" size="sm" placeholder="X" defaultValue={1} />
                  <Form.Control type="number" size="sm" placeholder="Y" defaultValue={1} />
                </div>
              </Form.Group>
            </div>
          </Accordion.Body>
        </Accordion.Item>

        <Accordion.Item eventKey="properties">
          <Accordion.Header>
            <i className="bi bi-sliders me-2"></i>
            Material Properties
          </Accordion.Header>
          <Accordion.Body>
            <Form.Group className="mb-3">
              <Form.Label className="small d-flex justify-content-between">
                <span>Roughness</span>
                <span className="text-muted">0.5</span>
              </Form.Label>
              <Form.Range defaultValue={50} />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="small d-flex justify-content-between">
                <span>Metalness</span>
                <span className="text-muted">0.0</span>
              </Form.Label>
              <Form.Range defaultValue={0} />
            </Form.Group>

            <Form.Group>
              <Form.Label className="small d-flex justify-content-between">
                <span>Opacity</span>
                <span className="text-muted">1.0</span>
              </Form.Label>
              <Form.Range defaultValue={100} />
            </Form.Group>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>

      {/* Presets */}
      <div className="property-group">
        <Form.Label className="property-label">Material Presets</Form.Label>
        <div className="d-grid gap-2">
          <Button variant="outline-secondary" size="sm">Wood - Oak</Button>
          <Button variant="outline-secondary" size="sm">Metal - Steel</Button>
          <Button variant="outline-secondary" size="sm">Ceramic - White</Button>
          <Button variant="outline-secondary" size="sm">Stone - Marble</Button>
        </div>
      </div>

      <div className="property-divider"></div>

      <div className="d-grid gap-2">
        <Button variant="primary" size="sm">
          <i className="bi bi-check2 me-2"></i>
          Apply Material
        </Button>
        <Button variant="outline-secondary" size="sm">
          <i className="bi bi-arrow-clockwise me-2"></i>
          Reset
        </Button>
      </div>
    </>
  );
};

export default RightPanel;
