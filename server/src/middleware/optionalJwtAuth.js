import passport from 'passport';

/**
 * Optional JWT authentication middleware
 * This middleware will populate req.user if a valid token is provided,
 * but won't reject the request if no token or invalid token is provided.
 * This is useful for endpoints that support both authenticated and guest users.
 */
const optionalJwtAuth = (req, res, next) => {
    const token = req.headers['x-auth-token'];
    
    console.log('🔐 Optional JWT Auth Debug:', {
        path: req.path,
        hasToken: !!token,
        tokenPreview: token ? `${token.substring(0, 20)}...` : 'none',
    });

    // If no token provided, continue as guest
    if (!token) {
        console.log('🔓 No token provided, continuing as guest');
        req.user = null;
        return next();
    }

    // If token provided, try to authenticate
    passport.authenticate('jwt', { session: false }, (err, user, info) => {
        if (err) {
            console.error('Optional JWT Auth Error:', err);
            // Don't fail the request, just continue as guest
            req.user = null;
            return next();
        }
        
        if (!user) {
            console.log('Optional JWT Auth Failed:', info);
            // Don't fail the request, just continue as guest
            req.user = null;
            return next();
        }
        
        console.log('✅ Optional JWT Auth Success:', { userId: user._id, role: user.role });
        req.user = user;
        next();
    })(req, res, next);
};

export default optionalJwtAuth;
