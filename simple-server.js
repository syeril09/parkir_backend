const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.json({ message: 'OK' });
});

app.listen(5000, () => {
  console.log('🚀 Server running on http://localhost:5000');
});
