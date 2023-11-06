// chessUtils.ts
import { IMove } from '../interfaces/interfaces';

export function moveExists(
  potentialMoves: IMove[],
  from: string,
  to: string,
): boolean {
  return potentialMoves.some((move) => move.from === from && move.to === to);
}

export function numberToString(num: number): string {
    return num.toLocaleString('fullwide', { useGrouping: false });
  }
