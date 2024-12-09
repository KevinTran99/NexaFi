const switchToSepolia = async () => {
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0xaa36a7' }],
    });
    return true;
  } catch (error) {
    if (error.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: '0xaa36a7',
              chainName: 'Sepolia',
              nativeCurrency: { symbol: 'ETH', decimals: 18, name: 'Ethereum' },
              rpcUrls: [`wss://eth-sepolia.g.alchemy.com/v2/${process.env.REACT_APP_ALCHEMY_KEY}`],
              blockExplorerUrls: ['https://sepolia.etherscan.io'],
            },
          ],
        });
        return true;
      } catch (addError) {
        return false;
      }
    }
    return false;
  }
};

export const connectWallet = async () => {
  if (window.ethereum) {
    try {
      await switchToSepolia();
      const addressArray = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      return {
        address: addressArray[0],
      };
    } catch (err) {
      return {
        address: '',
        error: err.message || 'An unknown error occurred.',
      };
    }
  } else {
    return {
      address: '',
      error: 'No digital wallet detected. Please install a wallet like MetaMask.',
    };
  }
};

export const getConnectedWallet = async () => {
  if (window.ethereum) {
    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      if (chainId !== '0xaa36a7') {
        return { address: '' };
      }

      const accounts = await window.ethereum.request({
        method: 'eth_accounts',
      });

      return {
        address: accounts[0] || '',
      };
    } catch (err) {
      return {
        address: '',
        error: err.message || 'An unknown error occurred.',
      };
    }
  }
};

export const walletListener = setWalletAddress => {
  if (window.ethereum) {
    window.ethereum.on('accountsChanged', accounts => {
      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
      } else {
        setWalletAddress('');
      }
    });

    window.ethereum.on('chainChanged', async () => {
      const { address } = await getConnectedWallet();
      setWalletAddress(address);
    });
  }
};
