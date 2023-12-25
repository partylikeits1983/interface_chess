import { ethers } from 'ethers';

export type CreateMatchType = {
  player1: string;
  wagerToken: string;
  wagerAmount: BigInt;
  timePerMove: number;
  numberOfGames: number;
}

export type DelegationAndWallet = {
  delegationMessage: Delegation;
  delegationSignature: string;
  encodedDelegationAndSig: string;
  delegatedWalletMnemonic: string;
};

export interface Delegation {
  delegatorAddress: string;
  delegatedAddress: string;
  wagerAddress: string;
}

export interface SignedDelegation {
  delegation: Delegation;
  signature: string; // Assuming signature is a hex string
}

export type GaslessMove = {
  wagerAddress: string; // Ethereum address as a hex string
  gameNumber: number;
  moveNumber: number;
  move: number; // Assuming uint16 can be represented as a regular number in JS
  expiration: number;
}

export type DelegationData = {
  delegationMessage: Delegation,
  delegationSignature: string;
  encodedDelegationAndSig: string;
}

export type GaslessMoveDataPOST = {
  isDelegated: boolean;
  delegationData: DelegationData;
  moveMessageData: GaslessMove;
  encodedMoveMessage: string;
  move: string;
  signedMoveMessage: string;
  signerAddress: string;
} 