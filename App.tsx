import React, { useState, useRef } from 'react';
import './src/styles/design-system.css';
import SideNav from './components/layout/SideNav';
import TopBar from './components/layout/TopBar';
import MobileNav from './components/layout/MobileNav';
import SGPACalculator from './components/SGPACalculator';
import CGPACalculator from './components/CGPACalculator';
import UniversityRules from './components/pages/UniversityRules';

type Page = 'sgpa' | 'cgpa' | 'rules';

const App: React.FC = () => {
  const [activePage, setActivePage] = useState<Page>('sgpa');

  // Refs to trigger export from child components
  const sgpaExportRef = useRef<(() => void) | null>(null);
  const cgpaExportRef = useRef<(() => void) | null>(null);

  const handleExport = () => {
    if (activePage === 'sgpa' && sgpaExportRef.current) {
      sgpaExportRef.current();
    } else if (activePage === 'cgpa' && cgpaExportRef.current) {
      cgpaExportRef.current();
    }
  };

  return (
    <div className="min-h-screen bg-background text-[#fafafa] selection:bg-primary/30">
      {/* Top Bar */}
      <TopBar
        activePage={activePage}
        onNavigate={setActivePage}
        onExport={activePage !== 'rules' ? handleExport : undefined}
      />

      <div className="flex h-full">
        {/* Sidebar */}
        <SideNav activePage={activePage} onNavigate={setActivePage} />

        {/* Main area */}
        <main className="lg:ml-64 pt-24 pb-32 lg:pb-8 px-4 md:px-8 max-w-7xl mx-auto min-h-screen min-w-0">
          <div className="py-8">
            {activePage === 'sgpa' && (
              <SGPACalculator
                onExportReady={(fn) => {
                  sgpaExportRef.current = fn;
                }}
              />
            )}
            {activePage === 'cgpa' && (
              <CGPACalculator
                onExportReady={(fn) => {
                  cgpaExportRef.current = fn;
                }}
              />
            )}
            {activePage === 'rules' && <UniversityRules />}
          </div>
        </main>
      </div>

      {/* Mobile bottom nav */}
      <MobileNav activePage={activePage} onNavigate={setActivePage} />
    </div>
  );
};

export default App;
