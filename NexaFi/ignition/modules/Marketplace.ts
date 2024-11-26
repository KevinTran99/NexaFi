import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

const MarketplaceModule = buildModule('MarketplaceModule', m => {
  const testUSDTAddress = '0x2dfe6851783E901D0f0745684fF7bf7F50bBc371';
  const tokenRegistryAddress = '0x969648fFC0c0D2d9C72B1e7d1D00738c8A1D9A46';

  const marketplace = m.contract('Marketplace', [testUSDTAddress, tokenRegistryAddress]);

  return { marketplace };
});

export default MarketplaceModule;
