
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Maze from './Maze/Maze';
import './App.css';
import useEventSource from './useEventSource';
import { v4 as uuidv4 } from 'uuid';
import plus from '../public/plus.svg';
import minus from '../public/minus.png';
import Modal from './Modal/Modal';
import { cos, div } from 'three/webgpu';



function App() {

    const [time, setTime] = useState(0);
    const [episodes, setEpisodes] = useState(7);
    const [epsilon, setEpsilon] = useState(1);
    const [epsilon_decay, setEpsilonDecay] = useState(0.99);
    const [learning_rate, setLearningRate] = useState(0.1);
    const [loading, setLoading] = useState(false);
    const [responseData, setResponseData] = useState(null);
    const [error, setError] = useState(null);
    const [isChecked, setIsChecked] = useState(false);
    const [radioValue, setRadioValue] = useState('');
    const [position, setPosition] = useState([]);
    const [positionArr, setPositionArr] = useState([]);
    const [endSSE, setEndSSE] = useState(true);
    const timerRef = useRef(false)
    const [mazeRun, setMazeRun] = useState(false);
    const [maze, setMaze] = useState([]);
    const submitMaze = useRef(false)

    const [epsilonChange, setEpsilonChange] = useState(0);
    const [qTable, setQTable] = useState([]);
    const [params, setParams] = useState({ time: 4, episodes: 4, epsilon: 1, epsilon_decay: 0.99, learning_rate: 0.1 });
    const [selectedAlgo, setSelectedAlgo] = useState('q-learn');
    const curr_task_id = useRef(null);
    const [hasReceivedData, setHasReceivedData] = useState(false);
    const [episode, setEpisode] = useState(0);
    const [solutionPath, setSolutionPath] = useState([]);
    const [updateArr, setUpdateArr] = useState([]);




    useEventSource(selectedAlgo, endSSE, setEndSSE, setPosition, setEpsilonChange, setQTable, setLoading, setEpisode, setSolutionPath, loading, episode, setUpdateArr, updateArr);




    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        submitMaze.current = true;
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
        setEpsilonChange(Number(epsilon));
        runPythonScript(timeValue, episodesValue);
        setMazeRun(true);
        setIsChecked(false);
        setEndSSE(false);
        timerRef.current = true;

        const maze = document.querySelector('.maze');
        maze.classList.add('margin_change');

    };

    const clear_states = () => {

        setQTable([]);
        setPositionArr([]);
        setHasReceivedData(false);
        setEpisode(null);
        setSolutionPath(null);


        console.log('episode value from cancel:', episode);

    };


    const runPythonScript = async (timeValue, episodesValue) => {
        const response = null;
        const task_id = uuidv4();
        console.log('task_id:', task_id);
        curr_task_id.current = task_id;
        try {
            if (selectedAlgo === 'q-learn') {
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
                clear_states();
                setResponseData(response.data);
                console.log('first response:', response.data);

            } else if (selectedAlgo === 'sarsa') {
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
                clear_states();
                setResponseData(response.data);


            }


        } catch (error) {
            handleError(error);
        } finally {

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


            setEndSSE(true);
            // endSSE.current = true
            setResponseData([]);

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


        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [selectedAlgo]);




    useEffect(() => {
        setParams({ time: time, episodes: episodes, epsilon: epsilon, epsilon_decay: epsilon_decay, learning_rate: learning_rate });
    }, [episodes, time]);

    useEffect(() => {

        console.log('endSSE APP APP APP APP:', endSSE);

    }, [endSSE]);


    useEffect(() => {

        const selection = document.querySelector('.selection');

        const handleMouseMove = (event) => {
            const screenWidth = window.innerWidth;
            const cursorX = event.clientX;
            if ((cursorX >= screenWidth * 0.8 && endSSE)) {
                selection.classList.remove('hidden');
                selection.classList.add('active');
                console.log('endsse value for selction', endSSE);
            } else if (!endSSE) {
                selection.classList.remove('active');
                selection.classList.add('hidden');
                console.log('endsse value for hiiding hiiding ', endSSE);

            }

            else {
                selection.classList.remove('active');
                selection.classList.add('hidden');
            }
        };

        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, [endSSE, setEndSSE]);





    return (
        <div className="main">
            <div className="selection">
                <div className="forms">
                    <form className="form" onSubmit={handleSubmit}>
                        <div className='episode-input'>
                            <div className="input-values">
                                <label htmlFor="episodes">Episodes:</label>
                                <input
                                    type="text"
                                    name="episodes"
                                    min="0"
                                    value={episodes}
                                    onChange={(e) => setEpisodes(Math.max(0, parseInt(e.target.value) || 0))}
                                />
                            </div>
                            <div className='add-button' type="button" onClick={() => setEpisodes(episodes + 1)}>
                                <img src={plus} alt="" />

                            </div>
                            <div className='sub-button' type="button" onClick={() => setEpisodes(Math.max(0, episodes - 1))}>
                                <img src={minus} alt="" />

                            </div>
                        </div>



                        <div className='learning-input'>
                            <div className="input-values">
                                <label htmlFor="learn-rate">Learning Rate:</label>
                                <input
                                    type="text"
                                    name="learn-rate"
                                    value={learning_rate}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (value === '' || /^[0-9]*\.?[0-9]*$/.test(value)) {
                                            setLearningRate(value);
                                        }
                                    }}
                                    onBlur={() => {
                                        setLearningRate((prev) => {
                                            const numericValue = parseFloat(prev);
                                            return !isNaN(numericValue) ? numericValue.toFixed(2) : '0.00';
                                        });
                                    }}
                                />
                            </div>
                            <div
                                className='add-button'
                                type="button"
                                onClick={() => setLearningRate((prev) => {
                                    const currentValue = parseFloat(prev) || 0;
                                    return (currentValue + 0.02).toFixed(2);
                                })}
                            >
                                <img src={plus} alt="" />
                            </div>
                            <div
                                className='sub-button'
                                type="button"
                                onClick={() => setLearningRate((prev) => {
                                    const currentValue = parseFloat(prev) || 0;
                                    return Math.max(0, currentValue - 0.02).toFixed(2);
                                })}
                            >
                                <img src={minus} alt="" />
                            </div>
                        </div>




                        <div className="eps">
                            <div className='eps-input'>
                                <div className="input-values">
                                    <label htmlFor="eps">Epsilon:</label>
                                    <input
                                        type="text"
                                        name="eps"
                                        value={epsilon}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            if (value === '' || /^[0-9]*\.?[0-9]*$/.test(value)) {
                                                setEpsilon(value);
                                            }
                                        }}
                                        onBlur={() => {

                                            setEpsilon((prev) => {
                                                const numericValue = parseFloat(prev);
                                                return !isNaN(numericValue) ? numericValue.toFixed(1) : '0.0';
                                            });
                                        }}
                                    />
                                </div>
                                <div
                                    className='add-button'
                                    type="button"
                                    onClick={() => setEpsilon((prev) => {
                                        const currentValue = parseFloat(prev) || 0;
                                        return (currentValue + 0.1).toFixed(1);
                                    })}
                                >
                                    <img src={plus} alt="" />
                                </div>
                                <div
                                    className='sub-button'
                                    type="button"
                                    onClick={() => setEpsilon((prev) => {
                                        const currentValue = parseFloat(prev) || 0;
                                        return Math.max(0, currentValue - 0.1).toFixed(1);
                                    })}
                                >
                                    <img src={minus} alt="" />
                                </div>
                            </div>

                            <div className='eps-decay-input'>
                                <div className="input-values">
                                    <label htmlFor="eps-decay">Epsilon-decay:</label>
                                    <input
                                        type="text"
                                        name="eps-decay"
                                        value={epsilon_decay}
                                        onChange={(e) => {
                                            const value = e.target.value;

                                            if (value === '' || /^[0-9]*\.?[0-9]*$/.test(value)) {
                                                setEpsilonDecay(value);
                                            }
                                        }}
                                        onBlur={() => {

                                            setEpsilonDecay((prev) => {
                                                const numericValue = parseFloat(prev);
                                                return !isNaN(numericValue) ? numericValue.toFixed(2) : '0.00';
                                            });
                                        }}
                                    />
                                </div>
                                <div
                                    className='add-button'
                                    type="button"
                                    onClick={() => setEpsilonDecay((prev) => {
                                        const currentValue = parseFloat(prev) || 0;
                                        return (currentValue + 0.01).toFixed(2);
                                    })}
                                >
                                    <img src={plus} alt="" />
                                </div>
                                <div
                                    className='sub-button'
                                    type="button"
                                    onClick={() => setEpsilonDecay((prev) => {
                                        const currentValue = parseFloat(prev) || 0;
                                        return Math.max(0, currentValue - 0.01).toFixed(2);
                                    })}
                                >
                                    <img src={minus} alt="" />
                                </div>
                            </div>
                        </div>




                        <div className='submit-container'>
                            <input type="submit" value="run" className='submit-btn' />
                        </div>
                    </form>
                </div>


            </div>

            {loading && (
                <div className="loading-screen">
                    <video
                        autoPlay
                        muted
                        className="logo-video"
                        height="200px"
                        width="200px"
                    >
                        <source src="../public/loading_animation.mp4" type="video/mp4" />
                        loading...
                    </video>
                    <div className='loading-message'>setting params...</div>
                </div>
            )}

            <div className="maze-view">
                <Maze isChecked={isChecked} setQTable={setQTable} setIsChecked={setIsChecked} radioValue={radioValue} position={position} sendMaze={sendMaze} submitMaze={submitMaze} handleRadioChange={handleRadioChange} handleCheckboxChange={handleCheckboxChange} endSSE={endSSE} setEndSSE={setEndSSE} params={params} positionArr={positionArr} selectedAlgo={selectedAlgo} setSelectedAlgo={setSelectedAlgo} cancel_run={cancel_run} epsilonChange={epsilonChange} qTable={qTable} responseData={responseData} setPositionArr={setPositionArr} setHasReceivedData={setHasReceivedData} hasReceivedData={hasReceivedData} episode={episode} setEpisode={setEpisode} solutionPath={solutionPath} setSolutionPath={setSolutionPath} setUpdateArr={setUpdateArr} updateArr={updateArr} timerRef={timerRef} />
            </div>

            {responseData && (
                <div>

                </div>
            )}

            <div className="footer">
                <ul>
                    <li>background</li>
                    <li>about</li>
                </ul>
            </div>

            <div className='block-overlay'>
                open app in a larger screen
            </div>

        </div>
    );
}

export default App;



