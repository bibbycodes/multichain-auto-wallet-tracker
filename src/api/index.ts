import express from 'express';
import bodyParser from 'body-parser';
import { QueueDashboard } from '../queues/dashboard';

const app = express();
const port = 4200;

// Middleware to parse JSON body
app.use(bodyParser.json());

// Initialize queue dashboard
const queueDashboard = new QueueDashboard();

// Mount queue dashboard routes directly
const dashboardRouter = queueDashboard.getRouter();
app.use('/admin/queues', dashboardRouter);

// Test route to verify mounting
app.get('/admin/test', (req, res) => {
  res.json({ message: 'Admin routes are working', timestamp: new Date().toISOString() });
});

// POST endpoint for '/webhooks/moralis'
app.post('/webhooks/moralis', (req, res) => {
  console.log('Received webhook:', JSON.stringify(req.body));
  res.status(200).send('Webhook received');
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Queue stats endpoint
app.get('/admin/api/queue-stats', async (req, res) => {
  try {
    const stats = await queueDashboard.getQueueStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch queue stats',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  console.log(`Queue Dashboard: http://localhost:${port}/admin/queues`);
  console.log(`Queue Stats API: http://localhost:${port}/admin/api/queue-stats`);
});
