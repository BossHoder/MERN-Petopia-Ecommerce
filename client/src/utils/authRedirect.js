/**
 * Utility to handle authentication redirects safely
 * Prevents infinite redirect loops by tracking redirect state
 */

let isRedirecting = false;
let redirectTimeout = null;

/**
 * Safely redirect to login page without causing infinite loops
 * @param {string} currentPath - Current page path
 * @param {Function} navigate - React Router navigate function (optional)
 */
export const safeRedirectToLogin = (currentPath = window.location.pathname, navigate = null) => {
    // Prevent multiple simultaneous redirects
    if (isRedirecting) {
        return;
    }

    // Don't redirect if already on auth pages
    const isAuthPage = currentPath === '/login' || currentPath === '/register';
    if (isAuthPage) {
        return;
    }

    isRedirecting = true;

    // Clear any existing timeout
    if (redirectTimeout) {
        clearTimeout(redirectTimeout);
    }

    try {
        if (navigate && typeof navigate === 'function') {
            // Use React Router navigation (preferred)
            navigate('/login', { replace: true });
        } else {
            // Fallback to history API (avoids full page reload)
            window.history.pushState(null, '', '/login');
            window.dispatchEvent(new PopStateEvent('popstate'));
        }
    } catch (error) {
        console.error('Error during redirect:', error);
        // Last resort: use window.location
        window.location.href = '/login';
    }

    // Reset redirect flag after a delay
    redirectTimeout = setTimeout(() => {
        isRedirecting = false;
    }, 1000);
};

/**
 * Reset redirect state (useful for testing or manual reset)
 */
export const resetRedirectState = () => {
    isRedirecting = false;
    if (redirectTimeout) {
        clearTimeout(redirectTimeout);
        redirectTimeout = null;
    }
};

/**
 * Check if currently in redirect state
 */
export const isCurrentlyRedirecting = () => isRedirecting;
