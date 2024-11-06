const PORT = 9000;
const express = require('express');
const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.send('This server is running new');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
