// Game state hook — persists XP, learnedSigns, and streak to localStorage

import { useState, useEffect, useCallback } from 'react';

export interface GameState {
  xp: number;
  level: number;
  learnedSigns: Set<string>;
  streak: number;
  addXP: (amount: number) => void;
  markLearned: (id: string) => void;
  isLearned: (id: string) => boolean;
}

const XP_PER_LEVEL = 100;

function getLevelFromXP(xp: number): number {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
}

function getTodayKey(): string {
  return new Date().toISOString().split('T')[0];
}

function loadFromStorage() {
  const xp = parseInt(localStorage.getItem('edusign_xp') || '0', 10);
  const learnedRaw = JSON.parse(localStorage.getItem('edusign_learned') || '[]') as string[];
  const learnedSigns = new Set<string>(learnedRaw);

  // Streak logic
  const lastVisit = localStorage.getItem('edusign_last_visit');
  const today = getTodayKey();
  let streak = parseInt(localStorage.getItem('edusign_streak') || '0', 10);

  if (lastVisit === today) {
    // same day, keep streak
  } else if (lastVisit) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yKey = yesterday.toISOString().split('T')[0];
    streak = lastVisit === yKey ? streak + 1 : 1;
  } else {
    streak = 1;
  }
  localStorage.setItem('edusign_last_visit', today);
  localStorage.setItem('edusign_streak', String(streak));

  return { xp, learnedSigns, streak };
}

export function useGameState(): GameState {
  const [xp, setXP] = useState(0);
  const [learnedSigns, setLearnedSigns] = useState<Set<string>>(new Set());
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const data = loadFromStorage();
    setXP(data.xp);
    setLearnedSigns(data.learnedSigns);
    setStreak(data.streak);
  }, []);

  const addXP = useCallback((amount: number) => {
    setXP(prev => {
      const next = prev + amount;
      localStorage.setItem('edusign_xp', String(next));
      return next;
    });
  }, []);

  const markLearned = useCallback((id: string) => {
    setLearnedSigns(prev => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      localStorage.setItem('edusign_learned', JSON.stringify([...next]));
      return next;
    });
  }, []);

  const isLearned = useCallback((id: string) => learnedSigns.has(id), [learnedSigns]);

  return {
    xp,
    level: getLevelFromXP(xp),
    learnedSigns,
    streak,
    addXP,
    markLearned,
    isLearned,
  };
}

export const XP_PER_LEVEL_CONST = XP_PER_LEVEL;
