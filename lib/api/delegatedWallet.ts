import crypto from 'crypto';

import { encrypt } from 'eth-sig-util';

import { ethers, Signer } from 'ethers';

import { stringifiableToHex } from './utils';

import {
  domain,
  delegationTypes,
  walletGenerationTypes,
} from './signatureConstants';

const gaslessGameABI = require('./contract-abi/gaslessGameABI').abi;

// Generating a new deterministic wallet based upon the
// wagerAddress and the hash of the user signature of the wagerAddress
export const generateWallet = async (
  chainId: number,
  gaslessGameAddress: string,
  wagerAddress: string,
): Promise<ethers.Signer> => {
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

export const createDelegation = async (
  chainId: number,
  gaslessGameAddress: string,
  wagerAddress: string,
) => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const signerAddress = await signer.getAddress();

  const gaslessGame = new ethers.Contract(
    gaslessGameAddress,
    gaslessGameABI,
    signer,
  );

  // 1) create random wallet
  const delegatedSigner = await generateWallet(
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
  const signedDelegationData = await gaslessGame.encodeSignedDelegation(
    message,
    signature,
  );

  // 5) return the signature and signed delegation data
  return {
    signature,
    signedDelegationData,
  };
};

const LOCAL_STORAGE_KEY_PREFIX = 'delegation-';
const ENCRYPTION_KEY_STORAGE_KEY = 'userEncryptionKey';

// Function to get or ask for the encryption key
async function getOrAskForEncryptionKey(provider: any): Promise<string> {
  let encryptionKey = localStorage.getItem(ENCRYPTION_KEY_STORAGE_KEY);
  if (!encryptionKey) {
    encryptionKey = await provider.request({
      method: 'eth_getEncryptionPublicKey',
      params: [provider.selectedAddress],
    });
    // Ensure encryptionKey is not null before setting it to localStorage
    if (encryptionKey) {
      localStorage.setItem(ENCRYPTION_KEY_STORAGE_KEY, encryptionKey);
    } else {
      // Handle the case where encryptionKey is null
      throw new Error('Encryption key could not be retrieved');
    }
  }
  return encryptionKey;
}

// Function to encrypt data
function encryptData(encryptionKey: string, data: any): string {
  if (!encryptionKey) {
    throw new Error('Invalid encryption key');
  }
  return stringifiableToHex(
    encrypt(
      encryptionKey,
      { data: JSON.stringify(data) },
      'x25519-xsalsa20-poly1305',
    ),
  );
}

// Function to decrypt data
async function decryptData(provider: any, encryptedData: string): Promise<any> {
  const decryptedData = await provider.request({
    method: 'eth_decrypt',
    params: [encryptedData, provider.selectedAddress],
  });
  return JSON.parse(decryptedData);
}

export const getDelegation = async (
  provider: any, // assuming the provider is passed in as an argument
  chainId: number,
  gaslessGameAddress: string,
  wagerAddress: string,
): Promise<{ signature: string; signedDelegationData: string }> => {
  // Step 1: Check for encryption key and encrypt/decrypt as necessary
  const encryptionKey = await getOrAskForEncryptionKey(provider);
  const localStorageKey = `${LOCAL_STORAGE_KEY_PREFIX}${wagerAddress}`;
  const encryptedDelegationData = localStorage.getItem(localStorageKey);
  let delegationData = null;

  // Decrypt if data exists
  if (encryptedDelegationData) {
    delegationData = await decryptData(provider, encryptedDelegationData);
  } else {
    // Step 2: If delegation data doesn't exist, call createDelegation
    delegationData = await createDelegation(
      chainId,
      gaslessGameAddress,
      wagerAddress,
    );

    // Step 3: Encrypt and save the delegation data in local storage
    const encryptedData = encryptData(encryptionKey, delegationData);
    localStorage.setItem(localStorageKey, encryptedData);
  }

  return delegationData;
};
