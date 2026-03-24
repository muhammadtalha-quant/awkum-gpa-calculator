import React from 'react';

interface Props {
  theme?: any;
}

const CalculationInfo: React.FC<Props> = () => {
  return (
    <div className="bg-[#121215] rounded-xl p-6 border border-[#27272a]">
      <h3 className="text-sm font-bold uppercase tracking-wider text-[#fafafa] mb-6 flex items-center gap-2">
        <span className="material-symbols-outlined text-[#a78bfa] text-[18px]">functions</span>
        How the GPA is Calculated
      </h3>

      <div className="space-y-6">
        <section>
          <h4 className="font-medium text-[#a1a1aa] mb-2 text-sm">1. Marks to Grade Point Conversion</h4>
          <div className="bg-[#0c0c0f] p-4 rounded-lg font-mono text-sm border-l-4 border-[#a78bfa] space-y-1 text-[#fafafa]">
            <p>IF Marks ≥ 90: <span className="text-[#34d399]">GP = 4.00</span></p>
            <p>IF 50 ≤ Marks &lt; 90: <span className="text-[#34d399]">GP = 2.00 + (Marks − 50) × 0.05</span></p>
            <p>IF Marks &lt; 50: <span className="text-[#ef4444]">GP = 0.00</span></p>
          </div>
          <p className="mt-2 text-sm text-[#71717a]">AWKUM uses a linear scaling system where every mark above 50 adds 0.05 to the Grade Point.</p>
        </section>

        <section>
          <h4 className="font-medium text-[#a1a1aa] mb-2 text-sm">2. Mathematical Formulas</h4>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-[#0c0c0f] p-4 rounded-lg font-mono text-sm border border-[#27272a]">
              <span className="text-[#a78bfa] font-bold">SGPA Formula</span>
              <p className="mt-2 text-[#a1a1aa]">∑ (GP × Credits) / ∑ Credits</p>
            </div>
            <div className="bg-[#0c0c0f] p-4 rounded-lg font-mono text-sm border border-[#27272a]">
              <span className="text-[#34d399] font-bold">CGPA Formula</span>
              <p className="mt-2 text-[#a1a1aa]">∑ (SGPA × Sem. Credits) / ∑ Total Credits</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default CalculationInfo;
