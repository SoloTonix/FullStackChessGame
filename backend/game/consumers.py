from channels.generic.websocket import AsyncWebsocketConsumer
import json
from django.contrib.auth.models import AnonymousUser
from asgiref.sync import sync_to_async
from .models import Game, Move
from chess import Board

class GameConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.game_id = self.scope['url_route']['kwargs']['game_id']
        self.room_group_name = f'game_{self.game_id}'
        
        # Authenticate user
        user = self.scope.get('user', AnonymousUser())
        if user.is_anonymous:
            await self.close()
            return
            
        # Verify user is part of this game
        game = await sync_to_async(Game.objects.get)(id=self.game_id)
        if user not in [game.white_player, game.black_player]:
            await self.close()
            return
            
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()
        
    async def receive(self, text_data):
        data = json.loads(text_data)
        user = self.scope.get('user', AnonymousUser())
        
        if data.get('type') == 'auth':
            # Authentication handled in connect
            pass
            
        elif data.get('type') == 'move':
            # Process move
            game = await sync_to_async(Game.objects.get)(id=self.game_id)
            
            # Verify it's the user's turn
            chess_board = Board(game.current_fen)
            if (chess_board.turn and user != game.white_player) or (not chess_board.turn and user != game.black_player):
                await self.send(json.dumps({'error': 'Not your turn'}))
                return
                
            try:
                # Apply move
                move = data['move']
                chess_board.push_san(move['move_text'])
                
                # Update game state
                game.current_fen = chess_board.fen()
                if chess_board.is_game_over():
                    if chess_board.is_checkmate():
                        game.winner = 'w' if chess_board.turn else 'b'
                await sync_to_async(game.save)()
                
                # Record move
                move_obj = await sync_to_async(Move.objects.create)(
                    game=game,
                    move_text=move['move_text'],
                    fen_after=game.current_fen
                )
                
                # Broadcast move to all players
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'game_move',
                        'move': {
                            'move_text': move['move_text'],
                            'fen_after': game.current_fen,
                            'by': user.username
                        }
                    }
                )
                
                # Check for game over
                if chess_board.is_game_over():
                    await self.channel_layer.group_send(
                        self.room_group_name,
                        {
                            'type': 'game_over',
                            'result': 'checkmate' if chess_board.is_checkmate() else 'draw'
                        }
                    )
                    
            except Exception as e:
                await self.send(json.dumps({'error': str(e)}))
                
    async def game_move(self, event):
        await self.send(text_data=json.dumps({
            'type': 'move',
            'move': event['move']
        }))
        
    async def game_over(self, event):
        await self.send(text_data=json.dumps({
            'type': 'game_over',
            'result': event['result']
        }))
        