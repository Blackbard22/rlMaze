import React, { useEffect, useState } from 'react';

const AgentMovements =  () => {
    const [socket, setSocket] = useState(null);
    const [data, setData] = useState(null);

    const handleSendData = async () => {
      try {
        const response = await axios.post('http://localhost:8000/send_data/', {
          time: timeValue,
          episodes: episodesValue,
        }, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
    
        console.log(response.data);
        setResponseData(response.data);
        console.log('Response:', responseData); 
      } catch (error) {
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.error('Error data:', error.response.data);
          console.error('Error status:', error.response.status);
          console.error('Error headers:', error.response.headers);
        } }};
  
    useEffect(() => {
      const newSocket = new WebSocket('ws://localhost:8000/ws/data/');
  
      newSocket.onopen = () => {
        console.log('WebSocket connected');
      };
  
      newSocket.onmessage = (event) => {
        const receivedData = JSON.parse(event.data);
        console.log('Received data:', receivedData.data);
        setData(receivedData.data);
      };
  
      newSocket.onclose = () => {
        console.log('WebSocket disconnected');
      };
  
      setSocket(newSocket);
  
      return () => {
        newSocket.close();
      };
    }, []);
  
    return (
      <div>
        <h2>WebSocket Data:</h2>
        <p>{data ? JSON.stringify(data) : 'Waiting for data...'}</p>
        <button onClick={handleSendData}>send data</button>
      </div>
    );
  };
  

export default AgentMovements;
