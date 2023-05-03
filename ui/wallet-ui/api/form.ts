const ethers = require('ethers');
const { parseUnits } = require('ethers/lib/utils');

const chessWagerABI = require('../../../contract-abi/ChessWagerABI');
const moveVerificationABI = require('../../../contract-abi/MoveVerificationABI.json');

const ChessAddress = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';
const VerificationAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

// -----------------------------------
const { CreateMatchType } = require('./types');
// -----------------------------------

const tokenAddress = '0x8464135c8F25Da09e49BC8782676a84730C318bC';

const ERC20ABI = [
  'function transferFrom(address from, address to, uint value)',
  'function transfer(address to, uint value)',
  'function approve(address account, uint amount) view returns (bool)',
  'function balanceOf(address owner) view returns (uint balance)',
  'function write(uint val)',
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

export const approve = async (address: string) => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();

  const token = new ethers.Contract(tokenAddress, ERC20ABI, signer);

  try {
    const value = await token.approve(address, 100);
    // const balance = ethers.utils.formatEther(value);

    alert('success');

    console.log('success');
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

  // const moveVerification = new ethers.Contract(VerificationAddress, moveVerificationABI, signer)
  const chess = new ethers.Contract(ChessAddress, chessWagerABI, signer);
  const verifier = new ethers.Contract(
    VerificationAddress,
    moveVerificationABI,
    signer,
  );

  try {
    console.log('attempting to view');

    console.log('MOVES LENGTH');
    console.log(moves.length);

    let hexMoves = [];
    for (let i = 0; i < moves.length; i++) {
      hexMoves[i] = await chess.moveToHex(moves[i]);
    }

    // console.log(hexMoves);

    const tx = await verifier.checkGameFromStart(hexMoves);

    // const tx = await chess.moveToHex(moves[]);

    // console.log(tx);

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
