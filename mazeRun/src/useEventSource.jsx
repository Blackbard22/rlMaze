import { useEffect, useRef } from 'react';

const useEventSource = (selectedAlgo, endSSE, setEndSSE, setPosition, setEpsilonChange, setQTable, setLoading, setEpisode, setSolutionPath, loading, episode, setUpdateArr, updateArr) => {
    const eventSourceRef = useRef(null);
    const sse_counter = useRef(0);

    useEffect(() => {

        if (loading) {
            setEpisode(null);
            setUpdateArr([]);
            console.log('episode value from eventSource: ', episode);
            sse_counter.current = 0;
        }

    }, [selectedAlgo, loading]);


    useEffect(() => {
        const createEventSource = (url) => {
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
            }

            eventSourceRef.current = new EventSource(url);

            eventSourceRef.current.onmessage = function (event) {
                const newPosition = JSON.parse(event.data);
                // console.log('newSSe:', newPosition);
                // console.log('update Arr for above:', updateArr)
                if (newPosition.position) {
                    setPosition(newPosition.position);
                    sse_counter.current += 1;
                    if (sse_counter.current > 2) {
                        setLoading(false);
                    }
                }


                if (newPosition.epsilon) {
                    setEpsilonChange(newPosition.epsilon);
                    console.log('epsilon:', newPosition.epsilon);
                }

                if (newPosition.q_table) {
                    setQTable(newPosition.q_table);

                }

                if (newPosition.episode) {
                    setEpisode(newPosition.episode);
                    console.log('episode set at:', newPosition.episode);
                }

                if (newPosition.solution_path) {
                    if (newPosition.solution_path != null) {
                        setSolutionPath(newPosition.solution_path);
                    }
                    console.log('New Solution Path Set: ' + newPosition.solution_path);
                }

                // console.log('New position:', newPosition);
                // console.log('endSSE:', endSSE);
            };

            eventSourceRef.current.onclose = function () {

                setPosition(null);
                setEpsilonChange(null);
                setQTable(null);
                setEpisode(null);
                setSolutionPath(null);
                setLoading(false);
            };

            eventSourceRef.current.onerror = function (error) {
                console.error("SSE Error:", error);
                eventSourceRef.current.close();
            };
        };

        if (selectedAlgo === 'q-learn') {
            createEventSource('http://localhost:8000/sse/');
        } else if (selectedAlgo === 'sarsa') {
            createEventSource('http://localhost:8000/sarsa_sse/');
            console.log('sarsa sse');
        }

        if (endSSE) {
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
            }
        }

        return () => {
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
                sse_counter.current = 0;
            }
        };
    }, [endSSE, selectedAlgo, setPosition]);
};

export default useEventSource;




