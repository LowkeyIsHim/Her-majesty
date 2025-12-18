'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, RotateCcw, Trophy } from 'lucide-react';
import { shuffleArray, saveScore, getLeaderboard, formatTime } from '@/lib/gameUtils';

const emojis = ['❤️', '🌟', '🎨', '🎮', '🎵', '🔥', '💎', '🌈'];

interface Card {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const MemoryGame: React.FC = () => {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [bestTime, setBestTime] = useState<number | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const leaderboard = getLeaderboard('memory');
    if (leaderboard.length > 0) {
      setBestTime(leaderboard[0].score);
    }
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && !isComplete) {
      interval = setInterval(() => {
        setTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, isComplete]);

  useEffect(() => {
    if (matches === 8) {
      setIsComplete(true);
      setIsPlaying(false);
      if (!bestTime || time < bestTime) {
        setBestTime(time);
        saveScore('memory', 'Player', time);
      }
    }
  }, [matches, time, bestTime]);

  useEffect(() => {
    if (flippedCards.length === 2) {
      const [first, second] = flippedCards;
      const firstCard = cards.find(c => c.id === first);
      const secondCard = cards.find(c => c.id === second);

      if (firstCard && secondCard && firstCard.emoji === secondCard.emoji) {
        setCards(prev =>
          prev.map(card =>
            card.id === first || card.id === second
              ? { ...card, isMatched: true }
              : card
          )
        );
        setMatches(prev => prev + 1);
        setFlippedCards([]);
      } else {
        setTimeout(() => {
          setCards(prev =>
            prev.map(card =>
              card.id === first || card.id === second
                ? { ...card, isFlipped: false }
                : card
            )
          );
          setFlippedCards([]);
        }, 1000);
      }
    }
  }, [flippedCards, cards]);

  const initGame = () => {
    const doubled = [...emojis, ...emojis];
    const shuffled = shuffleArray(doubled);
    const newCards: Card[] = shuffled.map((emoji, index) => ({
      id: index,
      emoji,
      isFlipped: false,
      isMatched: false,
    }));
    setCards(newCards);
    setFlippedCards([]);
    setMoves(0);
    setMatches(0);
    setTime(0);
    setIsPlaying(true);
    setIsComplete(false);
  };

  const handleCardClick = (id: number) => {
    if (!isPlaying || flippedCards.length === 2) return;
    
    const card = cards.find(c => c.id === id);
    if (!card || card.isFlipped || card.isMatched) return;

    setCards(prev =>
      prev.map(c => (c.id === id ? { ...c, isFlipped: true } : c))
    );
    setFlippedCards(prev => [...prev, id]);
    setMoves(prev => prev + 1);
  };

  return (
    <div className="flex flex-col items-center justify-center gap-8">
      <div className="flex gap-8 items-center flex-wrap justify-center">
        <div className="text-center">
          <p className="text-white/60 text-sm mb-1">Time</p>
          <p className="text-3xl font-bold text-white">{formatTime(time)}</p>
        </div>
        <div className="text-center">
          <p className="text-white/60 text-sm mb-1">Moves</p>
          <p className="text-3xl font-bold text-white">{moves}</p>
        </div>
        <div className="text-center">
          <p className="text-white/60 text-sm mb-1 flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            Best Time
          </p>
          <p className="text-3xl font-bold text-yellow-400">
            {bestTime ? formatTime(bestTime) : '--:--'}
          </p>
        </div>
      </div>

      <div className="relative">
        <div className="grid grid-cols-4 gap-4">
          {cards.map((card) => (
            <motion.button
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              whileHover={{ scale: card.isMatched ? 1 : 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`w-20 h-20 rounded-2xl flex items-center justify-center text-4xl font-bold transition-all ${
                card.isFlipped || card.isMatched
                  ? 'bg-gradient-to-br from-purple-500 to-pink-600'
                  : 'bg-white/10 hover:bg-white/20'
              } ${card.isMatched ? 'opacity-50' : ''}`}
            >
              {card.isFlipped || card.isMatched ? card.emoji : '?'}
            </motion.button>
          ))}
        </div>

        <AnimatePresence>
          {isComplete && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 rounded-2xl flex items-center justify-center backdrop-blur-sm"
            >
              <div className="text-center p-8">
                <p className="text-4xl font-bold text-white mb-4">🎉 Complete!</p>
                <p className="text-xl text-white/70 mb-2">Time: {formatTime(time)}</p>
                <p className="text-lg text-white/60 mb-6">Moves: {moves}</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={initGame}
                  className="px-8 py-3 bg-purple-500 text-white rounded-full font-semibold flex items-center gap-2 mx-auto"
                >
                  <RotateCcw className="w-5 h-5" />
                  Play Again
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {!isPlaying && !isComplete && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 rounded-2xl flex items-center justify-center backdrop-blur-sm"
            >
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={initGame}
                className="px-12 py-4 bg-purple-500 text-white rounded-full font-bold text-xl flex items-center gap-3"
              >
                <Play className="w-6 h-6" fill="currentColor" />
                Start Game
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="text-center text-white/60 text-sm">
        <p>Match all pairs as fast as you can!</p>
      </div>
    </div>
  );
};

export default MemoryGame;
