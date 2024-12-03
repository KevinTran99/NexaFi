import dotenv from 'dotenv';
dotenv.config();

export const config = {
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  ALCHEMY_KEY: process.env.ALCHEMY_KEY || '',
  USDT_ADDRESS: process.env.USDT_ADDRESS || '',
  TOKEN_REGISTRY_ADDRESS: process.env.TOKEN_REGISTRY_ADDRESS || '',
  MARKETPLACE_ADDRESS: process.env.MARKETPLACE_ADDRESS || '',
};
