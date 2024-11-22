import React, { useState, useEffect, useRef } from 'react';

const RobustTimer = ({ endSSE, timerValue }) => {
    const [timeElapsed, setTimeElapsed] = useState(0);
    const startTimeRef = useRef(null);
    const accumulatedTimeRef = useRef(0);
    const pausedValueRef = useRef(null);

    useEffect(() => {
        let animationFrameId;

        const updateTimer = () => {
            if (!endSSE && !timerValue) {
                const currentTime = performance.now();
                const elapsed = startTimeRef.current
                    ? Math.floor(currentTime - startTimeRef.current) + accumulatedTimeRef.current
                    : 0;

                setTimeElapsed(elapsed);
                animationFrameId = requestAnimationFrame(updateTimer);
            }
        };


        if (timerValue && !pausedValueRef.current) {
            pausedValueRef.current = timeElapsed;
            if (startTimeRef.current) {
                accumulatedTimeRef.current += performance.now() - startTimeRef.current;
                startTimeRef.current = null;
            }
        }


        if (!timerValue && pausedValueRef.current !== null) {
            pausedValueRef.current = null;
            if (!endSSE) {
                startTimeRef.current = performance.now();
                updateTimer();
            }
        }


        if (!endSSE && !timerValue) {
            startTimeRef.current = performance.now();
            updateTimer();
        } else {
            if (startTimeRef.current) {
                accumulatedTimeRef.current += performance.now() - startTimeRef.current;
            }
        }


        if (endSSE && timeElapsed !== 0) {
            setTimeElapsed(0);
            startTimeRef.current = null;
            accumulatedTimeRef.current = 0;
            pausedValueRef.current = null;
        }

        return () => {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
        };
    }, [endSSE, timerValue]);

    const formatTime = (milliseconds) => {
        const mins = String(Math.floor((milliseconds % 3600000) / 60000)).padStart(2, '0');
        const secs = String(Math.floor((milliseconds % 60000) / 1000)).padStart(2, '0');
        const ms = String(Math.floor((milliseconds % 1000) / 10)).padStart(2, '0');
        return `${mins} : ${secs} : ${ms}`;
    };

    return (
        <span className="animated-timer">
            {formatTime(timerValue ? (pausedValueRef.current || timeElapsed) : timeElapsed)}
        </span>
    );
};

export default RobustTimer;