import { ethers } from 'ethers';

const alchemyKey = process.env.REACT_APP_ALCHEMY_KEY;
const provider = new ethers.WebSocketProvider(`wss://polygon-amoy.g.alchemy.com/v2/${alchemyKey}`);

const contractABI = require('../contract-abi.json');
const contractAddress = process.env.REACT_APP_CONTRACT;

export const fetchNFTs = async walletAddress => {
  try {
    const nfts = [];
    const currentTokenIds = 2;
    const tokenIds = Array.from({ length: currentTokenIds }, (_, index) => index + 1);

    const tokenRegistryContract = new ethers.Contract(contractAddress, contractABI, provider);

    const balances = await tokenRegistryContract.balanceOfBatch(Array(tokenIds.length).fill(walletAddress), tokenIds);

    for (let i = 0; i < tokenIds.length; i++) {
      const balance = Number(balances[i]);

      if (balance > 0) {
        const uri = await tokenRegistryContract.uri(tokenIds[i]);
        const response = await fetch(uri.replace('{id}', tokenIds[i]));
        const metadata = await response.json();

        nfts.push({
          id: tokenIds[i],
          balance: balance,
          metadata: metadata,
        });
      }
    }

    return nfts;
  } catch (err) {
    console.error('Error fetching NFTs:', err);
    return [];
  }
};

export const burnForRetirement = async (tokenId, amount) => {
  if (!window.ethereum) {
    console.error('Ethereum wallet is not connected');
    return;
  }

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const tokenRegistryContract = new ethers.Contract(contractAddress, contractABI, signer);

    const tx = await tokenRegistryContract.burnForRetirement(tokenId, amount);

    const receipt = await tx.wait();

    return {
      success: true,
      transaction: tx,
      receipt: receipt,
    };
  } catch (err) {
    console.error('Error burning NFT:', err);
    throw new Error(err.message || 'Failed to burn NFT');
  }
};

export const burnForExchange = async (tokenId, amount) => {
  if (!window.ethereum) {
    console.error('Ethereum wallet is not connected');
    return;
  }

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const tokenRegistryContract = new ethers.Contract(contractAddress, contractABI, signer);

    const tx = await tokenRegistryContract.burnForExchange(tokenId, amount);

    const receipt = await tx.wait();

    return {
      success: true,
      transaction: tx,
      receipt: receipt,
    };
  } catch (err) {
    console.error('Error burning NFT:', err);
    throw new Error(err.message || 'Failed to burn NFT');
  }
};
