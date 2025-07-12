import { Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

let express: typeof import("express");
let app: import("express").Express;


(async () => {
  const expressModule = await import("express");
  // Some environments require .default, some do not
  const expressFn = (expressModule as any).default || expressModule;
  express = expressFn;
  app = expressFn();

  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  // 🛠️ Logging middleware for API routes
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
      if (path.startsWith("/api")) {
        const duration = Date.now() - start;
        let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;

        if (capturedJsonResponse) {
          logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
        }

        if (logLine.length > 80) {
          logLine = logLine.slice(0, 79) + "…";
        }

        log(logLine);
      }
    });

    next();
  });

  const server = await registerRoutes(app);

  // 🧯 Error handler
  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    const status = (err as any).status || 500;
    const message = (err as any).message || "Internal Server Error";
    res.status(status).json({ message });
    console.error("❌ Server error:", err);
  });

  // 🔧 Environment-specific setup
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // 🖥️ Launch server on local address (Windows-safe)
  const port = parseInt(process.env.PORT || "5000", 10);
  const host = process.env.HOST || "127.0.0.1";

  server.listen(port, host, () => {
    log(`✅ Server is live at http://${host}:${port}`);
  });
})();
