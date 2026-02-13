import { useEffect, useRef } from 'react';


export const usePolling = (callback, interval, enabled = true) => {
  const savedCallback = useRef();
  const intervalId = useRef();

  
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  
  useEffect(() => {
    const tick = () => {
      if (savedCallback.current) {
        savedCallback.current();
      }
    };

    if (enabled && interval) {
      
      tick();
      
      
      intervalId.current = setInterval(tick, interval);
      
      return () => {
        if (intervalId.current) {
          clearInterval(intervalId.current);
        }
      };
    }
  }, [interval, enabled]);

  
  const stopPolling = () => {
    if (intervalId.current) {
      clearInterval(intervalId.current);
    }
  };

  return { stopPolling };
};

export default usePolling;