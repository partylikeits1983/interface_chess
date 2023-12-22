import { ethers } from 'ethers';

export const stringifiableToHex = (value: string) => {
  return ethers.utils.hexlify(Buffer.from(JSON.stringify(value)));
};
