import { Chess } from "chess.js";
import { useState, useEffect, useRef } from "react";

function ChessBoard({ gameId, playerColor, authToken }) {
    const [chess, setChess] = useState(new Chess());
    const [board, setBoard] = useState([]);
    const [selectedSpot, setSelectedSpot] = useState(null);
    const [validMoves, setValidMoves] = useState([]);
    const [gameStatus, setGameStatus] = useState('ongoing');
    const [currentTurn, setCurrentTurn] = useState('white');
    const [moveHistory, setMoveHistory] = useState([]);
    const [players, setPlayers] = useState({ white: null, black: null });
    const ws = useRef(null);

    useEffect(() => {
        const fetchGameData = async () => {
            try {
                const response = await fetch(`http://localhost:8000/game/get-game/${gameId}/`, 
                    { headers: { 'Authorization': `Bearer ${authToken}` } });

                const gameData = await response.json();

                const chessInstance = new Chess(gameData.current_fen);
                setChess(chessInstance);
                setBoard(chessInstance.board());
                setCurrentTurn(chessInstance.turn());

                setPlayers({ white: gameData.white_player, black: gameData.black_player });

                const movesResponse = await fetch(`http://localhost:8000/game/get-game-moves/${gameId}/`, {
                    headers: { 'Authorization': `Bearer ${authToken}` }
                });
                const movesData = await movesResponse.json();
                setMoveHistory(movesData);
            }
            catch (error) {
                console.log('Error loading game data', error);
            }
        };
        fetchGameData();
    }, [gameId, authToken]);

    useEffect(() => {
        ws.current = new WebSocket(`ws://localhost:8000/ws/game/${gameId}/`);
        
        ws.current.onopen = () => {
            console.log('WebSocket connected');
            if (authToken) {
                ws.current.send(JSON.stringify({ type: 'auth', token: authToken }));
            }
        };
        
        ws.current.onmessage = (e) => {
            const data = JSON.parse(e.data);
            
            if (data.type === 'move') {
                handleReceivedMove(data.move);
            } else if (data.type === 'game_over') {
                setGameStatus(data.result);
            }
        };
        
        ws.current.onclose = () => {
            console.log('WebSocket disconnected');
        };
        
        return () => {
            if (ws.current) {
                ws.current.close();
            }
        };
    }, [gameId, authToken]);

    const handleReceivedMove = (moveData) => {
        const chessInstance = new Chess();
        chessInstance.load(moveData.fen_after);
        setChess(chessInstance);
        setBoard(chessInstance.board());
        setCurrentTurn(chessInstance.turn());
        setMoveHistory(prev => [...prev, {
            move_text: moveData.move_text,
            fen_after: moveData.fen_after,
            created_at: new Date().toISOString()
        }]);

        if (chessInstance.isGameOver()) {
            setGameStatus(chessInstance.isCheckmate() ? 'checkmate' : 'draw');
        }
    };

    const handleSpotClick = (row, col) => {
        const file = String.fromCharCode(97 + col);
        const rank = 8 - row;
        const spot = `${file}${rank}`;

        if (currentTurn !== playerColor[0]) return;

        if (!selectedSpot) {
            const piece = chess.get(spot);
            if (piece && piece.color === playerColor[0]) {
                setSelectedSpot(spot);
                setValidMoves(chess.moves({ square: spot, verbose: true }));
            }
            return;
        }

        if (selectedSpot) {
            if (selectedSpot === spot) {
                setSelectedSpot(null);
                setValidMoves([]);
                return;
            }

            const piece = chess.get(spot);
            if (piece && piece.color === playerColor[0]) {
                setSelectedSpot(spot);
                setValidMoves(chess.moves({ square: spot, verbose: true }));
                return;
            }

            const move = chess.move({
                from: selectedSpot,
                to: spot,
                promotion: 'q'
            });

            if (move) {
                const moveData = {
                    move_text: `${selectedSpot}${spot}`,
                    fen_after: chess.fen()
                };

                if (ws.current && ws.current.readyState === WebSocket.OPEN) {
                    ws.current.send(JSON.stringify({ type: 'move', move: moveData }));
                }

                setBoard(chess.board());
                setCurrentTurn(chess.turn());
                setSelectedSpot(null);
                setValidMoves([]);
                setMoveHistory(prev => [...prev, {
                    move_text: moveData.move_text,
                    fen_after: moveData.fen_after,
                    created_at: new Date().toISOString()
                }]);

                if (chess.isGameOver()) {
                    setGameStatus(chess.isCheckmate() ? 'checkmate' : 'draw');
                }
            }
        }
    };

    const renderPiece = (piece) => {
        if (!piece) return null;

        const pieceSymbols = {
            k: { w: '♔', b: '♚' },
            q: { w: '♕', b: '♛' },
            r: { w: '♖', b: '♜' },
            b: { w: '♗', b: '♝' },
            n: { w: '♘', b: '♞' },
            p: { w: '♙', b: '♟' },
        };

        return <span className="text-4xl">{pieceSymbols[piece.type][piece.color]}</span>;
    };

    const isHighlighted = (row, col) => {
        if (!selectedSpot) return false;
        
        const file = String.fromCharCode(97 + col);
        const rank = 8 - row;
        const square = `${file}${rank}`;
        
        return validMoves.some(move => move.to === square);
    };

    return (
        <div className="flex flex-col items-center">
            <div className="text-xl mb-4">
                {gameStatus === 'ongoing' ? (
                    currentTurn === playerColor[0] ? 'Your turn' : 'Waiting for opponent'
                ) : (
                    gameStatus === 'checkmate' ? 'Checkmate!' : 'Game over'
                )}
            </div>
            
            <div className="flex flex-col md:flex-row gap-8 w-full max-w-6xl">
                <div className="flex-1">
                    <div className="flex justify-between mb-4">
                        <div className={`p-3 rounded-lg ${currentTurn === 'w' ? 'bg-blue-100 border-2 border-blue-500' : 'bg-gray-100'}`}>
                            <h3 className="font-semibold">White Player</h3>
                            <p>{players.white?.username || 'Waiting...'}</p>
                        </div>
                        <div className={`p-3 rounded-lg ${currentTurn === 'b' ? 'bg-blue-100 border-2 border-blue-500' : 'bg-gray-100'}`}>
                            <h3 className="font-semibold">Black Player</h3>
                            <p>{players.black?.username || 'Waiting...'}</p>
                        </div>
                    </div>
                    
                    <div className="border-2 border-gray-800 shadow-lg">
                        {board.map((row, rowIndex) => (
                            <div key={rowIndex} className="flex">
                                {row.map((spot, colIndex) => {
                                    const isLight = (rowIndex + colIndex) % 2 === 0;
                                    const file = String.fromCharCode(97 + colIndex);
                                    const rank = 8 - rowIndex;
                                    const spotNotation = `${file}${rank}`;
                                    const isSelected = selectedSpot === spotNotation;
                                    const isValidMove = isHighlighted(rowIndex, colIndex);
                                    
                                    return (
                                        <div
                                            key={`${rowIndex}-${colIndex}`}
                                            className={`w-12 h-12 md:w-16 md:h-16 flex items-center justify-center cursor-pointer
                                                ${isLight ? 'bg-amber-100' : 'bg-amber-800'}
                                                ${isSelected ? 'bg-blue-300' : ''}
                                                ${isValidMove ? (spot ? 'bg-red-300' : 'bg-green-300') : ''}
                                            `}
                                            onClick={() => handleSpotClick(rowIndex, colIndex)}
                                        >
                                            {spot && renderPiece(spot)}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
                
                <div className="flex-1 mt-4 md:mt-0">
                    <div className="bg-white rounded-lg shadow-lg p-4 h-full">
                        <h3 className="text-lg font-semibold mb-4">Move History</h3>
                        <div className="overflow-y-auto max-h-96">
                            {moveHistory.length === 0 ? (
                                <p className="text-gray-500">No moves yet</p>
                            ) : (
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left py-2">#</th>
                                            <th className="text-left py-2">Move</th>
                                            <th className="text-left py-2">Time</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {moveHistory.map((move, idx) => (
                                            <tr key={idx} className="border-b last:border-0">
                                                <td className="py-2">{idx + 1}</td>
                                                <td className="py-2 font-mono">{move.move_text}</td>
                                                <td className="py-2 text-sm text-gray-600">
                                                    {new Date(move.created_at).toLocaleTimeString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ChessBoard;
