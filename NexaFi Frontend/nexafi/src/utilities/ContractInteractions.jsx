const alchemyKey = process.env.REACT_APP_ALCHEMY_KEY;
const { createAlchemyWeb3 } = require('@alch/alchemy-web3');
const web3 = createAlchemyWeb3(alchemyKey);

const contractABI = require('../contract-abi.json');
const contractAddress = process.env.REACT_APP_CONTRACT;

const tokenRegistryContract = new web3.eth.Contract(contractABI, contractAddress);

export const fetchNFTs = async walletAddress => {
  if (window.ethereum) {
    try {
      const nfts = [];
      const currentTokenIds = 2;

      const tokenIds = Array.from({ length: currentTokenIds }, (_, index) => index + 1);
      const balances = await tokenRegistryContract.methods
        .balanceOfBatch(Array(tokenIds.length).fill(walletAddress), tokenIds)
        .call();

      for (let i = 0; i < tokenIds.length; i++) {
        const balance = balances[i];

        const uri = await tokenRegistryContract.methods.uri(tokenIds[i]).call();
        const response = await fetch(uri.replace('{id}', tokenIds[i]));
        const metadata = await response.json();

        if (balance > 0) {
          nfts.push({
            id: tokenIds[i],
            balance: balance,
            metadata: metadata,
          });
        }
      }

      return nfts;
    } catch (err) {
      return [];
    }
  }
};
