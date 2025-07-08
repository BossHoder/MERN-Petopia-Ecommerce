// ===========================================
// DTO EXPORTS
// ===========================================
// Central export file for all Data Transfer Objects

// Product DTOs
export * from './productDto.js';

// User DTOs
export * from './userDto.js';

// Order DTOs
export * from './orderDto.js';

// Cart DTOs
export * from './cartDto.js';

// Category DTOs
export * from './categoryDto.js';

// Message DTOs
export * from './messageDto.js';

// Coupon DTOs
export * from './couponDto.js';

// Notification DTOs
export * from './notificationDto.js';

// Common DTO utilities
export const createPaginationDto = (data, pagination) => {
    return {
        data,
        pagination: {
            page: pagination.page || 1,
            limit: pagination.limit || 20,
            total: pagination.total || 0,
            pages: pagination.pages || Math.ceil((pagination.total || 0) / (pagination.limit || 20)),
            hasNext: pagination.hasNext || false,
            hasPrev: pagination.hasPrev || false
        }
    };
};

export const createApiResponse = (success, data, message, errors = null) => {
    return {
        success,
        message,
        data,
        errors,
        timestamp: new Date().toISOString()
    };
};

export const createErrorDto = (message, code, details = null) => {
    return {
        error: {
            message,
            code,
            details,
            timestamp: new Date().toISOString()
        }
    };
};

export const createSuccessDto = (data, message = 'Success') => {
    return {
        success: true,
        message,
        data,
        timestamp: new Date().toISOString()
    };
};

export const createListDto = (items, total = null, transform = null) => {
    const data = transform ? items.map(transform) : items;
    return {
        items: data,
        total: total !== null ? total : data.length,
        count: data.length
    };
};

export const createSummaryDto = (data, summary) => {
    return {
        data,
        summary
    };
};

export const createMetadataDto = (data, metadata) => {
    return {
        data,
        metadata: {
            ...metadata,
            generatedAt: new Date().toISOString()
        }
    };
};

export const sanitizeDto = (dto, excludeFields = []) => {
    const sanitized = { ...dto };
    excludeFields.forEach(field => {
        delete sanitized[field];
    });
    return sanitized;
};

export const transformDto = (data, transformer) => {
    if (Array.isArray(data)) {
        return data.map(transformer);
    }
    return transformer(data);
};

export const mergeDto = (...dtos) => {
    return Object.assign({}, ...dtos);
};

export const pickDto = (dto, fields) => {
    const result = {};
    fields.forEach(field => {
        if (field in dto) {
            result[field] = dto[field];
        }
    });
    return result;
};

export const omitDto = (dto, fields) => {
    const result = { ...dto };
    fields.forEach(field => {
        delete result[field];
    });
    return result;
};

// DTO validation helpers
export const validateDto = (dto, schema) => {
    const errors = [];
    
    for (const [field, rules] of Object.entries(schema)) {
        const value = dto[field];
        
        if (rules.required && (value === undefined || value === null)) {
            errors.push(`${field} is required`);
            continue;
        }
        
        if (value !== undefined && rules.type && typeof value !== rules.type) {
            errors.push(`${field} must be of type ${rules.type}`);
        }
        
        if (rules.validator && !rules.validator(value)) {
            errors.push(`${field} is invalid`);
        }
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
};

export const createValidationErrorDto = (errors) => {
    return {
        success: false,
        message: 'Validation failed',
        errors: errors.map(error => ({
            field: error.field || 'unknown',
            message: error.message || 'Invalid value'
        })),
        timestamp: new Date().toISOString()
    };
};

// DTO caching helpers
const dtoCache = new Map();

export const cacheDto = (key, dto, ttl = 300000) => { // 5 minutes default
    dtoCache.set(key, {
        data: dto,
        expiry: Date.now() + ttl
    });
    return dto;
};

export const getCachedDto = (key) => {
    const cached = dtoCache.get(key);
    if (!cached) return null;
    
    if (Date.now() > cached.expiry) {
        dtoCache.delete(key);
        return null;
    }
    
    return cached.data;
};

export const clearDtoCache = (pattern = null) => {
    if (pattern) {
        const regex = new RegExp(pattern);
        for (const key of dtoCache.keys()) {
            if (regex.test(key)) {
                dtoCache.delete(key);
            }
        }
    } else {
        dtoCache.clear();
    }
};

// Performance helpers
export const batchTransformDto = (items, transformer, batchSize = 100) => {
    const results = [];
    
    for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        results.push(...batch.map(transformer));
    }
    
    return results;
};

export const createStatsDto = (data) => {
    return {
        total: data.length,
        processed: data.filter(item => item.processed).length,
        failed: data.filter(item => item.error).length,
        success: data.filter(item => item.success).length,
        timestamp: new Date().toISOString()
    };
};
