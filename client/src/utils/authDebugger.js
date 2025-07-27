// Authentication Debugging Utility
// Use this in browser console to debug auth issues

export const authDebugger = {
    // Check current authentication state
    checkAuthState: () => {
        const token = localStorage.getItem('token');
        const reduxState = window.__REDUX_DEVTOOLS_EXTENSION__
            ? window.store?.getState()?.auth
            : 'Redux DevTools not available';

        console.log('🔍 Authentication Debug Report:');
        console.log('================================');
        console.log('📦 LocalStorage Token:', token ? 'Present' : 'Missing');
        console.log('🏪 Redux Auth State:', reduxState);

        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                console.log('🎫 Token Payload:', payload);
                console.log('⏰ Token Expires:', new Date(payload.exp * 1000));
                console.log('🕐 Current Time:', new Date());
                console.log('✅ Token Valid:', payload.exp * 1000 > Date.now());
            } catch (e) {
                console.log('❌ Invalid Token Format:', e.message);
            }
        }

        return {
            hasToken: !!token,
            reduxState,
            tokenValid: token ? this.isTokenValid(token) : false,
        };
    },

    // Check if token is valid (not expired)
    isTokenValid: (token) => {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.exp * 1000 > Date.now();
        } catch {
            return false;
        }
    },

    // Test API call with current token
    testApiCall: async (endpoint = '/api/users/me') => {
        const token = localStorage.getItem('token');

        if (!token) {
            console.log('❌ No token found');
            return;
        }

        try {
            const response = await fetch(endpoint, {
                headers: {
                    'x-auth-token': token,
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            console.log('🌐 API Test Result:');
            console.log('Status:', response.status);
            console.log('Response:', data);

            return { status: response.status, data };
        } catch (error) {
            console.log('❌ API Test Failed:', error);
            return { error: error.message };
        }
    },

    // Clear auth state (for testing)
    clearAuth: () => {
        localStorage.removeItem('token');
        console.log('🧹 Authentication cleared');
        window.location.reload();
    },

    // Check if token is expired
    checkTokenExpiry: () => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.log('❌ No token found');
            return { hasToken: false };
        }

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const isExpired = payload.exp * 1000 <= Date.now();
            const expiryDate = new Date(payload.exp * 1000);

            console.log('🎫 Token Expiry Check:', {
                expires: expiryDate.toLocaleString(),
                isExpired,
                timeUntilExpiry: isExpired
                    ? 'EXPIRED'
                    : `${Math.round((payload.exp * 1000 - Date.now()) / 1000 / 60)} minutes`,
            });

            return { hasToken: true, isExpired, expiryDate };
        } catch (e) {
            console.log('❌ Invalid token format');
            return { hasToken: true, isExpired: true, error: 'Invalid format' };
        }
    },

    // Test admin access
    testAdminAccess: async () => {
        return await authDebugger.testApiCall('/api/admin/dashboard/stats');
    },

    // Test user profile access
    testUserAccess: async () => {
        return await authDebugger.testApiCall('/api/users/me');
    },
};

// Make it available globally for console debugging
if (typeof window !== 'undefined') {
    window.authDebugger = authDebugger;
}

export default authDebugger;
