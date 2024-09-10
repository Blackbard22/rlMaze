

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
  const [positionArr, setPositionArr] = useState([]);
  const [endSSE, setEndSSe]= useState(true);
  const [mazeRun, setMazeRun] = useState(false);  
  const [maze, setMaze] = useState([]);
  const [submitMaze, setSubmitMaze] = useState(false);
  const [params, setParams] = useState({time: 4, episodes: 4});



  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const timeValue = formData.get('time');
    const episodesValue = formData.get('episodes');
    setTime(Number(timeValue));
    setEpisodes(Number(episodesValue));
    runPythonScript(timeValue, episodesValue);
    setSubmitMaze(true);
    setMazeRun(true);
    
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
    console.log('checkbox', isChecked);
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
      // const oldArr = [...positionArr];
      // setPositionArr(oldArr.concat(JSON.parse(event.data)));
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


  useEffect(() => { 
   setParams({time: time, episodes: episodes});  
  }, [episodes, time]);   

  return (
    <div className="main">
          {!isChecked && (

      <div className="selection">
        <div className="forms">
            <form className="form" onSubmit={handleSubmit}>
            <div className='time-input'>
              <label htmlFor="time">Time:</label>
              <input type="number" name="time" min="0" defaultValue="0" />
            </div>
            <div className='episode-input'>
              <label htmlFor="episodes">Episodes:</label>
              <input type="number" name="episodes" min="0" defaultValue="4" />
            </div>
            <div className='learning-input'>
              <label htmlFor="episodes">Learning Rate:</label>
              <input type="number" name="learn-rate" min="0" defaultValue="4" />
            </div>
            <div className="eps">
            <div className='eps-input'>
              <label htmlFor="episodes">Epsilon:</label>
              <input type="number" name="eps" min="0" defaultValue="4" />
            </div>
            <div className='eps-decay-input'>
              <label htmlFor="episodes">Epsilon-decay:</label>
              <input type="number" name="eps-decay" min="0" defaultValue="4" />
            </div>
            </div>
            <input type="submit" value="Submit" className='submit-btn' />
          </form>
          <form className="editMaze">
          <div className="edit-checkbox">
            <button type="button" name="editSelect" onClick={handleCheckboxChange}> Edit Maze </button>
          </div>

        </form>
        </div>
        
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
    )}
      <div className="maze-view">
        <Maze isChecked={isChecked} radioValue={radioValue} position={position} sendMaze = {sendMaze} submitMaze={submitMaze} setSubmitMaze={setSubmitMaze} handleRadioChange={handleRadioChange} handleCheckboxChange={handleCheckboxChange} endSSE = {endSSE} params={params} positionArr = {positionArr}/>
      </div>
    </div>
  );
}

export default App;



