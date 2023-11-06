// useCheckValidMove.ts
import { useEffect } from 'react';

type CheckValidMoveFunction = (moves: string[]) => Promise<void>; // Replace MoveType with the actual type of your moves

const useCheckValidMove = (moves: string[], CheckValidMove: CheckValidMoveFunction): void => {
  useEffect(() => {
    const callMoveVerification = async () => {
      try {
        await CheckValidMove(moves);
      } catch (error) {
        console.error(error);
      }
    };
    callMoveVerification();
  }, [moves, CheckValidMove]);
};

export default useCheckValidMove;
