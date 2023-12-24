// import crypto from 'crypto';

import { encrypt, EthEncryptedData } from '@metamask/eth-sig-util';
import { ethers } from 'ethers';

import {
  domain,
  delegationTypes,
  walletGenerationTypes,
} from './signatureConstants';

import { DelegationAndWallet } from './types';

// const gaslessGameABI = require('./contract-abi/gaslessGameABI').abi;

const LOCAL_STORAGE_KEY_PREFIX = 'delegation-';
const ENCRYPTION_KEY_STORAGE_KEY = 'userEncryptionKey';

// Generating a new deterministic wallet based upon the
// wagerAddress and the hash of the user signature of the wagerAddress
export const generateWallet = async (
  chainId: number,
  gaslessGameAddress: string,
  wagerAddress: string,
): Promise<ethers.Wallet> => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  let signer = provider.getSigner();

  const message = {
    wagerAddress: wagerAddress,
  };

  domain.chainId = chainId;
  domain.verifyingContract = gaslessGameAddress;

  const signature = await signer._signTypedData(
    domain,
    walletGenerationTypes,
    message,
  );
  const hashedSignature = ethers.utils.keccak256(signature);

  // Use the hashed signature to generate a deterministic mnemonic
  const mnemonic = ethers.utils.entropyToMnemonic(hashedSignature);

  // Create a wallet using the deterministic mnemonic
  const deterministicWallet = ethers.Wallet.fromMnemonic(mnemonic);

  return deterministicWallet;
};

interface Delegation {
  delegatorAddress: string;
  delegatedAddress: string;
  wagerAddress: string;
}

interface SignedDelegation {
  delegation: Delegation;
  signature: string; // Assuming signature is a hex string
}

function encodeSignedDelegation(
  delegation: Delegation,
  signature: string,
): string {
  const abiCoder = new ethers.utils.AbiCoder();
  const signedDelegation: SignedDelegation = {
    delegation,
    signature,
  };

  return abiCoder.encode(
    [
      'tuple(address delegatorAddress, address delegatedAddress, address wagerAddress)',
      'bytes',
    ],
    [
      signedDelegation.delegation,
      ethers.utils.arrayify(signedDelegation.signature),
    ],
  );
}

export const createDelegation = async (
  chainId: number,
  gaslessGameAddress: string,
  wagerAddress: string,
) => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const signerAddress = await signer.getAddress();

  // 1) create random wallet
  const delegatedSigner: ethers.Wallet = await generateWallet(
    chainId,
    gaslessGameAddress,
    wagerAddress,
  );
  const delegatedSignerAddress = await delegatedSigner.getAddress();

  // 2) create deletation type
  const message = {
    delegatorAddress: signerAddress,
    delegatedAddress: delegatedSignerAddress,
    wagerAddress: wagerAddress,
  };

  domain.chainId = chainId;
  domain.verifyingContract = gaslessGameAddress;

  // 4) Sign the data
  const signature = await signer._signTypedData(
    domain,
    delegationTypes,
    message,
  );
  // 5) Delegation abstraction
  const signedDelegationData = encodeSignedDelegation(message, signature);

  const delegationAndWallet: DelegationAndWallet = {
    delegationSignature: signature, // sig for backend
    signedDelegationData: signedDelegationData, // delegation abstraction for sc
    delegatedWalletMnemonic: delegatedSigner.mnemonic.phrase, // created wallet for frontend signatures
  };

  console.log('delegated wallet', delegatedSigner.getAddress());

  // 6) return delegationAndWallet
  return delegationAndWallet;
};

// Function to get or ask for the encryption key
async function getOrAskForEncryptionKey(provider: any): Promise<string> {
  let encryptionKey = localStorage.getItem(ENCRYPTION_KEY_STORAGE_KEY);

  console.log('encryptionKey from storage:', encryptionKey);
  if (!encryptionKey) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const signerAddress = await signer.getAddress();

    try {
      encryptionKey = await provider.send('eth_getEncryptionPublicKey', [
        signerAddress,
      ]);

      // Check for falsy values (null, undefined, empty string, etc.)
      if (!encryptionKey) {
        throw new Error('Encryption key could not be retrieved');
      } else {
        localStorage.setItem(ENCRYPTION_KEY_STORAGE_KEY, encryptionKey);
      }
    } catch (error) {
      console.error('Error getting encryption key:', error);
      alert('Error occurred while getting encryption key');
      throw error; // Re-throw the error to handle it elsewhere if needed
    }
  }
  console.log('encryptionKey', encryptionKey);
  return encryptionKey;
}

export const stringifiableToHex = (value: string) => {
  return ethers.utils.hexlify(Buffer.from(JSON.stringify(value)));
};

function encryptData(encryptionKey: string, data: DelegationAndWallet): string {
  console.log('ENCRYPTING', data);

  const encryptedData = encrypt({
    publicKey: encryptionKey,
    data: JSON.stringify(data),
    version: 'x25519-xsalsa20-poly1305',
  });

  let encryptedDataString = JSON.stringify(encryptedData);

  return encryptedDataString; // Return the hex string instead of the encrypted data object
}

// Function to decrypt data
async function decryptData(
  provider: any,
  encryptedData: EthEncryptedData,
): Promise<DelegationAndWallet> {
  const accounts = await provider.send('eth_requestAccounts', []);

  try {
    // Decrypt using the hex string
    const decryptedData = JSON.parse(
      await provider.send('eth_decrypt', [
        JSON.stringify(encryptedData),
        accounts[0],
      ]),
    );

    console.log('DECRYPTED', decryptedData);

    return decryptedData;
  } catch (error) {
    console.error('Decryption error', error);
    throw error; // Re-throw the error for further handling if necessary
  }
}

export const getDelegation = async (
  chainId: number,
  gaslessGameAddress: string,
  wagerAddress: string,
): Promise<DelegationAndWallet> => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  // Step 1: Check for encryption key and encrypt/decrypt as necessary
  const encryptionKey = await getOrAskForEncryptionKey(provider);
  const localStorageKey = `${LOCAL_STORAGE_KEY_PREFIX}${wagerAddress}`;
  const encryptedDelegationData = localStorage.getItem(localStorageKey);
  let delegationData: DelegationAndWallet;

  console.log('encryptedDelegationData', encryptedDelegationData);

  // Decrypt if data exists
  if (encryptedDelegationData) {
    const encryptedDelegation: EthEncryptedData = JSON.parse(
      encryptedDelegationData,
    );
    delegationData = await decryptData(provider, encryptedDelegation);
  } else {
    // Step 2: If delegation data doesn't exist, call createDelegation
    delegationData = await createDelegation(
      chainId,
      gaslessGameAddress,
      wagerAddress,
    );

    // Step 3: Encrypt and save the delegation data in local storage
    const encryptedData: string = encryptData(encryptionKey, delegationData);
    localStorage.setItem(localStorageKey, encryptedData);
  }

  console.log('DelegationData', delegationData);

  return delegationData;
};
