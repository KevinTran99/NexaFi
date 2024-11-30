import http from 'http';
import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { config } from './config/config.mjs';
import orderbookRouter from './routes/orderbook-routes.mjs';
import { orderbook, blockchainService } from './startup.mjs';

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.locals.broadcast = data => {
  wss.clients.forEach(client => {
    if (client.readyState === 1) {
      client.send(JSON.stringify(data));
    }
  });
};

app.use(cors());
app.use(express.json());
app.use('/api/v1/orderbook', orderbookRouter);

app.get('/health', (_, res) =>
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() })
);

wss.on('connection', ws => {
  console.log('Client connected');

  ws.on('message', message => {
    try {
      const { type, tokenId } = JSON.parse(message);
      if (type === 'SUBSCRIBE_ORDERBOOK') {
        const orderbookData = orderbook.getOrderbookByTokenId(tokenId);
        ws.send(
          JSON.stringify({
            type: 'ORDERBOOK_SNAPSHOT',
            data: {
              tokenId,
              ...orderbookData,
              timestamp: Date.now(),
            },
          })
        );
      }
    } catch (error) {
      console.error('WebSocket error:', error);
    }
  });

  ws.on('error', error => {
    console.error('WebSocket error:', error);
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

const handleBlockchainEvents = {
  onOrderCreated: order => {
    console.log('Order created:', order);
    orderbook.addOrder(order);
    const updatedBook = orderbook.getOrderbookByTokenId(order.tokenId);
    app.locals.broadcast({
      type: 'ORDERBOOK_SNAPSHOT',
      data: { ...updatedBook, tokenId: order.tokenId },
    });
  },
  onOrderFilled: update => {
    console.log('Order filled:', update);
    const result = orderbook.updateOrderFill(update);
    if (result) {
      const updatedBook = orderbook.getOrderbookByTokenId(result.tokenId);
      app.locals.broadcast({
        type: 'ORDERBOOK_SNAPSHOT',
        data: { ...updatedBook, tokenId: result.tokenId },
      });
    }
  },
  onOrderCancelled: update => {
    console.log('Order cancelled:', update);
    const result = orderbook.removeOrder(update.orderId);
    if (result) {
      const updatedBook = orderbook.getOrderbookByTokenId(result.tokenId);
      app.locals.broadcast({
        type: 'ORDERBOOK_SNAPSHOT',
        data: { ...updatedBook, tokenId: result.tokenId },
      });
    }
  },
};

const initialize = async () => {
  try {
    const activeOrders = await blockchainService.initialize();
    orderbook.processOrders(activeOrders);
    blockchainService.listenToEvents(handleBlockchainEvents);
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
