/**
 * MainLayout - Main application layout component
 * Manages the overall structure: Navbar, Sidebar, Main content, Panel, Toolbar
 */

import React from 'react';
import { Container } from 'react-bootstrap';
import { useUIStore } from '../../stores';
import TopNavbar from './TopNavbar';
import LeftSidebar from './LeftSidebar';
import RightPanel from './RightPanel';
import BottomToolbar from './BottomToolbar';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  // Get UI state from store
  const leftSidebarOpen = useUIStore((state) => state.leftSidebar.isOpen);
  const rightPanelOpen = useUIStore((state) => state.rightPanel.isOpen);
  const bottomToolbarOpen = useUIStore((state) => state.bottomToolbar.isOpen);

  return (
    <div className="app-layout">
      {/* Top Navbar */}
      <TopNavbar />

      {/* Main Content Area */}
      <div className="app-content">
        {/* Left Sidebar */}
        <aside className={`app-sidebar ${!leftSidebarOpen ? 'collapsed' : ''}`}>
          <LeftSidebar />
        </aside>

        {/* Main Canvas/Content */}
        <main className="app-main">
          {children}
        </main>

        {/* Right Panel */}
        <aside className={`app-panel ${!rightPanelOpen ? 'collapsed' : ''}`}>
          <RightPanel />
        </aside>
      </div>

      {/* Bottom Toolbar */}
      <footer className={`app-toolbar ${!bottomToolbarOpen ? 'collapsed' : ''}`}>
        <BottomToolbar />
      </footer>
    </div>
  );
};

export default MainLayout;
