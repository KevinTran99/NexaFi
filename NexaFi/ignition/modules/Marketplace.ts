import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

const MarketplaceModule = buildModule('MarketplaceModule', m => {
  const testUSDTAddress = '0xa8a3FDB4E5366aD53e77cACdC02A2Ee542856159';
  const tokenRegistryAddress = '0xbFF3F1218a302D8c6306650DDaCc06233Fb28911';

  const marketplace = m.contract('Marketplace', [testUSDTAddress, tokenRegistryAddress]);

  return { marketplace };
});

export default MarketplaceModule;
