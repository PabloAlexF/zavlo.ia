const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = false;
const hostname = '0.0.0.0';
const port = process.env.PORT || 3000;

console.log('🚀 Starting Next.js server...');
console.log('Environment:', process.env.NODE_ENV);
console.log('Port:', port);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare()
  .then(() => {
    console.log('✅ Next.js app prepared successfully');
    
    createServer(async (req, res) => {
      try {
        const parsedUrl = parse(req.url, true);
        await handle(req, res, parsedUrl);
      } catch (err) {
        console.error('❌ Error handling request:', err);
        res.statusCode = 500;
        res.end('Internal Server Error');
      }
    }).listen(port, (err) => {
      if (err) {
        console.error('❌ Failed to start server:', err);
        throw err;
      }
      console.log(`✅ Server listening on http://${hostname}:${port}`);
    });
  })
  .catch((err) => {
    console.error('❌ Failed to prepare Next.js app:', err);
    console.error('Stack trace:', err.stack);
    process.exit(1);
  });

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  console.error('Stack:', error.stack);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise);
  console.error('Reason:', reason);
});
