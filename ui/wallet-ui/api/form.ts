const ethers = require('ethers');
const { parseUnits } = require('ethers/lib/utils');
import { CreateMatchType } from './types';

const chessWagerABI = require('../../../contract-abi/ChessWagerABI');
const moveVerificationABI = require('../../../contract-abi/MoveVerificationABI.json');

import alertWarningFeedback from '#/ui/alertWarningFeedback';
import alertSuccessFeedback from '#/ui/alertSuccessFeedback';

import detectEthereumProvider from '@metamask/detect-provider';

interface ContractAddress {
  network: string;
  chainID: number;
  owner: string;
  token: string;
  chessToken: string;
  moveVerification: string;
  chess: string;
}

interface Card {
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

const data: ContractAddress = require('./contractAddresses.json');
const jsonString = JSON.stringify(data); // Convert the object to JSON string
const addresses = JSON.parse(jsonString); // Parse the JSON string

let ChessAddress = addresses[0].chess;
let VerificationAddress = addresses[0].moveVerification;
let tokenAddress = addresses[0].token;

const ERC20ABI = [
  'function transferFrom(address from, address to, uint value)',
  'function transfer(address to, uint value)',
  'function approve(address account, uint amount) returns (bool)',
  'function allowance(address _owner, address _spender) public view returns (uint256 remaining)',
  'function balanceOf(address owner) view returns (uint balance)',
  'event Transfer(address indexed from, address indexed to, address value)',
  'error InsufficientBalance(account owner, uint balance)',
];

const updateContractAddresses = async (): Promise<void> => {
  let { provider } = await setupProvider();

  // const provider = new ethers.providers.Web3Provider(window.ethereum);
  const network = await provider.getNetwork();
  const chainId = network.chainId;

  /*   console.log('Chain ID');
  console.log(chainId); */

  const data: ContractAddress[] = require('./contractAddresses.json');
  const addresses: ContractAddress[] = JSON.parse(JSON.stringify(data));

  // Find the matching chain ID in the array of objects
  const matchingChain = addresses.find(
    (address) => address.chainID === chainId,
  );

  if (matchingChain) {
    const { chess, moveVerification, token } = matchingChain;

    // Update the addresses based on the matching chain ID
    ChessAddress = chess;
    VerificationAddress = moveVerification;
    tokenAddress = token;

    // console.log(ChessAddress, VerificationAddress, tokenAddress);
  }
  // Add more chains if needed.
};

const setupProvider = async () => {
  let provider, signer, accounts, isWalletConnected;
  const detectedProvider = await detectEthereumProvider();

  if (detectedProvider && detectedProvider.isMetaMask) {
    try {
      window.ethereum = detectedProvider;
      provider = new ethers.providers.Web3Provider(window.ethereum);
      signer = provider.getSigner();
      accounts = await provider.listAccounts();
      await provider.send('eth_requestAccounts', []);
      console.log('Web3 provider is set');
      isWalletConnected = true;
    } catch (error) {
      console.error('User rejected the connection request.', error);
      provider = null; // reset provider to null
      signer = null;
      accounts = null;
      isWalletConnected = false;
    }
  }

  // If provider is not set (either window.ethereum is not available or user rejected the connection)
  // then use the custom JSON-RPC provider
  if (!provider) {
    const customRpcUrl = 'https://rpc.ankr.com/polygon_mumbai';
    provider = new ethers.providers.JsonRpcProvider(customRpcUrl);
    signer = provider;
    accounts = undefined;
    isWalletConnected = false;
    console.log('JSON-RPC provider is set - Form.ts');
  }

  return { provider, signer, accounts, isWalletConnected };
};

export const getBalance = async (address: string) => {
  await updateContractAddresses();

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();

  const token = new ethers.Contract(tokenAddress, ERC20ABI, signer);

  try {
    const value = await token.balanceOf(address);
    const balance = ethers.utils.formatEther(value);

    return {
      value: balance,
      success: true,
      status: '✅ Check out your transaction on Etherscan',
    };
  } catch (error) {
    return {
      success: false,
      // @ts-ignore
      status: '😥 Something went wrong: ' + error.message,
    };
  }
};

export const Approve = async (tokenAddress: string, amount: number) => {
  await updateContractAddresses();

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const accounts = await provider.send('eth_requestAccounts', []);

  const token = new ethers.Contract(tokenAddress, ERC20ABI, signer);

  try {
    // @dev amount.toSting() was a nightmare bug to find...
    const value = await token.approve(ChessAddress, amount.toString());
    const allowance = await token.allowance(accounts[0], ChessAddress);

    alert('success' + allowance);

    return {
      value: value,
      success: true,
      status: '✅ Check out your transaction on Etherscan',
    };
  } catch (error) {
    return {
      success: false,
      // @ts-ignore
      status: '😥 Something went wrong: ' + error.message,
    };
  }
};

export const AcceptWagerAndApprove = async (wagerAddress: string) => {
  await updateContractAddresses();

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const accounts = await provider.send('eth_requestAccounts', []);

  const chess = new ethers.Contract(ChessAddress, chessWagerABI, signer);

  try {
    const wagerParams = await chess.gameWagers(wagerAddress);

    const card: Card = {
      matchAddress: wagerAddress,
      player0Address: wagerParams[0],
      player1Address: wagerParams[1],
      wagerToken: wagerParams[2],
      wagerAmount: parseInt(wagerParams[3]),
      numberOfGames: parseInt(wagerParams[4]),
      isInProgress: wagerParams[5],
      timeLimit: parseInt(wagerParams[6]),
      timeLastMove: parseInt(wagerParams[7]),
      timePlayer0: parseInt(wagerParams[8]),
      timePlayer1: parseInt(wagerParams[9]),
      isPlayerTurn: false,
    };

    const token = new ethers.Contract(card.wagerToken, ERC20ABI, signer);

    const value = await token.approve(ChessAddress, wagerParams[3].toString());
    const allowance = await token.allowance(accounts[0], ChessAddress);

    // alert('success' + allowance);

    return {
      value: value,
      success: true,
      status: '✅ Check out your transaction on Etherscan',
    };
  } catch (error) {
    return {
      success: false,
      // @ts-ignore
      status: '😥 Something went wrong: ' + error.message,
    };
  }
};

export const CheckValidMove = async (moves: string[]) => {
  await updateContractAddresses();

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();

  const chess = new ethers.Contract(ChessAddress, chessWagerABI, signer);
  const verifier = new ethers.Contract(
    VerificationAddress,
    moveVerificationABI,
    signer,
  );

  try {
    let hexMoves = [];
    for (let i = 0; i < moves.length; i++) {
      hexMoves[i] = await chess.moveToHex(moves[i]);
    }

    const tx = await verifier.checkGameFromStart(hexMoves);

    return {
      value: tx,
      success: true,
      status: '✅ Check out your transaction on Etherscan',
    };
  } catch (error) {
    return {
      success: false,
      // @ts-ignore
      status: '😥 Something went wrong: ' + error.message,
    };
  }
};

export const CreateWager = async (form: CreateMatchType) => {
  await updateContractAddresses();

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const accounts = await provider.send('eth_requestAccounts', []);

  const chess = new ethers.Contract(ChessAddress, chessWagerABI, signer);
  try {
    const player1 = form.player1.toString();
    const wagerToken = form.wagerToken.toString();
    let wager = ethers.utils.parseEther(form.wagerAmount.toString());
    let maxTimePerMove = Number(form.timePerMove);
    let numberOfGames = Number(form.numberOfGames);

    const tx = await chess.createGameWager(
      player1,
      wagerToken,
      wager,
      maxTimePerMove,
      numberOfGames,
    );
    const receipt = await tx.wait();

    const wagers = await chess.getAllUserGames(accounts[0]);
    const wagerAddress = wagers[wagers.length - 1];

    alertSuccessFeedback('Wager Created: ' + wagerAddress);

    return {
      value: tx,
      success: true,
      status: '✅ Check out your transaction on Etherscan',
    };
  } catch (error) {
    return {
      success: false,
      // @ts-ignore
      status: '😥 Something went wrong: ' + error.message,
    };
  }
};

export const GetAllWagers = async (): Promise<Card[]> => {
  await updateContractAddresses();

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const accounts = await provider.send('eth_requestAccounts', []);

  const chess = new ethers.Contract(ChessAddress, chessWagerABI, signer);
  try {
    const wagers = await chess.getAllUserGames(accounts[0]);

    console.log('GetAllWagers');

    const allWagerParams = [];
    for (let i = 0; i < wagers.length; i++) {
      const wagerParams = await chess.gameWagers(wagers[i]);

      let isPlayerTurn;
      const playerToMove = await chess.getPlayerMove(wagers[i]);
      if (Number(accounts[0]) == Number(playerToMove)) {
        isPlayerTurn = true;
      } else {
        isPlayerTurn = false;
      }

      const card: Card = {
        matchAddress: wagers[i],
        player0Address: wagerParams[0],
        player1Address: wagerParams[1],
        wagerToken: wagerParams[2],
        wagerAmount: parseInt(wagerParams[3]),
        numberOfGames: parseInt(wagerParams[4]),
        isInProgress: wagerParams[5],
        timeLimit: parseInt(wagerParams[6]),
        timeLastMove: parseInt(wagerParams[7]),
        timePlayer0: parseInt(wagerParams[8]),
        timePlayer1: parseInt(wagerParams[9]),
        isPlayerTurn: isPlayerTurn,
      };

      allWagerParams.push(card);
    }

    return allWagerParams;
  } catch (error) {
    console.log(error);

    const card = {} as Card;
    return [card];
  }
};

export const GetAllWagersForPairing = async () => {
  await updateContractAddresses();

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const accounts = await provider.send('eth_requestAccounts', []);

  const chess = new ethers.Contract(ChessAddress, chessWagerABI, signer);
  try {
    // const totalWagerCount = Number(await chess.getAllWagersCount());

    const wagers = await chess.getAllWagerAddresses();

    const pairingRoomWagers = [];

    for (let i = 0; i < wagers.length; i++) {
      const wagerParams = await chess.gameWagers(wagers[i]);

      if (
        wagerParams.player1 === '0x0000000000000000000000000000000000000000'
      ) {
        const wagerParams = await chess.gameWagers(wagers[i]);

        const card: Card = {
          matchAddress: wagers[i],
          player0Address: wagerParams[0],
          player1Address: wagerParams[1],
          wagerToken: wagerParams[2],
          wagerAmount: parseInt(wagerParams[3]),
          numberOfGames: parseInt(wagerParams[4]),
          isInProgress: wagerParams[5],
          timeLimit: parseInt(wagerParams[6]),
          timeLastMove: parseInt(wagerParams[7]),
          timePlayer0: parseInt(wagerParams[8]),
          timePlayer1: parseInt(wagerParams[9]),
          isPlayerTurn: false,
        };

        pairingRoomWagers.push(card);
      }
    }

    console.log('Pairing room wagers');

    return pairingRoomWagers;
  } catch (error) {
    console.log(error);
    return [];
  }
};

const squareToCoordinate = [
  'a1',
  'b1',
  'c1',
  'd1',
  'e1',
  'f1',
  'g1',
  'h1',
  'a2',
  'b2',
  'c2',
  'd2',
  'e2',
  'f2',
  'g2',
  'h2',
  'a3',
  'b3',
  'c3',
  'd3',
  'e3',
  'f3',
  'g3',
  'h3',
  'a4',
  'b4',
  'c4',
  'd4',
  'e4',
  'f4',
  'g4',
  'h4',
  'a5',
  'b5',
  'c5',
  'd5',
  'e5',
  'f5',
  'g5',
  'h5',
  'a6',
  'b6',
  'c6',
  'd6',
  'e6',
  'f6',
  'g6',
  'h6',
  'a7',
  'b7',
  'c7',
  'd7',
  'e7',
  'f7',
  'g7',
  'h7',
  'a8',
  'b8',
  'c8',
  'd8',
  'e8',
  'f8',
  'g8',
  'h8',
];

function hexToMove(hexMove: number): string {
  const fromPos: number = hexMove >> 6;
  const toPos: number = hexMove & 0x3f;

  const fromCoord: string = squareToCoordinate[fromPos];
  const toCoord: string = squareToCoordinate[toPos];

  return fromCoord + toCoord;
}

export const GetGameMoves = async (
  wagerAddress: string,
  gameID: number,
): Promise<string[]> => {
  let { provider } = await setupProvider();
  await updateContractAddresses();

  const chess = new ethers.Contract(ChessAddress, chessWagerABI, provider);

  try {
    // const gameID = 0;
    // alert(gameID)

    const data = await chess.getGameMoves(wagerAddress, gameID);
    const hexMoves = data.moves;

    const algebraeicMoves = [];
    for (let i = 0; i < hexMoves.length; i++) {
      const algebraeicMove = hexToMove(hexMoves[i]);
      /*       
      const algebraeicMoveSC = await chess.hexToMove(hexMoves[i]);
      if (algebraeicMoveSC != algebraeicMove) {
          console.log("SC:", algebraeicMoveSC);
          console.log("TS:", algebraeicMove);
        }
      */
      algebraeicMoves.push(algebraeicMove);
    }

    return algebraeicMoves;
  } catch (error) {
    // alert(`Get game moves: ${wagerAddress} not found`);
    console.log(error);
    return [];
  }
};

interface WagerStatus {
  isPlayerWhite: boolean;
  winsPlayer0: number;
  winsPlayer1: number;
}

export const GetWagerStatus = async (
  wagerAddress: string,
): Promise<[number, number]> => {
  let { provider } = await setupProvider();
  await updateContractAddresses();

  const chess = new ethers.Contract(ChessAddress, chessWagerABI, provider);

  try {
    console.log('GET WAGER STATUS !!!!!!');
    const wagerStatusData = await chess.wagerStatus(wagerAddress);

    const wagerStatus: WagerStatus = {
      isPlayerWhite: wagerStatusData[0],
      winsPlayer0: wagerStatusData[1],
      winsPlayer1: wagerStatusData[2],
    };

    return [Number(wagerStatus.winsPlayer0), Number(wagerStatus.winsPlayer1)];
  } catch (error) {
    // alert(`Get game moves: ${wagerAddress} not found`);
    console.log(error);
    return [0, 0];
  }
};

interface WagerPlayerAddresses {
  player0Address: string;
  player1Address: string;
}

export const GetWagerPlayers = async (
  wagerAddress: string,
): Promise<[string, string]> => {
  let { provider } = await setupProvider();
  await updateContractAddresses();

  const chess = new ethers.Contract(ChessAddress, chessWagerABI, provider);

  try {
    console.log('GET WAGER PLAYER ADDRESS !!!!!!');
    const wagerPlayerData = await chess.gameWagers(wagerAddress);

    const wagerStatus: WagerPlayerAddresses = {
      player0Address: wagerPlayerData[0],
      player1Address: wagerPlayerData[1],
    };

    return [
      String(wagerStatus.player0Address),
      String(wagerStatus.player1Address),
    ];
  } catch (error) {
    // alert(`Get game moves: ${wagerAddress} not found`);
    console.log(error);
    return ['player not found', 'player not found'];
  }
};

export const GetTimeRemaining = async (wagerAddress: string) => {
  let { provider } = await setupProvider();
  await updateContractAddresses();

  const chess = new ethers.Contract(ChessAddress, chessWagerABI, provider);

  try {
    console.log('TIME REMAINING');
    const timeRemaining = await chess.checkTimeRemaining(wagerAddress);

    const playerToMove = await chess.getPlayerMove(wagerAddress);
    const wagerData = await chess.gameWagers(wagerAddress);

    const player0 = wagerData.player0;

    let isPlayer0Move;
    if (playerToMove == player0) {
      isPlayer0Move = true;
    } else {
      isPlayer0Move = false;
    }

    return [Number(timeRemaining[0]), Number(timeRemaining[1]), isPlayer0Move];
  } catch (error) {
    // alert(`Get game moves: ${wagerAddress} not found`);
    console.log(error);
  }
};

export const AcceptWagerConditions = async (wagerAddress: string) => {
  await updateContractAddresses();

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const accounts = await provider.send('eth_requestAccounts', []);

  const chess = new ethers.Contract(ChessAddress, chessWagerABI, signer);
  try {
    console.log('Accept wager conditions');
    console.log(wagerAddress);

    const tx = await chess.acceptWager(wagerAddress);
    await tx.wait();

    return true;
  } catch (error) {
    alert(`wager address: ${wagerAddress} not found`);
    console.log(error);
  }
};

export const GetAnalyticsData = async (): Promise<[string[], string]> => {
  let { provider } = await setupProvider();

  const chess = new ethers.Contract(ChessAddress, chessWagerABI, provider);

  try {
    let wagerAddresses = [];
    let value = 0;
    let errorOccurred = false;
    while (!errorOccurred) {
      try {
        const wagerAddress = await chess.allWagers(value.toString());
        wagerAddresses.push(wagerAddress);
        value++;
      } catch (error) {
        errorOccurred = true;
      }
    }

    const allWagerParams = [];
    for (let i = 0; i < wagerAddresses.length; i++) {
      const wagerParams = await chess.gameWagers(wagerAddresses[i]);
      const card: Card = {
        matchAddress: wagerAddresses[i],
        player0Address: wagerParams[0],
        player1Address: wagerParams[1],
        wagerToken: wagerParams[2],
        wagerAmount: parseInt(wagerParams[3]),
        numberOfGames: parseInt(wagerParams[4]),
        isInProgress: wagerParams[5],
        timeLimit: parseInt(wagerParams[6]),
        timeLastMove: parseInt(wagerParams[7]),
        timePlayer0: parseInt(wagerParams[8]),
        timePlayer1: parseInt(wagerParams[9]),
        isPlayerTurn: false,
      };
      allWagerParams.push(card);
    }

    let totalNumberOfGames = 0;
    for (let i = 0; i < allWagerParams.length; i++) {
      totalNumberOfGames += allWagerParams[i].numberOfGames;
    }

    return [wagerAddresses, totalNumberOfGames.toString()];
  } catch (error) {
    alert(`Analytics function : error`);
    console.log(error);
    return [[], ''];
  }
};

export const GetWagerData = async (wagerAddress: string): Promise<Card> => {
  let { provider } = await setupProvider();
  const chess = new ethers.Contract(ChessAddress, chessWagerABI, provider);

  try {
    const wagerParams = await chess.gameWagers(wagerAddress);

    console.log('WAGER PARAMS');

    const card: Card = {
      matchAddress: wagerAddress,
      player0Address: wagerParams[0],
      player1Address: wagerParams[1],
      wagerToken: wagerParams[2],
      wagerAmount: parseInt(wagerParams[3]),
      numberOfGames: parseInt(wagerParams[4]),
      isInProgress: wagerParams[5],
      timeLimit: parseInt(wagerParams[6]),
      timeLastMove: parseInt(wagerParams[7]),
      timePlayer0: parseInt(wagerParams[8]),
      timePlayer1: parseInt(wagerParams[9]),
      isPlayerTurn: false,
    };

    return card;
  } catch (error) {
    // alert(`Error fetching wager data: ${error}`);
    console.log(error);

    alertWarningFeedback('Wager address not found');

    const card = {} as Card;
    return card;

    // throw error; // Throw the error so that the caller can handle it
  }
};

export const PlayMove = async (
  wagerAddress: string,
  move: string,
): Promise<Boolean> => {
  await updateContractAddresses();

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const accounts = await provider.send('eth_requestAccounts', []);

  const chess = new ethers.Contract(ChessAddress, chessWagerABI, signer);
  try {
    const hex_move = await chess.moveToHex(move);

    const tx = await chess.playMove(wagerAddress, hex_move);
    await tx.wait();

    return true;
  } catch (error) {
    // alert(`wager address: ${wagerAddress} not found`);
    console.log(`playMove: invalid address ${wagerAddress}`);

    console.log(error);
    return false;
  }
};

export const PayoutWager = async (wagerAddress: string) => {
  await updateContractAddresses();

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const accounts = await provider.send('eth_requestAccounts', []);

  const chess = new ethers.Contract(ChessAddress, chessWagerABI, signer);
  try {
    await chess.payoutWager(wagerAddress);

    return true;
  } catch (error) {
    alert(`wager address: ${wagerAddress} not found`);
    console.log(error);
  }
};

export const CancelWager = async (wagerAddress: string) => {
  await updateContractAddresses();

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const accounts = await provider.send('eth_requestAccounts', []);

  const chess = new ethers.Contract(ChessAddress, chessWagerABI, signer);
  try {
    await chess.cancelWager(wagerAddress);

    return true;
  } catch (error) {
    alert(`wager address: ${wagerAddress} not found`);
    console.log(error);
  }
};

export const IsPlayerWhite = async (wagerAddress: string): Promise<boolean> => {
  let { signer, accounts, isWalletConnected } = await setupProvider();

  await updateContractAddresses();

  if (isWalletConnected) {
    const chess = new ethers.Contract(ChessAddress, chessWagerABI, signer);
    try {
      console.log('In Is Player White');
      console.log(wagerAddress);

      const isPlayerWhite = await chess.isPlayerWhite(
        wagerAddress,
        accounts[0],
      );

      return isPlayerWhite;
    } catch (error) {
      // alert(`wager address: ${wagerAddress} not found`);
      console.log(`isPlayerWhite invalid address ${wagerAddress}`);
      console.log(error);

      alertWarningFeedback('Wager address not found');
      return false;
    }
  } else {
    return false;
  }
};

export const IsPlayerAddressWhite = async (
  wagerAddress: string,
  playerAddress: string,
): Promise<boolean> => {
  let { signer } = await setupProvider();

  await updateContractAddresses();

  const chess = new ethers.Contract(ChessAddress, chessWagerABI, signer);
  try {
    console.log('In Is Player White');
    console.log(wagerAddress);

    const isPlayerWhite = await chess.isPlayerWhite(
      wagerAddress,
      playerAddress,
    );

    return isPlayerWhite;
  } catch (error) {
    // alert(`wager address: ${wagerAddress} not found`);
    console.log(
      `isPlayerAddressWhite function: invalid address ${wagerAddress}`,
    );
    console.log(error);
    return false;
  }
};

export const GetPlayerTurn = async (wagerAddress: string): Promise<boolean> => {
  let { signer, accounts, isWalletConnected } = await setupProvider();

  await updateContractAddresses();

  const chess = new ethers.Contract(ChessAddress, chessWagerABI, signer);

  if (isWalletConnected) {
    try {
      console.log('In Get Player Turn');
      console.log(wagerAddress);

      const playerTurn = await chess.getPlayerMove(wagerAddress);

      let isPlayerTurn;
      if (Number(playerTurn) == Number(accounts[0])) {
        isPlayerTurn = true;
      } else {
        isPlayerTurn = false;
      }

      return isPlayerTurn;
    } catch (error) {
      // alert(`In playerturn : ${wagerAddress} not found`);
      console.log(`in player turn function: invalid address ${wagerAddress}`);
      console.log(error);
      return false;
    }
  } else {
    return false;
  }
};

export const GetNumberOfGames = async (
  wagerAddress: string,
): Promise<number[]> => {
  let { signer } = await setupProvider();

  await updateContractAddresses();

  const chess = new ethers.Contract(ChessAddress, chessWagerABI, signer);
  try {
    const wagerParams = await chess.gameWagers(wagerAddress);
    const numberOfGames = parseInt(wagerParams[4]);

    const gameNumber = await chess.getGameLength(wagerAddress);

    const data = [Number(gameNumber), Number(numberOfGames)];

    return data;
  } catch (error) {
    // alert(`In playerturn : ${wagerAddress} not found`);
    console.log(`getNumberOfGames function: invalid address ${wagerAddress}`);
    console.log(error);
    return [];
  }
};
