import { useEffect } from 'react';

type SetTimeFunction = (updater: (prevTime: number) => number) => void;

const useUpdateTime = (
  isWagerComplete: boolean,
  isPlayer0Turn: boolean,
  setTimePlayer0: SetTimeFunction,
  setTimePlayer1: SetTimeFunction,
): void => {
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (!isWagerComplete) {
      timer = setInterval(() => {
        if (isPlayer0Turn) {
          setTimePlayer0((prevTime) => Math.max(0, prevTime - 1));
        } else {
          setTimePlayer1((prevTime) => Math.max(0, prevTime - 1));
        }
      }, 1000);
    }

    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [isWagerComplete, isPlayer0Turn, setTimePlayer0, setTimePlayer1]);
};

export default useUpdateTime;
