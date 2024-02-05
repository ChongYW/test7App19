const dashboardPage = (req, res) =>{
    res.render('userB/dashboard');
}

const profilePage = (req, res) =>{
    res.render('userB/profile');
}

const logout = (req, res) =>{
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/login');
    });
}

module.exports = {
    dashboardPage,
    profilePage,
    logout,
}