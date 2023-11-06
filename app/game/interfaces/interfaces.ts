export interface ICard {
  matchAddress: string;
  player0Address: string;
  player1Address: string;
  wagerToken: string;
  wagerAmount: number;
  numberOfGames: number;
  isInProgress: boolean;
  timeLimit: number;
  timeLastMove: number;
  timePlayer0: number;
  timePlayer1: number;
  isPlayerTurn: boolean;
}

export interface IBoardProps {
  wager: string;
}

export interface IMove {
  color: string;
  piece: string;
  from: string;
  to: string;
  san: string;
  flags: string;
  lan: string;
  before: string;
  after: string;
}

export interface IGameSocketData {
  moves: string[];
  gameFEN: string;
  player0: string;
  player1: string;
  timeLimit: number;
  actualTimeRemainingSC: number;
  timeRemainingPlayer0: number;
  timeRemainingPlayer1: number;
  isGasless: boolean;
}
