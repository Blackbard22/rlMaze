

import { useState, useEffect } from 'react';
import axios from 'axios';
import Maze from './Maze/Maze';
import './App.css';

function App() {
  const [time, setTime] = useState(0);
  const [episodes, setEpisodes] = useState(0);
  const [loading, setLoading] = useState(false);
  const [responseData, setResponseData] = useState(null);
  const [error, setError] = useState(null);
  const [isChecked, setIsChecked] = useState(false);
  const [radioValue, setRadioValue] = useState('');
  const [positions, setPositions] = useState([]);  // Store positions received from SSE

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const timeValue = formData.get('time');
    const episodesValue = formData.get('episodes');
    setTime(Number(timeValue));
    setEpisodes(Number(episodesValue));
    runPythonScript(timeValue, episodesValue);
  };

  const runPythonScript = async (timeValue, episodesValue) => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:8000/run_qlearn/', {
        time: timeValue,
        episodes: episodesValue,
      }, {
        headers: { 'Content-Type': 'application/json' },
      });
      setResponseData(response.data);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleError = (error) => {
    if (error.response) {
      console.error('Error data:', error.response.data);
    } else if (error.request) {
      console.error('Error request:', error.request);
    } else {
      console.error('Error message:', error.message);
    }
  };

  const handleCheckboxChange = () => {
    setIsChecked(!isChecked);
  };

  const handleRadioChange = (event) => {
    setRadioValue(event.target.value);
  };

  // Start SSE listener
  useEffect(() => {
    const eventSource = new EventSource('http://localhost:8000/sse/');
    eventSource.onmessage = function(event) {
      const newPosition = JSON.parse(event.data);
      setPositions((prevPositions) => [...prevPositions, newPosition]);
      console.log('New position:', newPosition);
    };
    eventSource.onerror = function(error) {
      console.error("SSE Error:", error);
      eventSource.close();
    };
    return () => eventSource.close();
  }, []);

  return (
    <div className="main">
      <div className="selection">
        <form className="form" onSubmit={handleSubmit}>
          <label htmlFor="time">Time:</label>
          <input type="number" name="time" min="0" defaultValue="0" />
          <label htmlFor="episodes">Episodes:</label>
          <input type="number" name="episodes" min="0" defaultValue="4" />
          <input type="submit" value="Submit" />
        </form>

        <form className="editMaze">
          <div className="edit-checkbox">
            <label htmlFor="editSelect">Edit Maze</label>
            <input type="checkbox" name="editSelect" onChange={handleCheckboxChange} />
          </div>
          <div className="tile-radio">
            <label htmlFor="radio">Block:
              <input type="radio" value="tile" name="radio" disabled={!isChecked} onChange={handleRadioChange} />
            </label>
          </div>
          <div className="block-radio">
            <label>Tile:
              <input type="radio" value="block" name="radio" disabled={!isChecked} onChange={handleRadioChange} />
            </label>
          </div>
        </form>

        {loading ? (
          <div className="loading-screen">
            <p>Loading, please wait...</p>
          </div>
        ) : (
          <div>
            {responseData && (
              <div>
                <h3>Solution:</h3>
                <p>{JSON.stringify(responseData)}</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="maze-view">
        <Maze isChecked={isChecked} radioValue={radioValue} positions={positions} />
      </div>
    </div>
  );
}

export default App;



