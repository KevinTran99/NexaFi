import { ethers } from 'ethers';
import tokenRegistryABI from '../token-registry-abi.json';
import marketplaceABI from '../marketplace-abi.json';
import usdtABI from '../usdt-abi.json';

const alchemyKey = process.env.REACT_APP_ALCHEMY_KEY;
const provider = new ethers.WebSocketProvider(`wss://eth-sepolia.g.alchemy.com/v2/${alchemyKey}`);

const TOKEN_REGISTRY_ADDRESS = process.env.REACT_APP_TOKEN_REGISTRY_ADDRESS;
const USDT_ADDRESS = process.env.REACT_APP_USDT_ADDRESS;
const MARKETPLACE_ADDRESS = process.env.REACT_APP_MARKETPLACE_ADDRESS;

const switchNetwork = async () => {
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0xaa36a7' }],
    });
  } catch (error) {
    if (error.code === 4902) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: '0xaa36a7',
            chainName: 'Sepolia',
            nativeCurrency: { symbol: 'ETH', decimals: 18, name: 'Ethereum' },
            rpcUrls: [`wss://eth-sepolia.g.alchemy.com/v2/${alchemyKey}`],
            blockExplorerUrls: ['https://sepolia.etherscan.io'],
          },
        ],
      });
    }
  }
};

export const mintUSDT = async amount => {
  if (!window.ethereum) {
    console.error('Wallet is not connected');
    return;
  }

  try {
    await switchNetwork();
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const usdtContract = new ethers.Contract(USDT_ADDRESS, usdtABI, signer);
    const amountInWei = ethers.parseUnits(amount, 6);

    const tx = await usdtContract.mint(amountInWei);
    const receipt = await tx.wait();

    return { success: true, transaction: tx, receipt: receipt };
  } catch (err) {
    throw new Error(err.message || 'Failed to mint USDT');
  }
};

export const fetchUSDTBalance = async walletAddress => {
  try {
    if (!window.ethereum || !walletAddress) {
      return '0';
    }

    await switchNetwork();
    const provider = new ethers.BrowserProvider(window.ethereum);
    const usdtContract = new ethers.Contract(
      USDT_ADDRESS,
      ['function balanceOf(address) view returns (uint256)'],
      provider
    );

    const balance = await usdtContract.balanceOf(walletAddress);
    return balance.toString();
  } catch (error) {
    console.error('Error fetching USDT balance:', error);
    return '0';
  }
};

export const fetchNFTs = async walletAddress => {
  try {
    const nfts = [];
    const currentTokenIds = 2;
    const tokenIds = Array.from({ length: currentTokenIds }, (_, index) => index + 1);

    const tokenRegistryContract = new ethers.Contract(
      TOKEN_REGISTRY_ADDRESS,
      tokenRegistryABI,
      provider
    );

    const balances = await tokenRegistryContract.balanceOfBatch(
      Array(tokenIds.length).fill(walletAddress),
      tokenIds
    );

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

export const mint = async (tokenId, amount) => {
  if (!window.ethereum) {
    console.error('Wallet is not connected');
    return;
  }

  try {
    await switchNetwork();
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const tokenRegistryContract = new ethers.Contract(
      TOKEN_REGISTRY_ADDRESS,
      tokenRegistryABI,
      signer
    );

    const tx = await tokenRegistryContract.mint(await signer.getAddress(), tokenId, amount);
    const receipt = await tx.wait();

    return { success: true, transaction: tx, receipt: receipt };
  } catch (err) {
    console.error('Error minting NFT:', err);
    throw new Error(err.message || 'Failed to mint NFT');
  }
};

export const burnForRetirement = async (tokenId, amount) => {
  if (!window.ethereum) {
    console.error('Wallet is not connected');
    return;
  }

  try {
    await switchNetwork();
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const tokenRegistryContract = new ethers.Contract(
      TOKEN_REGISTRY_ADDRESS,
      tokenRegistryABI,
      signer
    );

    const tx = await tokenRegistryContract.burnForRetirement(tokenId, amount);
    const receipt = await tx.wait();

    return { success: true, transaction: tx, receipt: receipt };
  } catch (err) {
    console.error('Error burning NFT:', err);
    throw new Error(err.message || 'Failed to burn NFT');
  }
};

export const burnForExchange = async (tokenId, amount) => {
  if (!window.ethereum) {
    console.error('Wallet is not connected');
    return;
  }

  try {
    await switchNetwork();
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const tokenRegistryContract = new ethers.Contract(
      TOKEN_REGISTRY_ADDRESS,
      tokenRegistryABI,
      signer
    );

    const tx = await tokenRegistryContract.burnForExchange(tokenId, amount);
    const receipt = await tx.wait();

    return { success: true, transaction: tx, receipt: receipt };
  } catch (err) {
    console.error('Error burning NFT:', err);
    throw new Error(err.message || 'Failed to burn NFT');
  }
};

export const checkTokenApprovals = async (orderType, price, amount, walletAddress) => {
  if (!window.ethereum) {
    throw new Error('Please connect your wallet');
  }

  try {
    await switchNetwork();
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    if (orderType === 'buy') {
      const usdtContract = new ethers.Contract(
        USDT_ADDRESS,
        [
          'function allowance(address,address) view returns (uint256)',
          'function approve(address,uint256)',
        ],
        signer
      );

      const allowance = await usdtContract.allowance(walletAddress, MARKETPLACE_ADDRESS);
      const priceInWei = ethers.parseUnits(price, 6);
      const totalCost = priceInWei * BigInt(amount);

      if (allowance < totalCost) {
        const approveTx = await usdtContract.approve(MARKETPLACE_ADDRESS, ethers.MaxUint256);
        await approveTx.wait();
      }
    } else {
      const nftContract = new ethers.Contract(
        TOKEN_REGISTRY_ADDRESS,
        [
          'function isApprovedForAll(address,address) view returns (bool)',
          'function setApprovalForAll(address,bool)',
        ],
        signer
      );

      const isApproved = await nftContract.isApprovedForAll(walletAddress, MARKETPLACE_ADDRESS);

      if (!isApproved) {
        const approveTx = await nftContract.setApprovalForAll(MARKETPLACE_ADDRESS, true);
        await approveTx.wait();
      }
    }

    return true;
  } catch (err) {
    throw err;
  }
};

export const executeMarketOrder = async (orderType, matches) => {
  if (!window.ethereum) throw new Error('Please connect your wallet');

  try {
    await switchNetwork();
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const marketplaceContract = new ethers.Contract(MARKETPLACE_ADDRESS, marketplaceABI, signer);

    let tx;
    if (orderType === 'buy') {
      tx = await marketplaceContract.marketBuy(
        matches.orderIds,
        matches.amounts,
        matches.totalUsdt
      );
    } else {
      tx = await marketplaceContract.marketSell(
        matches.orderIds,
        matches.amounts,
        matches.totalNfts,
        '1'
      );
    }

    await tx.wait();
    return tx;
  } catch (err) {
    throw err;
  }
};

export const createLimitOrder = async (orderType, price, amount) => {
  if (!window.ethereum) throw new Error('Please connect your wallet');

  try {
    await switchNetwork();
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const marketplaceContract = new ethers.Contract(MARKETPLACE_ADDRESS, marketplaceABI, signer);

    const priceInWei = ethers.parseUnits(price, 6);
    const tx =
      orderType === 'buy'
        ? await marketplaceContract.createBuyOrder('1', priceInWei, amount)
        : await marketplaceContract.createSellOrder('1', priceInWei, amount);

    await tx.wait();
    return tx;
  } catch (err) {
    throw err;
  }
};
