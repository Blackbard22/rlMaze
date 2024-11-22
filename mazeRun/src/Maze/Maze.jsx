import React, { useState, useEffect, useRef } from 'react';
import './Maze.css';
import { div } from 'three/webgpu';
import { intervalToDuration } from 'date-fns';
import Timer from '../../src/Timer/Timer.jsx'

const Maze = ({ isChecked, radioValue, position, sendMaze, submitMaze, handleRadioChange, handleCheckboxChange, endSSE, setEndSSE, params, positionArr, selectedAlgo, setSelectedAlgo, cancel_run, epsilonChange, qTable, responseData, setIsChecked, setQTable, setPositionArr, setHasReceivedData, hasReceivedData, episode, setEpisode, solutionPath, setSolutionPath, setUpdateArr, updateArr, timerRef }) => {

    const [arr, setArr] = useState([
        ['S', '#', '.', '#', '#', '#'],
        ['.', '.', '#', '.', '#', '.'],
        ['#', '.', '.', '.', '.', '.'],
        ['#', '.', '.', '#', '#', '.'],
        ['#', '#', '.', '#', '#', 'G'],
    ]);

    const [currentGoal, setCurrentGoal] = useState([4, 5]);
    const [currentStart, setCurrentStart] = useState([0, 0]);
    const [arrPos, setArrPos] = useState([0, 0]);
    const [selectedAgent, setSelectedAgent] = useState('agent1');
    const [layoutWidth, setLayoutWidth] = useState(0);
    const [timerValue, setTimerValue] = useState(null)



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

        if (isChecked === true) {
            if (radioValue === 'block') {
                console.log('block');
                if (newArr[i][j] === 'G') {
                    console.log('goal value already set cannot change');
                } else if (!(newArr[i][j] === '#')) {
                    newArr[i][j] = '#';

                }

            }
            if (radioValue === 'tile') {
                console.log('tile');
                if (newArr[i][j] === 'G') {
                    console.log('goal value already set cannot change');
                } else if (!(newArr[i][j] === '.')) {
                    newArr[i][j] = '.';
                }



            }
            if (radioValue === 'goal') {
                if (!(newArr[i][j] === 'G') && !(newArr[i][j] === 'S')) {
                    newArr[i][j] = 'G';
                    newArr[currentGoal[0]][currentGoal[1]] = '.';
                    setCurrentGoal([i, j]);
                    console.log('goal', currentGoal);
                }
            }
            if (radioValue === 'start') {
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
                return <div className={`cell-path ${selectedAgent}`} onClick={() => handle_cell_change(i, j)}></div>;
            } else {
                return <div className='cell-path' onClick={() => handle_cell_change(i, j)}></div>;
            }
        } else if (cell === '#') {
            if (i === position[0] && j === position[1]) {
                return <div className='cell-block active' onClick={() => handle_cell_change(i, j)}></div>;
            } else {
                return <div className='cell-block' onClick={() => handle_cell_change(i, j)}></div>;
            }
        } else if (cell === 'G') {
            if (i === position[0] && j === position[1]) {
                return <div className='cell-goal active' onClick={() => handle_cell_change(i, j)}></div>;
            } else {
                return <div className='cell-goal' onClick={() => handle_cell_change(i, j)}></div>;
            }
        } else if (cell === 'S') {
            if (i === position[0] && j === position[1]) {
                return <div className='cell-start active' onClick={() => handle_cell_change(i, j)}></div>;
            } else {
                return <div className='cell-start' onClick={() => handle_cell_change(i, j)}></div>;
            }
        }
    }




    const handleMazeAddition = async (event) => {
        const newArr = [...arr];
        const layout = document.querySelector('.layout');

        layout.classList.remove('fadeIn');
        layout.classList.add('fadeOut');

        if (event.target.value === 'row' && newArr.length < 11) {
            console.log('adding row');
            newArr.push(Array(arr[0].length).fill('.'));
        }
        if (event.target.value === 'column' && newArr[0].length < 11) {
            console.log('adding column');
            for (let i = 0; i < newArr.length; i++) {
                newArr[i].push('.');
            }
        }

        await new Promise(resolve => setTimeout(resolve, 400));
        layout.classList.remove('fadeOut');
        layout.classList.add('fadeIn');
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
        setIsChecked(true);
        setQTable([]);
        setPositionArr([]);
        setHasReceivedData(false);
        setEpisode(null);
        setSolutionPath(null);
        setArrPos([]);
        setUpdateArr([]);


        console.log('CANCELLING UPDATE ARRAY , CANCELLING UPDATE ARRAY   ', qTable);
        console.log('update ARr after cancellation', updateArr)

        const maze = document.querySelector('.maze');
        maze.classList.remove('margin_change');
    };


    useEffect(() => {
        if (submitMaze.current === true) {
            console.log('submitting maze -- sent from maze jsx');
            sendMaze(arr);

            submitMaze.current = false;
        }


    }, [submitMaze]);


    useEffect(() => {

        if (position != null && position.length > 0) {
            setArrPos([...arrPos, position]);
        }

    }, [position]);


    const handleAgent = (value) => {
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

    const handleOptionSelection = (option, value) => {
        let selectSelected = document.querySelector('.select-selected');
        let selectItems = document.querySelector('.select-items');
        setSelectedAlgo(value);
        console.log('selected Algo', selectedAgent);
        selectSelected.textContent = option;
        selectItems.style.display = 'none';
    };



    useEffect(() => {
        const getLayoutWidth = () => {
            const layout = document.querySelector('.maze');
            if (layout) {
                setLayoutWidth(layout.offsetWidth);
                console.log('layout width', layout.offsetWidth);
                console.log(arr.length);
            }
            return 0;
        };


        if (document.readyState === 'complete') {
            getLayoutWidth();
        } else {
            window.addEventListener('load', getLayoutWidth);
            return () => window.removeEventListener('load', getLayoutWidth);
        }
    }, [arr, layoutWidth]);


    const maxArea = window.innerHeight * 0.5;


    const cellSize = Math.floor(maxArea / Math.max(arr.length, arr[0].length));




    useEffect(() => {
        if (responseData != null) {
            setUpdateArr([...updateArr, responseData]);
        }
    }, [responseData]);

    useEffect(() => {
        if (episode != null && episode != undefined) {
            setUpdateArr([...updateArr, { status: `Episode ${episode}`, task_id: 'completed' }]);
        }
    }, [episode]);

    useEffect(() => {
        if (solutionPath != null && solutionPath.length > 0) {
            setTimerValue(true);
            if (solutionPath === 'No Convergence') {
                setUpdateArr([...updateArr, { status: `No Solution Path found`, task_id: solutionPath }]);
                console.log('recieved the soution path;', solutionPath)
            } else {
                setUpdateArr([...updateArr, { status: `Solution Path found`, task_id: solutionPath }]);
            }
        }


    }, [solutionPath]);




    return (
        <div className="maze-main">
            <div className="maze">
                {(endSSE) && (
                    <div className='selection-main' onMouseEnter={handleDisplaySelection} onMouseLeave={handleDisplayLeave}>
                        <h2>Edit Items</h2>
                        <div className="cell-selection">
                            <div className="terrain-selection">
                                <div className="tile-button">
                                    <button value="block" name='radio' onClick={handleRadioChange}>Block</button>
                                </div>
                                <div className="block-button">
                                    <button value="tile" name='radio' onClick={handleRadioChange}>Tile</button>
                                </div>
                                <div className='goal-button'>
                                    <button value="goal" name='radio' onClick={handleRadioChange}>Goal</button>
                                </div>
                                <div className='start-button'>
                                    <button value="start" name='radio' onClick={handleRadioChange}>Start</button>
                                </div>
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
                                <button className='agent-select-btn' onClick={() => handleAgent('agent1')}>{selectedAgent}</button>
                                <div className='agent-btn-container hide'>
                                    <img className='agent1' value="agent1" onClick={() => handleAgent('agent1')} src='../../public/agent1-cut.svg' />
                                    <img className='agent2' value="agent2" onClick={() => handleAgent('agent2')} src='../../public/agent2_cut.svg' />
                                </div>
                            </div>

                            <div className="algo-selection">
                                <div class="select-selected" onClick={handleAlgoSelection}>
                                    {selectedAlgo}
                                </div>
                                <div class="select-items">
                                    <div className='algo-option' value='q-learn' onClick={() => handleOptionSelection('q-learn', 'q-learn')}>q-learn</div>
                                    <div className='algo-option' value='sarsa' onClick={() => handleOptionSelection('SARSA', 'sarsa')}>SARSA</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
                }

                {(!endSSE) && (
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
                        <div className="epsilon-change">
                            <div>Epsilon:</div>
                            <div>
                                {epsilonChange.toFixed(3)}
                            </div>
                        </div>
                    </div>
                )}


                <div className="layout" style={{
                    gridTemplateColumns: `repeat(${arr[0].length}, ${cellSize}px)`,
                    gridTemplateRows: `repeat(${arr.length}, ${cellSize}px)`,
                }}>
                    {arr.map((row, i) => (
                        row.map((cell, j) => (
                            <div key={`${i}-${j}`} className="cell">
                                {getCellType(cell, i, j)}
                            </div>
                        ))
                    ))}
                </div>
                {(!endSSE) && (
                    <div className="run_info">
                        <div className='run_info_selection'>
                            <div className='timer-run'>
                                <Timer endSSE={endSSE} timerValue={timerValue} />
                            </div>
                            <div className="pos-flow">
                                <h4>Agent pos</h4>
                                {arrPos.slice().reverse().map((pos, i) => (
                                    <div key={i} className='pos'>
                                        {`${[pos[0], pos[1]]}`}
                                    </div>
                                ))}

                            </div>
                            <div className='cancelRun'>
                                <div onClick={handleRunCancel} className='cancel-btn'>Cancel Run</div>
                            </div>

                        </div>
                        <div className='update-terminal'>
                            <h3>Update Terminal</h3>
                            <div className='update-container'>
                                {[...updateArr].reverse().map((msg, i) => (
                                    <div key={i} className='update_msg'>
                                        <div className='status_msg'> {`${msg.status}`} </div>
                                        <div className='task_id'> {`${msg.task_id}`} </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                )}


            </div >



            {
                (endSSE) && (
                    <div className="edit-display">
                        EDIT
                    </div>

                )
            }



            {
                qTable.length > 0 && !endSSE && (
                    <div className="q-table-container">
                        <h3>Q-Table:</h3>
                        <table className="q-table">
                            <thead>
                                <tr>
                                    <th>Action</th>
                                    {qTable.map((row, i) =>
                                        row.map((_, j) => (
                                            <th key={`${i}-${j}`}>({i}, {j})</th>
                                        ))
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {['Up', 'Right', 'Down', 'Left'].map((action, k) => (
                                    <tr key={action}>
                                        <td>{action}</td>
                                        {qTable.map((row, i) =>
                                            row.map((col, j) => (
                                                <td key={`${i}-${j}-${k}`}>{col[k].toFixed(2)}</td>
                                            ))
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )
            }
        </div >

    );
};

export default Maze;







