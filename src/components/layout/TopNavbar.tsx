/**
 * TopNavbar - Top navigation bar component
 * Contains logo, view mode switch, and action buttons (Save, Export, etc.)
 */

import React, { useState } from 'react';
import {
  Navbar,
  Container,
  Nav,
  Button,
  ButtonGroup,
  Dropdown,
  DropdownButton
} from 'react-bootstrap';
import { useUIStore, useFloorPlanStore, useFurnitureStore } from '../../stores';
import RoomTemplateSelector from '../2d-editor/RoomTemplateSelector';

const TopNavbar: React.FC = () => {
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);

  const viewMode = useUIStore((state) => state.viewMode);
  const setViewMode = useUIStore((state) => state.setViewMode);
  const openModal = useUIStore((state) => state.openModal);
  const addNotification = useUIStore((state) => state.addNotification);

  const floorPlan = useFloorPlanStore((state) => state.floorPlan);
  const canUndo = useFloorPlanStore((state) => state.canUndo());
  const canRedo = useFloorPlanStore((state) => state.canRedo());
  const undo = useFloorPlanStore((state) => state.undo);
  const redo = useFloorPlanStore((state) => state.redo);

  /**
   * Handle Save Project
   */
  const handleSave = () => {
    try {
      if (!floorPlan) {
        addNotification({
          type: 'warning',
          message: 'No floor plan to save',
          duration: 3000
        });
        return;
      }

      // Save to localStorage
      localStorage.setItem('kitchen-studio-project', JSON.stringify({
        floorPlan,
        furniture: useFurnitureStore.getState().items,
        savedAt: new Date().toISOString()
      }));

      addNotification({
        type: 'success',
        message: 'Project saved successfully!',
        duration: 3000
      });
    } catch (error) {
      addNotification({
        type: 'error',
        message: 'Failed to save project',
        duration: 3000
      });
      console.error('Save error:', error);
    }
  };

  /**
   * Handle Load Project
   */
  const handleLoad = () => {
    openModal('load-project');
  };

  /**
   * Handle Export
   */
  const handleExport = (format: string) => {
    openModal('export', { format });
  };

  /**
   * Handle New Project
   */
  const handleNew = () => {
    openModal('new-project');
  };

  return (
    <>
      <Navbar bg="white" className="app-navbar border-bottom" sticky="top">
        <Container fluid>
        {/* Logo & Brand */}
        <Navbar.Brand href="#" className="d-flex align-items-center gap-2">
          <i className="bi bi-house-door-fill fs-4 text-primary"></i>
          <span className="fw-bold">Kitchen Studio</span>
        </Navbar.Brand>

        {/* View Mode Toggle */}
        <Nav className="mx-auto">
          <ButtonGroup>
            <Button
              variant={viewMode === '2d' ? 'primary' : 'outline-primary'}
              onClick={() => setViewMode('2d')}
              className="d-flex align-items-center gap-2"
            >
              <i className="bi bi-grid-3x3"></i>
              <span className="d-none d-md-inline">2D Floor Plan</span>
              <span className="d-inline d-md-none">2D</span>
            </Button>
            <Button
              variant={viewMode === '3d' ? 'primary' : 'outline-primary'}
              onClick={() => setViewMode('3d')}
              className="d-flex align-items-center gap-2"
            >
              <i className="bi bi-box"></i>
              <span className="d-none d-md-inline">3D View</span>
              <span className="d-inline d-md-none">3D</span>
            </Button>
          </ButtonGroup>
        </Nav>

        {/* Actions */}
        <Nav className="gap-2">
          {/* Undo/Redo */}
          <ButtonGroup size="sm" className="d-none d-lg-flex">
            <Button
              variant="outline-secondary"
              onClick={undo}
              disabled={!canUndo}
              title="Undo (Ctrl+Z)"
            >
              <i className="bi bi-arrow-counterclockwise"></i>
            </Button>
            <Button
              variant="outline-secondary"
              onClick={redo}
              disabled={!canRedo}
              title="Redo (Ctrl+Y)"
            >
              <i className="bi bi-arrow-clockwise"></i>
            </Button>
          </ButtonGroup>

          {/* Templates */}
          {viewMode === '2d' && (
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => setShowTemplateSelector(true)}
              title="Room Templates"
              className="d-flex align-items-center gap-2"
            >
              <i className="bi bi-grid-3x3"></i>
              <span className="d-none d-md-inline">Templates</span>
            </Button>
          )}

          {/* New */}
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={handleNew}
            title="New Project"
            className="d-none d-sm-inline-flex align-items-center gap-2"
          >
            <i className="bi bi-file-earmark-plus"></i>
            <span className="d-none d-md-inline">New</span>
          </Button>

          {/* Save */}
          <Button
            variant="outline-success"
            size="sm"
            onClick={handleSave}
            title="Save Project (Ctrl+S)"
            className="d-flex align-items-center gap-2"
          >
            <i className="bi bi-save"></i>
            <span className="d-none d-md-inline">Save</span>
          </Button>

          {/* Load */}
          <Button
            variant="outline-primary"
            size="sm"
            onClick={handleLoad}
            title="Load Project"
            className="d-none d-sm-inline-flex align-items-center gap-2"
          >
            <i className="bi bi-folder-open"></i>
            <span className="d-none d-md-inline">Load</span>
          </Button>

          {/* Export */}
          {/* @ts-ignore - React 19 + react-bootstrap type compatibility issue */}
          <DropdownButton
            as={ButtonGroup}
            title={
              <>
                <i className="bi bi-download"></i>
                <span className="d-none d-md-inline ms-2">Export</span>
              </>
            }
            id="export-dropdown"
            variant="outline-info"
            size="sm"
            align="end"
          >
            <Dropdown.Item onClick={() => handleExport('json')}>
              <i className="bi bi-filetype-json me-2"></i>
              Export as JSON
            </Dropdown.Item>
            <Dropdown.Item onClick={() => handleExport('png')}>
              <i className="bi bi-image me-2"></i>
              Export as PNG
            </Dropdown.Item>
            <Dropdown.Item onClick={() => handleExport('pdf')}>
              <i className="bi bi-filetype-pdf me-2"></i>
              Export as PDF
            </Dropdown.Item>
            {viewMode === '3d' && (
              <>
                <Dropdown.Divider />
                <Dropdown.Item onClick={() => handleExport('glb')}>
                  <i className="bi bi-box-seam me-2"></i>
                  Export 3D Model (GLB)
                </Dropdown.Item>
              </>
            )}
          </DropdownButton>

          {/* Settings */}
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => openModal('settings')}
            title="Settings"
            className="d-none d-lg-inline-flex"
          >
            <i className="bi bi-gear"></i>
          </Button>
        </Nav>
      </Container>
    </Navbar>

      {/* Room Template Selector Modal */}
      <RoomTemplateSelector
        show={showTemplateSelector}
        onHide={() => setShowTemplateSelector(false)}
      />
    </>
  );
};

export default TopNavbar;
