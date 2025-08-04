// Date formatting utilities
export const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

export const formatDateTime = (date) => {
    return new Date(date).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

export const formatTimeAgo = (date) => {
    const now = new Date();
    const past = new Date(date);
    const diffInSeconds = Math.floor((now - past) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

    return formatDate(date);
};

// Avatar URL utility
export const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return '/user-icon.png'; // default avatar

    // If already a full URL, return as is
    if (avatarPath.startsWith('http')) return avatarPath;

    // If starts with /public or /uploads, prepend base URL
    if (avatarPath.startsWith('/public') || avatarPath.startsWith('/uploads')) {
        const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        return `${baseUrl}${avatarPath}`;
    }

    // If just filename, assume it's in public/images (for backward compatibility)
    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    return `${baseUrl}/public/images/${avatarPath}`;
};

// String utilities
export const truncateText = (text, maxLength = 100) => {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
};

export const capitalizeFirst = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
};

// Validation utilities
export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const isValidPassword = (password) => {
    return password.length >= 6;
};
