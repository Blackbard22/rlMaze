import React, { useEffect, useState } from 'react';

function SSEComponent() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const eventSource = new EventSource('http://localhost:8000/sse/');

    eventSource.onmessage = function(event) {
      setMessages(prevMessages => [...prevMessages, event.data]);
    };

    eventSource.onerror = function(error) {
      console.error('EventSource failed:', error);
      eventSource.close();
    };

    // Cleanup when the component unmounts
    return () => {
      eventSource.close();
    };
  }, []);

  return (
    <div>
      <h1>Server-Sent Events</h1>
      <ul>
        {messages.map((message, index) => (
          <li key={index}>{message}</li>
        ))}
      </ul>
    </div>
  );
}

export default SSEComponent;
