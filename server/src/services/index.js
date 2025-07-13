// ===========================================
// SERVICE EXPORTS
// ===========================================
// Central export file for all service classes

// Core business services
export { default as productService } from './productService.js';
export { default as userService } from './userService.js';
export { default as orderService } from './orderService.js';
export { default as couponService } from './couponService.js';
export { default as notificationService } from './notificationService.js';

// Authentication services
export { default as jwtStrategy } from './jwtStrategy.js';
export { default as localStrategy } from './localStrategy.js';
export { default as googleStrategy } from './googleStrategy.js';
export { default as facebookStrategy } from './facebookStrategy.js';

// Validation services
export { default as validators } from './validators.js';

// Service registry for dependency injection
export const serviceRegistry = {
    productService: null,
    userService: null,
    orderService: null,
    couponService: null,
    notificationService: null,
};

// Initialize services
export const initializeServices = async () => {
    try {
        // Import services dynamically to avoid circular dependencies
        const { default: ProductService } = await import('./productService.js');
        const { default: UserService } = await import('./userService.js');
        const { default: OrderService } = await import('./orderService.js');
        const { default: CouponService } = await import('./couponService.js');
        const { default: NotificationService } = await import('./notificationService.js');

        // Register services
        serviceRegistry.productService = ProductService;
        serviceRegistry.userService = UserService;
        serviceRegistry.orderService = OrderService;
        serviceRegistry.couponService = CouponService;
        serviceRegistry.notificationService = NotificationService;

        console.log('✅ Services initialized successfully');
        return serviceRegistry;
    } catch (error) {
        console.error('❌ Error initializing services:', error);
        throw error;
    }
};

// Get service instance
export const getService = (serviceName) => {
    const service = serviceRegistry[serviceName];
    if (!service) {
        throw new Error(`Service ${serviceName} not found. Make sure to initialize services first.`);
    }
    return service;
};

// Service health check
export const checkServicesHealth = async () => {
    const health = {
        status: 'healthy',
        services: {},
        timestamp: new Date().toISOString(),
    };

    try {
        // Check each service
        for (const [name, service] of Object.entries(serviceRegistry)) {
            if (service && typeof service.healthCheck === 'function') {
                try {
                    await service.healthCheck();
                    health.services[name] = { status: 'healthy' };
                } catch (error) {
                    health.services[name] = {
                        status: 'unhealthy',
                        error: error.message,
                    };
                    health.status = 'degraded';
                }
            } else {
                health.services[name] = { status: 'unknown' };
            }
        }
    } catch (error) {
        health.status = 'unhealthy';
        health.error = error.message;
    }

    return health;
};

// Graceful shutdown
export const shutdownServices = async () => {
    console.log('🔄 Shutting down services...');

    try {
        // Shutdown services that have cleanup methods
        for (const [name, service] of Object.entries(serviceRegistry)) {
            if (service && typeof service.shutdown === 'function') {
                try {
                    await service.shutdown();
                    console.log(`✅ ${name} shut down successfully`);
                } catch (error) {
                    console.error(`❌ Error shutting down ${name}:`, error);
                }
            }
        }

        // Clear registry
        Object.keys(serviceRegistry).forEach((key) => {
            serviceRegistry[key] = null;
        });

        console.log('✅ All services shut down successfully');
    } catch (error) {
        console.error('❌ Error during service shutdown:', error);
        throw error;
    }
};

// Service middleware for Express
export const serviceMiddleware = (req, res, next) => {
    req.services = serviceRegistry;
    next();
};

// Service decorator for error handling
export const withErrorHandling = (service) => {
    return new Proxy(service, {
        get(target, prop) {
            const originalMethod = target[prop];

            if (typeof originalMethod === 'function') {
                return async (...args) => {
                    try {
                        return await originalMethod.apply(target, args);
                    } catch (error) {
                        console.error(`Error in ${target.constructor.name}.${prop}:`, error);
                        return {
                            success: false,
                            error: error.message,
                            timestamp: new Date().toISOString(),
                        };
                    }
                };
            }

            return originalMethod;
        },
    });
};

// Service metrics
export const getServiceMetrics = () => {
    const metrics = {
        totalServices: Object.keys(serviceRegistry).length,
        activeServices: Object.values(serviceRegistry).filter((s) => s !== null).length,
        services: {},
        timestamp: new Date().toISOString(),
    };

    // Get metrics from services that support it
    for (const [name, service] of Object.entries(serviceRegistry)) {
        if (service && typeof service.getMetrics === 'function') {
            try {
                metrics.services[name] = service.getMetrics();
            } catch (error) {
                metrics.services[name] = { error: error.message };
            }
        }
    }

    return metrics;
};
