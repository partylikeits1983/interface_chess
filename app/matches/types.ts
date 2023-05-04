export interface Card {
  matchAddress: string;
  opponentAddress: string;
  wagerToken: string;
  wagerAmount: number;
  timePerMove: number;
  numberOfGames: number;
  isPending: boolean;
}
