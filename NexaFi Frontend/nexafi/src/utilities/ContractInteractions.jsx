const alchemyKey = process.env.REACT_APP_ALCHEMY_KEY;
const { createAlchemyWeb3 } = require('@alch/alchemy-web3');
const web3 = createAlchemyWeb3(alchemyKey);

const contractABI = require('../contract-abi.json');
const contractAddress = process.env.REACT_APP_CONTRACT;

const tokenRegistryContract = new web3.eth.Contract(contractABI, contractAddress);

export const connectWallet = async () => {
  if (window.ethereum) {
    try {
      const addressArray = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      return {
        address: addressArray[0],
        status: '',
      };
    } catch (err) {
      return {
        address: '',
        status: err.message,
      };
    }
  } else {
    return {
      address: '',
      status: (
        <>
          <h2>You don't have a digital wallet, please download one like MetaMask!</h2>
          <p>
            <a target="blank" href="https://metamask.io/download.html">
              Install MetaMask for your browser here!
            </a>
          </p>
        </>
      ),
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
          status: '',
        };
      } else {
        return {
          address: '',
          status: (
            <>
              <h2>Not Connected</h2>
              <p>Please connect your wallet using the top right button to view the dashboard.</p>
            </>
          ),
        };
      }
    } catch (err) {
      return {
        address: '',
        status: err.message,
      };
    }
  } else {
    return {
      status: (
        <>
          <h2>You don't have a digital wallet, please download one like MetaMask!</h2>
          <p>
            <a target="blank" href="https://metamask.io/download.html">
              Install MetaMask for your browser here!
            </a>
          </p>
        </>
      ),
      address: '',
    };
  }
};

export const walletListener = (setWalletAddress, setStatus) => {
  if (window.ethereum) {
    window.ethereum.on('accountsChanged', accounts => {
      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
        setStatus('');
      } else {
        setWalletAddress('');
        setStatus(
          <>
            <h2>Not Connected</h2>
            <p>Please connect your wallet using the top right button to view the dashboard.</p>
          </>
        );
      }
    });
  }
};
