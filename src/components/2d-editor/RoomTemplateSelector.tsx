/**
 * Room Template Selector - Modal to choose kitchen layout preset
 */

import React from 'react';
import { Modal, Button, Card, Row, Col } from 'react-bootstrap';
import { ROOM_TEMPLATES, type RoomTemplate } from '../../constants/roomTemplates';
import { useFloorPlanStore } from '../../stores';

interface RoomTemplateSelectorProps {
  show: boolean;
  onHide: () => void;
}

const RoomTemplateSelector: React.FC<RoomTemplateSelectorProps> = ({ show, onHide }) => {
  const createFloorPlan = useFloorPlanStore((state) => state.createFloorPlan);
  const addWall = useFloorPlanStore((state) => state.addWall);
  const clearFloorPlan = useFloorPlanStore((state) => state.clearFloorPlan);

  const handleSelectTemplate = (template: RoomTemplate) => {
    // Clear existing floor plan
    clearFloorPlan();

    // Create new floor plan with template dimensions
    createFloorPlan(
      template.nameVi,
      template.dimensions.width,
      template.dimensions.length,
      template.dimensions.height
    );

    // Add all walls from template
    template.walls.forEach((wallData) => {
      addWall({
        name: `Wall`,
        start: {
          x: wallData.start.x + 100, // Offset to center in canvas
          y: wallData.start.y + 100
        },
        end: {
          x: wallData.end.x + 100,
          y: wallData.end.y + 100
        },
        thickness: wallData.thickness,
        height: wallData.height
      });
    });

    // Close modal
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="bi bi-grid-3x3 me-2"></i>
          Chọn Layout Bếp
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <p className="text-muted mb-4">
          Chọn một mẫu layout sẵn để bắt đầu thiết kế nhanh hơn
        </p>

        <Row className="g-3">
          {ROOM_TEMPLATES.map((template) => (
            <Col key={template.id} xs={12} sm={6} md={4}>
              <Card
                className="template-card h-100"
                style={{ cursor: 'pointer' }}
                onClick={() => handleSelectTemplate(template)}
              >
                <Card.Body className="text-center">
                  <div className="template-icon mb-3" style={{ fontSize: '48px' }}>
                    {template.icon}
                  </div>
                  <Card.Title className="h6">{template.nameVi}</Card.Title>
                  <Card.Text className="small text-muted">
                    {template.descriptionVi}
                  </Card.Text>
                  <div className="small text-muted mt-2">
                    {template.dimensions.width} × {template.dimensions.length} cm
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Hủy
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default RoomTemplateSelector;
