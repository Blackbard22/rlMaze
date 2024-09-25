import React, { useState } from 'react';
import axios from 'axios';

const QLearningComponent = () => {
  const [isTraining, setIsTraining] = useState(false);

  const startTraining = async () => {
    try {
      setIsTraining(true);
      const response = await axios.post('http://localhost:8000/run_qlearn/', {
        episodes: 1000,
        time: 0.1,
        epsilon: 1.0,
        epsilon_decay: 0.995,
        learning_rate: 0.1
      });
      console.log(response.data);
    } catch (error) {
      console.error('Error starting training:', error);
    }
  };

  const cancelTraining = async () => {
    try {
      const response = await axios.post('http://localhost:8000/cancel-training/');
      console.log(response.data);
      setIsTraining(false);
    } catch (error) {
      console.error('Error cancelling training:', error);
    }
  };

  return (
    <div>
      {!isTraining ? (
        <button onClick={startTraining}>Start Q-Learning Training</button>
      ) : (
        <button onClick={cancelTraining}>Cancel Training</button>
      )}
    </div>
  );
};

export default QLearningComponent;