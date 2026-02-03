
import React from 'react';

const CalculationInfo: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
      <h3 className="text-lg font-semibold text-gray-800 mb-6">How the GPA is Calculated</h3>
      
      <div className="space-y-6">
        <section>
          <h4 className="font-medium text-gray-700 mb-2">1. Marks to Grade Point Conversion</h4>
          <div className="bg-gray-100 p-4 rounded-xl font-mono text-sm border-l-4 border-blue-500 text-gray-800 space-y-1">
            <p>IF Marks ≥ 90: <span className="text-blue-600">GP = 4.00</span></p>
            <p>IF 50 ≤ Marks &lt; 90: <span className="text-blue-600">GP = 2.00 + (Marks - 50) × 0.05</span></p>
            <p>IF Marks &lt; 50: <span className="text-blue-600">GP = 0.00</span></p>
          </div>
          <p className="mt-2 text-sm text-gray-500">AWKUM uses a linear scaling system where every mark above 50 adds 0.05 to the Grade Point.</p>
        </section>

        <section>
          <h4 className="font-medium text-gray-700 mb-2">2. Mathematical Formulas</h4>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-gray-100 p-4 rounded-xl font-mono text-sm text-gray-800">
              <span className="text-blue-600 font-bold">SGPA Formula</span>
              <p className="mt-2">Σ (GP × Credits) / Σ Credits</p>
            </div>
            <div className="bg-gray-100 p-4 rounded-xl font-mono text-sm text-gray-800">
              <span className="text-blue-600 font-bold">CGPA Formula</span>
              <p className="mt-2">Σ (SGPA × Sem. Credits) / Σ Total Credits</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default CalculationInfo;
