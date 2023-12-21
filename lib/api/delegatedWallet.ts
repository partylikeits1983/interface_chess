import crypto from "crypto";
import { ethers, Signer } from 'ethers';

import { domain, delegationTypes, walletGenerationTypes } from './signatureConstants';

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

    const signature = await signer._signTypedData(domain, walletGenerationTypes, message);
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
    wagerAddress: string
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
    const delegatedSigner = await generateWallet(chainId, gaslessGameAddress, wagerAddress);
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
    const signature = await signer._signTypedData(domain, delegationTypes, message);
    const signedDelegationData = await gaslessGame.encodeSignedDelegation(message, signature);

    // 5) return the signature and signed delegation data
    return {
        signature, 
        signedDelegationData
    }
}