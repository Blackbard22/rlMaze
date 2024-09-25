import React, { useEffect, useRef } from 'react';
import { w3cwebsocket as W3CWebSocket } from 'websocket';

const WebSocketClient = () => {
  const webSocketRef = useRef(null);

  useEffect(() => {
    webSocketRef.current = new W3CWebSocket('ws://localhost:8000/ws/');

    webSocketRef.current.onopen = () => {
      console.log('WebSocket connection opened');
      // Send a message to the server
      webSocketRef.current.send('Hello from React!');
    };

    webSocketRef.current.onmessage = (message) => {
      console.log('Received message:', message.data);
    };

    webSocketRef.current.onclose = () => {
      console.log('WebSocket connection closed');
    };

    return () => {
      webSocketRef.current.close();
    };
  }, []);

  return null; // This component doesn't render any UI
};

export default WebSocketClient;