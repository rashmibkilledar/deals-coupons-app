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

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    if (id === admin_user.id) {
        done(null, admin_user);
    } else {
        done('User not found');
    }
});

app.use(flash());

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