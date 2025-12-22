'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, Users, Trophy, Zap, RotateCcw } from 'lucide-react';
import { ref, set, onValue, off } from 'firebase/database';
import { database } from '@/lib/firebase';
import { generateRoomCode } from '@/lib/gameUtils';
import { sounds } from '@/lib/sounds';

interface Player {
  name: string;
  score: number;
  ready: boolean;
  answered: boolean;
}

interface GameState {
  roomCode: string;
  players: Record<string, Player>;
  question: { num1: number; num2: number; operator: string; answer: number } | null;
  round: number;
  maxRounds: number;
  winner: string | null;
}

const QuickMathGame: React.FC = () => {
  const [roomCode, setRoomCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [answer, setAnswer] = useState('');
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (roomCode) {
      const gameRef = ref(database, `games/quickmath/${roomCode}`);
      
      const unsubscribe = onValue(gameRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setGameState(data);
          if (data.question) {
            setTimeout(() => inputRef.current?.focus(), 100);
          }
        }
      });

      return () => {
        off(gameRef);
      };
    }
  }, [roomCode]);

  const createRoom = () => {
    if (!playerName.trim()) return;
    
    const code = generateRoomCode();
    setRoomCode(code);

    const initialState: GameState = {
      roomCode: code,
      players: {
        [playerName]: { name: playerName, score: 0, ready: false, answered: false }
      },
      question: null,
      round: 0,
      maxRounds: 10,
      winner: null,
    };

    set(ref(database, `games/quickmath/${code}`), initialState);
  };

  const joinRoom = () => {
    if (!inputCode || !playerName.trim()) return;
    
    const upperCode = inputCode.toUpperCase();
    setRoomCode(upperCode);
    
    const gameRef = ref(database, `games/quickmath/${upperCode}`);
    
    onValue(gameRef, (snapshot) => {
      const data = snapshot.val();
      if (data && !data.players[playerName]) {
        set(ref(database, `games/quickmath/${upperCode}/players/${playerName}`), {
          name: playerName,
          score: 0,
          ready: false,
          answered: false,
        });
      }
    }, { onlyOnce: true });
  };

  const markReady = () => {
    if (!roomCode || !gameState) return;
    
    set(ref(database, `games/quickmath/${roomCode}/players/${playerName}/ready`), true);
    
    const allReady = Object.values(gameState.players).every(p => p.ready || p.name === playerName);
    
    if (allReady && Object.keys(gameState.players).length >= 2) {
      setTimeout(() => generateQuestion(), 500);
    }
  };

  const generateQuestion = () => {
    if (!roomCode || !gameState) return;

    const newRound = gameState.round + 1;
    
    if (newRound > gameState.maxRounds) {
      const winner = Object.values(gameState.players).reduce((prev, current) =>
        current.score > prev.score ? current : prev
      );
      
      set(ref(database, `games/quickmath/${roomCode}/winner`), winner.name);
      sounds.victory();
      return;
    }

    const operators = ['+', '-', '*'];
    const operator = operators[Math.floor(Math.random() * operators.length)];
    const num1 = Math.floor(Math.random() * 50) + 1;
    const num2 = Math.floor(Math.random() * 20) + 1;
    
    let correctAnswer = 0;
    switch(operator) {
      case '+': correctAnswer = num1 + num2; break;
      case '-': correctAnswer = num1 - num2; break;
      case '*': correctAnswer = num1 * num2; break;
    }

    set(ref(database, `games/quickmath/${roomCode}`), {
      ...gameState,
      question: { num1, num2, operator, answer: correctAnswer },
      round: newRound,
      players: Object.fromEntries(
        Object.entries(gameState.players).map(([key, player]) => [
          key,
          { ...player, ready: false, answered: false }
        ])
      ),
    });

    setAnswer('');
    sounds.countdown();
  };

  const submitAnswer = () => {
    if (!gameState || !roomCode || !gameState.question || !answer) return;
    
    const isCorrect = parseInt(answer) === gameState.question.answer;
    
    if (isCorrect) {
      const newScore = (gameState.players[playerName]?.score || 0) + 10;
      set(ref(database, `games/quickmath/${roomCode}/players/${playerName}`), {
        ...gameState.players[playerName],
        score: newScore,
        answered: true,
      });
      sounds.collect();
    } else {
      set(ref(database, `games/quickmath/${roomCode}/players/${playerName}/answered`), true);
      sounds.miss();
    }

    setAnswer('');

    const allAnswered = Object.values(gameState.players).every(p => p.answered || p.name === playerName);
    if (allAnswered) {
      setTimeout(() => generateQuestion(), 2000);
    }
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    sounds.buttonClick();
  };

  const getPlayersList = () => {
    return gameState ? Object.values(gameState.players).sort((a, b) => b.score - a.score) : [];
  };

  if (!roomCode) {
    return (
      <div className="flex flex-col items-center justify-center gap-8 p-4">
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 max-w-md w-full">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">
            Quick Math Battle
          </h2>

          <input
            type="text"
            placeholder="Your name..."
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-purple-500 mb-4"
            maxLength={20}
          />

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={createRoom}
            disabled={!playerName.trim()}
            className="w-full py-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-2xl font-semibold mb-4 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Zap className="w-5 h-5" />
            Create Room
          </motion.button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-transparent text-white/60">or</span>
            </div>
          </div>

          <input
            type="text"
            placeholder="Enter room code..."
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value.toUpperCase())}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-purple-500 mb-4"
            maxLength={6}
          />

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={joinRoom}
            disabled={!inputCode || !playerName.trim()}
            className="w-full py-4 bg-white/10 text-white rounded-2xl font-semibold disabled:opacity-50"
          >
            Join Room
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-6 max-w-4xl mx-auto p-4">
      <div className="flex items-center gap-4 flex-wrap justify-center">
        <div className="bg-white/5 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2 border border-white/10">
          <span className="text-white/60 text-sm">Room:</span>
          <span className="text-white font-mono font-bold">{roomCode}</span>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={copyRoomCode}
            className="p-1 hover:bg-white/10 rounded"
          >
            {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3 text-white/60" />}
          </motion.button>
        </div>

        <div className="bg-white/5 backdrop-blur-sm px-4 py-2 rounded-full text-sm border border-white/10">
          <span className="text-white/60">Round: </span>
          <span className="text-white font-bold">
            {gameState?.round}/{gameState?.maxRounds}
          </span>
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 w-full max-w-2xl">
        {gameState?.winner ? (
          <div className="text-center py-12">
            <Trophy className="w-24 h-24 text-yellow-400 mx-auto mb-6" />
            <h2 className="text-4xl font-bold text-white mb-4">
              {gameState.winner} Wins! 🎉
            </h2>
            <div className="space-y-2 mt-8">
              {getPlayersList().map((player, index) => (
                <div key={player.name} className="flex items-center justify-between text-lg">
                  <span className="text-white">
                    {index + 1}. {player.name}
                  </span>
                  <span className="text-yellow-400 font-bold">{player.score}</span>
                </div>
              ))}
            </div>
          </div>
        ) : gameState?.question ? (
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-white/60 text-sm mb-4">Solve this:</p>
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="text-6xl font-bold text-white mb-6"
              >
                {gameState.question.num1} {gameState.question.operator} {gameState.question.num2} = ?
              </motion.div>
            </div>

            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="number"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && submitAnswer()}
                placeholder="Your answer..."
                disabled={gameState.players[playerName]?.answered}
                className="flex-1 px-6 py-4 bg-white/5 border-2 border-white/10 rounded-2xl text-white text-2xl text-center placeholder-white/40 focus:outline-none focus:border-purple-500 disabled:opacity-50"
                autoFocus
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={submitAnswer}
                disabled={!answer || gameState.players[playerName]?.answered}
                className="px-8 py-4 bg-purple-500 text-white rounded-2xl font-semibold disabled:opacity-50"
              >
                Submit
              </motion.button>
            </div>

            <div className="space-y-2">
              <p className="text-white/60 text-sm text-center">Leaderboard:</p>
              {getPlayersList().map((player) => (
                <div key={player.name} className="flex items-center justify-between">
                  <span className={`${player.name === playerName ? 'text-purple-400' : 'text-white'}`}>
                    {player.name} {player.answered && '✓'}
                  </span>
                  <span className="text-white font-bold">{player.score}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="w-20 h-20 text-white/40 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-white mb-4">
              Waiting for players...
            </h3>
            <p className="text-white/60 mb-6">
              {Object.keys(gameState?.players || {}).length} player(s) in room
            </p>
            
            {Object.keys(gameState?.players || {}).length >= 2 ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={markReady}
                disabled={gameState?.players[playerName]?.ready}
                className="px-8 py-3 bg-purple-500 text-white rounded-full font-semibold disabled:opacity-50"
              >
                {gameState?.players[playerName]?.ready ? 'Ready! ✓' : 'Ready to Start'}
              </motion.button>
            ) : (
              <p className="text-white/40 text-sm">
                Need at least 2 players to start
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuickMathGame;
