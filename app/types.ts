export interface Card {
  matchAddress: string;
  player0Address: string;
  player1Address: string;
  wagerToken: string;
  wagerAmount: number;
  numberOfGames: number;
  hasPlayerAccepted: boolean;
  timeLimit: number;
  timeLastMove: number;
  timePlayer0: number;
  timePlayer1: number;
  isTournament: boolean;
  isTournamentInProgress: boolean;
  isPlayerTurn: boolean;
  isComplete: boolean;
  hasBeenPaid: boolean;
}
