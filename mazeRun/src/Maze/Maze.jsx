import React, {useState} from 'react';
import './Maze.css';
const Maze = ({isChecked, radioValue}) => {

    const [arr, setArr] = useState([
        ['.', '#', '#'],
        ['.', '.', '#'],
        ['#', '.', '.']
      ]);
    
      const handle_cell_change = (e, i, j) => {
        // Create a copy of the array to avoid direct mutation
        const newArr = [...arr];
        
        // Toggle the cell's value

        if(isChecked === true){
            if(radioValue === 'tile'){
                if (newArr[i][j] === '.') {
                    newArr[i][j] = '#';
                  } 

            }
            if (radioValue === 'block'){
                if (newArr[i][j] === '#') {
                    newArr[i][j] = '.';
                  }
            }
    }
    
        // Update the state with the new array
        setArr(newArr);
      };
    



    return (
        <div className='layout'>
                    {arr.map((row, i) => (
                        <div key={i} className='row'>
                            {row.map((cell, j) => (
                                <div key={j} className='cell'  >
                                {
                                    cell === '.' ? <div className=' cell-path' onClick={(e)=>handle_cell_change(e,i,j)}></div> : <div className=' cell-block' onClick={(e)=>handle_cell_change(e,i,j)}></div>
                                }
                                </div>
                            ))}
                        </div>
                ))}
        </div>
    );
};

export default Maze;