import express from 'express';
import bodyParser from 'body-parser';

const app = express();
const port = 4200;

// Middleware to parse JSON body
app.use(bodyParser.json());

// POST endpoint for '/webhooks/moralis'
app.post('/webhooks/moralis', (req, res) => {
  console.log('Received webhook:', JSON.stringify(req.body));
  res.status(200).send('Webhook received');
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
