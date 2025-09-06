// Backend/server.js
const http = require('http');
const app = require('./src/app'); // adjust path if app.js is in a different location

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
  console.log('Environment:', process.env.NODE_ENV || 'development');
});
