import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

const TestUSDTModule = buildModule('TestUSDTModule', m => {
  const testUSDT = m.contract('TestUSDT');

  return { testUSDT };
});

export default TestUSDTModule;
