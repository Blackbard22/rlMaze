import { useEffect, useRef } from 'react';

const useEventSource = (selectedAlgo, endSSE, setPosition) => {
  const eventSourceRef = useRef(null);

  useEffect(() => {
    const createEventSource = (url) => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      eventSourceRef.current = new EventSource(url);

      eventSourceRef.current.onmessage = function(event) {
        const newPosition = JSON.parse(event.data);
        setPosition(newPosition);
        console.log('New position:', newPosition);
        console.log('endSSE:', endSSE); 
      };

      eventSourceRef.current.onerror = function(error) {
        console.error("SSE Error:", error);
        eventSourceRef.current.close();
      };
    };

    if (selectedAlgo === 'q-learn') {
      createEventSource('http://localhost:8000/sse/');
    } else if (selectedAlgo === 'sarsa') {
      createEventSource('http://localhost:8000/sarsa_sse/');
      console.log('sarsa sse');
    }

    if (endSSE) {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    }

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [endSSE, selectedAlgo, setPosition]);
};

export default useEventSource;