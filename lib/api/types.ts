import { ethers } from 'ethers';

export interface CreateMatchType {
  player1: string;
  wagerToken: string;
  wagerAmount: BigInt;
  timePerMove: number;
  numberOfGames: number;
}

export type DelegationAndWallet = {
  delegationSignature: string;
  signedDelegationData: string;
  delegatedWalletMnemonic: string;
};
