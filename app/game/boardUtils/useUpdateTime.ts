// useUpdateTime.ts
import { useEffect } from 'react';

type SetTimeFunction = (updater: (prevTime: number) => number) => void;

const useUpdateTime = (
  isPlayer0Turn: boolean,
  setTimePlayer0: SetTimeFunction,
  setTimePlayer1: SetTimeFunction,
): void => {
  useEffect(() => {
    let timer: NodeJS.Timeout = setInterval(() => {
      if (isPlayer0Turn) {
        setTimePlayer0((prevTime) => prevTime - 1);
      } else {
        setTimePlayer1((prevTime) => prevTime - 1);
      }
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [isPlayer0Turn, setTimePlayer0, setTimePlayer1]);
};

export default useUpdateTime;
