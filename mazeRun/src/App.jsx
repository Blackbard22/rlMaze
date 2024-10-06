
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Maze from './Maze/Maze';
import './App.css';
import useEventSource from './useEventSource';  
import { v4 as uuidv4 } from 'uuid';




function App() {

  const [time, setTime] = useState(0);
  const [episodes, setEpisodes] = useState(0);
  const [epsilon, setEpsilon] = useState(0);  
  const [epsilon_decay, setEpsilonDecay] = useState(0); 
  const [learning_rate, setLearningRate] = useState(0);
  const [loading, setLoading] = useState(false);
  const [responseData, setResponseData] = useState(null);
  const [error, setError] = useState(null);
  const [isChecked, setIsChecked] = useState(false);
  const [radioValue, setRadioValue] = useState('');
  const [position, setPosition] = useState([]);  
  const [positionArr, setPositionArr] = useState([]);
  const [endSSE, setEndSSE]= useState(true);
  const [mazeRun, setMazeRun] = useState(false);  
  const [maze, setMaze] = useState([]);
  const [submitMaze, setSubmitMaze] = useState(false);
  const [params, setParams] = useState({time: 4, episodes: 4, epsilon: 1, epsilon_decay: 0.99, learning_rate: 0.1});
  const [selectedAlgo, setSelectedAlgo] = useState('q-learn');  
  const curr_task_id = useRef(null);  



  useEventSource(selectedAlgo, endSSE, setPosition);
  

  

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const timeValue = formData.get('time');
    const episodesValue = formData.get('episodes');
    const epsilon = formData.get('eps');
    const epsilon_decay = formData.get('eps-decay');
    const learning_rate = formData.get('learn-rate');
    setTime(Number(timeValue));
    setEpisodes(Number(episodesValue));
    setEpsilon(Number(epsilon));  
    setEpsilonDecay(Number(epsilon_decay));
    setLearningRate(Number(learning_rate)); 
    runPythonScript(timeValue, episodesValue);
    setSubmitMaze(true);
    setMazeRun(true);
    
  };

  const runPythonScript = async (timeValue, episodesValue) => {
    setLoading(true);
    setEndSSE(false);
    const response = null;
    const task_id = uuidv4();
    console.log('task_id:', task_id);
    curr_task_id.current = task_id;
    try {
      if(selectedAlgo === 'q-learn'){
        console.log('runniing q-learn');
        const response = await axios.post('http://localhost:8000/run_qlearn/', {
          time: timeValue,
          episodes: episodesValue,
          task_id: task_id,
          epsilon: epsilon,
          epsilon_decay: epsilon_decay, 
          learning_rate: learning_rate  
        }, {
          headers: { 'Content-Type': 'application/json' },
        });
        setResponseData(response.data);
        // setEndSSe(true);
  
      } else if(selectedAlgo === 'sarsa'){
        console.log('runniing sarsa');
        const response = await axios.post('http://localhost:8000/sarsa/', {
          time: timeValue,
          episodes: episodesValue,
          task_id: task_id,
          epsilon: epsilon,
          epsilon_decay: epsilon_decay, 
          learning_rate: learning_rate  
        }, {
          headers: { 'Content-Type': 'application/json' },
        });
        setResponseData(response.data);
        // setEndSSe(true);
  
      }
     


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

  const cancel_run = async () => {
    try {
      const response = await axios.post(`http://localhost:8000/cancel-task/${curr_task_id.current}/`);
      console.log(response.data);
      setIsTraining(false);
      setEndSSE(true);
    } catch (error) {
      console.error('Error cancelling training:', error);
    }
  };


  


  useEffect(() => {
    const handleBeforeUnload = (event) => {
      console.log(selectedAlgo);
      cancel_run();
     
    };
  
    window.addEventListener('beforeunload', handleBeforeUnload);
  
    // Cleanup the event listener when component unmounts
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [selectedAlgo]); 




  useEffect(() => { 
   setParams({time: time, episodes: episodes, epsilon: epsilon, epsilon_decay: epsilon_decay, learning_rate: learning_rate});  
  }, [episodes, time]);   

  useEffect(() => {
    // Your effect logic here
    console.log('endSSE APP APP APP APP:', endSSE);
    
  }, [endSSE, setEndSSE]);

  return (
    <div className="main">
          {!isChecked && (

      <div className="selection">
        <div className="forms">
            <form className="form" onSubmit={handleSubmit}>
            <div className='time-input'>
              <label htmlFor="time">Time:</label>
              <input type="number" name="time" min="0" defaultValue="0"  step="0.01"/>
            </div>
            <div className='episode-input'>
              <label htmlFor="episodes">Episodes:</label>
              <input type="number" name="episodes" min="0" defaultValue="4" />
            </div>
            <div className='learning-input'>
              <label htmlFor="episodes">Learning Rate:</label>
              <input type="number" name="learn-rate" min="0" defaultValue="0.1" step="0.02" />
            </div>
            <div className="eps">
            <div className='eps-input'>
              <label htmlFor="episodes">Epsilon:</label>
              <input type="number" name="eps" min="0" defaultValue="1" step="0.1"/>
            </div>
            <div className='eps-decay-input'>
              <label htmlFor="episodes">Epsilon-decay:</label>
              <input type="number" name="eps-decay" min="0" defaultValue="0.99" step="0.01"/>
            </div>
          </div>
          <div className='submit-container'>
            <input type="submit" value="Submit" className='submit-btn' />
          </div>
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
        <Maze isChecked={isChecked} radioValue={radioValue} position={position} sendMaze = {sendMaze} submitMaze={submitMaze} setSubmitMaze={setSubmitMaze} handleRadioChange={handleRadioChange} handleCheckboxChange={handleCheckboxChange} endSSE = {endSSE} setEndSSE={setEndSSE} params={params} positionArr = {positionArr} selectedAlgo={selectedAlgo} setSelectedAlgo={setSelectedAlgo} cancel_run={cancel_run}/>
      </div>
      <div className="footer">
        <ul>
          <li>background</li>
          <li>about</li>
    
        </ul>

      </div>
    </div>
  );
}

export default App;



