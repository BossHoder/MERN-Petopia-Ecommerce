import 'dotenv/config.js';
import express from 'express';

const app = express();
const PORT = process.env.PORT || 5000;


app.get('/routetest', (req, res) => {
  res.send('Route is working!');
});

app.get('/dynamic', (req, res) => {
  res.send('Route is working!');
});

app.listen(PORT, (err) => {
  console.log(`Server is running on localhost:${PORT}`);
});