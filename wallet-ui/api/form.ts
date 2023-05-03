const ethers = require('ethers');

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

export const transfer = async (from: string) => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();

  console.log(signer);

  const token = new ethers.Contract(tokenAddress, ERC20ABI, signer);

  const to = '0x3f616e00827cf8be61102d222ef392a3890f5e98';

  console.log('here');

  try {
    const tx = await token.transfer(to, 100);

    await tx.wait();
    alert('success');

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
