/**
 * Custom Next.js Server with HTTP and HTTPS Support
 * 
 * This enables:
 * - HTTPS on localhost:3000 (for Google OAuth)
 * - HTTP on 127.0.0.1:3000 (for Spotify OAuth, which requires loopback IP)
 */

const { createServer: createHttpsServer } = require("https");
const { createServer: createHttpServer } = require("http");
const { parse } = require("url");
const next = require("next");
const fs = require("fs");
const path = require("path");

const dev = process.env.NODE_ENV !== "production";
const port = 3000;

const app = next({ dev, hostname: "localhost", port });
const handle = app.getRequestHandler();

const httpsOptions = {
  key: fs.readFileSync(path.join(__dirname, ".certs/localhost+2-key.pem")),
  cert: fs.readFileSync(path.join(__dirname, ".certs/localhost+2.pem")),
};

app.prepare()
  .then(() => {
    console.log("✅ Next.js app prepared");
    
    // HTTPS server for localhost (Google OAuth)
    const httpsServer = createHttpsServer(httpsOptions, async (req, res) => {
      try {
        const parsedUrl = parse(req.url, true);
        await handle(req, res, parsedUrl);
      } catch (err) {
        console.error("Error occurred handling", req.url, err);
        res.statusCode = 500;
        res.end("internal server error");
      }
    });
    
    httpsServer.listen(port, "localhost", (err) => {
      if (err) {
        console.error("HTTPS server error:", err);
        throw err;
      }
      console.log(`> HTTPS ready on https://localhost:${port}`);
    });

    // HTTP server for 127.0.0.1 (Spotify OAuth - requires loopback IP with HTTP)
    const httpServer = createHttpServer(async (req, res) => {
      try {
        const parsedUrl = parse(req.url, true);
        await handle(req, res, parsedUrl);
      } catch (err) {
        console.error("Error occurred handling", req.url, err);
        res.statusCode = 500;
        res.end("internal server error");
      }
    });
    
    httpServer.listen(port, "127.0.0.1", (err) => {
      if (err) {
        console.error("HTTP server error:", err);
        throw err;
      }
      console.log(`> HTTP ready on http://127.0.0.1:${port}`);
    });
  })
  .catch((err) => {
    console.error("Failed to prepare Next.js app:", err);
    process.exit(1);
  });

