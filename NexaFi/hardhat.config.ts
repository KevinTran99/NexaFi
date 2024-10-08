import { HardhatUserConfig, vars } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';

const OKLINK_API_KEY = vars.get('OKLINK_API_KEY');
const ALCHEMY_API_KEY = vars.get('ALCHEMY_API_KEY');
const AMOY_PRIVATE_KEY = vars.get('AMOY_PRIVATE_KEY');

const config: HardhatUserConfig = {
  solidity: '0.8.24',
  etherscan: {
    apiKey: { polygonAmoy: OKLINK_API_KEY },
    customChains: [
      {
        network: 'polygonAmoy',
        chainId: 80002,
        urls: {
          apiURL: 'https://www.oklink.com/api/v5/explorer/contract/verify-source-code-plugin/AMOY_TESTNET',
          browserURL: 'https://www.oklink.com/amoy',
        },
      },
    ],
  },
  networks: {
    polygonAmoy: {
      url: `https://polygon-amoy.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      accounts: [AMOY_PRIVATE_KEY],
    },
  },
};

export default config;
