const fs = require('fs');
const path = require('path');

class RouteLoader {
  constructor(app) {
    this.app = app;
    this.loadedRoutes = new Map();
  }

  lazyLoad(routePath, routeFile) {
    const fullPath = path.join(__dirname, '..', routeFile);

    this.app.use(routePath, (req, res, next) => {
      if (!this.loadedRoutes.has(routePath)) {
        try {
          const routeModule = require(fullPath);
          this.loadedRoutes.set(routePath, routeModule);
        } catch (error) {
          console.error(`❌ Failed to load ${routePath}:`, error.message);
          return res.status(500).json({ error: 'Route loading failed' });
        }
      }
      // Delegate to the cached router directly — no double app.use()
      this.loadedRoutes.get(routePath)(req, res, next);
    });
  }

  routeExists(routeFile) {
    const fullPath = path.join(__dirname, '..', routeFile);
    return fs.existsSync(fullPath);
  }
}

module.exports = RouteLoader;
