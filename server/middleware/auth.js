// middleware/auth.js

const isAuth = (req, res, next) => {
    console.log('isAuth middleware - Session:', {
        id: req.sessionID,
        user: req.session.user,
        cookieName: req.session.name
    });
    
    if (req.session && req.session.user) {
        next();
    } else {
        console.log('Authentication failed - no user in session');
        return res.status(401).json({ message: 'Authentication required' });
    }
};

const isAdmin = (req, res, next) => {
    console.log('isAdmin middleware - User type:', req.session?.user?.userType);
    
    if (req.session && req.session.user && req.session.user.userType === 'admin') {
        next();
    } else {
        console.log('Admin check failed - user type:', req.session?.user?.userType);
        return res.status(403).json({ message: 'Admin privileges required' });
    }
};

module.exports = { isAuth, isAdmin };
