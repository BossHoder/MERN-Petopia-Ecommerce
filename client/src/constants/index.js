// Social Authentication URLs
const SERVER_URL = process.env.REACT_APP_SERVER_URL || 'http://localhost:5000';

export const GOOGLE_AUTH_LINK = `${SERVER_URL}/auth/google`;
export const FACEBOOK_AUTH_LINK = `${SERVER_URL}/auth/facebook`;

// API Base URL
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Pet-friendly Color Palette
export const COLORS = {
    BRAND_ORANGE: '#FF6B35',
    BRAND_CREAM: '#FCF9F8',
    BRAND_BROWN_DARK: '#1D120C',
    BRAND_BROWN_LIGHT: '#A16345',
    BRAND_TAN: '#F4EBE6',
    BRAND_BORDER: '#EAD7CD',
};

// Responsive Breakpoints
export const BREAKPOINTS = {
    SM: '640px',
    MD: '768px',
    LG: '1024px',
    XL: '1280px',
};
