const ethers = require('ethers');

import { SubmitVerifyMoves, DownloadGaslessMoves } from './form';

export const signTxPushToDB = async (
  wagerAddress: string,
  move: string,
  hex_move: string,
  gameFEN: string,
  moveNumber: number,
  gameNumber: number,
  message: string,
  messageHash: string,
) => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const accounts = await provider.send('eth_requestAccounts', []);

  const network = await provider.getNetwork();
  const chainId = network.chainId;

  try {
    const signerAddress = accounts[0];
    const signedMessage = await signer.signMessage(
      ethers.utils.arrayify(messageHash),
    );

    const rawData = JSON.stringify({
      wagerAddress: wagerAddress,
      move: move,
      hex_move: hex_move,
      gameFEN: gameFEN,
      moveNumber: moveNumber,
      gameNumber: gameNumber,
      message: message,
      messageHash: messageHash,
      signedMessage: signedMessage,
      signerAddress: signerAddress,
    });

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
    const data: PlayerTurnData = await response.json();
    return data.playerTurn;
  } catch (error) {
    console.error('Error:', error);
    return '';
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