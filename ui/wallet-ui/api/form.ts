const ethers = require('ethers');
const { parseUnits } = require('ethers/lib/utils');
import { CreateMatchType } from './types';

const chessWagerABI = require('../../../contract-abi/ChessWagerABI');
const moveVerificationABI = require('../../../contract-abi/MoveVerificationABI.json');
const splitterABI = require('../../../contract-abi/SplitterABI');
const crowdSaleABI = require('../../../contract-abi/CrowdSaleABI');
const tournamentABI = require('../../../contract-abi/TournamentABI');

import alertWarningFeedback from '#/ui/alertWarningFeedback';
import alertSuccessFeedback from '#/ui/alertSuccessFeedback';

import detectEthereumProvider from '@metamask/detect-provider';

interface ContractAddress {
  network: string;
  chainID: number;
  owner: string;
  token: string;
  chessToken: string;
  dividendSplitter: string;
  moveVerification: string;
  chess: string;
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
let tokenAddress = addresses[0].token;
let ChessToken = addresses[0].chessToken;
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
  let { provider } = await setupProvider();

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
    ChessAddress = matchingChain.chess;
    VerificationAddress = matchingChain.moveVerification;
    tokenAddress = matchingChain.token;
    ChessToken = matchingChain.chessToken;
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

export const getChainId = async () => {
  let { provider } = await setupProvider();

  try {
    const network = await provider.getNetwork();
    const chainId = network.chainId;
    return chainId;
  } catch {
    return 0;
  }
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

export const getDividendBalances = async () => {
  await updateContractAddresses();

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();

  const wbtc = new ethers.Contract(WBTC, ERC20ABI, signer);
  const weth = new ethers.Contract(WETH, ERC20ABI, signer);
  const usdt = new ethers.Contract(USDT, ERC20ABI, signer);
  const usdc = new ethers.Contract(USDC, ERC20ABI, signer);
  const dai = new ethers.Contract(DAI, ERC20ABI, signer);

  try {
    let wbtc_bal = await wbtc.balanceOf(DividendSplitter);
    let weth_bal = await weth.balanceOf(DividendSplitter);
    let usdt_bal = await usdt.balanceOf(DividendSplitter);
    let usdc_bal = await usdc.balanceOf(DividendSplitter);
    let dai_bal = await dai.balanceOf(DividendSplitter);

    wbtc_bal = ethers.utils.formatEther(wbtc_bal);
    weth_bal = ethers.utils.formatEther(weth_bal);
    usdt_bal = ethers.utils.formatEther(usdt_bal);
    usdc_bal = ethers.utils.formatEther(usdc_bal);
    dai_bal = ethers.utils.formatEther(dai_bal);

    return [wbtc_bal, weth_bal, usdt_bal, usdc_bal, dai_bal];
  } catch (error) {
    return [0, 0, 0, 0, 0];
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

    const decimals = await token.decimals();
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
        isTournament: Boolean(wagerParams[10]),
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
    // alert(`wager address: ${wagerAddress} not found`);
    alertWarningFeedback(
      `Accept Wager Conditions pending... Wait until token approve tx success`,
    );
    console.log(error);
  }
};

export const GetAnalyticsData = async (): Promise<[string[], string]> => {
  await updateContractAddresses();
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
        isTournament: Boolean(wagerParams.isTournament),
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
      isTournament: Boolean(wagerParams.isTournament),
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
    alert(`Analytics function : error`);
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

    console.log(userAmount);
    console.log(totalSupply);

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

  const amount = ethers.utils.parseEther(amountIn);

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();

  const crowdSale = new ethers.Contract(CrowdSale, crowdSaleABI, signer);

  try {
    await crowdSale.getChessFishTokens({ value: amount });
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

  console.log(params);

  const tournament = new ethers.Contract(Tournament, tournamentABI, signer);
  const token = new ethers.Contract(params.wagerToken, ERC20ABI, signer);

  const decimals = await token.decimals();
  const amountAdjusted = ethers.utils.parseUnits(params.wagerAmount, decimals);

  // const value = await token.approve(Tournament, amountAdjusted);
  // const allowance = await token.allowance(accounts[0], ChessAddress);

  try {
    await tournament.createTournament(
      params.numberOfPlayers,
      params.numberOfGames,
      params.wagerToken,
      amountAdjusted,
      params.timeLimit,
    );

    return true;
  } catch (error) {
    return false;
  }
};

export const JoinTournament = async (tournamentID: number) => {
  await updateContractAddresses();

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();

  const tournament = new ethers.Contract(Tournament, tournamentABI, signer);
  try {
    await tournament.joinTournament(tournamentID);
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

interface TournamentData {
  tournamentNonce: number;
  numberOfPlayers: number;
  players: string[];
  numberOfGames: number;
  token: string;
  tokenAmount: number;
  isInProgress: boolean;
  startTime: number;
  timeLimit: number;
  isComplete: boolean;
  isTournament: boolean;
}

interface Tournaments {
  tournamentData: TournamentData;
}

export const GetPendingTournaments = async () => {
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

      if (Boolean(data[4]) == false) {
        const tournamentData: TournamentData = {
          tournamentNonce: i,
          numberOfPlayers: Number(data[0]),
          players: [],
          numberOfGames: Number(data[1]),
          token: data[2],
          tokenAmount: Number(data[3]),
          isInProgress: Boolean(data[4]),
          startTime: Number(data[5]),
          timeLimit: Number(data[6]),
          isComplete: Boolean(data[7]),
          isTournament: Boolean(data[8]),
        };

        const players = await tournament.getTournamentPlayers(i);
        tournamentData.players = players;

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

      console.log(data);

      const tournamentData: TournamentData = {
        tournamentNonce: i,
        numberOfPlayers: Number(data[0]),
        players: [],
        numberOfGames: Number(data[1]),
        token: data[2],
        tokenAmount: Number(data[3]),
        isInProgress: Boolean(data[4]),
        startTime: Number(data[5]),
        timeLimit: Number(data[6]),
        isComplete: Boolean(data[7]),
        isTournament: Boolean(data[8]),
      };

      const players = await tournament.getTournamentPlayers(i);
      tournamentData.players = players;

      if (tournamentData.isInProgress === true) {
        const players = await tournament.getTournamentPlayers(i);
        tournamentData.players = players;
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

  let tournamentData: TournamentData | null = null; // Initialize it to null or some default value

  try {
    const data = await tournament.tournaments(tournamentID);
    if (Boolean(data[4]) == false) {
      tournamentData = {
        tournamentNonce: tournamentID,
        numberOfPlayers: Number(data[0]),
        players: [],
        numberOfGames: Number(data[1]),
        token: data[2],
        tokenAmount: Number(data[3]),
        isInProgress: Boolean(data[4]),
        startTime: Number(data[5]),
        timeLimit: Number(data[6]),
        isComplete: Boolean(data[7]),
        isTournament: Boolean(data[8]),
      };

      const players = await tournament.getTournamentPlayers(tournamentID);
      tournamentData.players = players;
    }
  } catch (error) {
    // Handle error if needed
    console.error('Error fetching tournament data:', error);
    // You could also consider setting tournamentData to some error state here
  }

  return tournamentData;
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
    const currentTimestamp = Math.floor(Date.now() / 1000); // Divided by 1000 to convert from ms to s

    console.log(currentTimestamp);
    return currentTimestamp > endTime; // Return true if currentTimestamp is greater, else false
  } catch (error) {
    // Handle error if needed
    console.error(error); // Optionally log the error
    return false; // Fallback return value in case of error
  }
};
