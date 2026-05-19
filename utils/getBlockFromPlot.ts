import { BLOCK_PHASE_MAP } from '../constants/phases';

export function getBlockFromPlot(plotBlock: string): string {
  if (!plotBlock) return 'UNKNOWN';
  const match = plotBlock.toString().trim().match(/\s+([A-L])$/i);
  return match ? match[1].toUpperCase() : 'UNKNOWN';
}

export function getPhaseFromBlock(block: string): number {
  return BLOCK_PHASE_MAP[block.toUpperCase()] ?? 0;
}

export function getPlotNumber(plotBlock: string): string {
  const match = plotBlock?.toString().trim().match(/^(\d+)/);
  return match ? match[1] : plotBlock;
}
