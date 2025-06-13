import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ChessBoard from '../components/ChessBoard';

const GamePage = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const [playerColor, setPlayerColor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authToken, setAuthToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    const fetchGameData = async () => {
      try {
        const response = await fetch(`http://localhost:8000/game/get-game/${gameId}/`, 
          {headers: {'Authorization': `Bearer ${authToken}`}});
        
        if (!response.ok) {
          if (response.status === 403) {
            navigate('/login');
            return;
          }
          throw new Error('Game not found');
        }
        
        const data = await response.json();
        
        // Determine player color based on current user
        const currentUser = JSON.parse(localStorage.getItem('user'));
        if (currentUser.id === data.white_player.id) {
          setPlayerColor('w');
        } else if (currentUser.id === data.black_player.id) {
          setPlayerColor('b');
        } else {
          throw new Error('You are not a player in this game');
        }
        
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    
    if (authToken) {
      fetchGameData();
    } else {
      navigate('/login');
    }
  }, [gameId, authToken, navigate]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-xl">Loading game...</div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
        <p className="mb-6">{error}</p>
        <button
          onClick={() => navigate('/')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Back to Home
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold">Chess Game #{gameId}</h1>
          <button
            onClick={() => navigate('/')}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded"
          >
            Leave Game
          </button>
        </div>
        
        <ChessBoard gameId={gameId} playerColor={playerColor} authToken={authToken} />
      </div>
    </div>
  );
};

export default GamePage;