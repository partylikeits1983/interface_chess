const ethers = require('ethers');

export const postDataToRedis = async (
  key: string,
  value: any,
): Promise<void> => {
  try {
    const response = await fetch('https://api.chess.fish/set-redis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ key, value }),
    });

    const data: { error?: string } = await response.json();
    console.log(data);

    if (response.ok) {
      console.log('Data set in Redis successfully.');
    } else {
      console.error('Failed to set data in Redis:', data.error);
    }
  } catch (error: any) {
    console.error('Error:', error);
  }
};

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
      `https://api.chess.fish/isGameGasless/${gameWager}`,
    );
    const data = await response.json();
    const { isGasless } = data;
    return isGasless;
  } catch (error) {
    console.error('Error:', error);
    throw new Error('Failed to check if game is gasless.');
  }
};
