import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import axios from 'axios';
import { useEffect } from 'react';
import Maze from './Maze/Maze';


function App() {
  const [count, setCount] = useState(0);
  const [time, setTime ] = useState(0); 
  const [episodes, setEpisodes] = useState(0);  


  const [loading, setLoading] = useState(false);  // Manage loading state
  const [responseData, setResponseData] = useState(null);  // Store response data
  const [error, setError] = useState(null);  // Manage error state


  const [isChecked, setIsChecked] = useState(false); //edit maze checkbox
  const [radioValue, setRadioValue] = useState(''); //tile or block radio button



  const handleSubmit = async (e) => {
    e.preventDefault();  // Prevent the default form submission behavior

    // Get form data
    const formData = new FormData(e.target);
    const timeValue = formData.get('time');
    const episodesValue = formData.get('episodes');

    // Update the state with the form input values
    await setTime(Number(timeValue));
    await setEpisodes(Number(episodesValue));

    // You can now use 'time' and 'episodes' states in your component logic
    console.log('Time:', time);
    console.log('Episodes:', episodesValue);

    runPythonScript(timeValue, episodesValue);

  };


  const runPythonScript = async (timeValue, episodesValue) => {
    setLoading(true);  // Show loading screen
    try {
      const response = await axios.post('http://localhost:8000/run_qlearn/', {
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
      } else if (error.request) {
        // The request was made but no response was received
        console.error('Error request:', error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error message:', error.message);
      } 
    } finally {
      setLoading(false);  // Hide loading screen
    }
  };



  const handleCheckboxChange = () => {
    setIsChecked(!isChecked);
  };

  const handleRadioChange = (event) => {
    setRadioValue(event.target.value);
    
  };

  return (
    <div className='main'>
    <div className="selection">

      <form className='form' onSubmit={handleSubmit}>
        <label htmlFor="time">Time:</label>
        <input type="number" name="time" min="0" defaultValue="0"/>
        <label htmlFor="episodes">Episodes:</label>
        <input type="number" name="episodes" min="0" defaultValue="4"/>
        <input type='submit' value='Submit'  />  
      </form>

      <form className='editMaze'>
        <div className="edit-checkbox">
        <label htmlFor="editSelect">Edit Maze</label> 
        <input type="checkbox" name='editSelect'  onChange={handleCheckboxChange} />
        </div>
        
        <div className='tile-radio'>
        <label htmlFor="radio">Block:
        <input type="radio" value='tile' name="radio" disabled = {!isChecked} onChange={handleRadioChange}/>
        </label>
        </div>
        <div className='block-radio'>
        <label >Tile:
        <input type="radio" value="block" name="radio" disabled = {!isChecked} onChange={handleRadioChange}/>
        </label>
        </div>
      </form>
      
      {loading ? (
        <div className="loading-screen">
          <p>Loading, please wait...</p>
        </div>
      ) : (
        <div>

        </div>
      )}
    </div>
    <div className="maze-view">
      <Maze isChecked = {isChecked} radioValue = {radioValue}/>
    </div>
    </div>
  );
}

export default App;
