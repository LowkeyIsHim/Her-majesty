'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pencil, Eraser, RotateCcw, Send, Copy, Check, Users } from 'lucide-react';
import { ref, set, onValue, off, push } from 'firebase/database';
import { database } from '@/lib/firebase';
import { generateRoomCode } from '@/lib/gameUtils';

interface DrawingState {
  roomCode: string;
  currentWord: string;
  drawer: string;
  players: string[];
  score: Record<string, number>;
  round: number;
  guesses: Array<{ player: string; message: string; correct?: boolean }>;
}

const words = [
  'cat', 'dog', 'house', 'tree', 'car', 'phone', 'book', 'sun', 'moon', 'star',
  'flower', 'heart', 'smile', 'pizza', 'cake', 'fish', 'bird', 'plane', 'boat', 'train'
];

const DrawingGame: React.FC = () => {
  const [roomCode, setRoomCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#ffffff');
  const [brushSize, setBrushSize] = useState(3);
  const [gameState, setGameState] = useState<DrawingState | null>(null);
  const [copied, setCopied] = useState(false);
  const [guess, setGuess] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = 600;
      canvas.height = 400;
      
      const context = canvas.getContext('2d');
      if (context) {
        context.lineCap = 'round';
        context.strokeStyle = color;
        context.lineWidth = brushSize;
        contextRef.current = context;
      }
    }
  }, []);

  useEffect(() => {
    if (contextRef.current) {
      contextRef.current.strokeStyle = color;
      contextRef.current.lineWidth = brushSize;
    }
  }, [color, brushSize]);

  useEffect(() => {
    if (roomCode) {
      const gameRef = ref(database, `games/drawing/${roomCode}`);
      
      const unsubscribe = onValue(gameRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setGameState(data);
          setIsConnected(true);
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

    const initialState: DrawingState = {
      roomCode: code,
      currentWord: words[Math.floor(Math.random() * words.length)],
      drawer: playerName,
      players: [playerName],
      score: { [playerName]: 0 },
      round: 1,
      guesses: [],
    };

    set(ref(database, `games/drawing/${code}`), initialState);
  };

  const joinRoom = () => {
    if (!inputCode || !playerName.trim()) return;
    
    setRoomCode(inputCode.toUpperCase());
    
    const gameRef = ref(database, `games/drawing/${inputCode.toUpperCase()}`);
    
    onValue(gameRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const updatedPlayers = [...data.players, playerName];
        const updatedScore = { ...data.score, [playerName]: 0 };
        
        set(ref(database, `games/drawing/${inputCode.toUpperCase()}/players`), updatedPlayers);
        set(ref(database, `games/drawing/${inputCode.toUpperCase()}/score`), updatedScore);
      }
    }, { onlyOnce: true });
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isMyTurn()) return;
    
    const canvas = canvasRef.current;
    if (!canvas || !contextRef.current) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    contextRef.current.beginPath();
    contextRef.current.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !isMyTurn()) return;
    
    const canvas = canvasRef.current;
    if (!canvas || !contextRef.current) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    contextRef.current.lineTo(x, y);
    contextRef.current.stroke();

    // Broadcast drawing to other players (optional: implement this)
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || !contextRef.current) return;
    
    contextRef.current.clearRect(0, 0, canvas.width, canvas.height);
  };

  const submitGuess = () => {
    if (!guess.trim() || !gameState || !roomCode) return;

    const isCorrect = guess.toLowerCase().trim() === gameState.currentWord.toLowerCase();
    
    const newGuess = {
      player: playerName,
      message: guess,
      correct: isCorrect,
    };

    const guessesRef = ref(database, `games/drawing/${roomCode}/guesses`);
    push(guessesRef, newGuess);

    if (isCorrect) {
      const newScore = (gameState.score[playerName] || 0) + 10;
      set(ref(database, `games/drawing/${roomCode}/score/${playerName}`), newScore);
      
      // Next round
      setTimeout(() => {
        nextRound();
      }, 2000);
    }

    setGuess('');
  };

  const nextRound = () => {
    if (!gameState || !roomCode) return;

    const currentDrawerIndex = gameState.players.indexOf(gameState.drawer);
    const nextDrawerIndex = (currentDrawerIndex + 1) % gameState.players.length;
    const nextDrawer = gameState.players[nextDrawerIndex];

    set(ref(database, `games/drawing/${roomCode}`), {
      ...gameState,
      drawer: nextDrawer,
      currentWord: words[Math.floor(Math.random() * words.length)],
      round: gameState.round + 1,
      guesses: [],
    });

    clearCanvas();
  };

  const isMyTurn = () => {
    return gameState?.drawer === playerName;
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Setup screen
  if (!roomCode) {
    return (
      <div className="flex flex-col items-center justify-center gap-8">
        <div className="glass rounded-3xl p-8 max-w-md w-full">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">
            Join Drawing Battle
          </h2>

          <input
            type="text"
            placeholder="Your name..."
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-pink-500 mb-4"
            maxLength={20}
          />

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={createRoom}
            disabled={!playerName.trim()}
            className="w-full py-4 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-2xl font-semibold mb-4 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Users className="w-5 h-5" />
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
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-pink-500 mb-4"
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
    <div className="flex flex-col lg:flex-row gap-8 items-start justify-center max-w-7xl mx-auto">
      {/* Left Panel - Canvas & Tools */}
      <div className="flex flex-col gap-4">
        {/* Room Info */}
        <div className="flex items-center gap-4 flex-wrap">
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
            <span className="text-white font-bold">{gameState?.round}</span>
          </div>
        </div>

        {/* Word (only for drawer) */}
        {isMyTurn() && (
          <div className="glass px-6 py-3 rounded-2xl text-center">
            <p className="text-white/60 text-sm mb-1">Draw this word:</p>
            <p className="text-3xl font-bold text-pink-400">{gameState?.currentWord}</p>
          </div>
        )}

        {!isMyTurn() && (
          <div className="glass px-6 py-3 rounded-2xl text-center">
            <p className="text-white/60 text-sm">
              {gameState?.drawer} is drawing...
            </p>
          </div>
        )}

        {/* Canvas */}
        <div className="relative">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            className="border-4 border-white/20 rounded-2xl bg-white cursor-crosshair"
            style={{ width: '100%', maxWidth: '600px', height: 'auto' }}
          />
        </div>

        {/* Drawing Tools */}
        {isMyTurn() && (
          <div className="glass p-4 rounded-2xl flex items-center gap-4 flex-wrap">
            <div className="flex gap-2">
              {['#ffffff', '#000000', '#ef4444', '#3b82f6', '#10b981', '#eab308', '#a855f7', '#ec4899'].map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full border-2 ${
                    color === c ? 'border-white scale-110' : 'border-white/30'
                  } transition-all`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Pencil className="w-4 h-4 text-white/60" />
              <input
                type="range"
                min="1"
                max="20"
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="w-24"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={clearCanvas}
              className="px-4 py-2 bg-white/10 text-white rounded-xl flex items-center gap-2 hover:bg-white/20"
            >
              <Eraser className="w-4 h-4" />
              Clear
            </motion.button>
          </div>
        )}
      </div>

      {/* Right Panel - Chat & Scores */}
      <div className="flex flex-col gap-4 w-full lg:w-80">
        {/* Scores */}
        <div className="glass p-4 rounded-2xl">
          <h3 className="text-white font-bold mb-3 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Players
          </h3>
          <div className="space-y-2">
            {gameState?.players.map((player) => (
              <div key={player} className="flex items-center justify-between text-sm">
                <span className={`${player === gameState.drawer ? 'text-pink-400' : 'text-white'}`}>
                  {player} {player === playerName && '(You)'}
                  {player === gameState.drawer && ' 🎨'}
                </span>
                <span className="text-yellow-400 font-bold">
                  {gameState.score[player] || 0}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Chat/Guesses */}
        <div className="glass p-4 rounded-2xl flex-1 flex flex-col">
          <h3 className="text-white font-bold mb-3">Guesses</h3>
          
          <div className="flex-1 overflow-y-auto space-y-2 mb-3 max-h-60">
            {gameState?.guesses?.map((g, i) => (
              <div
                key={i}
                className={`text-sm p-2 rounded ${
                  g.correct
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-white/5 text-white/70'
                }`}
              >
                <span className="font-semibold">{g.player}:</span> {g.message}
                {g.correct && ' ✓'}
              </div>
            ))}
          </div>

          {!isMyTurn() && (
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Your guess..."
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && submitGuess()}
                className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-pink-500 text-sm"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={submitGuess}
                className="p-2 bg-pink-500 text-white rounded-xl"
              >
                <Send className="w-4 h-4" />
              </motion.button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DrawingGame;
