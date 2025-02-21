import express from 'express';
import { createServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

// Fix __dirname usage in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 4000;

// Create Vite server
async function start() {
  const vite = await createServer({
    server: { middlewareMode: true },
  });

  // Use Vite's middleware to serve the app
  app.use(vite.middlewares);

  // Serve static files (after build)
  app.use(express.static(path.resolve(__dirname, 'dist')));

  // Catch-all route for single-page app
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });

  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
}

start();


