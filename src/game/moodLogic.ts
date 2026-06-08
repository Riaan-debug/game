import type { TimeOfDay } from './types';
import { clampNeed } from './constants';
import type { SimState } from './types';

export function getTimeOfDay(simTimeMinutes: number): TimeOfDay {
  const hour = Math.floor(simTimeMinutes / 60) % 24;
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'day';
  if (hour >= 18 && hour < 22) return 'evening';
  return 'night';
}

export function getTimeOfDayLabel(simTimeMinutes: number): string {
  const labels: Record<TimeOfDay, string> = {
    morning: 'Morning',
    day: 'Afternoon',
    evening: 'Evening',
    night: 'Night',
  };
  return labels[getTimeOfDay(simTimeMinutes)];
}

export function getDaylightFactor(simTimeMinutes: number): number {
  const hour = (simTimeMinutes / 60) % 24;
  if (hour >= 7 && hour <= 18) return 1;
  if (hour >= 6 && hour < 7) return 0.55 + (hour - 6) * 0.45;
  if (hour > 18 && hour <= 20) return 1 - (hour - 18) * 0.35;
  if (hour > 20 && hour <= 22) return 0.3 - (hour - 20) * 0.12;
  return 0.22;
}

export function getSkyColors(simTimeMinutes: number): { background: string; fog: string } {
  const period = getTimeOfDay(simTimeMinutes);
  const palettes: Record<TimeOfDay, { background: string; fog: string }> = {
    morning: { background: '#3d4f6f', fog: '#3d4f6f' },
    day: { background: '#5a7a9a', fog: '#4a6680' },
    evening: { background: '#4a3d5c', fog: '#4a3d5c' },
    night: { background: '#1a1625', fog: '#1a1625' },
  };
  return palettes[period];
}

export function computeMood(sim: SimState): number {
  const needs = [sim.hunger, sim.energy, sim.hygiene, sim.fun, sim.social];
  const average = needs.reduce((sum, value) => sum + value, 0) / needs.length;
  const criticalCount = needs.filter((value) => value < 25).length;
  const penalty = criticalCount * 10;
  return clampNeed(average - penalty);
}

export function getMoodLabel(mood: number): string {
  if (mood >= 85) return 'Elated';
  if (mood >= 70) return 'Happy';
  if (mood >= 50) return 'Fine';
  if (mood >= 30) return 'Stressed';
  return 'Miserable';
}

export function skillLevel(skill: number): number {
  return Math.min(10, Math.floor(skill / 10) + 1);
}
