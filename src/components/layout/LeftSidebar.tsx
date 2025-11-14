/**
 * LeftSidebar - Left sidebar component
 * Shows 2D tools in 2D mode, Furniture library in 3D mode
 */

import React from 'react';
import { Nav, Button, ButtonGroup, Accordion, Form } from 'react-bootstrap';
import { useUIStore, useFloorPlanStore } from '../../stores';
import type { Tool2D } from '../../types';

const LeftSidebar: React.FC = () => {
  const viewMode = useUIStore((state) => state.viewMode);
  const currentTool = useFloorPlanStore((state) => state.currentTool);
  const setCurrentTool = useFloorPlanStore((state) => state.setCurrentTool);

  /**
   * Render 2D Editor Tools
   */
  const render2DTools = () => {
    const tools: Array<{ id: Tool2D; icon: string; label: string }> = [
      { id: 'select', icon: 'bi-cursor', label: 'Select' },
      { id: 'wall', icon: 'bi-pencil', label: 'Wall' },
      { id: 'door', icon: 'bi-door-closed', label: 'Door' },
      { id: 'window', icon: 'bi-window', label: 'Window' }
    ];

    return (
      <div className="p-3">
        <h6 className="text-secondary text-uppercase small mb-3 fw-semibold">
          <i className="bi bi-tools me-2"></i>
          Drawing Tools
        </h6>

        <div className="d-flex flex-column gap-2">
          {tools.map((tool) => (
            <Button
              key={tool.id}
              variant={currentTool === tool.id ? 'primary' : 'outline-secondary'}
              className="d-flex align-items-center gap-3 justify-content-start"
              onClick={() => setCurrentTool(tool.id)}
            >
              <i className={`${tool.icon} fs-5`}></i>
              <span>{tool.label}</span>
            </Button>
          ))}
        </div>

        {/* Tool Options (based on selected tool) */}
        <div className="mt-4">
          <h6 className="text-secondary text-uppercase small mb-3 fw-semibold">
            Tool Options
          </h6>

          {currentTool === 'wall' && <WallToolOptions />}
          {currentTool === 'door' && <DoorToolOptions />}
          {currentTool === 'window' && <WindowToolOptions />}
        </div>
      </div>
    );
  };

  /**
   * Render 3D Furniture Library
   */
  const render3DFurniture = () => {
    const categories = [
      { id: 'cabinet', icon: 'bi-box', label: 'Cabinets', count: 12 },
      { id: 'appliance', icon: 'bi-lightning', label: 'Appliances', count: 8 },
      { id: 'counter', icon: 'bi-table', label: 'Counters', count: 6 },
      { id: 'table', icon: 'bi-grid-3x3', label: 'Tables', count: 10 },
      { id: 'chair', icon: 'bi-person-chair', label: 'Chairs', count: 15 },
      { id: 'lighting', icon: 'bi-lightbulb', label: 'Lighting', count: 9 },
      { id: 'sink', icon: 'bi-droplet', label: 'Sinks', count: 5 },
      { id: 'storage', icon: 'bi-archive', label: 'Storage', count: 7 },
      { id: 'decoration', icon: 'bi-star', label: 'Decorations', count: 20 }
    ];

    return (
      <div className="p-3">
        <div className="mb-3">
          <h6 className="text-secondary text-uppercase small mb-2 fw-semibold">
            <i className="bi bi-collection me-2"></i>
            Furniture Library
          </h6>

          {/* Search */}
          <Form.Control
            type="search"
            placeholder="Search furniture..."
            size="sm"
            className="mb-3"
          />
        </div>

        {/* Categories Accordion */}
        <Accordion defaultActiveKey="cabinet" flush>
          {categories.map((category) => (
            <Accordion.Item key={category.id} eventKey={category.id}>
              <Accordion.Header>
                <i className={`${category.icon} me-2`}></i>
                {category.label}
                <span className="badge bg-secondary ms-auto me-2">{category.count}</span>
              </Accordion.Header>
              <Accordion.Body>
                <div className="furniture-grid">
                  {/* Placeholder furniture items */}
                  {Array.from({ length: category.count }).map((_, i) => (
                    <div key={i} className="furniture-card">
                      <div className="furniture-thumbnail">
                        <i className={category.icon}></i>
                      </div>
                      <div className="furniture-name">
                        Item {i + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </Accordion.Body>
            </Accordion.Item>
          ))}
        </Accordion>
      </div>
    );
  };

  return (
    <div className="h-100 overflow-auto">
      {viewMode === '2d' ? render2DTools() : render3DFurniture()}
    </div>
  );
};

/**
 * Wall Tool Options
 */
const WallToolOptions: React.FC = () => {
  return (
    <div className="d-flex flex-column gap-2">
      <Form.Group>
        <Form.Label className="small">Thickness (cm)</Form.Label>
        <Form.Control type="number" size="sm" defaultValue={20} min={10} max={50} />
      </Form.Group>

      <Form.Group>
        <Form.Label className="small">Height (cm)</Form.Label>
        <Form.Control type="number" size="sm" defaultValue={240} min={200} max={400} />
      </Form.Group>

      <Form.Group>
        <Form.Label className="small">Material</Form.Label>
        <Form.Select size="sm" defaultValue="concrete">
          <option value="concrete">Concrete</option>
          <option value="brick">Brick</option>
          <option value="wood">Wood</option>
          <option value="drywall">Drywall</option>
        </Form.Select>
      </Form.Group>
    </div>
  );
};

/**
 * Door Tool Options
 */
const DoorToolOptions: React.FC = () => {
  return (
    <div className="d-flex flex-column gap-2">
      <Form.Group>
        <Form.Label className="small">Door Type</Form.Label>
        <Form.Select size="sm" defaultValue="single">
          <option value="single">Single</option>
          <option value="double">Double</option>
          <option value="sliding">Sliding</option>
          <option value="bifold">Bifold</option>
        </Form.Select>
      </Form.Group>

      <Form.Group>
        <Form.Label className="small">Width (cm)</Form.Label>
        <Form.Control type="number" size="sm" defaultValue={80} min={60} max={120} />
      </Form.Group>

      <Form.Group>
        <Form.Label className="small">Height (cm)</Form.Label>
        <Form.Control type="number" size="sm" defaultValue={200} min={180} max={240} />
      </Form.Group>

      <Form.Group>
        <Form.Label className="small">Swing Direction</Form.Label>
        <Form.Select size="sm" defaultValue="inward">
          <option value="inward">Inward</option>
          <option value="outward">Outward</option>
          <option value="left">Left</option>
          <option value="right">Right</option>
        </Form.Select>
      </Form.Group>
    </div>
  );
};

/**
 * Window Tool Options
 */
const WindowToolOptions: React.FC = () => {
  return (
    <div className="d-flex flex-column gap-2">
      <Form.Group>
        <Form.Label className="small">Window Type</Form.Label>
        <Form.Select size="sm" defaultValue="casement">
          <option value="fixed">Fixed</option>
          <option value="casement">Casement</option>
          <option value="sliding">Sliding</option>
          <option value="double-hung">Double Hung</option>
        </Form.Select>
      </Form.Group>

      <Form.Group>
        <Form.Label className="small">Width (cm)</Form.Label>
        <Form.Control type="number" size="sm" defaultValue={100} min={50} max={200} />
      </Form.Group>

      <Form.Group>
        <Form.Label className="small">Height (cm)</Form.Label>
        <Form.Control type="number" size="sm" defaultValue={120} min={60} max={180} />
      </Form.Group>

      <Form.Group>
        <Form.Label className="small">Sill Height (cm)</Form.Label>
        <Form.Control type="number" size="sm" defaultValue={90} min={60} max={150} />
      </Form.Group>
    </div>
  );
};

export default LeftSidebar;
