export const connectWallet = async () => {
  if (window.ethereum) {
    try {
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
      const accounts = await window.ethereum.request({
        method: 'eth_accounts',
      });

      if (accounts.length > 0) {
        return {
          address: accounts[0],
        };
      } else {
        return {
          address: '',
        };
      }
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
  }
};
