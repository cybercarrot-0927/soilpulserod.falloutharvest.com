export enum SoilStatus {
  IDLE = 'IDLE',
  SCANNING = 'SCANNING',
  UNSAFE = 'UNSAFE',
  RECOVERING = 'RECOVERING',
  READY = 'READY'
}

export interface SoilData {
  radiationLevel: number; // 0-100 (uSv/h)
  myceliumDensity: number; // 0-100 (%)
  soilStructure: number; // 0-100 (integrity)
  waterRetention: number; // 0-100 (%)
}

export interface AnalysisResult {
  status: SoilStatus;
  data: SoilData;
  aiAnalysis?: string;
}

export const STATUS_COLORS = {
  [SoilStatus.IDLE]: 'text-zinc-500 bg-zinc-900 border-zinc-700 shadow-none',
  [SoilStatus.SCANNING]: 'text-cyan-400 bg-cyan-950 border-cyan-500 shadow-cyan-500/50',
  [SoilStatus.UNSAFE]: 'text-red-500 bg-red-950 border-red-500 shadow-red-500/50',
  [SoilStatus.RECOVERING]: 'text-amber-400 bg-amber-950 border-amber-500 shadow-amber-500/50',
  [SoilStatus.READY]: 'text-emerald-400 bg-emerald-950 border-emerald-500 shadow-emerald-500/50',
};

export const STATUS_LIGHT_COLORS = {
    [SoilStatus.IDLE]: '#52525b', // zinc-600
    [SoilStatus.SCANNING]: '#22d3ee', // cyan-400
    [SoilStatus.UNSAFE]: '#ef4444', // red-500
    [SoilStatus.RECOVERING]: '#fbbf24', // amber-400
    [SoilStatus.READY]: '#34d399', // emerald-400
}
