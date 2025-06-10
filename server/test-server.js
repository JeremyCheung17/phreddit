
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');

const communityRoutes = require('./routes/community-routes');
const postRoutes = require('./routes/post-routes');
const commentRoutes = require('./routes/comment-routes');
const linkflairRoutes = require('./routes/linkflair-routes');
const userRoutes = require('./routes/user-routes');
const authRoutes = require('./routes/auth-routes');

const app = express();

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

mongoose.connect('mongodb://127.0.0.1:27017/phreddit_test');

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
      store: MongoStore.create({mongoUrl: 'mongodb://127.0.0.1:27017/phreddit_test'}),
      secret: 'testsecretkey',
    })
);

// Routes
app.get("/", function (req, res) {
    res.send("Hello Phreddit Test!")
});

app.use('/api/communities', communityRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/linkflairs', linkflairRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);

module.exports = app;