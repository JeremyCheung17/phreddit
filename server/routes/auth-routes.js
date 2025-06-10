const express = require('express');
const router = express.Router();
const User = require('../models/users');
const bcrypt = require('bcrypt');
const {isAuth, isAdmin} = require('../middleware/auth')

router.post('/register', async (req,res) => {
    try {
        const emailExists = await User.findOne({ email: req.body.email })
        if (emailExists) return res.status(409).json({ message: "Email taken" });
        const nameExists = await User.findOne({ displayName: req.body.displayName })
        if (nameExists) return res.status(409).json({ message: "Username taken" });

        const passwordHash = await bcrypt.hash(req.body.password, 10);
        const user = new User({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            displayName: req.body.displayName,
            passwordHash: passwordHash,
            userType: 'user'
        });
        const newUser = await user.save();
        res.status(201).json(newUser);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
})

router.post('/login', async (req,res) => {
    try {
        const {email, password} = req.body
        const user = await User.findOne({ email: email });
        if (!user) return res.status(401).json({ message: 'Invalid email or password.' });
        
        const pwdMatch = await bcrypt.compare(password, user.passwordHash);
        if (!pwdMatch) {
            return res.status(401).json({ message: 'Invalid email or password.' })
        }

        // Store user info in session
        req.session.user = {
            _id: user._id,
            displayName: user.displayName,
            userType: user.userType,
            reputation: user.reputation,
            email: user.email,
            createdDate: user.createdDate,
        };
        
        // Save the session explicitly
        req.session.save(err => {
            if (err) {
                console.error('Session save error:', err);
                return res.status(500).json({ message: 'Session error' });
            }
            
            console.log('Session saved successfully, ID:', req.sessionID);
            return res.json({ 
                message: "Logged in", 
                user: req.session.user,
                sessionID: req.sessionID
            });
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: err.message });
    }
})

router.post('/logout', isAuth, async (req,res) => {
    req.session.destroy(err => {
        if (err) return res.status(500).json({ message: err.message });

        res.clearCookie('phreddit.sid', {
            httpOnly: true,
            sameSite: 'lax',
            secure: false,
            path: '/'
        });

        res.json( { message: "Logged out" })
    })
})

router.get('/me', async (req,res) => {
    // Debug session information
    console.log('Session on /me route:', {
        id: req.sessionID,
        user: req.session.user,
        cookie: req.session.cookie
    });
    
    if (req.session && req.session.user) {
        res.json(req.session.user);
    } else {
        res.status(401).json({ message: 'Not authenticated' });
    }
})

// Add a test route to check admin access
router.get('/admin-check', isAuth, isAdmin, (req, res) => {
    res.json({ 
        message: 'You have admin access', 
        user: req.session.user,
        sessionID: req.sessionID
    });
});

module.exports = router;