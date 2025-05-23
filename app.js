const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const eCommerceRoutes = require('./routes/eCommerceRoutes');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const flash = require('connect-flash');

const app = express();
const port = 3000;

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());

const admin_user = {
    id: 1,
    username: '8989898989',
    pin: '8989',
};

passport.use(new LocalStrategy({
    usernameField: 'username',
    passwordField: 'pin',
}, (username, pin, done) => {
    try {
        if (username === admin_user.username && pin === admin_user.pin) {
            return done(null, admin_user);
        } else {
            return done(null, false, { message: 'Invalid credentials' });
        }
    } catch (error) {
        console.log(error);
        return done(error);
    }

}));

/* Passport uses sessions to keep users logged in between HTTP requests. */
/* Serialize user ID into session */
/* This function determines what user data should be stored in the session.
    This gets called once after a successful login.
    It typically stores just the user ID (or some unique identifier) for efficiency.
    done(null, user.id) means: no error, and store this ID in session. */
passport.serializeUser((user, done) => {
    done(null, user.id);
});

/* This function is called on every request after the session is established. 
It uses the stored ID from the session to fetch the full user object. */
/* Deserialize user from session ID */
/* This allows req.admin_user to be available in routes/views.
    It restores the full admin_user object from just the ID stored in the session. */
passport.deserializeUser((id, done) => {
    if (id === admin_user.id) {
        done(null, admin_user);
    } else {
        done('User not found');
    }
});

/* When you log in using Passport.js, it sets information like:
req.user → the logged-in user.
req.isAuthenticated() → returns true if logged in.
But by default, your EJS templates don’t know whether the user is logged in, because those values 
(req.user, req.isAuthenticated()) are only available in the route handler, not directly in your view templates.
So middleware adds those values to res.locals, which is automatically available in all EJS views.
This middleware exposes req.isAuthenticated() and req.user to all views */
app.use((req, res, next) => {
    /* res.locals is an object provided by Express that lets to pass data from middleware or route handler 
    to view templates (like EJS) */
    res.locals.isAuthenticated = req.isAuthenticated();
    res.locals.admin_user = req.admin_user;
    next();
});

app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
});


app.use(flash());

/* Error handling middleware */
app.use((req, res, next) => {
    res.locals.error_msg = req.flash('error');
    next();
});

/* routes */
app.use('/', eCommerceRoutes);

/* mongodb connection */
mongoose.connect('mongodb://localhost/eCommerceApp')
    .then(() =>
        console.log('mongodb connected'))
    .catch((error) =>
        console.log('Error in db connection: ' + error));

app.listen(port, () => {
    console.log(`Server is running at, http://localhost:${port}`);
});