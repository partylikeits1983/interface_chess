const ethers = require('ethers');
const { parseUnits } = require('ethers/lib/utils');

const chessWagerABI = require('../../../contract-abi/ChessWagerABI');
const moveVerificationABI = require('../../../contract-abi/MoveVerificationABI.json');

const ChessAddress = '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0';
const VerificationAddress = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';

import { max } from 'date-fns';
// -----------------------------------
import { CreateMatchType } from './types';
// -----------------------------------

const tokenAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

const ERC20ABI = [
  'function transferFrom(address from, address to, uint value)',
  'function transfer(address to, uint value)',
  'function approve(address account, uint amount) returns (bool)',
  'function allowance(address _owner, address _spender) public view returns (uint256 remaining)',
  'function balanceOf(address owner) view returns (uint balance)',
  'event Transfer(address indexed from, address indexed to, address value)',
  'error InsufficientBalance(account owner, uint balance)',
];

export const getBalance = async (address: string) => {
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
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const accounts = await provider.send('eth_requestAccounts', []);

  const token = new ethers.Contract(tokenAddress, ERC20ABI, signer);

  try {
    const value = await token.approve(ChessAddress, amount);
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
  opponentAddress: string;
  wagerToken: string;
  wagerAmount: number;
  timePerMove: number;
  numberOfGames: number;
  isPending: boolean;
}

export const GetAllWagers = async () => {
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

      const card: Card = {
        matchAddress: wagers[i],
        opponentAddress: wagerParams[1],
        wagerToken: wagerParams[2],
        wagerAmount: parseInt(wagerParams[3]),
        timePerMove: parseInt(wagerParams[4]),
        numberOfGames: parseInt(wagerParams[5]),
        isPending: wagerParams[6],
      };

      allWagerParams.push(card);
    }

    return allWagerParams;
  } catch (error) {
    console.log(error);
  }
};

export const getGameMoves = async () => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const accounts = await provider.send('eth_requestAccounts', []);

  const chess = new ethers.Contract(ChessAddress, chessWagerABI, signer);
  try {
    console.log('get all moves');

    const wagers = await chess.getAllUserGames(accounts[0]);

    const wager = wagers[0];
    const gameID = 0;

    const hexMoves = await chess.getGameMoves(wager, gameID);

    const algebraeicMoves = [];
    for (let i = 0; i < hexMoves.length; i++) {
      const algebraeicMove = await chess.hexToMove(hexMoves[i]);
      algebraeicMoves.push(algebraeicMove);
    }

    console.log(algebraeicMoves);

    return algebraeicMoves;
  } catch (error) {
    console.log(error);
  }
};
