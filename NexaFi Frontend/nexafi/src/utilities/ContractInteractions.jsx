import { ethers } from 'ethers';

const alchemyKey = process.env.REACT_APP_ALCHEMY_KEY;
const provider = new ethers.WebSocketProvider(`wss://polygon-amoy.g.alchemy.com/v2/${alchemyKey}`);

const contractABI = require('../contract-abi.json');
const contractAddress = process.env.REACT_APP_CONTRACT;

export const fetchNFTs = async walletAddress => {
  if (window.ethereum) {
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
  }
};
