import React, { useState, useEffect } from 'react';
import { SoilPulseRod } from './components/SoilPulseRod';
import { Dashboard } from './components/Dashboard';
import { SoilStatus, AnalysisResult } from './types';
import { generateSoilAnalysis } from './services/geminiService';

const App: React.FC = () => {
  const [isInserted, setIsInserted] = useState(false);
  const [status, setStatus] = useState<SoilStatus>(SoilStatus.IDLE);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  // Simulation Logic
  const handleSimulate = async (targetState: 'UNSAFE' | 'RECOVERING' | 'READY') => {
    // 1. Insert Probe
    if (!isInserted) {
      setIsInserted(true);
    }
    
    // 2. Start Scanning
    setStatus(SoilStatus.SCANNING);
    setAnalysis(null);

    // 3. Simulate Sensor Delay (Mycelium growth animation time)
    setTimeout(async () => {
      // 4. Determine Data based on Target State
      let mockData;
      switch (targetState) {
        case 'UNSAFE':
          mockData = { radiationLevel: 85, myceliumDensity: 12, soilStructure: 30, waterRetention: 20 };
          setStatus(SoilStatus.UNSAFE);
          break;
        case 'RECOVERING':
          mockData = { radiationLevel: 45, myceliumDensity: 65, soilStructure: 55, waterRetention: 60 };
          setStatus(SoilStatus.RECOVERING);
          break;
        case 'READY':
          mockData = { radiationLevel: 5, myceliumDensity: 92, soilStructure: 88, waterRetention: 85 };
          setStatus(SoilStatus.READY);
          break;
      }

      // 5. Call AI for Text Analysis
      const aiText = await generateSoilAnalysis(
        targetState === 'UNSAFE' ? SoilStatus.UNSAFE : targetState === 'RECOVERING' ? SoilStatus.RECOVERING : SoilStatus.READY,
        mockData
      );

      setAnalysis({
        status: targetState === 'UNSAFE' ? SoilStatus.UNSAFE : targetState === 'RECOVERING' ? SoilStatus.RECOVERING : SoilStatus.READY,
        data: mockData,
        aiAnalysis: aiText
      });

    }, 2500); // 2.5s scan time
  };

  const handleReset = () => {
    setIsInserted(false);
    setStatus(SoilStatus.IDLE);
    setAnalysis(null);
  };

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-noise overflow-hidden">
      {/* Left Panel: Visualizer */}
      <div className="w-full md:w-1/2 h-1/2 md:h-full relative border-b md:border-b-0 md:border-r border-zinc-800">
        <div className="absolute top-4 left-4 z-20 pointer-events-none">
          <h2 className="text-xs font-mono text-zinc-500">[VISUAL_FEED_01]</h2>
        </div>
        <SoilPulseRod status={status} isInserted={isInserted} />
      </div>

      {/* Right Panel: UI & Dashboard */}
      <div className="w-full md:w-1/2 h-1/2 md:h-full relative">
        <Dashboard 
          analysis={analysis}
          status={status}
          onReset={handleReset}
          onSimulate={handleSimulate}
          isInserted={isInserted}
        />
      </div>
    </div>
  );
};

export default App;