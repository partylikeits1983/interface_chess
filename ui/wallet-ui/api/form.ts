const ethers = require('ethers');
const { parseUnits } = require('ethers/lib/utils');

const chessWagerABI = require('../../../contract-abi/ChessWagerABI');
const moveVerificationABI = require('../../../contract-abi/MoveVerificationABI.json');

let ChessAddress = '0x512945dfCD32C9E51ABcc6DE22752a7dd4266fDd';
let VerificationAddress = '0xFe3C5F9c8959FaFAEFb5841fc46Ee701d403e34D';
let tokenAddress = '0xCA7E373c6AE45f82d97F5898DE7ac5e3f97F9200';

import { CreateMatchType } from './types';

const ERC20ABI = [
  'function transferFrom(address from, address to, uint value)',
  'function transfer(address to, uint value)',
  'function approve(address account, uint amount) returns (bool)',
  'function allowance(address _owner, address _spender) public view returns (uint256 remaining)',
  'function balanceOf(address owner) view returns (uint balance)',
  'event Transfer(address indexed from, address indexed to, address value)',
  'error InsufficientBalance(account owner, uint balance)',
];

const updateContractAddresses = async () => {
  let { provider } = await setupProvider();

  // const provider = new ethers.providers.Web3Provider(window.ethereum);
  const network = await provider.getNetwork();
  const chainId = network.chainId;

  console.log('update addresses');
  console.log(chainId);

  // Update the addresses based on the chain id.
  // This is an example, you need to replace with actual addresses.
  if (chainId === 31337) {
    // localhost
    ChessAddress = '0x9963Aeb98a0d7ffC48F175f305234889E71b7D77';
    VerificationAddress = '0x029C1A99D6ae043FbE0D8BF021135D67c3443642';
    tokenAddress = '0xdf1724f11b65d6a6155B057F33fBDfB2F3B95E17';
  } else if (chainId === 80001) {
    // mumbai Testnet
    ChessAddress = '0x512945dfCD32C9E51ABcc6DE22752a7dd4266fDd';
    VerificationAddress = '0xFe3C5F9c8959FaFAEFb5841fc46Ee701d403e34D';
    tokenAddress = '0xCA7E373c6AE45f82d97F5898DE7ac5e3f97F9200';
  }
  // Add more chains if needed.
};

const setupProvider = async () => {
  let provider, signer, accounts, isWalletConnected;

  if (window.ethereum) {
    try {
      provider = new ethers.providers.Web3Provider(window.ethereum);
      signer = provider.getSigner();
      accounts = await provider.listAccounts();
      await provider.send('eth_requestAccounts', []);
      console.log('Web3 provider is set.');
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
    console.log('JSON-RPC provider is set. Form.ts');
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

    alert('balance: ' + balance);

    console.log(balance);

    console.log('success');
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
      timePerMove: parseInt(wagerParams[4]),
      numberOfGames: parseInt(wagerParams[5]),
      isInProgress: wagerParams[6],
    };

    const token = new ethers.Contract(card.wagerToken, ERC20ABI, signer);

    const value = await token.approve(ChessAddress, wagerParams[3].toString());
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
    console.log('MOVES LENGTH');
    console.log(moves.length);

    let hexMoves = [];
    for (let i = 0; i < moves.length; i++) {
      hexMoves[i] = await chess.moveToHex(moves[i]);
    }

    const tx = await verifier.checkGameFromStart(hexMoves);
    // alert("SC: VALID MOVE")

    console.log('success');
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

    console.log(accounts[0]);
    const wagers = await chess.getAllUserGames(accounts[0]);
    const wagerAddress = wagers[wagers.length - 1];

    alert('Wager Created: ' + wagerAddress);

    console.log('success');
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

interface Card {
  matchAddress: string;
  player0Address: string;
  player1Address: string;
  wagerToken: string;
  wagerAmount: number;
  timePerMove: number;
  numberOfGames: number;
  isInProgress: boolean;
}

export const GetAllWagers = async () => {
  await updateContractAddresses();

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const accounts = await provider.send('eth_requestAccounts', []);

  const chess = new ethers.Contract(ChessAddress, chessWagerABI, signer);
  try {
    console.log('GetAllWagers');

    const wagers = await chess.getAllUserGames(accounts[0]);

    const allWagerParams = [];

    for (let i = 0; i < wagers.length; i++) {
      const wagerParams = await chess.gameWagers(wagers[i]);

      //console.log(wagerParams);

      const card: Card = {
        matchAddress: wagers[i],
        player0Address: wagerParams[0],
        player1Address: wagerParams[1],
        wagerToken: wagerParams[2],
        wagerAmount: parseInt(wagerParams[3]),
        timePerMove: parseInt(wagerParams[4]),
        numberOfGames: parseInt(wagerParams[5]),
        isInProgress: wagerParams[6],
      };

      allWagerParams.push(card);
    }
    console.log(allWagerParams);

    return allWagerParams;
  } catch (error) {
    console.log(error);
  }
};

export const GetGameMoves = async (wagerAddress: string) => {
  let { provider } = await setupProvider();
  await updateContractAddresses();

  const chess = new ethers.Contract(ChessAddress, chessWagerABI, provider);

  try {
    const gameID = 0;

    const data = await chess.getGameMoves(wagerAddress, gameID);
    const hexMoves = data.moves;

    const algebraeicMoves = [];
    for (let i = 0; i < hexMoves.length; i++) {
      const algebraeicMove = await chess.hexToMove(hexMoves[i]);
      algebraeicMoves.push(algebraeicMove);
    }

    return algebraeicMoves;
  } catch (error) {
    alert(`Get game moves: ${wagerAddress} not found`);
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
        timePerMove: parseInt(wagerParams[4]),
        numberOfGames: parseInt(wagerParams[5]),
        isInProgress: wagerParams[6],
      };
      allWagerParams.push(card);
    }

    let totalNumberOfGames = 0;
    for (let i = 0; i < allWagerParams.length; i++) {
      totalNumberOfGames += allWagerParams[i].numberOfGames;
    }

    return [wagerAddresses, totalNumberOfGames.toString()];
  } catch (error) {
    alert(`error`);
    console.log(error);
    return [[], ''];
  }
};

export const PlayMove = async (wagerAddress: string, move: string) => {
  await updateContractAddresses();

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const accounts = await provider.send('eth_requestAccounts', []);

  const chess = new ethers.Contract(ChessAddress, chessWagerABI, signer);
  try {
    const hex_move = await chess.moveToHex(move);
    console.log(hex_move);

    const tx = await chess.playMove(wagerAddress, hex_move);
    await tx.wait();

    return true;
  } catch (error) {
    alert(`wager address: ${wagerAddress} not found`);
    console.log(error);
  }
};

export const IsPlayerWhite = async (wagerAddress: string) => {
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
      console.log(isPlayerWhite);

      return isPlayerWhite;
    } catch (error) {
      alert(`wager address: ${wagerAddress} not found`);
      console.log(error);
    }
  } else {
    return false;
  }
};

export const GetPlayerTurn = async (wagerAddress: string) => {
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

      console.log(isPlayerTurn);

      return isPlayerTurn;
    } catch (error) {
      alert(`In playerturn : ${wagerAddress} not found`);
      console.log(error);
    }
  } else {
    return false;
  }
};

export const GetNumberOfGames = async (wagerAddress: string) => {
  let { signer } = await setupProvider();

  console.log('GET NUMBER OF GAMES');

  await updateContractAddresses();

  const chess = new ethers.Contract(ChessAddress, chessWagerABI, signer);
  try {
    console.log('In Get Player Turn');

    const wagerParams = await chess.gameWagers(wagerAddress);
    const numberOfGames = parseInt(wagerParams[5]);

    const gameNumber = await chess.getGameLength(wagerAddress);

    const data = [Number(gameNumber) + 1, Number(numberOfGames)];

    return data;
  } catch (error) {
    alert(`In playerturn : ${wagerAddress} not found`);
    console.log(error);
  }
};
