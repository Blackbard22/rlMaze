import React, {useState, useEffect} from 'react';
import './Maze.css';

const Maze = ({isChecked, radioValue, position, sendMaze, submitMaze, setSubmitMaze,handleRadioChange, handleCheckboxChange, endSSE, setEndSSE, params, positionArr, selectedAlgo,setSelectedAlgo, cancel_run }) => {

    const [arr, setArr] = useState([
      ['S', '#', '.', '#', '#', '#'],
      ['.', '.', '#', '.', '#', '.'],
      ['#', '.', '.', '.', '.', '.'],
      ['#', '.', '.', '#', '#', '.'],
      ['#', '#', '.', '#', '#', 'G'],
      ]);

    const [currentGoal, setCurrentGoal] = useState([4, 2]);
    const [currentStart, setCurrentStart] = useState([0, 0]); 
    const [arrPos, setArrPos] = useState([0, 0]);
    const [selectedAgent, setSelectedAgent] = useState('agent1');
  

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
      
    const handleDisplaySelection = () => {
      const selectionMain = document.querySelector('.selection-main')
      selectionMain.classList.remove('hide')
      selectionMain.classList.toggle('show')
      

    } 

    const handleDisplayLeave = () => {
      const selectionMain = document.querySelector('.selection-main')
      selectionMain.classList.remove('show')
      selectionMain.classList.toggle('hide')
      

    } 


    const handleRunCancel = () => { 

      cancel_run();
      setEndSSE(true);

    };

    
    

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


    const handleAgent = (value) =>{
      const selectionMain = document.querySelector('.agent-select-btn')
      const mainSelect = document.querySelector('.agent-btn-container') 
      selectionMain.classList.toggle('hide')
      mainSelect.classList.toggle('hide') 
      setSelectedAgent(value);
      console.log('selected agent', selectedAgent);
    }

    

    const handleAlgoSelection = () => {
      let selectItems = document.querySelector('.select-items');
      
      if (selectItems.style.display === 'block') {
        selectItems.style.display = 'none';
      } else {
        selectItems.style.display = 'block';
      }
    };
    
    const handleOptionSelection = (option,value) => {
      let selectSelected = document.querySelector('.select-selected');
      let selectItems = document.querySelector('.select-items');
      setSelectedAlgo(value);
      console.log('selected Algo', selectedAgent);
      selectSelected.textContent = option;
      selectItems.style.display = 'none';
    
      
    };

    // useEffect(() => {
    //   // Your effect logic here
    //   window.addEventListener('click', function handleOutsideClick(e) {
    //     if (!selectItems.contains(e.target) && !selectSelected.contains(e.target)) {
    //       selectItems.style.display = 'none';
    //       window.removeEventListener('click', handleOutsideClick);
    //     }
    //   });

    //   return () => {
        
    //   };
    // }, []);


    useEffect(() => {
      

      const handleOutsideClick = (e) => {
        if (!selectItems.contains(e.target) && !selectSelected.contains(e.target)) {
          selectItems.style.display = 'none';
          window.removeEventListener('click', handleOutsideClick);
        }
      };
  
      document.addEventListener('mousedown', handleOutsideClick);
  
      return () => {
        document.removeEventListener('mousedown', handleOutsideClick);
      };
    }, []);
    



    return (

    <div className="maze-main">
      {!endSSE && (
        <div className="maze-timer">
        30 seconds to complete the maze
        </div>
      )}
      
      <div className="maze">
        {endSSE && (
          <div className='selection-main' onMouseEnter={handleDisplaySelection} onMouseLeave={handleDisplayLeave}>
          <h2>Edit Items</h2>
          <div className="cell-selection">
        <div className="terrain-selection">
          <div className="tile-button">
              <button value="block" name='radio' disabled={!isChecked} onClick={handleRadioChange}>Block</button>
            </div>
            <div className="block-button">
              <button value="tile" name='radio' disabled={!isChecked} onClick={handleRadioChange}>Tile</button>
            </div>
            <div className='goal-button'>
              <button value="goal" name='radio' disabled={!isChecked} onClick={handleRadioChange}>Goal</button>
            </div>
            <div className='start-button'>
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
         

          <div className='agent-select'>
            <button className='agent-select-btn' onClick={()=>handleAgent('')}>{selectedAgent}</button>
            <div className='agent-btn-container hide'>
              <img className='agent1' value="agent1" onClick={()=>handleAgent('agent1')} src='../../public/agent1-cut.svg' />
              <img className='agent2' value="agent2" onClick={()=>handleAgent('agent2')} src='../../public/agent2_cut.svg' />
            </div>
          </div>

        <div className="algo-selection">
          <div class="select-selected" onClick={handleAlgoSelection}>
            q-learn
          </div>
          <div class="select-items">
              <div className='algo-option' value='q-learn' onClick={() => handleOptionSelection('q-learn','q-learn')}>q-learn</div>
              <div className='algo-option' value='sarsa' onClick={() => handleOptionSelection('SARSA','sarsa')}>SARSA</div>
          </div>
          </div>
        </div>
          </div>
        )
        }
  
        <div className='layout'>
                    {arr.map((row, i) => (
                        <div key={i} className='row' style={{gridTemplateColumns: `repeat(${arr[0].length}, minmax(10px, 50px))`}}>
                            {row.map((cell, j) => (
                                <div key={j} className='cell'>
                                {getCellType(cell,i,j)}
                                </div>
                            ))}
                        </div>
                ))}
          </div>
      
    <div className="run-info">  
        {!endSSE &&  (
          <>
        <div className="pos-flow">
        <h4>Agent pos</h4>
        {arrPos.slice().reverse().map((pos, i) => (
        <div key={i} className='pos'>
          {`${[pos[0], pos[1]]}`}
         </div>
            ))}

      </div>
      <button onClick={handleRunCancel} className='cancel-btn'>Cancel Run</button>
      </>
      )}
    </div>

      </div>

      {!endSSE && (
        <div className="maze-params">
          <div className="params-time">
            <div>Time:</div>
          <div>
          {params.time}
          </div>
          </div>
          <div className="params-episode">
            <div>Episode:</div>
            <div>
            {params.episodes}
            </div>
          </div>
        </div>
      )}



  { endSSE &&(
    <div className="edit-display">
        EDIT
    </div>

  )


  }    


  </div>



      
    );
};

export default Maze;







