// Generate random room code (6 chars)
export const generateRoomCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Shuffle array
export const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Get leaderboard from localStorage
export const getLeaderboard = (gameType: string): Array<{ name: string; score: number }> => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(`leaderboard_${gameType}`);
  return stored ? JSON.parse(stored) : [];
};

// Save score to leaderboard
export const saveScore = (gameType: string, name: string, score: number): void => {
  if (typeof window === 'undefined') return;
  
  const leaderboard = getLeaderboard(gameType);
  leaderboard.push({ name, score });
  leaderboard.sort((a, b) => b.score - a.score);
  const top10 = leaderboard.slice(0, 10);
  
  localStorage.setItem(`leaderboard_${gameType}`, JSON.stringify(top10));
};

// Format time (seconds to MM:SS)
export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// Calculate accuracy percentage
export const calculateAccuracy = (hits: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((hits / total) * 100);
};

// Random position generator (for target games)
export const getRandomPosition = (maxWidth: number, maxHeight: number, size: number) => {
  return {
    x: Math.random() * (maxWidth - size),
    y: Math.random() * (maxHeight - size),
  };
};
