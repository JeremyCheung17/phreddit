// Run this script to launch the server.
// The server should run on localhost port 8000.
// This is where you should start writing server-side code for this application.
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const communityRoutes = require('./routes/community-routes');
const postRoutes = require('./routes/post-routes');
const commentRoutes = require('./routes/comment-routes');
const linkflairRoutes = require('./routes/linkflair-routes');
const userRoutes = require('./routes/user-routes');
const authRoutes = require('./routes/auth-routes');
const app = express();
const session = require('express-session');
const MongoStore = require('connect-mongo');
module.exports = app;

// CORS configuration - IMPORTANT for session cookies to work
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

mongoose.connect('mongodb://127.0.0.1:27017/phreddit');

app.use(
    session({
      name: 'phreddit.sid',
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 30 * 60 * 1000, 
        httpOnly: true,
        sameSite: 'lax', 
        secure: false 
      },
      store: MongoStore.create({mongoUrl: 'mongodb://127.0.0.1:27017/phreddit'}),
      secret: 'somesecretkey',
    })
);

// Debug middleware to log session and authentication
app.use((req, res, next) => {
  console.log('Session ID:', req.sessionID);
  console.log('Session User:', req.session.user);
  next();
});

app.get("/", function (req, res) {
    console.log("Get request received at '/'");
    res.send("Hello Phreddit!")
});



app.use('/api/communities', communityRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/linkflairs', linkflairRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);


const server = app.listen(8000, () => {
  console.log(`Server listening on port 8000...`);
});

process.on('SIGINT', () => {
    server.close(() => {
      mongoose.connection.close().then(() => {
        console.log('Server closed. Database instance disconnected.');
        process.exit(0);
      });
    });
});