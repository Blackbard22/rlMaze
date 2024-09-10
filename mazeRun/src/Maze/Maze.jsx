import React, {useState, useEffect} from 'react';
import './Maze.css';
const Maze = ({isChecked, radioValue, position, sendMaze, submitMaze, setSubmitMaze,handleRadioChange, handleCheckboxChange, endSSE, params, positionArr}) => {

    const [arr, setArr] = useState([
        ['S', '#', '#'],
        ['.', '.', '#'],
        ['#', '.', '.'],
        ['#', '#', '.'],
        ['#', '#', 'G'],
      ]);

    const [currentGoal, setCurrentGoal] = useState([4, 2]);
    const [currentStart, setCurrentStart] = useState([0, 0]); 
    const [arrPos, setArrPos] = useState([0, 0]);
    const [selectedAgent, setSelectedAgent] = useState('agent1');
    const [selectedAlgo, setSelectedAlgo] = useState('q-learn');  
      

    const handle_agent_change = (event) => {  

        setSelectedAgent(event.target.value);
        console.log('selected agent', selectedAgent);
    }

    const handle_algo_change = (event) => { 
      setSelectedAlgo(event.target.value);
      console.log('selected algo', selectedAlgo); 
    }


      const handle_cell_change = async (i, j) => {
        const newArr = [...arr];

        console.log('triggered', i, j);
        
        if(isChecked === true){
            if(radioValue === 'block'){
                console.log('block');
                if (newArr[i][j] === 'G') {
                    console.log('goal value already set cannot change');
                } else if (!(newArr[i][j] === '#')) {
                    newArr[i][j] = '#';

                  } 
               
        
            }
            if (radioValue === 'tile'){
                console.log('tile');
                if (newArr[i][j] === 'G') {
                    console.log('goal value already set cannot change');
                } else if (!(newArr[i][j] === '.')) {
                    newArr[i][j] = '.';
                  }
                
                 

            }
            if (radioValue === 'goal'){
                if (!(newArr[i][j] === 'G') && !(newArr[i][j] === 'S')) {
                    newArr[i][j] = 'G';
                    newArr[currentGoal[0]][currentGoal[1]] = '.';
                    setCurrentGoal([i, j]);
                    console.log('goal', currentGoal);
                  }
            }
            if (radioValue === 'start'){
                if (!(newArr[i][j] === 'S') && !(newArr[i][j] === 'G')) {
                    newArr[i][j] = 'S';
                    newArr[currentStart[0]][currentStart[1]] = '.';
                    setCurrentStart([i, j]);
                    console.log('start', currentStart);
                  }
            }
            
    }
    setArr(newArr);
    

      };

      const getCellType = (cell, i, j) => {
        if (cell === '.') {
          if (i === position[0] && j === position[1]) {
            return <div className={`cell-path ${selectedAgent}`} onClick={()=> handle_cell_change(i, j)}></div>;
          } else{
            return <div className='cell-path' onClick={()=> handle_cell_change(i, j)}></div>;
          }
        } else if (cell === '#') {
          if (i === position[0] && j === position[1]) {
            return <div className='cell-block active' onClick={()=> handle_cell_change(i, j)}></div>;
          } else{
          return <div className='cell-block' onClick={()=> handle_cell_change(i, j)}></div>;
          }
        } else if (cell === 'G') {
          if (i === position[0] && j === position[1]) {
            return <div className='cell-goal active' onClick={()=> handle_cell_change(i, j)}></div>;
          } else{
          return <div className='cell-goal' onClick={()=> handle_cell_change(i, j)}></div>;
          }
        } else if (cell === 'S') {
          if (i === position[0] && j === position[1]) {
            return <div className='cell-start active' onClick={()=> handle_cell_change(i, j)}></div>;
          } else{
          return <div className='cell-start' onClick={()=> handle_cell_change(i, j)}></div>;
          }
        }
      }

      const handleMazeAddition = (event) => {
        const newArr = [...arr];
        if (event.target.value === 'row') {
          console.log('adding row');
          newArr.push(Array(arr[0].length).fill('.'));
        }
        if (event.target.value === 'column') {
          console.log('adding column');
          for (let i = 0; i < newArr.length; i++) {
        newArr[i].push('.');
          }
        }
        setArr(newArr);
        animateMazeAddition(event.target.value);
      }

      const animateMazeAddition = (type) => {
        const mazeElement = document.querySelector('.maze');
        if (type === 'row') {
          mazeElement.classList.add('animate-row');
          setTimeout(() => {
        mazeElement.classList.remove('animate-row');
          }, 500);
        }
        if (type === 'column') {
          mazeElement.classList.add('animate-column');
          setTimeout(() => {
        mazeElement.classList.remove('animate-column');
          }, 500);
        }
      }
      


    

    useEffect(() => {
        if (submitMaze === true){
            console.log('submitting maze -- sent from maze jsx');
            sendMaze(arr);
            setSubmitMaze(false);
        }
        
    

    }, [submitMaze]);

      
    useEffect(() => { 
      setArrPos([...arrPos, position]);
    } , [position]);  

    return (

      <div className="maze-main">
      {!endSSE && (
        <div className="maze-timer">
        30 seconds to complete the maze
        </div>
      )}
      
      <div className="maze">
        {endSSE && (
          <div className='selection-main'>
          <h2>Edit Items</h2>
          <div className="cell-selection">
        <div className="terrain-selection">
          <div className="tile-radio">
              <button value="block" name='radio' disabled={!isChecked} onClick={handleRadioChange}>Block</button>
            </div>
            <div className="block-radio">
              <button value="tile" name='radio' disabled={!isChecked} onClick={handleRadioChange}>Tile</button>
            </div>
            <div className='goal-radio'>
              <button value="goal" name='radio' disabled={!isChecked} onClick={handleRadioChange}>Goal</button>
            </div>
            <div className='start-radio'>
              <button value="start" name='radio' disabled={!isChecked} onClick={handleRadioChange}>Start</button>
            </div>
            <button onClick={handleCheckboxChange}>Set Params</button>
          </div>
          <div className="maze-alteration">
            <div className="add-row">
                <button name='alteration' value='row' onClick={handleMazeAddition}>Row +</button>
            </div>
            <div className="add-column">
                <button name='alteration' value="column" onClick={handleMazeAddition}>Column +</button>
            </div>
          </div>
          <div className="dropdown-container">
            <label htmlFor="maze-options">Agent Select:</label>
            <select id="maze-options" name="maze-options" onChange={handle_agent_change}>
              <option value="agent1" className='agent1'>Quake</option>
              <option value="agent2" className='agent2'>Nubulis</option>
            </select>
          </div>

          <div className="algo-selection">
          <label htmlFor="algo-options">Algo Select:</label>
            <select id="algo-options" name="algo-options" onChange={handle_algo_change}>
              <option value="q-learn" className='q-learn'>q-learn</option>
              <option value="sarsa" className='sarsa'>sarsa</option>
            </select>
          </div>
        </div>
          </div>
        )

        }
          <div className='layout'>
                    {arr.map((row, i) => (
                        <div key={i} className='row'>
                            {row.map((cell, j) => (
                                <div key={j} className='cell'>
                                {getCellType(cell,i,j)}
                                </div>
                            ))}
                        </div>
                ))}
          </div>

        {!endSSE &&  (
        <div className="pos-flow">
        <h4>Agent pos</h4>
        {arrPos.map((pos, i) => (
          <div key={i} className='pos'>
            {pos}
          </div>
        ))}
      </div>
      )}

      </div>

      {!endSSE && (
        <div className="maze-params">
          {console.log('params', params)}
          <div className="parms-time">
            {params.time}
          </div>
          <div className="parms-episode">
            {params.episodes}
          </div>
        </div>
      )}

      </div>

      
    );
};

export default Maze;







