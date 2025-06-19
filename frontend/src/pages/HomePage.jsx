import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const [gameId, setGameId] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (gameId.trim()) {
      navigate(`/game/${gameId.trim()}`);
    }
  };

  const createNewGame = async () => {
    try {
      const response = await fetch('http://localhost:8000/game/get-game/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      navigate(`/game/${data.id}`);
    } catch (error) {
      console.error('Error creating game:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6 text-center">Chess Game</h1>
        
        <button
          onClick={createNewGame}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
        >
          Create New Game
        </button>
        
        <div className="text-center mb-4">OR</div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="gameId" className="block text-sm font-medium text-gray-700 mb-1">
              Join Existing Game
            </label>
            <input
              type="text"
              id="gameId"
              value={gameId}
              onChange={(e) => setGameId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Enter Game ID"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            Join Game
          </button>
        </form>
      </div>
    </div>
  );
};

export default HomePage;