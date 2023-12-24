import { ethers, Signer } from 'ethers';
import { SubmitVerifyMoves, DownloadGaslessMoves } from './form';

import { domain, moveTypes } from './signatureConstants';

import { DelegationAndWallet } from './types';

export const signTxPushToDB = async (
  isDelegated: boolean,
  delegationAndWallet: DelegationAndWallet,
  gaslessGameAddress: string,
  messageData: any,
  message: string,
  move: string,
) => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);

  let signer: ethers.Wallet | ethers.providers.JsonRpcSigner;
  let signerAddress;

  if (isDelegated) {
    signer = ethers.Wallet.fromMnemonic(
      delegationAndWallet.delegatedWalletMnemonic,
    );
    signerAddress = signer.getAddress();
  } else {
    signer = provider.getSigner();
    signerAddress = signer.getAddress();
  }

  const network = await provider.getNetwork();
  const chainId = network.chainId;

  try {
    // Typed signature data
    domain.chainId = chainId;
    domain.verifyingContract = gaslessGameAddress;

    const signedMoveMessage = await signer._signTypedData(
      domain,
      moveTypes,
      messageData,
    );

    // do not send wallet to server
    const delegationData = {
      delegationSignature: delegationAndWallet.delegationSignature,
      signedDelegationData: delegationAndWallet.signedDelegationData,
    };

    const data = {
      isDelegated: isDelegated,
      delegationData: delegationData,
      move: move,
      messageData: messageData,
      message: message,
      signedMoveMessage: signedMoveMessage,
      signerAddress: signerAddress,
    };

    console.log('DATA', data);

    const rawData = JSON.stringify(data);

    // Include chainId in the request URL
    const response = await fetch(`https://api.chess.fish/move/${chainId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: rawData,
    });

    const responseBody = await response.json();
    if (response.ok) {
      return true;
    } else {
      console.error(responseBody.error);
      return false;
    }
  } catch (error) {
    console.log(error);
    return false;
  }
};

export const checkIfGasless = async (gameWager: string) => {
  try {
    const response = await fetch(
      `https://api.chess.fish/isGameGasless/${gameWager.toLowerCase()}`,
    );
    const data = await response.json();
    const { isGasless } = data;
    return isGasless;
  } catch (error) {
    console.error('Error:', error);
    throw new Error('Failed to check if game is gasless.');
  }
};

export const getGameFen = async (gameWager: string) => {
  try {
    const response = await fetch(
      `https://api.chess.fish/gameFen/${gameWager.toLowerCase()}`,
    );
    const data = await response.json();
    const { gameFEN } = data;
    return gameFEN;
  } catch (error) {
    console.error('Error:', error);
    // throw new Error('Failed to get game fen');
  }
};

interface ChessData {
  moves: string[][];
  messages: string[][];
  signedMessages: string[][];
}

export const submitMoves = async (gameWager: string): Promise<void> => {
  try {
    const response = await fetch(
      `https://api.chess.fish/signedMoves/${gameWager.toLowerCase()}`,
    );
    const data: ChessData = await response.json();

    // Function to remove 'ONCHAIN' elements from an array
    const removeOnchain = (arr: string[]): string[] =>
      arr.filter((item) => item !== 'ONCHAIN');

    if (data.moves && Array.isArray(data.moves)) {
      data.moves = data.moves.map((innerArray) => removeOnchain(innerArray));
    }

    /*
    // Processing 'messages'
    if (data.messages && Array.isArray(data.messages)) {
      data.messages = data.messages.map((innerArray) =>
        removeOnchain(innerArray),
      );
    }

    // Processing 'signedMessages'
     if (data.signedMessages && Array.isArray(data.signedMessages)) {
      data.signedMessages = data.signedMessages.map((innerArray) =>
        removeOnchain(innerArray),
      );
    } 
    */

    await SubmitVerifyMoves(data, gameWager);

    console.log(data);
  } catch (error) {
    console.error('Error:', error);
    throw new Error('Failed to submit signed moves');
  }
};

interface PlayerTurnData {
  playerTurn: string;
}

export const getPlayerTurnAPI = async (
  wagerAddress: string,
): Promise<string> => {
  try {
    const response = await fetch(
      `https://api.chess.fish/playerTurn/${wagerAddress.toLowerCase()}`,
    );

    if (response.status === 204) {
      return '';
    }

    const data: PlayerTurnData = await response.json();
    return data.playerTurn;
  } catch (error) {
    return ''; // Return an empty string in case of any error
  }
};

export const DownloadMoves = async (gameWager: string) => {
  try {
    const response = await fetch(
      `https://api.chess.fish/signedMoves/${gameWager.toLowerCase()}`,
    );
    const data: ChessData = await response.json();

    // Function to remove 'ONCHAIN' elements from an array
    const removeOnchain = (arr: string[]): string[] =>
      arr.filter((item) => item !== 'ONCHAIN');

    if (data.moves && Array.isArray(data.moves)) {
      data.moves = data.moves.map((innerArray) => removeOnchain(innerArray));
    }

    // Processing 'messages'
    if (data.messages && Array.isArray(data.messages)) {
      data.messages = data.messages.map((innerArray) =>
        removeOnchain(innerArray),
      );
    }

    // Processing 'signedMessages'
    if (data.signedMessages && Array.isArray(data.signedMessages)) {
      data.signedMessages = data.signedMessages.map((innerArray) =>
        removeOnchain(innerArray),
      );
    }

    return await DownloadGaslessMoves(data, gameWager);
  } catch (error) {
    console.error('Error:', error);
    throw new Error('Failed to download signed moves');
  }
};

export const GetGameNumberDB = async (gameWager: string): Promise<number> => {
  try {
    const response = await fetch(
      `https://api.chess.fish/signedMoves/${gameWager.toLowerCase()}`,
    );
    const data: ChessData = await response.json();

    // Function to remove 'ONCHAIN' elements from an array
    const removeOnchain = (arr: string[]): string[] =>
      arr.filter((item) => item !== 'ONCHAIN');

    if (data.moves && Array.isArray(data.moves)) {
      data.moves = data.moves.map((innerArray) => removeOnchain(innerArray));
    }

    return data.moves.length;
  } catch (error) {
    console.error('Error:', error);
    return 0;
  }
};
