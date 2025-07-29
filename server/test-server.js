const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Server root is alive!');
});

app.get('/ping', (req, res) => {
  res.send('Pong from test server!');
});

app.listen(5000, () => {
  console.log('✅ Test server running on port 5000');
});
