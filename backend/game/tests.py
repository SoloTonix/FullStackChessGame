from django.test import TestCase
from channels.testing import WebsocketCommunicator
from .consumers import GameConsumer
from channels.routing import URLRouter
from django.urls import re_path
import asyncio

# Create a test application with your consumer's route
application = URLRouter([
    re_path(r'^ws/game/(?P<game_id>\w+)/$', GameConsumer.as_asgi()),
])

class GameConsumerTests(TestCase):
    async def test_websocket_connection(self):
        communicator = WebsocketCommunicator(
            application,
            '/ws/game/1/'
        )
        
        # Test connection
        connected, _ = await communicator.connect()
        self.assertTrue(connected)
        
        # Test sending and receiving
        await communicator.send_json_to({'message': 'test'})
        response = await communicator.receive_json_from()
        self.assertEqual(response, {'response': 'test response'})
        
        # Close connection
        await communicator.disconnect()

    # Django's TestCase doesn't natively support async, so we need to wrap it
    def test_async_code(self):
        asyncio.get_event_loop().run_until_complete(self.test_websocket_connection())