import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  Radar 
} from 'recharts';
import { SoilData, SoilStatus, AnalysisResult, STATUS_COLORS } from '../types';
import { Activity, Radio, Sprout, Droplets, Cpu } from 'lucide-react';

interface DashboardProps {
  analysis: AnalysisResult | null;
  status: SoilStatus;
  onReset: () => void;
  onSimulate: (type: 'UNSAFE' | 'RECOVERING' | 'READY') => void;
  isInserted: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  analysis, 
  status, 
  onReset, 
  onSimulate,
  isInserted 
}) => {
  const chartData = analysis ? [
    { name: 'Radiation', value: analysis.data.radiationLevel, fill: '#ef4444' },
    { name: 'Mycelium', value: analysis.data.myceliumDensity, fill: '#fbbf24' },
    { name: 'Structure', value: analysis.data.soilStructure, fill: '#34d399' },
    { name: 'H2O', value: analysis.data.waterRetention, fill: '#3b82f6' },
  ] : [];

  const radarData = analysis ? [
    { subject: 'Toxicity', A: analysis.data.radiationLevel, fullMark: 100 },
    { subject: 'Biology', A: analysis.data.myceliumDensity, fullMark: 100 },
    { subject: 'Nutrients', A: analysis.data.soilStructure, fullMark: 100 },
    { subject: 'Moisture', A: analysis.data.waterRetention, fullMark: 100 },
    { subject: 'PH', A: 65, fullMark: 100 },
  ] : [];

  return (
    <div className="h-full flex flex-col p-8 gap-6 bg-zinc-900/90 border-l border-zinc-800 backdrop-blur-sm overflow-y-auto font-mono">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tighter uppercase flex items-center gap-2">
            <Cpu className="w-6 h-6 text-zinc-400" />
            SoilPulse <span className="text-zinc-500">v2.4</span>
          </h1>
          <p className="text-xs text-zinc-500 mt-1">Fallout Harvest // Eco-Restoration System</p>
        </div>
        <div className={`px-4 py-1 rounded-full border text-xs font-bold tracking-widest ${STATUS_COLORS[status]}`}>
          {status}
        </div>
      </div>

      {/* Control Panel (Simulation triggers) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 bg-zinc-950/50 rounded-lg border border-zinc-800">
        <div className="col-span-full mb-2 text-xs text-zinc-400 uppercase tracking-widest">
          Simulation Controls
        </div>
        
        {!isInserted ? (
           <button 
             onClick={() => onSimulate('RECOVERING')} // Default first action
             className="col-span-full py-4 bg-zinc-100 text-zinc-900 hover:bg-white font-bold rounded flex items-center justify-center gap-2 transition-all active:scale-95"
           >
             <Radio className="w-4 h-4" />
             INSERT PROBE & SCAN
           </button>
        ) : (
          <>
             <button 
               onClick={() => onSimulate('UNSAFE')}
               disabled={status === SoilStatus.SCANNING}
               className="py-2 bg-red-950/30 border border-red-900/50 text-red-500 hover:bg-red-900/50 hover:text-red-300 rounded text-xs transition-colors disabled:opacity-50"
             >
               SIM: UNSAFE
             </button>
             <button 
               onClick={() => onSimulate('RECOVERING')}
               disabled={status === SoilStatus.SCANNING}
               className="py-2 bg-amber-950/30 border border-amber-900/50 text-amber-500 hover:bg-amber-900/50 hover:text-amber-300 rounded text-xs transition-colors disabled:opacity-50"
             >
               SIM: RECOVERING
             </button>
             <button 
               onClick={() => onSimulate('READY')}
               disabled={status === SoilStatus.SCANNING}
               className="py-2 bg-emerald-950/30 border border-emerald-900/50 text-emerald-500 hover:bg-emerald-900/50 hover:text-emerald-300 rounded text-xs transition-colors disabled:opacity-50"
             >
               SIM: READY
             </button>
             <button 
              onClick={onReset}
              className="col-span-full mt-2 py-2 border border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-white rounded text-xs transition-colors"
             >
               RETRACT PROBE
             </button>
          </>
        )}
      </div>

      {/* Data Visualization Area */}
      {analysis && status !== SoilStatus.SCANNING ? (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          {/* AI Analysis Text */}
          <div className="p-4 bg-zinc-800/50 border-l-2 border-zinc-500 rounded-r">
             <h3 className="text-xs font-bold text-zinc-400 uppercase mb-2 flex items-center gap-2">
               <Activity className="w-3 h-3" /> System Analysis
             </h3>
             <p className="text-sm text-zinc-200 leading-relaxed font-sans">
               {analysis.aiAnalysis || "Computing..."}
             </p>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 gap-4">
             <MetricCard 
                label="Radiation" 
                value={`${analysis.data.radiationLevel} uSv/h`} 
                icon={<Radio className="w-4 h-4 text-red-400"/>}
                status={analysis.data.radiationLevel > 50 ? 'danger' : 'safe'}
             />
             <MetricCard 
                label="Mycelium" 
                value={`${analysis.data.myceliumDensity}%`} 
                icon={<Sprout className="w-4 h-4 text-amber-400"/>}
                status={analysis.data.myceliumDensity > 40 ? 'safe' : 'neutral'}
             />
             <MetricCard 
                label="Moisture" 
                value={`${analysis.data.waterRetention}%`} 
                icon={<Droplets className="w-4 h-4 text-blue-400"/>}
                status="neutral"
             />
             <MetricCard 
                label="Integrity" 
                value={`${analysis.data.soilStructure}/100`} 
                icon={<Activity className="w-4 h-4 text-emerald-400"/>}
                status={analysis.data.soilStructure > 70 ? 'safe' : 'danger'}
             />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 h-64">
            <div className="bg-zinc-950/30 p-4 rounded border border-zinc-800">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={80} tick={{fill: '#71717a', fontSize: 10}} />
                  <Tooltip 
                    contentStyle={{backgroundColor: '#18181b', borderColor: '#3f3f46', color: '#fff'}} 
                    itemStyle={{color: '#fff'}}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-zinc-950/30 p-4 rounded border border-zinc-800">
               <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                  <PolarGrid stroke="#333" />
                  <PolarAngleAxis dataKey="subject" tick={{fill: '#71717a', fontSize: 10}} />
                  <Radar name="Soil Data" dataKey="A" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.3} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-zinc-600 space-y-4">
           {status === SoilStatus.SCANNING ? (
             <>
                <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm tracking-widest animate-pulse text-cyan-500">ACQUIRING BIOSIGNATURES...</p>
             </>
           ) : (
             <div className="text-center p-8 border-2 border-dashed border-zinc-800 rounded-lg">
                <p>WAITING FOR INPUT</p>
                <p className="text-xs mt-2 opacity-50">Insert probe to begin analysis sequence.</p>
             </div>
           )}
        </div>
      )}
    </div>
  );
};

const MetricCard: React.FC<{label: string, value: string, icon: React.ReactNode, status: 'safe'|'danger'|'neutral'}> = ({
  label, value, icon, status
}) => {
  const color = status === 'safe' ? 'text-zinc-200' : status === 'danger' ? 'text-red-400' : 'text-zinc-400';
  return (
    <div className="bg-zinc-950/50 p-3 rounded border border-zinc-800 flex items-center justify-between">
      <div>
        <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">{label}</div>
        <div className={`text-lg font-bold ${color}`}>{value}</div>
      </div>
      <div className="opacity-80">{icon}</div>
    </div>
  )
}