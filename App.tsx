import React, { useState, useRef } from 'react';
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
    <div className="flex min-h-screen bg-[#09090b] text-[#fafafa]">
      {/* Sidebar */}
      <SideNav activePage={activePage} onNavigate={setActivePage} />

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar
          activePage={activePage}
          onExport={activePage !== 'rules' ? handleExport : undefined}
        />

        <div className="flex-1 overflow-y-auto pb-16 md:pb-0">
          {activePage === 'sgpa' && (
            <SGPACalculator onExportReady={(fn) => { sgpaExportRef.current = fn; }} />
          )}
          {activePage === 'cgpa' && (
            <CGPACalculator onExportReady={(fn) => { cgpaExportRef.current = fn; }} />
          )}
          {activePage === 'rules' && <UniversityRules />}
        </div>
      </div>

      {/* Mobile bottom nav */}
      <MobileNav activePage={activePage} onNavigate={setActivePage} />
    </div>
  );
};

export default App;