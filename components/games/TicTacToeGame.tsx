'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, Users, RotateCcw, AlertCircle } from 'lucide-react';
import { ref, set, onValue, off, get } from 'firebase/database';
import { database } from '@/lib/firebase';
import { generateRoomCode } from '@/lib/gameUtils';
import { sounds } from '@/lib/sounds';

type Player = 'X' | 'O' | null;
type Board = Player[];

interface GameState {
  board: Board;
  currentPlayer: Player;
  winner: Player;
  roomCode: string;
  players: number;
  playerX: string;
  playerO: string;
}

const TicTacToeGame: React.FC = () => {
  const [roomCode, setRoomCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [isHost, setIsHost] = useState(false);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [playerSymbol, setPlayerSymbol] = useState<Player>(null);
  const [copied, setCopied] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (roomCode && database) {
      const gameRef = ref(database, `games/tictactoe/${roomCode}`);
      
      const unsubscribe = onValue(gameRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setGameState(data);
          setIsConnected(true);
          setError('');
        }
      });

      return () => {
        off(gameRef);
      };
    }
  }, [roomCode]);

  const createRoom = () => {
    if (!database) {
      setError('Firebase not initialized. Check your config.');
      return;
    }

    const code = generateRoomCode();
    setRoomCode(code);
    setIsHost(true);
    setPlayerSymbol('X');

    const initialState: GameState = {
      board: Array(9).fill(null),
      currentPlayer: 'X',
      winner: null,
      roomCode: code,
      players: 1,
      playerX: 'Host',
      playerO: '',
    };

    set(ref(database, `games/tictactoe/${code}`), initialState)
      .then(() => {
        sounds.buttonClick();
        setError('');
      })
      .catch((err) => {
        setError('Failed to create room: ' + err.message);
      });
  };

  const joinRoom = async () => {
    if (!inputCode || !database) {
      setError('Enter a room code');
      return;
    }

    const upperCode = inputCode.toUpperCase().trim();
    const gameRef = ref(database, `games/tictactoe/${upperCode}`);
    
    try {
      const snapshot = await get(gameRef);
      
      if (!snapshot.exists()) {
        setError('Room not found. Check the code.');
        return;
      }

      const data = snapshot.val();
      
      if (data.players >= 2) {
        setError('Room is full');
        return;
      }

      setRoomCode(upperCode);
      setPlayerSymbol('O');
      setIsHost(false);
      
      await set(ref(database, `games/tictactoe/${upperCode}`), {
        ...data,
        players: 2,
        playerO: 'Guest',
      });

      sounds.buttonClick();
      setError('');
      setInputCode('');
    } catch (err: any) {
      setError('Failed to join: ' + err.message);
    }
  };

  const makeMove = (index: number) => {
    if (!gameState || !roomCode || !playerSymbol || !database) return;
    if (gameState.board[index] || gameState.winner) return;
    if (gameState.currentPlayer !== playerSymbol) return;

    const newBoard = [...gameState.board];
    newBoard[index] = playerSymbol;

    const winner = calculateWinner(newBoard);
    const nextPlayer = playerSymbol === 'X' ? 'O' : 'X';

    set(ref(database, `games/tictactoe/${roomCode}`), {
      ...gameState,
      board: newBoard,
      currentPlayer: nextPlayer,
      winner,
    });

    if (winner) {
      sounds.victory();
    } else {
      sounds.buttonClick();
    }
  };

  const calculateWinner = (board: Board): Player => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    for (const [a, b, c] of lines) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }

    return null;
  };

  const resetGame = () => {
    if (!roomCode || !isHost || !database) return;

    set(ref(database, `games/tictactoe/${roomCode}`), {
      ...gameState,
      board: Array(9).fill(null),
      currentPlayer: 'X',
      winner: null,
    });

    sounds.buttonClick();
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    sounds.buttonClick();
  };

  const isDraw = gameState?.board.every(cell => cell !== null) && !gameState.winner;

  if (!roomCode) {
    return (
      <div className="flex flex-col items-center justify-center gap-8 p-4">
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 max-w-md w-full">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">
            Choose Mode
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-xl flex items-center gap-2 text-red-200 text-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={createRoom}
            className="w-full py-4 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-2xl font-semibold mb-4 flex items-center justify-center gap-2"
          >
            <Users className="w-5 h-5" />
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
            onKeyPress={(e) => e.key === 'Enter' && joinRoom()}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-cyan-500 mb-4 text-center font-mono text-lg"
            maxLength={6}
          />

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={joinRoom}
            disabled={!inputCode}
            className="w-full py-4 bg-white/10 text-white rounded-2xl font-semibold disabled:opacity-50"
          >
            Join Room
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-6 p-4">
      <div className="flex items-center gap-4 flex-wrap justify-center">
        <div className="bg-white/5 backdrop-blur-sm px-6 py-3 rounded-full flex items-center gap-3 border border-white/10">
          <span className="text-white/60">Room:</span>
          <span className="text-white font-mono font-bold text-lg">{roomCode}</span>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={copyRoomCode}
            className="p-1 hover:bg-white/10 rounded"
          >
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-white/60" />}
          </motion.button>
        </div>

        <div className="bg-white/5 backdrop-blur-sm px-6 py-3 rounded-full border border-white/10">
          <span className="text-white/60">You: </span>
          <span className={`font-bold text-lg ${playerSymbol === 'X' ? 'text-blue-400' : 'text-pink-400'}`}>
            {playerSymbol}
          </span>
        </div>

        {gameState && gameState.players < 2 && (
          <div className="bg-yellow-500/20 border border-yellow-500/50 px-6 py-3 rounded-full text-yellow-400 animate-pulse">
            Waiting for opponent...
          </div>
        )}
      </div>

      <div className="relative">
        <div className="grid grid-cols-3 gap-3">
          {gameState?.board.map((cell, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: gameState.players === 2 && !cell && !gameState.winner ? 1.05 : 1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => makeMove(index)}
              disabled={!isConnected || gameState.players < 2}
              className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center text-4xl sm:text-5xl font-bold transition-all ${
                cell === 'X' ? 'bg-gradient-to-br from-blue-500 to-cyan-600 text-white' :
                cell === 'O' ? 'bg-gradient-to-br from-pink-500 to-rose-600 text-white' :
                'bg-white/10 hover:bg-white/20'
              }`}
            >
              {cell}
            </motion.button>
          ))}
        </div>

        <AnimatePresence>
          {(gameState?.winner || isDraw) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-black/90 rounded-2xl flex items-center justify-center backdrop-blur-sm"
            >
              <div className="text-center p-6">
                <p className="text-4xl font-bold text-white mb-4">
                  {isDraw ? 'Draw! 🤝' : `${gameState.winner} Wins! 🎉`}
                </p>
                {isHost && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={resetGame}
                    className="px-8 py-3 bg-blue-500 text-white rounded-full font-semibold flex items-center gap-2 mx-auto"
                  >
                    <RotateCcw className="w-5 h-5" />
                    Play Again
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {gameState && gameState.players === 2 && !gameState.winner && (
        <div className="text-center">
          <p className="text-white/60 text-sm mb-2">Current Turn:</p>
          <p className={`text-3xl font-bold ${
            gameState.currentPlayer === 'X' ? 'text-blue-400' : 'text-pink-400'
          }`}>
            {gameState.currentPlayer}
            {gameState.currentPlayer === playerSymbol && " (You)"}
          </p>
        </div>
      )}
    </div>
  );
};

export default TicTacToeGame;
