import { useState, useEffect, useRef, useCallback } from 'react';

export interface UseTimerOptions {
  initialTime?: number; // in seconds
  onComplete?: () => void;
  onTick?: (time: number) => void;
  autoStart?: boolean;
  countDown?: boolean;
}

export function useTimer({
  initialTime = 0,
  onComplete,
  onTick,
  autoStart = false,
  countDown = false
}: UseTimerOptions = {}) {
  const [time, setTime] = useState(initialTime);
  const [isActive, setIsActive] = useState(autoStart);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const pausedTimeRef = useRef<number>(0);

  const tick = useCallback(() => {
    const now = Date.now();
    if (startTimeRef.current) {
      const elapsed = Math.floor((now - startTimeRef.current - pausedTimeRef.current) / 1000);
      const newTime = countDown ? Math.max(0, initialTime - elapsed) : elapsed;
      
      setTime(newTime);
      
      if (onTick) {
        onTick(newTime);
      }
      
      // Check if timer should complete (for countdown)
      if (countDown && newTime <= 0) {
        setIsActive(false);
        setIsPaused(false);
        if (onComplete) {
          onComplete();
        }
      }
    }
  }, [initialTime, countDown, onTick, onComplete]);

  useEffect(() => {
    if (isActive && !isPaused) {
      intervalRef.current = setInterval(tick, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, isPaused, tick]);

  const start = useCallback(() => {
    if (!isActive) {
      startTimeRef.current = Date.now();
      pausedTimeRef.current = 0;
      setTime(countDown ? initialTime : 0);
    }
    setIsActive(true);
    setIsPaused(false);
  }, [isActive, countDown, initialTime]);

  const pause = useCallback(() => {
    if (isActive) {
      setIsPaused(true);
      if (startTimeRef.current) {
        const now = Date.now();
        const elapsed = now - startTimeRef.current - pausedTimeRef.current;
        pausedTimeRef.current += elapsed;
        startTimeRef.current = now;
      }
    }
  }, [isActive]);

  const resume = useCallback(() => {
    if (isActive && isPaused) {
      setIsPaused(false);
      startTimeRef.current = Date.now();
    }
  }, [isActive, isPaused]);

  const stop = useCallback(() => {
    setIsActive(false);
    setIsPaused(false);
    startTimeRef.current = null;
    pausedTimeRef.current = 0;
    setTime(countDown ? initialTime : 0);
  }, [countDown, initialTime]);

  const reset = useCallback(() => {
    setIsActive(false);
    setIsPaused(false);
    startTimeRef.current = null;
    pausedTimeRef.current = 0;
    setTime(countDown ? initialTime : 0);
  }, [countDown, initialTime]);

  // Format time for display
  const formatTime = useCallback((seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return {
    time,
    formattedTime: formatTime(time),
    isActive,
    isPaused,
    start,
    pause,
    resume,
    stop,
    reset,
    toggle: isActive ? (isPaused ? resume : pause) : start
  };
}
