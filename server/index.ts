import { fileURLToPath } from "url";
import { dirname } from "path";
import { Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import path from "path";
import { pool } from "./db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let express: typeof import("express");
let app: import("express").Express;

(async () => {
  try {
    console.log("🧠 Initializing Express…");
    const expressModule = await import("express");
    const expressFn = (expressModule as any).default || expressModule;
    express = expressFn;
    app = expressFn();

    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    console.log("🔌 Middleware mounted");

    // API logging middleware
    app.use((req: Request, res: Response, next: NextFunction) => {
      const start = Date.now();
      const path = req.path;
      let capturedJsonResponse: Record<string, any> | undefined;

      const originalJson: (...args: any[]) => Response = res.json;
      res.json = function (body: any, ...args: any[]) {
        capturedJsonResponse = body;
        return originalJson.apply(this, [body, ...args]);
      };

      res.on("finish", () => {
        if (path.startsWith("/api") || path === "/ping-db") {
          const duration = Date.now() - start;
          let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
          if (capturedJsonResponse) {
            logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
          }
          if (logLine.length > 80) logLine = logLine.slice(0, 79) + "…";
          log(logLine);
        }
      });

      next();
    });

    // DB ping route
    app.get("/ping-db", async (_req: Request, res: Response) => {
      try {
        const result = await pool.query("SELECT NOW()");
        res.json({ time: result.rows[0].now });
      } catch (err) {
        console.error("❌ Database connection failed:", err);
        res.status(500).send("Database connection failed");
      }
    });

    console.log("📦 Registering backend routes…");
    await registerRoutes(app);
    console.log("✅ Routes registered");

    // Error handler
    app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
      const status = (err as any).status || 500;
      const message = (err as any).message || "Internal Server Error";
      res.status(status).json({ message });
      console.error("❌ Server error:", err);
    });

    // Port and Host
    const port = parseInt(process.env.PORT || "5000", 10);
    const host = process.env.HOST || "0.0.0.0";
    console.log(`🔗 Listening on PORT: ${port} (env: ${process.env.PORT})`);

    // Start Express server
    const server = app.listen(port, host, () => {
      log(`✅ Server is live at http://${host}:${port}`);
      console.log(`🚀 Listening on ${host}:${port}`);
    });

    // Frontend serving logic
    if (app.get("env") === "development") {
      console.log("🛠️ Dev mode — running Vite");
      await setupVite(app, server);
      console.log("⚙️ Vite setup complete");
    } else {
      console.log("🚀 Production mode — serving static frontend");

      const distPath = path.resolve(__dirname, "../client/dist");
      const assetsPath = path.resolve(distPath, "assets");

      app.use("/assets", express.static(assetsPath));
      console.log("🗂️ Assets route mounted from:", assetsPath);

      app.use(express.static(distPath));
      console.log("🧱 Root static served from:", distPath);

      // Serve index.html for SPA routes
      app.get("/", (_req: Request, res: Response) => {
        console.log("🌐 Root GET — serving index.html");
        res.sendFile(path.join(distPath, "index.html"));
      });

      app.get("*", (_req: Request, res: Response) => {
        console.log("🔁 Wildcard GET — serving index.html");
        res.sendFile(path.join(distPath, "index.html"));
      });
    }

    console.log("✅ Application boot finished. Server is running.");

  } catch (error) {
    console.error("🔥 Boot failure:", error);
    process.exit(1);
  }
})();
