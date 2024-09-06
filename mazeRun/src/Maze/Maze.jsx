import React, {useState, useEffect} from 'react';
import './Maze.css';
const Maze = ({isChecked, radioValue, position, sendMaze, submitMaze, setSubmitMaze}) => {

    const [arr, setArr] = useState([
        ['S', '#', '#'],
        ['.', '.', '#'],
        ['#', '.', '.'],
        ['#', '#', '.'],
        ['#', '#', 'G'],
      ]);

     const [currentGoal, setCurrentGoal] = useState([4, 2]);
     const [currentStart, setCurrentStart] = useState([0, 0]); 

      const handle_cell_change = async (i, j) => {
        // Create a copy of the array to avoid direct mutation
        const newArr = [...arr];
        
        // Toggle the cell's value
        
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
                if (!(newArr[i][j] === 'G')) {
                    newArr[i][j] = 'G';
                    newArr[currentGoal[0]][currentGoal[1]] = '.';
                    setCurrentGoal([i, j]);
                    console.log('goal', currentGoal);
                  }
            }
            if (radioValue === 'start'){
                if (!(newArr[i][j] === 'S')) {
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
            return <div className='cell-path active' onClick={()=> handle_cell_change(i, j)}></div>;
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

      


    

    useEffect(() => {
        if (submitMaze === true){
            console.log('submitting maze -- sent from maze jsx');
            sendMaze(arr);
            setSubmitMaze(false);
        }
        
    

    }, [submitMaze]);

      
    

    return (
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
    );
};

export default Maze;










// const getCellType = (cell, i, j) => {
//   if (cell === '.') {
//     if (i === position[0] && j === position[1]) {
//       return <div className='cell-path active' onClick={()=> handle_cell_change(i, j)}></div>;
//     } else{
//       return <div className='cell-path' onClick={()=> handle_cell_change(i, j)}></div>;
//     }
//   } else if (cell === '#') {
//     return <div className='cell-block' onClick={()=> handle_cell_change(i, j)}></div>;
//   } else if (cell === 'G') {
//     return <div className='cell-goal' onClick={()=> handle_cell_change(i, j)}></div>;
//   } else if (cell === 'S') {
//     return <div className='cell-start' onClick={()=> handle_cell_change(i, j)}></div>;
//   }
// }