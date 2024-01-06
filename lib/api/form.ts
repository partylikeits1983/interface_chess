const ethers = require('ethers');
const { parseUnits } = require('ethers/lib/utils');
import { CreateMatchType } from './types';

const chessWagerABI = require('./contract-abi/ChessWagerABI').abi;
const moveVerificationABI = require('./contract-abi/MoveVerificationABI').abi;
const gaslessGameABI = require('./contract-abi/GaslessGameABI').abi;
const splitterABI = require('./contract-abi/SplitterABI').abi;
const crowdSaleABI = require('./contract-abi/CrowdSaleABI').abi;
const tournamentABI = require('./contract-abi/TournamentABI').abi;

import { signTxPushToDB } from './gaslessAPI';

import alertWarningFeedback from '#/ui/alertWarningFeedback';
import alertSuccessFeedback from '#/ui/alertSuccessFeedback';
import alertSuccessSubmitMoves from '#/ui/alertSuccessSubmitMoves';

import detectEthereumProvider from '@metamask/detect-provider';

import { submitMoves, getPlayerTurnAPI, checkIfGasless } from './gaslessAPI';

import { DelegationAndWallet, GaslessMove, DelegationData } from './types';
import { domain, moveTypes, delegationTypes } from './signatureConstants';
import {
  createDelegation,
  getDelegation,
  getOrAskForEncryptionKey,
  LOCAL_STORAGE_KEY_PREFIX,
  ENCRYPTION_KEY_STORAGE_KEY,
} from './delegatedWallet';

import { moveToHex } from './utils';

interface ContractAddress {
  network: string;
  chainID: number;
  owner: string;
  chessFishToken: string;
  dividendSplitter: string;
  moveVerification: string;
  gaslessGame: string;
  chessWager: string;
  crowdSale: string;
  tournament: string;
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
  isTournament: boolean;
  isPlayerTurn: boolean;
  isComplete: boolean;
}

interface TokenAddresses {
  network: string;
  chainID: number;
  NATIVE: string;
  WBTC: string;
  WETH: string;
  USDT: string;
  USDC: string;
  DAI: string;
}

const data: ContractAddress = require('./contractAddresses.json');
const jsonString = JSON.stringify(data); // Convert the object to JSON string
const addresses = JSON.parse(jsonString); // Parse the JSON string

let ChessAddress = addresses[0].chess;
let VerificationAddress = addresses[0].moveVerification;
let GaslessGameAddress = addresses[0].gaslessGame;
let ChessToken = addresses[0].chessFishToken;
let DividendSplitter = addresses[0].dividendSplitter;
let CrowdSale = addresses[0].crowdSale;
let Tournament = addresses[0].tournament;

const tokenData: TokenAddresses = require('./tokenAddresses.json');
const tokenjson = JSON.stringify(tokenData);
const tokenAddresses = JSON.parse(tokenjson);

let WBTC = tokenAddresses[0].WBTC;
let WETH = tokenAddresses[0].WETH;
let USDT = tokenAddresses[0].USDT;
let USDC = tokenAddresses[0].USDC;
let DAI = tokenAddresses[0].DAI;

const ERC20ABI = [
  'function transferFrom(address from, address to, uint value)',
  'function transfer(address to, uint value)',
  'function approve(address account, uint amount) returns (bool)',
  'function allowance(address _owner, address _spender) public view returns (uint256 remaining)',
  'function balanceOf(address owner) view returns (uint balance)',
  'function totalSupply() view returns (uint amount)',
  'function decimals() view returns (uint decimals)',
  'event Transfer(address indexed from, address indexed to, address value)',
  'error InsufficientBalance(account owner, uint balance)',
];

const updateContractAddresses = async (): Promise<void> => {
  let { provider, isWalletConnected } = await setupProvider();

  const network = await provider.getNetwork();
  const chainId = network.chainId;

  const contractData: ContractAddress[] = require('./contractAddresses.json');
  const addresses: ContractAddress[] = JSON.parse(JSON.stringify(contractData));

  const tokenData: TokenAddresses[] = require('./tokenAddresses.json');
  const tokenAddresses: TokenAddresses[] = JSON.parse(
    JSON.stringify(tokenData),
  );

  const matchingChain = addresses.find(
    (address) => address.chainID === chainId,
  );
  const matchingChainTokens = tokenAddresses.find(
    (token) => token.chainID === chainId,
  );

  if (matchingChain) {
    ChessAddress = matchingChain.chessWager;
    VerificationAddress = matchingChain.moveVerification;
    GaslessGameAddress = matchingChain.gaslessGame;
    ChessToken = matchingChain.chessFishToken;
    DividendSplitter = matchingChain.dividendSplitter;
    CrowdSale = matchingChain.crowdSale;
    Tournament = matchingChain.tournament;
  }

  if (matchingChainTokens) {
    WBTC = matchingChainTokens.WBTC;
    WETH = matchingChainTokens.WETH;
    USDT = matchingChainTokens.USDT;
    USDC = matchingChainTokens.USDC;
    DAI = matchingChainTokens.DAI;
  }
};

export const setupProvider = async () => {
  let provider, signer, accounts;
  let isWalletConnected = false;
  const detectedProvider = await detectEthereumProvider();

  if (detectedProvider && detectedProvider.isMetaMask) {
    try {
      window.ethereum = detectedProvider;
      provider = new ethers.providers.Web3Provider(window.ethereum);
      signer = provider.getSigner();
      accounts = await provider.listAccounts();
      await provider.send('eth_requestAccounts', []);
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
  if (!detectedProvider) {
    const customRpcUrl = 'https://sepolia-rollup.arbitrum.io/rpc';
    provider = new ethers.providers.JsonRpcProvider(customRpcUrl);
    signer = provider;
    accounts = undefined;
    isWalletConnected = false;
  }

  return { provider, signer, accounts, isWalletConnected };
};

export const getChainId = async () => {
  await updateContractAddresses();
  const provider = new ethers.providers.Web3Provider(window.ethereum);

  try {
    const network = await provider.getNetwork();
    const chainId = network.chainId;

    return chainId;
  } catch (error) {
    console.log(' chain id ERROR');
    console.log(error);
    return 0;
  }
};

export const getPlayerAddress = async () => {
  let accounts;
  const provider = new ethers.providers.Web3Provider(window.ethereum);

  try {
    accounts = await provider.listAccounts();
    await provider.send('eth_requestAccounts', []);
    return accounts[0];
  } catch (error) {
    console.log('could not get wallet address');
    console.log(error);
    return '';
  }
};

export const getBalance = async (address: string) => {
  await updateContractAddresses();

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();

  const token = new ethers.Contract(address, ERC20ABI, signer);

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

export const GetDividendBalances = async () => {
  await updateContractAddresses();

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();

  const wbtc = new ethers.Contract(WBTC, ERC20ABI, signer);
  const weth = new ethers.Contract(WETH, ERC20ABI, signer);
  const usdt = new ethers.Contract(USDT, ERC20ABI, signer);
  const usdc = new ethers.Contract(USDC, ERC20ABI, signer);
  const dai = new ethers.Contract(DAI, ERC20ABI, signer);

  console.log(DividendSplitter);

  try {
    let wbtc_bal = await wbtc.balanceOf(DividendSplitter);
    let weth_bal = await weth.balanceOf(DividendSplitter);
    let usdt_bal = await usdt.balanceOf(DividendSplitter);
    let usdc_bal = await usdc.balanceOf(DividendSplitter);
    let dai_bal = await dai.balanceOf(DividendSplitter);

    wbtc_bal = ethers.utils.formatEther(wbtc_bal);
    weth_bal = ethers.utils.formatEther(weth_bal);
    usdt_bal = ethers.utils.formatUnits(usdt_bal, 6);
    usdc_bal = ethers.utils.formatUnits(usdc_bal, 6);
    dai_bal = ethers.utils.formatEther(dai_bal);

    return [dai_bal, usdc_bal, usdt_bal, wbtc_bal, weth_bal];
  } catch (error) {
    return [0, 0, 0, 0, 0];
  }
};

export const ApproveChessWagerContract = async (
  tokenAddress: string,
  amount: number,
) => {
  await updateContractAddresses();
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const accounts = await provider.send('eth_requestAccounts', []);

  const token = new ethers.Contract(tokenAddress, ERC20ABI, signer);
  try {
    const decimals = await token.decimals();
    const amountAdjusted = ethers.utils.parseUnits(amount, decimals);

    const value = await token.approve(ChessAddress, amountAdjusted);
    const allowance = await token.allowance(accounts[0], ChessAddress);

    const readableAmount = ethers.utils.formatUnits(allowance, decimals);

    alertSuccessFeedback('Success! Allowance set');

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

export const ApproveTournamnetContract = async (
  tokenAddress: string,
  amount: number,
) => {
  await updateContractAddresses();
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const accounts = await provider.send('eth_requestAccounts', []);

  const token = new ethers.Contract(tokenAddress, ERC20ABI, signer);
  try {
    const decimals = await token.decimals();
    const amountAdjusted = ethers.utils.parseUnits(amount, decimals);

    const value = await token.approve(Tournament, amountAdjusted);
    const allowance = await token.allowance(accounts[0], ChessAddress);

    const readableAmount = ethers.utils.formatUnits(allowance, decimals);

    alertSuccessFeedback('Success! allowance set: ' + readableAmount);

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

    const data: Card = {
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
      isTournament: Boolean(wagerParams.isTournament),
      isPlayerTurn: false,
      isComplete: Boolean(wagerParams.isComplete),
    };

    const token = new ethers.Contract(data.wagerToken, ERC20ABI, signer);

    if (data.wagerAmount > 0) {
      const value = await token.approve(
        ChessAddress,
        data.wagerAmount.toString(),
      );
      await value.wait();
    }

    return {
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

  const token = new ethers.Contract(
    form.wagerToken.toString(),
    ERC20ABI,
    signer,
  );
  const decimals = await token.decimals();

  try {
    const player1 = form.player1.toString();
    const wagerToken = form.wagerToken.toString();
    let wager = ethers.utils.parseUnits(form.wagerAmount.toString(), decimals);
    let maxTimePerMove = Number(form.timePerMove);
    let numberOfGames = Number(form.numberOfGames);

    const tx = await chess.createGameWager(
      player1,
      wagerToken,
      wager,
      maxTimePerMove,
      numberOfGames,
    );
    await tx.wait();

    const wagers = await chess.getAllUserGames(accounts[0]);
    const wagerAddress = wagers[wagers.length - 1];

    alertSuccessFeedback('Wager Created: ' + wagerAddress);

    return {
      value: tx,
      success: true,
      status: '✅ Check out your transaction on Etherscan',
    };
  } catch (error) {
    console.log(form.wagerToken);
    alertWarningFeedback('Approve Tokens First');

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

    const allWagerParams = [];
    for (let i = 0; i < wagers.length; i++) {
      const wagerParams = await chess.gameWagers(wagers[i]);

      let isPlayerTurn = await GetPlayerTurn(wagers[i]);

      const token = new ethers.Contract(wagerParams[2], ERC20ABI, signer);
      const decimals = await token.decimals();

      const card: Card = {
        matchAddress: wagers[i],
        player0Address: wagerParams[0],
        player1Address: wagerParams[1],
        wagerToken: wagerParams[2],
        wagerAmount: ethers.utils.formatUnits(wagerParams[3], decimals),
        numberOfGames: parseInt(wagerParams[4]),
        isInProgress: wagerParams[5],
        timeLimit: parseInt(wagerParams[6]),
        timeLastMove: parseInt(wagerParams[7]),
        timePlayer0: parseInt(wagerParams[8]),
        timePlayer1: parseInt(wagerParams[9]),
        isPlayerTurn: isPlayerTurn,
        isTournament: Boolean(wagerParams[10]),
        isComplete: Boolean(wagerParams.isComplete),
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
          isTournament: Boolean(wagerParams.isTournament),
          isComplete: Boolean(wagerParams.isComplete),
        };

        pairingRoomWagers.push(card);
      }
    }

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
  await updateContractAddresses();

  const provider = new ethers.providers.Web3Provider(window.ethereum);

  const chess = new ethers.Contract(ChessAddress, chessWagerABI, provider);

  try {
    console.log('GET GAME MOVES');
    const data = await chess.getGameMoves(wagerAddress, gameID);
    const hexMoves = data.moves;

    const algebraeicMoves = [];
    for (let i = 0; i < hexMoves.length; i++) {
      const algebraeicMove = hexToMove(hexMoves[i]);

      algebraeicMoves.push(algebraeicMove);
    }

    return algebraeicMoves;
  } catch (error) {
    // alert(`Get game moves: ${wagerAddress} not found`);
    console.log('GetGameMoves error', error);
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
  await updateContractAddresses();
  const provider = new ethers.providers.Web3Provider(window.ethereum);

  const chess = new ethers.Contract(ChessAddress, chessWagerABI, provider);

  try {
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

export const GetIsWagerComplete = async (
  wagerAddress: string,
): Promise<boolean> => {
  await updateContractAddresses();
  const provider = new ethers.providers.Web3Provider(window.ethereum);

  const chess = new ethers.Contract(ChessAddress, chessWagerABI, provider);

  try {
    const wagerData = await chess.gameWagers(wagerAddress);

    if (wagerData.isComplete) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.log(wagerAddress)
    console.log(error);
    return false;
  }
};

interface WagerPlayerAddresses {
  player0Address: string;
  player1Address: string;
}

export const GetWagerPlayers = async (
  wagerAddress: string,
): Promise<[string, string]> => {
  await updateContractAddresses();
  const provider = new ethers.providers.Web3Provider(window.ethereum);

  const chess = new ethers.Contract(ChessAddress, chessWagerABI, provider);

  try {
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
  await updateContractAddresses();
  const provider = new ethers.providers.Web3Provider(window.ethereum);

  const chess = new ethers.Contract(ChessAddress, chessWagerABI, provider);

  try {
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

export const IsWagerGameTimeEnded = async (wagerAddress: string) => {
  await updateContractAddresses();
  const provider = new ethers.providers.Web3Provider(window.ethereum);

  const chess = new ethers.Contract(ChessAddress, chessWagerABI, provider);

  try {
    const timeRemaining = await chess.checkTimeRemaining(wagerAddress);

    let isWagerTimeEnded = false;
    if (Number(timeRemaining[0]) || Number(timeRemaining[1]) < 0) {
      isWagerTimeEnded = true;
    }

    return isWagerTimeEnded;
  } catch (error) {
    console.log(error);
  }
};

export const UpdateWagerStateTime = async (wagerAddress: string) => {
  await updateContractAddresses();

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const chess = new ethers.Contract(ChessAddress, chessWagerABI, signer);

  try {
    await chess.updateWagerStateTime(wagerAddress);

    alertSuccessFeedback('Update wager state time success!');

    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

export const AcceptWagerConditions = async (wagerAddress: string) => {
  await updateContractAddresses();

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const chess = new ethers.Contract(ChessAddress, chessWagerABI, signer);
  try {
    const tx = await chess.acceptWager(wagerAddress);
    await tx.wait();

    // alertSuccessFeedback('Wager Conditions Accepted!');

    return true;
  } catch (error) {
    // alert(`wager address: ${wagerAddress} not found`);
    alertWarningFeedback(
      `Accept Wager Conditions pending... Wait until token approve tx success`,
    );
    console.log(error);
  }
};

export const GetAnalyticsData = async (): Promise<[string[], string]> => {
  await updateContractAddresses();

  const provider = new ethers.providers.Web3Provider(window.ethereum);

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
        isTournament: Boolean(wagerParams.isTournament),
        isComplete: Boolean(wagerParams.isComplete),
      };
      allWagerParams.push(card);
    }

    let games = 0;
    for (let i = 0; i < allWagerParams.length; i++) {
      const winsData = await chess.wagerStatus(wagerAddresses[i]);
      games += Number(winsData.winsPlayer0);
      games += Number(winsData.winsPlayer1);
    }

    return [wagerAddresses, games.toString()];
  } catch (error) {
    console.log(error);
    return [[], '0'];
  }
};

export const GetWagerData = async (wagerAddress: string): Promise<Card> => {
  await updateContractAddresses();
  const provider = new ethers.providers.Web3Provider(window.ethereum);

  const chess = new ethers.Contract(ChessAddress, chessWagerABI, provider);

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
      isTournament: Boolean(wagerParams.isTournament),
      isPlayerTurn: false,
      isComplete: Boolean(wagerParams.isComplete),
    };

    return card;
  } catch (error) {
    // alert(`Error fetching wager data: ${error}`);
    console.log(error);

    // alertWarningFeedback('Wager address not found');

    const card = {} as Card;
    return card;

    // throw error; // Throw the error so that the caller can handle it
  }
};

function encodeMoveMessage(move: GaslessMove): string {
  const abiCoder = new ethers.utils.AbiCoder();
  return abiCoder.encode(
    ['address', 'uint256', 'uint256', 'uint16', 'uint256'],
    [
      move.wagerAddress,
      move.gameNumber,
      move.moveNumber,
      move.move,
      move.expiration,
    ],
  );
}

export const IsEncryptionKeyAvailable = async () => {
  let encryptionKey = localStorage.getItem(ENCRYPTION_KEY_STORAGE_KEY);
  if (!encryptionKey) {
    return false;
  } else {
    return true;
  }
};

export const GetEncryptionKey = async () => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  await getOrAskForEncryptionKey(provider);
};

export const IsDelegationAvailable = async (wagerAddress: string) => {
  const localStorageKey = `${LOCAL_STORAGE_KEY_PREFIX}${wagerAddress}`;
  const encryptedDelegationData = localStorage.getItem(localStorageKey);
  if (!encryptedDelegationData) {
    return false;
  } else {
    return true;
  }
};

export const GetDelegation = async (wagerAddress: string) => {
  await getDelegation(GaslessGameAddress, wagerAddress);
};

export const PlayMove = async (
  isGasLess: boolean,
  isDelegated: boolean,
  moveNumber: number,
  wagerAddress: string,
  move: string,
): Promise<Boolean> => {
  await updateContractAddresses();
  const provider = new ethers.providers.Web3Provider(window.ethereum);

  const network = await provider.getNetwork();
  const chainId = network.chainId;
  const signer = provider.getSigner();

  const chess = new ethers.Contract(ChessAddress, chessWagerABI, signer);
  const gaslessGame = new ethers.Contract(
    GaslessGameAddress,
    gaslessGameABI,
    signer,
  );

  try {
    // const hex_move = await chess.moveToHex(move);
    // const gameNumber = Number(await chess.getGameLength(wagerAddress));
    let hex_move = moveToHex(move);
    let gameNumber = await GetGameNumber(wagerAddress);

    if (isGasLess) {
      let delegationAndWallet;
      // isDelegated is set to true for v1
      if (isDelegated) {
        try {
          // get return values and post to server
          delegationAndWallet = await getDelegation(
            GaslessGameAddress,
            wagerAddress,
          );
        } catch (error) {
          console.log(error);
        }
      }

      const timeNow = Date.now();
      const timeStamp = Math.floor(timeNow / 1000) + 86400 * 3; // @dev set to the expiration of the wager

      const moveMessageData: GaslessMove = {
        wagerAddress: wagerAddress,
        gameNumber: gameNumber,
        moveNumber: moveNumber,
        move: hex_move,
        expiration: timeStamp,
      };

      const encodedMoveMessage = encodeMoveMessage(moveMessageData);

      if (delegationAndWallet) {
        await signTxPushToDB(
          isDelegated,
          delegationAndWallet,
          GaslessGameAddress,
          moveMessageData,
          encodedMoveMessage,
          move,
        );
      } else {
        console.error('DELEGATION NOT DEFINED');
      }
    } else {
      const onChainMoves = await chess.getGameMoves(wagerAddress, gameNumber);
      const onChainMoveNumber = onChainMoves.length;

      if (moveNumber != onChainMoveNumber) {
        await submitMoves(wagerAddress);
      }

      const tx = await chess.playMove(wagerAddress, hex_move);
      await tx.wait();
    }

    return true;
  } catch (error) {
    console.log(`playMove: invalid address ${wagerAddress}`);
    console.log(error);
    return false;
  }
};

export const GetConnectedAccount = async () => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  return signer;
};

export const PlayMoveGasless = async (
  wagerAddress: string,
  move: string,
): Promise<Boolean> => {
  await updateContractAddresses();

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();

  const chess = new ethers.Contract(ChessAddress, chessWagerABI, signer);

  const timeNow = Date.now();
  const timeStamp = Math.floor(timeNow / 1000) + 86400 * 2; // plus two days

  try {
    const hex_move = await chess.moveToHex(move);

    // const tx = await chess.playMove(wagerAddress, hex_move);
    // await tx.wait();

    // get number of moves in game and game number

    const message = await chess.generateMoveMessage(
      wagerAddress,
      hex_move,
      0,
      timeStamp,
    );

    const messageHash = await chess.getMessageHash(
      wagerAddress,
      hex_move,
      0,
      timeStamp,
    );

    const signature = await signer.signMessage(
      ethers.utils.arrayify(messageHash),
    );

    return true;
  } catch (error) {
    console.log(`playMove: invalid address ${wagerAddress}`);
    console.log(error);
    return false;
  }
};

export const PayoutWager = async (wagerAddress: string) => {
  await updateContractAddresses();

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();

  const chess = new ethers.Contract(ChessAddress, chessWagerABI, signer);
  try {
    await chess.payoutWager(wagerAddress);
    alertSuccessFeedback('Wager Payout Success!');

    return true;
  } catch (error) {
    alertWarningFeedback('cannot payout wager yet');
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
    // alert(`wager address: ${wagerAddress} not found`);
    console.log(error);
  }
};

export const IsPlayerWhite = async (wagerAddress: string): Promise<boolean> => {
  let { signer, accounts, isWalletConnected } = await setupProvider();

  await updateContractAddresses();

  if (isWalletConnected) {
    const chess = new ethers.Contract(ChessAddress, chessWagerABI, signer);
    try {
      const isPlayerWhite = await chess.isPlayerWhite(
        wagerAddress,
        accounts[0],
      );

      return isPlayerWhite;
    } catch (error) {
      console.log(`isPlayerWhite invalid address ${wagerAddress}`);
      console.log(error);
      return false;
    }
  } else {
    return false;
  }
};

export const IsPlayer0White = async (
  wagerAddress: string,
): Promise<boolean> => {
  let { signer, isWalletConnected } = await setupProvider();

  await updateContractAddresses();

  if (isWalletConnected) {
    const chess = new ethers.Contract(ChessAddress, chessWagerABI, signer);
    try {
      const wagerData = await chess.gameWagers(wagerAddress);

      const player0 = wagerData.player0;

      const isPlayerWhite = await chess.isPlayerWhite(wagerAddress, player0);

      return isPlayerWhite;
    } catch (error) {
      console.log(`isPlayerWhite invalid address ${wagerAddress}`);
      console.log(error);
      return false;
    }
  } else {
    return false;
  }
};

export const IsSignerInWagerAddress = async (wagerAddress: string) => {
  await updateContractAddresses();
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const accounts = await provider.send('eth_requestAccounts', []);

  const chess = new ethers.Contract(ChessAddress, chessWagerABI, signer);

  try {
    const data = await chess.gameWagers(wagerAddress);

    const player0 = data.player0.toLowerCase();
    const player1 = data.player1.toLowerCase();
    const connectedAccount = accounts[0].toLowerCase();

    return connectedAccount === player0 || connectedAccount === player1;
  } catch (error) {
    console.error('Error checking wager address:', error);
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
    const isPlayerWhite = await chess.isPlayerWhite(
      wagerAddress,
      playerAddress,
    );

    return isPlayerWhite;
  } catch (error) {
    console.log(
      `isPlayerAddressWhite function: invalid address ${wagerAddress}`,
    );
    console.log(error);
    return false;
  }
};

export const GetPlayerTurn = async (wagerAddress: string): Promise<boolean> => {
  const { signer, accounts, isWalletConnected } = await setupProvider();
  if (!isWalletConnected) return false;

  await updateContractAddresses();
  const chess = new ethers.Contract(ChessAddress, chessWagerABI, signer);

  try {
    const isGameGasless = await checkIfGasless(wagerAddress);
    let playerTurn = isGameGasless ? await getPlayerTurnAPI(wagerAddress) : await chess.getPlayerMove(wagerAddress);

    // Fallback for gasless game with empty player turn
    if (isGameGasless && playerTurn === '') {
      playerTurn = await chess.getPlayerMove(wagerAddress);
    }

    return Number(playerTurn) === Number(accounts[0]);
  } catch (error) {
    console.error(`Error in GetPlayerTurn function with address ${wagerAddress}:`, error);
    return false;
  }
};


export const GetPlayerTurnSC = async (
  wagerAddress: string,
): Promise<boolean> => {
  let { signer, accounts, isWalletConnected } = await setupProvider();

  await updateContractAddresses();

  const chess = new ethers.Contract(ChessAddress, chessWagerABI, signer);

  if (isWalletConnected) {
    try {
      let playerTurn = await chess.getPlayerMove(wagerAddress);

      let isPlayerTurn;
      if (Number(playerTurn) == Number(accounts[0])) {
        isPlayerTurn = true;
      } else {
        isPlayerTurn = false;
      }

      return isPlayerTurn;
    } catch (error) {
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
  await updateContractAddresses();

  const provider = new ethers.providers.Web3Provider(window.ethereum);

  const chess = new ethers.Contract(ChessAddress, chessWagerABI, provider);
  try {
    const wagerParams = await chess.gameWagers(wagerAddress);

    const numberOfGames = Number(parseInt(wagerParams[4]));
    const gameNumber = Number(await chess.getGameLength(wagerAddress));

    let data: number[] = [];

    if (Number(gameNumber) === Number(numberOfGames)) {
      data.push(Number(gameNumber) - 1);
      data.push(Number(numberOfGames));
    } else {
      data.push(Number(gameNumber));
      data.push(Number(numberOfGames));
    }

    return data;
  } catch (error) {
    console.log(`getNumberOfGames function: invalid address ${wagerAddress}`);
    console.log(error);
    return [];
  }
};

export const GetGameNumber = async (wagerAddress: string): Promise<number> => {
  await updateContractAddresses();

  const provider = new ethers.providers.Web3Provider(window.ethereum);

  const chess = new ethers.Contract(ChessAddress, chessWagerABI, provider);
  try {
    const gameNumber = Number(await chess.getGameLength(wagerAddress));

    return gameNumber;
  } catch (error) {
    console.log(`getNumberOfGames function: invalid address ${wagerAddress}`);
    console.log(error);
    return 0;
  }
};

type PlayerStats = {
  totalGames: number;
  gamesWon: number;
};

export const GetLeaderboardData = async (): Promise<{
  [key: string]: PlayerStats;
}> => {
  await updateContractAddresses();
  let { provider } = await setupProvider();

  const chess = new ethers.Contract(ChessAddress, chessWagerABI, provider);

  const playerStatistics: { [key: string]: PlayerStats } = {};

  try {
    let wagerAddresses: string[] = [];

    // Fetch all wager addresses
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

    for (const wagerAddress of wagerAddresses) {
      const wagerParams = await chess.gameWagers(wagerAddress);
      const status = await chess.wagerStatus(wagerAddress);

      const players = [wagerParams[0], wagerParams[1]];

      players.forEach((player, index) => {
        if (player === ethers.constants.AddressZero) return; // Skip the iteration if player is the zero address

        if (!playerStatistics[player]) {
          playerStatistics[player] = {
            totalGames: 0,
            gamesWon: 0,
          };
        }

        // Increment the total games played by the player
        playerStatistics[player].totalGames += parseInt(wagerParams[4]);

        // Increment the games won by the player
        if (index === 0) {
          playerStatistics[player].gamesWon += Number(status.winsPlayer0);
        } else {
          playerStatistics[player].gamesWon += Number(status.winsPlayer1);
        }
      });
    }

    return playerStatistics;
  } catch (error) {
    //alert(`Analytics function : error`);
    console.log(error);
    return {};
  }
};

export const PayoutDividends = async (tokenAddress: string) => {
  await updateContractAddresses();

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const accounts = await provider.send('eth_requestAccounts', []);

  const splitter = new ethers.Contract(DividendSplitter, splitterABI, signer);
  try {
    await splitter.releaseERC20(tokenAddress, accounts[0]);

    return true;
  } catch (error) {
    console.log(error);
  }
};

export const GetDividendData = async () => {
  await updateContractAddresses();

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const accounts = await provider.send('eth_requestAccounts', []);

  const token = new ethers.Contract(ChessToken, ERC20ABI, signer);

  try {
    const userAmount = ethers.utils.formatEther(
      await token.balanceOf(accounts[0]),
      18,
    );

    const totalSupply = ethers.utils.formatEther(await token.totalSupply(), 18);

    const userPercent = (userAmount / totalSupply) * 100;

    return [userPercent, totalSupply];
  } catch (error) {
    console.log(error);
    return [0, 0];
  }
};

export const GetDividendPayoutData = async (tokenAddress: string) => {
  await updateContractAddresses();

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const accounts = await provider.send('eth_requestAccounts', []);

  const splitter = new ethers.Contract(DividendSplitter, splitterABI, signer);

  try {
    const userAmount = ethers.utils.formatEther(
      await splitter.releasedERC20(tokenAddress, accounts[0]),
      18,
    );

    return userAmount;
  } catch (error) {
    console.log(error);
    return [0, 0];
  }
};

export const GetChessFishTokens = async (amountIn: string) => {
  await updateContractAddresses();

  const amount = ethers.utils.parseUnits(amountIn, 6);

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();

  const crowdSale = new ethers.Contract(CrowdSale, crowdSaleABI, signer);

  const usdc = new ethers.Contract(USDC, ERC20ABI, signer);

  try {
    const tx1 = await usdc.approve(CrowdSale, amount);
    await tx1.wait();

    alertSuccessFeedback("Tokens approved await second transaction");

    await crowdSale.getChessFishTokens(amount);
  } catch (error) {
    console.log(error);
    return false;
  }
};

export const getCrowdSaleBalance = async () => {
  await updateContractAddresses();

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();

  const token = new ethers.Contract(ChessToken, ERC20ABI, signer);

  try {
    const value = await token.balanceOf(CrowdSale);
    const balance = ethers.utils.formatEther(value);

    return balance;
  } catch (error) {
    return 0;
  }
};

interface TournamentParams {
  numberOfPlayers: number;
  wagerToken: string;
  wagerAmount: number;
  numberOfGames: number;
  timeLimit: number;
}

export const CreateTournament = async (params: TournamentParams) => {
  await updateContractAddresses();

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();

  const tournament = new ethers.Contract(
    Tournament.toString(),
    tournamentABI,
    signer,
  );
  const token = new ethers.Contract(
    params.wagerToken.toString(),
    ERC20ABI,
    signer,
  );

  const decimals = await token.decimals();
  const amountAdjusted = ethers.utils.parseUnits(params.wagerAmount, decimals);

  try {
    await tournament.createTournament(
      params.numberOfPlayers,
      params.numberOfGames,
      params.wagerToken,
      amountAdjusted,
      params.timeLimit,
    );

    alertSuccessFeedback('Tournament Created!');
    return true;
  } catch (error) {
    return false;
  }
};

interface TournamentParamsAuthed {
  numberOfPlayers: number;
  wagerToken: string;
  wagerAmount: number;
  numberOfGames: number;
  timeLimit: number;
  specificPlayers: string[];
  creatorToJoin: boolean;
}

export const CreateTournamentAuthed = async (
  params: TournamentParamsAuthed,
) => {
  await updateContractAddresses();
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();

  const accounts = await provider.send('eth_requestAccounts', []);

  const tournament = new ethers.Contract(
    Tournament.toString(),
    tournamentABI,
    signer,
  );
  const token = new ethers.Contract(
    params.wagerToken.toString(),
    ERC20ABI,
    signer,
  );

  const decimals = await token.decimals();
  const amountAdjusted = ethers.utils.parseUnits(params.wagerAmount, decimals);

  if (amountAdjusted == 0) {
    alertWarningFeedback(
      'Amount must be greater than 0 for authenticated tournaments',
    );
  }

  try {
    await tournament.createTournamentWithSpecificPlayers(
      params.specificPlayers,
      params.numberOfGames.toString(),
      params.wagerToken.toString(),
      amountAdjusted.toString(),
      params.timeLimit.toString(),
      params.creatorToJoin.toString(),
    );

    alertSuccessFeedback('Tournament Created!');
    return true;
  } catch (error: any) {
    console.log(error);

    alertWarningFeedback('Approve tokens first');

    return false;
  }
};

export const JoinTournament = async (
  tokenAddress: string,
  amount: number,
  tournamentID: number,
) => {
  await updateContractAddresses();

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const accounts = await provider.send('eth_requestAccounts', []);

  const tournament = new ethers.Contract(Tournament, tournamentABI, signer);
  const token = new ethers.Contract(tokenAddress, ERC20ABI, signer);

  try {
    const decimals = await token.decimals();
    const amountAdjusted = ethers.utils.parseUnits(amount.toString(), decimals);
    const tx1 = await token.approve(Tournament, amountAdjusted);
    alertSuccessFeedback('Success! Allowance set, wait for join tx');
    await tx1.wait();

    await tournament.joinTournament(tournamentID);

    alertSuccessFeedback('Success! Joined Tournament: ' + tournamentID);
    return true;
  } catch (error) {
    return false;
  }
};

export const ApproveTournament = async (
  tokenAddress: string,
  amount: number,
) => {
  await updateContractAddresses();

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const accounts = await provider.send('eth_requestAccounts', []);

  const token = new ethers.Contract(tokenAddress, ERC20ABI, signer);
  try {
    const decimals = await token.decimals();
    const amountAdjusted = ethers.utils.parseUnits(amount.toString(), decimals);
    const value = await token.approve(Tournament, amountAdjusted);
    const allowance = await token.allowance(accounts[0], Tournament);

    const readableAmount = ethers.utils.formatUnits(allowance, decimals);

    alertSuccessFeedback('Success! allowance set: ' + readableAmount);

    return {
      value: value,
      success: true,
      status: '✅ Check out your transaction on Etherscan',
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      // @ts-ignore
      status: '😥 Something went wrong: ' + error.message,
    };
  }
};

/* 
	struct Tournament {
		uint numberOfPlayers; // number of players in tournament
		address[] authed_players; // authenticated players
		address[] joined_players; // joined players
		bool isByInvite; // is tournament by invite only
		uint numberOfGames; // number of games per match
		address token; // wager token address
		uint tokenAmount; // token amount
		uint prizePool; // size of prize pool
		bool isInProgress; // is tournament in progress
		uint startTime; // unix timestamp start time
		uint timeLimit; // timeLimit for tournament
		bool isComplete; // is tournament complete
	}
*/

export interface TournamentData {
  tournamentNonce: number;
  numberOfPlayers: number;
  authed_players: string[];
  joined_players: string[];
  isByInvite: boolean;
  numberOfGames: number;
  token: string;
  tokenAmount: number;
  prizePool: number;
  isInProgress: boolean;
  startTime: number;
  timeLimit: number;
  isComplete: boolean;
  isTournament: boolean;
}

interface Tournaments {
  tournamentData: TournamentData;
}

export const GetPendingTournaments = async (): Promise<TournamentData[]> => {
  await updateContractAddresses();

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();

  const tournament = new ethers.Contract(Tournament, tournamentABI, signer);
  const tournamentsData: TournamentData[] = [];
  try {
    let tournamentNonce = await tournament.tournamentNonce();

    // First loop to get the basic tournament data
    for (let i = 0; i < tournamentNonce; i++) {
      const data = await tournament.tournaments(i);

      console.log(data);

      if (data.isInProgress === false) {
        const token = new ethers.Contract(data.token, ERC20ABI, signer);
        const tokenDecimals = await token.decimals();
        const tokenAmount = ethers.utils.formatUnits(
          data.tokenAmount,
          tokenDecimals,
        );
        const prizePool = ethers.utils.formatUnits(
          data.prizePool,
          tokenDecimals,
        );

        const tournamentData: TournamentData = {
          tournamentNonce: i,
          numberOfPlayers: data.numberOfPlayers,
          authed_players: [],
          joined_players: [],
          isByInvite: data.isByInvite,
          numberOfGames: data.numberOfGames,
          token: data.token,
          tokenAmount: tokenAmount,
          prizePool: prizePool,
          isInProgress: data.isInProgress,
          startTime: Number(data.startTime),
          timeLimit: Number(data.timeLimit),
          isComplete: Boolean(data.isComplete),
          isTournament: true,
        };

        const joined_players = await tournament.getTournamentPlayers(i);
        tournamentData.joined_players = joined_players;

        if (data.isByInvite) {
          const authed_players = await tournament.getAuthorizedPlayers(i);
          tournamentData.authed_players = authed_players;
        }

        console.log('JOINED', joined_players);
        console.log('AUTHED', tournamentData.authed_players);

        tournamentsData.push(tournamentData);
      }
    }
  } catch (error) {
    // Handle error if needed
  }

  return tournamentsData;
};

export const GetInProgressTournaments = async () => {
  await updateContractAddresses();

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();

  const tournament = new ethers.Contract(Tournament, tournamentABI, signer);
  const tournamentsData: TournamentData[] = [];

  try {
    let tournamentNonce = await tournament.tournamentNonce();

    // First loop to get the basic tournament data
    for (let i = 0; i < tournamentNonce; i++) {
      const data = await tournament.tournaments(i);

      const token = new ethers.Contract(data.token, ERC20ABI, signer);
      const tokenDecimals = await token.decimals();
      const tokenAmount = ethers.utils.formatUnits(
        data.tokenAmount,
        tokenDecimals,
      );
      const prizePool = ethers.utils.formatUnits(data.prizePool, tokenDecimals);

      const tournamentData: TournamentData = {
        tournamentNonce: i,
        numberOfPlayers: data.numberOfPlayers,
        authed_players: data.authed_players,
        joined_players: [],
        isByInvite: data.isByInvite,
        numberOfGames: data.numberOfGames,
        token: data.token,
        tokenAmount: tokenAmount,
        prizePool: prizePool,
        isInProgress: data.isInProgress,
        startTime: Number(data.startTime),
        timeLimit: Number(data.timeLimit),
        isComplete: Boolean(data.isComplete),
        isTournament: true,
      };

      const players = await tournament.getTournamentPlayers(i);
      tournamentData.joined_players = players;

      if (tournamentData.isInProgress === true) {
        const players = await tournament.getTournamentPlayers(i);
        tournamentData.joined_players = players;
        tournamentsData.push(tournamentData);
      }
    }
  } catch (error) {
    // Handle error if needed
  }

  return tournamentsData;
};

export const GetTournament = async (tournamentID: number) => {
  await updateContractAddresses();

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const tournament = new ethers.Contract(Tournament, tournamentABI, signer);

  let tournamentData: TournamentData; // Initialize it to null or some default value

  try {
    const data = await tournament.tournaments(tournamentID);

    const token = new ethers.Contract(data[2], ERC20ABI, signer);
    const tokenDecimals = await token.decimals();
    const tokenAmount = ethers.utils.formatUnits(
      data.tokenAmount,
      tokenDecimals,
    );
    const prizePool = ethers.utils.formatUnits(data.prizePool, tokenDecimals);

    tournamentData = {
      tournamentNonce: tournamentID,
      numberOfPlayers: Number(data[0]),
      authed_players: data.authed_players,
      joined_players: data.joined_players,
      isByInvite: data.isByInvite,
      numberOfGames: Number(data[1]),
      token: data[2],
      tokenAmount: Number(tokenAmount),
      prizePool: Number(prizePool),
      isInProgress: Boolean(data[4]),
      startTime: Number(data[5]),
      timeLimit: Number(data[6]),
      isComplete: Boolean(data[7]),
      isTournament: Boolean(data[8]),
    };

    return tournamentData;
  } catch (error) {
    console.error('Error fetching tournament data:', error);
    return null;
  }
};

export const ExitTournament = async (tounamentId: number) => {
  await updateContractAddresses();

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();

  const tournament = new ethers.Contract(Tournament, tournamentABI, signer);

  try {
    await tournament.exitTournament(tounamentId);
    return true;
  } catch (error) {
    return false;
  }
};

export const StartTournament = async (tounamentId: number) => {
  await updateContractAddresses();

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();

  const tournament = new ethers.Contract(Tournament, tournamentABI, signer);

  try {
    await tournament.startTournament(tounamentId);
    alertSuccessFeedback('Success! Tournament Started!');

    return true;
  } catch (error) {
    return false;
  }
};

export const PayoutTournament = async (tounamentId: number) => {
  await updateContractAddresses();

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();

  const tournament = new ethers.Contract(Tournament, tournamentABI, signer);

  try {
    await tournament.payoutTournament(tounamentId);
    alertSuccessFeedback('Tournament Payout Successful!');
    return true;
  } catch (error) {
    return false;
  }
};

export const GetTournamentScore = async (tournamentId: number) => {
  await updateContractAddresses();

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();

  const tournament = new ethers.Contract(Tournament, tournamentABI, signer);

  try {
    const data = await tournament.viewTournamentScore(tournamentId);

    // Create a new array and populate it with the converted values
    const newData = [...data[1].map((item: any) => item.toString())];

    return [data[0], newData];
  } catch (error) {
    console.log(error);
  }
  return [[], []];
};

export const HaveAllGamesBeenPlayedInTournament = async (
  tournamentId: number,
): Promise<boolean> => {
  await updateContractAddresses();

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();

  const tournament = new ethers.Contract(Tournament, tournamentABI, signer);

  try {
    const tournamentScore = await tournament.viewTournamentScore(tournamentId);

    if (
      !tournamentScore ||
      tournamentScore.length === 0 ||
      !tournamentScore[0] ||
      !tournamentScore[1]
    ) {
      return false;
    }

    const numberOfPlayers = tournamentScore[0].length;
    const tournamentData = await tournament.tournaments(tournamentId);
    const numberOfGames = Number(tournamentData[1]);
    const totalGames =
      (numberOfPlayers * (numberOfPlayers - 1) * numberOfGames) / 2;

    // Convert win values to numbers and calculate the sum
    let sumOfGamesPlayed = 0;

    for (let i = 0; i < tournamentScore.length; i++) {
      sumOfGamesPlayed += Number(tournamentScore[1][i]);
    }

    return sumOfGamesPlayed === totalGames;
  } catch (error) {
    console.error(error);
  }
  return false;
};

export const GetPlayerAddresses = async () => {
  await updateContractAddresses();

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();

  const tournament = new ethers.Contract(Tournament, tournamentABI, signer);

  try {
    const tournamentNonce = await tournament.tournamentNonce();

    const players = await tournament.getTournamentPlayers(tournamentNonce - 1);

    return players;
  } catch (error) {
    // Handle error if needed
  }
};

export const GetWagerAddressTournament = async (tournamentNonce: number) => {
  await updateContractAddresses();

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();

  const tournament = new ethers.Contract(Tournament, tournamentABI, signer);

  try {
    const players = await tournament.getTournamentWagerAddresses(
      tournamentNonce,
    );

    return players;
  } catch (error) {
    // Handle error if needed
  }
};

export const GetIsTournamentEnded = async (tournamentId: number) => {
  await updateContractAddresses();

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const tournament = new ethers.Contract(Tournament, tournamentABI, signer);

  try {
    const data = await tournament.tournaments(tournamentId);

    const startTime = Number(data.startTime);
    const timeLimit = Number(data.timeLimit);

    const endTime = startTime + timeLimit;

    // Get current unix timestamp
    const currentTimestamp = Math.floor(Date.now() / 1000) + 86400; // Divided by 1000 to convert from ms to s

    console.log(currentTimestamp);
    return currentTimestamp > endTime; // Return true if currentTimestamp is greater, else false
  } catch (error) {
    // Handle error if needed
    console.error(error); // Optionally log the error
    return false; // Fallback return value in case of error
  }
};

export const GetIsUserInTournament = async (tournamentId: number) => {
  await updateContractAddresses();
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const accounts = await provider.send('eth_requestAccounts', []);

  const tournament = new ethers.Contract(Tournament, tournamentABI, signer);
  try {
    const players = await tournament.getTournamentPlayers(tournamentId);
    let isPlayerInTournament = false;
    for (let i = 0; i < players.length; i++) {
      if (parseInt(players[i], 16) === parseInt(accounts[0], 16)) {
        isPlayerInTournament = true;
      }
    }

    return isPlayerInTournament;
  } catch (error) {
    return false;
  }
};

export const GetCanTournamentBegin = async (tournamentId: number) => {
  await updateContractAddresses();
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();

  const tournament = new ethers.Contract(Tournament, tournamentABI, signer);
  try {
    const data = await tournament.tournaments(tournamentId);

    const startTime = Number(data.startTime) * 1000; // Assuming the startTime is in seconds. Convert it to milliseconds for JavaScript.

    const timeNow = Date.now(); // Get current time in milliseconds.

    const oneDayInMilliseconds = 24 * 60 * 60 * 1000; // 24 hours * 60 minutes * 60 seconds * 1000 milliseconds

    if (timeNow - startTime > oneDayInMilliseconds) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
};

/// GASLESS MOVE SUBMIT
export const SubmitVerifyMoves = async (data: any, wager: string) => {
  await updateContractAddresses();
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();

  const chess = new ethers.Contract(ChessAddress, chessWagerABI, signer);
  try {
    const gameNumber = Number(await chess.getGameLength(wager));

    // get game moves on chain
    const onChainMoves = await GetGameMoves(wager, gameNumber);

    // Initialize arrays for the current game
    let moves = data.moves[gameNumber];
    let messages = data.messages[gameNumber];
    let signedMessages = data.signedMessages[gameNumber];

    /*     console.log('arrays');
    console.log(onChainMoves);
    console.log(moves);
    console.log(messages);
    console.log(signedMessages); */

    // Remove elements from moves that match with onChainMoves
    onChainMoves.forEach((onChainMove) => {
      const index = moves.indexOf(onChainMove);
      if (index !== -1) {
        moves.splice(index, 1);
        messages.splice(index, 1);
        signedMessages.splice(index, 1);
      }
    });

    // Update data with the filtered arrays
    data.moves[gameNumber] = moves;
    data.messages[gameNumber] = messages;
    data.signedMessages[gameNumber] = signedMessages;

    if (messages.length !== 0 || signedMessages.length !== 0) {
      let tx = await chess.verifyGameUpdateState(messages, signedMessages);
      await tx.wait();

      alertSuccessSubmitMoves('Moves submitted on-chain');
    }
  } catch (error) {
    console.log(error);
  }
};

/// GASLESS MOVE SUBMIT
export const SubmitVerifyMovesDelegated = async (data: any, wager: string) => {
  await updateContractAddresses();
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();

  const chess = new ethers.Contract(ChessAddress, chessWagerABI, signer);
  try {
    const gameNumber = Number(await chess.getGameLength(wager));

    // get game moves on chain
    const onChainMoves = await GetGameMoves(wager, gameNumber);

    // Get encoded delegations
    const delegations = [
      data.delegations[0].encodedDelegationAndSig,
      data.delegations[1].encodedDelegationAndSig,
    ];

    // Initialize arrays for the current game
    let moves = data.moves[gameNumber];
    let messages = data.messages[gameNumber];
    let signedMessages = data.signedMessages[gameNumber];

    //  console.log('arrays');
    /*     console.log(onChainMoves);
    console.log(moves);
    console.log(messages);
    console.log(signedMessages); */
    // console.log(delegations);

    // Remove elements from moves that match with onChainMoves
    onChainMoves.forEach((onChainMove) => {
      const index = moves.indexOf(onChainMove);
      if (index !== -1) {
        moves.splice(index, 1);
        messages.splice(index, 1);
        signedMessages.splice(index, 1);
      }
    });

    // Update data with the filtered arrays
    data.moves[gameNumber] = moves;
    data.messages[gameNumber] = messages;
    data.signedMessages[gameNumber] = signedMessages;

    if (messages.length !== 0 || signedMessages.length !== 0) {
      let tx = await chess.verifyGameUpdateStateDelegated(
        delegations,
        messages,
        signedMessages,
      );
      await tx.wait();

      alertSuccessSubmitMoves('Moves submitted on-chain');
    }
  } catch (error) {
    console.log(error);
  }
};

export const DownloadGaslessMoves = async (data: any, wager: string) => {
  await updateContractAddresses();
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();

  const chess = new ethers.Contract(ChessAddress, chessWagerABI, signer);
  try {
    const gameNumber = Number(await chess.getGameLength(wager));

    // get game moves on chain
    const onChainMoves = await GetGameMoves(wager, gameNumber);

    // Initialize arrays for the current game
    let moves = data.moves[gameNumber];
    let messages = data.messages[gameNumber];
    let signedMessages = data.signedMessages[gameNumber];

    // Remove elements from moves that match with onChainMoves
    onChainMoves.forEach((onChainMove) => {
      const index = moves.indexOf(onChainMove);
      if (index !== -1) {
        moves.splice(index, 1);
        messages.splice(index, 1);
        signedMessages.splice(index, 1);
      }
    });

    // Update data with the filtered arrays
    data.moves[gameNumber] = moves;
    data.messages[gameNumber] = messages;
    data.signedMessages[gameNumber] = signedMessages;

    return { messages, signedMessages };
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const GetCurrentBlock = async () => {
  await updateContractAddresses();
  // Use this RPC URL: https://arb1.arbitrum.io/rpc
  const provider = new ethers.providers.JsonRpcProvider(
    'https://arb1.arbitrum.io/rpc',
  );
  try {
    const blockNumber = await provider.getBlockNumber();
    console.log('Current Block Number:', blockNumber);

    return blockNumber;
  } catch (error) {
    console.error('Error fetching current block:', error);
    throw error; // Rethrow the error for handling upstream
  }
};
