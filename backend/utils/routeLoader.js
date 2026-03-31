// utils/routeLoader.js
const fs = require('fs');
const path = require('path');

class RouteLoader {
  constructor(app) {
    this.app = app;
    this.loadedRoutes = new Map();
  }

  lazyLoad(routePath, routeFile, options = {}) {
    const fullPath = path.join(__dirname, '..', routeFile);
    
    this.app.use(routePath, (req, res, next) => {
      if (!this.loadedRoutes.has(routePath)) {
        console.log(`📦 Loading route: ${routePath}`);
        
        try {
          const routeModule = require(fullPath);
          this.app.use(routePath, routeModule);
          this.loadedRoutes.set(routePath, true);
          console.log(`✅ Loaded: ${routePath}`);
        } catch (error) {
          console.error(`❌ Failed to load ${routePath}:`, error.message);
          return res.status(500).json({ error: 'Route loading failed' });
        }
      }
      next();
    });
  }

  // Check if route file exists before loading
  routeExists(routeFile) {
    const fullPath = path.join(__dirname, '..', routeFile);
    return fs.existsSync(fullPath);
  }
}

module.exports = RouteLoader;