# from channels.generic.websocket import AsyncWebsocketConsumer
# import json

# class DataConsumer(AsyncWebsocketConsumer):
   

#     async def receive(self, text_data):
#         text_data_json = json.loads(text_data)
#         message = text_data_json['message']
#         print(message)
#         await self.send(text_data=json.dumps({
#             'message': message
#         }))

  
#     async def connect(self):
#         await self.channel_layer.group_add(
#             "data_group",
#             self.channel_name
#         )
#         await self.accept()

#     async def disconnect(self, close_code):
#         await self.channel_layer.group_discard(
#             "data_group",
#             self.channel_name
#         )

#     async def send_data(self, event):
#         print(f"Received event: {event}")
#         data = event['data']
#         await self.send(text_data=json.dumps(data))


from channels.generic.websocket import AsyncWebsocketConsumer

class MyConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Accept the WebSocket connection
        await self.accept()

    async def disconnect(self, close_code):
        pass

    async def receive(self, text_data):
        # Handle incoming WebSocket messages
        pass