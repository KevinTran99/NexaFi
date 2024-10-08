import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

const TokenRegistryModule = buildModule('TokenRegistryModule', m => {
  const tokenRegistry = m.contract('TokenRegistry');

  return { tokenRegistry };
});

export default TokenRegistryModule;
