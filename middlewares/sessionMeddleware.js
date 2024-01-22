const session = require('express-session');

module.exports = session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 
        //600000 // 10 minute
        300000 // 5 minute
        // 100000 // 1 minute
        // 10000 // 10 second
        // 5000 // 5 second
    }
})