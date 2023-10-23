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
    gameFEN: string,
    moveNumber: number,
    message: string,
    messageHash: string,
) => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const accounts = await provider.send('eth_requestAccounts', []);
  
    try {
      const signerAddress = accounts[0];
      const signedMessage = await signer.signMessage(ethers.utils.arrayify(messageHash));

      const rawData = JSON.stringify({
        wagerAddress: wagerAddress,
        gameFEN: gameFEN,
        moveNumber: moveNumber,
        message: message,
        signedMessage: signedMessage,
        signerAddress: signerAddress,
      });
    
      // Send the data to the server
      const response = await fetch('https://api.chess.fish/auth', {
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
  

/* 
export const requestSigForJWT = async() => {
    try {
        const message = "Authenticate me!";
        const signerAddress = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const signedMessage = await window.ethereum.request({
            method: 'personal_sign',
            params: [message, signerAddress]
        });

    }
} */

/* export const signTxPushToDB = async () => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const accounts = await provider.send('eth_requestAccounts', []);

  try {
    const message = 'ChessFish Gasless API';
    const signerAddress = accounts[0];
    const signedMessage = await signer.signMessage(message);

    const rawData = JSON.stringify({
      message: message,
      signedMessage: signedMessage,
      signerAddress: signerAddress,
    });

    console.log(rawData);

    // Send the data to the server
    const response = await fetch('https://api.chess.fish/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: message,
        signedMessage: signedMessage,
        signerAddress: signerAddress,
      }),
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
 */