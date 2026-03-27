import React, { useState } from 'react';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-[#fafafa] selection:bg-primary/30">
      {/* Top Bar */}
      <TopBar
        activePage={activePage}
        onNavigate={(page) => {
          setActivePage(page);
          setMobileMenuOpen(false);
        }}
        onMenuClick={() => setMobileMenuOpen(true)}
      />

      <div className="flex h-full">
        {/* Sidebar */}
        <SideNav
          activePage={activePage}
          onNavigate={(page) => {
            setActivePage(page);
            setMobileMenuOpen(false);
          }}
          mobileOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
        />

        {/* Main area */}
        <main className="flex-1 lg:pl-64 pt-24 pb-24 lg:pb-8 min-h-screen min-w-0 overflow-x-hidden">
          <div className="px-4 sm:px-12 lg:px-20 max-w-[2000px] mx-auto py-8">
            {activePage === 'sgpa' && <SGPACalculator />}
            {activePage === 'cgpa' && <CGPACalculator />}
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
