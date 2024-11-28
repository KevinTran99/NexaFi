import express from 'express';
import cors from 'cors';
import http from 'http';
import { config } from './config/config.mjs';
import orderbookRouter from './routes/orderbook-routes.mjs';
import { orderbook, blockchainService } from './startup.mjs';

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

app.use('/api/v1/orderbook', orderbookRouter);

app.get('/health', (_, res) =>
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() })
);

const initialize = async () => {
  try {
    const activeOrders = await blockchainService.initialize();
    orderbook.processOrders(activeOrders);
  } catch (error) {
    console.error('Initialization error:', error);
  }
};

const PORT = config.PORT;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${config.NODE_ENV} mode`);
  initialize();
});

process.on('SIGTERM', () => {
  server.close(() => process.exit(0));
});
