import { ethers } from 'ethers';

import { EthEncryptedData } from '@metamask/eth-sig-util';

export const stringifiableToHex = (value: EthEncryptedData) => {
  return ethers.utils.hexlify(Buffer.from(JSON.stringify(value)));
};

export const hexToStringifiable = (hexValue: string): EthEncryptedData => {
  const jsonString = ethers.utils.toUtf8String(hexValue);
  return JSON.parse(jsonString);
};
