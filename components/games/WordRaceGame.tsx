'use client';

import { ref, set, onValue, off, get } from 'firebase/database';
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Copy, Check, Users, Zap } from 'lucide-react';
import { database } from '@/lib/firebase';
import { generateRoomCode } from '@/lib/gameUtils';

interface Player {
  name: string;
  score: number;
  ready: boolean;
}

interface GameState {
  roomCode: string;
  players: Record<string, Player>;
  currentWord: string;
  round: number;
  maxRounds: number;
  winner: string | null;
}

const wordsList = [
  'javascript', 'typescript', 'react', 'python', 'developer',
  'algorithm', 'function', 'variable', 'database', 'server',
  'frontend', 'backend', 'framework', 'component', 'interface',
  'debugging', 'compiler', 'syntax', 'method', 'array'
];

const WordRaceGame: React.FC = () => {
  const [roomCode, setRoomCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [inputWord, setInputWord] = useState('');
  const [copied, setCopied] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (roomCode) {
      const gameRef = ref(database, `games/wordrace/${roomCode}`);
      
      const unsubscribe = onValue(gameRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setGameState(data);
          setIsConnected(true);
          
          if (data.currentWord && !startTime) {
            setStartTime(Date.now());
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
        [playerName]: { name: playerName, score: 0, ready: false }
      },
      currentWord: '',
      round: 0,
      maxRounds: 10,
      winner: null,
    };

    set(ref(database, `games/wordrace/${code}`), initialState);
  };
  
  const joinRoom = async () => {
  if (!inputCode || !playerName.trim() || !database) {
    return;
  }
  
  const upperCode = inputCode.toUpperCase().trim();
  const gameRef = ref(database, `games/wordrace/${upperCode}`);
  
  try {
    const snapshot = await get(gameRef);
    
    if (!snapshot.exists()) {
      alert('Room not found. Check the code.');
      return;
    }

    const data = snapshot.val();
    
    if (data.players && data.players[playerName]) {
      alert('Name already taken in this room');
      return;
    }

    setRoomCode(upperCode);
    
    await set(ref(database, `games/wordrace/${upperCode}/players/${playerName}`), {
      name: playerName,
      score: 0,
      ready: false,
    });

    sounds.buttonClick();
  } catch (err: any) {
    alert('Failed to join: ' + err.message);
  }
};

  const markReady = () => {
    if (!roomCode || !gameState) return;
    
    set(ref(database, `games/wordrace/${roomCode}/players/${playerName}/ready`), true);
    
    const allReady = Object.values(gameState.players).every(p => p.ready || p.name === playerName);
    
    if (allReady && Object.keys(gameState.players).length >= 2) {
      startNewRound();
    }
  };

  const startNewRound = () => {
    if (!roomCode || !gameState) return;

    const newRound = gameState.round + 1;
    
    if (newRound > gameState.maxRounds) {
      const winner = Object.values(gameState.players).reduce((prev, current) =>
        current.score > prev.score ? current : prev
      );
      
      set(ref(database, `games/wordrace/${roomCode}/winner`), winner.name);
      return;
    }

    const newWord = wordsList[Math.floor(Math.random() * wordsList.length)];
    
    set(ref(database, `games/wordrace/${roomCode}`), {
      ...gameState,
      currentWord: newWord,
      round: newRound,
      players: Object.fromEntries(
        Object.entries(gameState.players).map(([key, player]) => [
          key,
          { ...player, ready: false }
        ])
      ),
    });

    setInputWord('');
    setStartTime(Date.now());
  };

  const checkWord = () => {
    if (!gameState || !roomCode || !startTime) return;
    
    if (inputWord.toLowerCase().trim() === gameState.currentWord.toLowerCase()) {
      const timeTaken = (Date.now() - startTime) / 1000;
      const points = Math.max(100 - Math.floor(timeTaken * 10), 10);
      
      const newScore = (gameState.players[playerName]?.score || 0) + points;
      
      set(ref(database, `games/wordrace/${roomCode}/players/${playerName}`), {
        ...gameState.players[playerName],
        score: newScore,
        ready: true,
      });

      setInputWord('');
      setStartTime(null);
    }
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getPlayersList = () => {
    return gameState ? Object.values(gameState.players).sort((a, b) => b.score - a.score) : [];
  };

  if (!roomCode) {
    return (
      <div className="flex flex-col items-center justify-center gap-8">
        <div className="glass rounded-3xl p-8 max-w-md w-full">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">
            Join Word Race
          </h2>

          <input
            type="text"
            placeholder="Your name..."
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-yellow-500 mb-4"
            maxLength={20}
          />

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={createRoom}
            disabled={!playerName.trim()}
            className="w-full py-4 bg-gradient-to-r from-yellow-500 to-amber-600 text-white rounded-2xl font-semibold mb-4 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Zap className="w-5 h-5" />
            Create Room
          </motion.button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-midnight text-white/60">or</span>
            </div>
          </div>

          <input
            type="text"
            placeholder="Enter room code..."
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value.toUpperCase())}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-yellow-500 mb-4"
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
    <div className="flex flex-col items-center justify-center gap-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 flex-wrap justify-center">
        <div className="glass px-4 py-2 rounded-full flex items-center gap-2">
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

        <div className="glass px-4 py-2 rounded-full text-sm">
          <span className="text-white/60">Round: </span>
          <span className="text-white font-bold">
            {gameState?.round}/{gameState?.maxRounds}
          </span>
        </div>
      </div>

      <div className="glass rounded-3xl p-8 w-full max-w-2xl">
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
        ) : gameState?.currentWord ? (
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-white/60 text-sm mb-2">Type this word:</p>
              <p className="text-5xl font-bold text-yellow-400 mb-6 tracking-wider">
                {gameState.currentWord}
              </p>
            </div>

            <input
              ref={inputRef}
              type="text"
              value={inputWord}
              onChange={(e) => setInputWord(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && checkWord()}
              placeholder="Start typing..."
              className="w-full px-6 py-4 bg-white/5 border-2 border-white/10 rounded-2xl text-white text-2xl text-center placeholder-white/40 focus:outline-none focus:border-yellow-500"
              autoFocus
            />

            <div className="space-y-2">
              <p className="text-white/60 text-sm text-center">Leaderboard:</p>
              {getPlayersList().map((player) => (
                <div key={player.name} className="flex items-center justify-between">
                  <span className={`${player.name === playerName ? 'text-yellow-400' : 'text-white'}`}>
                    {player.name} {player.ready && '✓'}
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
                className="px-8 py-3 bg-yellow-500 text-white rounded-full font-semibold disabled:opacity-50"
              >
                {gameState?.players[playerName]?.ready ? 'Ready!' : 'Ready to Start'}
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

export default WordRaceGame;
