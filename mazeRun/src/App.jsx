

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
  const [position, setPosition] = useState([]);  
  const [endSSE, setEndSSe]= useState(true);

  const [maze, setMaze] = useState([]);
  const [submitMaze, setSubmitMaze] = useState(false);



  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const timeValue = formData.get('time');
    const episodesValue = formData.get('episodes');
    setTime(Number(timeValue));
    setEpisodes(Number(episodesValue));
    runPythonScript(timeValue, episodesValue);
    setSubmitMaze(true);
    
  };

  const runPythonScript = async (timeValue, episodesValue) => {
    setLoading(true);
    setEndSSe(false);
    try {
      const response = await axios.post('http://localhost:8000/run_qlearn/', {
        time: timeValue,
        episodes: episodesValue,
      }, {
        headers: { 'Content-Type': 'application/json' },
      });
      setResponseData(response.data);
      setEndSSe(true);

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


  const sendMaze = async (maze) => {
    console.log('submitting maze -- sent from app');
    try {
      const response = await axios.post('http://localhost:8000/save_maze/', {
        maze: maze,
        }, {
        headers: { 'Content-Type': 'application/json' },
      });

    } catch (error) {
      handleError(error);
    } 


  } 

  // Start SSE listener
  useEffect(() => {
    const eventSource = new EventSource('http://localhost:8000/sse/');
    eventSource.onmessage = function(event) {
      const newPosition = JSON.parse(event.data);
      setPosition(newPosition);
      console.log('New position:', newPosition);
    };
    eventSource.onerror = function(error) {
      console.error("SSE Error:", error);
      eventSource.close();
    };

    if (endSSE === true){
      eventSource.close();
    } 

    return () => eventSource.close();
  }, [endSSE]);

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
          <div className='goal-radio'>
          <label>Goal:
              <input type="radio" value="goal" name="radio" disabled={!isChecked} onChange={handleRadioChange} />
            </label>
          </div>
          <div className='start-radio'>
            <label>Start:
              <input type="radio" value="start" name="radio" disabled={!isChecked} onChange={handleRadioChange} />
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
        <Maze isChecked={isChecked} radioValue={radioValue} position={position} sendMaze = {sendMaze} submitMaze={submitMaze} setSubmitMaze={setSubmitMaze}/>
      </div>
    </div>
  );
}

export default App;



