/**
 * Main App Component
 */

import React from 'react';
import { MainLayout } from './components/layout';
import FloorPlanEditor from './components/2d-editor/FloorPlanEditor';
import Scene3D from './components/3d-viewer/Scene3D';
import { useUIStore } from './stores';

const App: React.FC = () => {
  const viewMode = useUIStore((state) => state.viewMode);

  return (
    <MainLayout>
      {viewMode === '2d' ? <FloorPlanEditor /> : <Scene3D />}
    </MainLayout>
  );
};

export default App;
