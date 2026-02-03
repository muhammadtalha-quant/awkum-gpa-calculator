
import React, { useState } from 'react';
import Header from './components/Header';
import SGPACalculator from './components/SGPACalculator';
import CGPACalculator from './components/CGPACalculator';
import CalculationInfo from './components/CalculationInfo';
import GradingChart from './components/GradingChart';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'sgpa' | 'cgpa'>('sgpa');

  return (
    <div className="min-h-screen pb-16">
      <div className="max-w-4xl mx-auto px-4 pt-12">
        <Header />

        <div className="flex justify-center mb-8">
          <nav className="inline-flex bg-gray-200 p-1 rounded-2xl">
            <button
              onClick={() => setActiveTab('sgpa')}
              className={`px-8 py-2.5 rounded-xl font-semibold transition-all ${
                activeTab === 'sgpa'
                  ? 'bg-white text-blue-600 shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Semester GPA
            </button>
            <button
              onClick={() => setActiveTab('cgpa')}
              className={`px-8 py-2.5 rounded-xl font-semibold transition-all ${
                activeTab === 'cgpa'
                  ? 'bg-white text-blue-600 shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Cumulative GPA
            </button>
          </nav>
        </div>

        <main className="space-y-8">
          {activeTab === 'sgpa' ? (
            <div className="animate-in fade-in duration-300">
              <SGPACalculator />
            </div>
          ) : (
            <div className="animate-in fade-in duration-300">
              <CGPACalculator />
            </div>
          )}

          <CalculationInfo />
          <GradingChart />
        </main>

        <footer className="mt-12 text-center text-gray-500 text-xs">
          <p>© {new Date().getFullYear()} Abdul Wali Khan University Mardan - Academic Tools</p>
          <p className="mt-1">Developed for Students of AWKUM</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
