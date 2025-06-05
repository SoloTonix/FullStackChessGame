from channels.generic.websocket import AsyncWebsocketConsumer
import json
class GameConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.game_id = self.scope['url_route']['kwargs']['game_id']
        self.room_group_name = f'game_{self.game_id}'
        
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name)
        
        await self.accept()
        
    async def recieve(self, text_data):
        data = json.loads(text_data)
        move = data['moves']
        await self.channel_layer.group_send(self.room_group_name,{'type':'game_move', 'moves':move})
        
    async def game_move(self, event):
        await self.send(text_data=json.dumps(event))
        