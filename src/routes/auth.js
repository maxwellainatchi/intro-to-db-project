const lib = require('../lib');
const log = require('winston');
const router = new (require('express').Router)();

router.post("/logout", async (req, res, next) => {
    if (!req.state.user) {
        res.status(400).send("not logged in")
    } else {
        res.cookie("username", "");
        res.cookie("usertoken", "");
    }
    res.redirect("/")
});

router.post("/login", async (req, res, next) => {
    if (!req.body.username) {
        res.render('login', {error: "Missing username!"})
    } else if (!req.body.password) {
        res.render('login', {error: "Missing username!"})
    } else {
        try {
            let {username, password} = req.body;
            let token = await lib.validateLogin(username, password);
            log.info("login", {username, success: true});
            res.cookie("username", username);
            res.cookie("usertoken", token);
            res.redirect("/home")
        } catch (err) {
            res.render('login', {error: "Invalid username or password!"})
        }
    }
});

router.post("/register", async (req, res, next) => {
    if (!req.body.username) {
        res.render('register', {error: "Missing username!"})
    } else if (!req.body.password) {
        res.render('register', {error: "Missing password!"})
    } else if (!req.body.passwordconfirm || req.body.password !== req.body.passwordconfirm) {
        res.render('register', {error: "Password doesn't match confirmation!"})
    } else if (!req.body.name) {
        res.render('register', {error: "Missing name!"})
    } else {
        try {
            let {username, password, name} = req.body;
            let token = await lib.register(username, password, name);
            log.info("register", {username, success: true});
            res.cookie("username", username);
            res.cookie("usertoken", token);
            res.redirect("/home")
        } catch (err) {
            let message;
            if (err.code === "ER_DUP_ENTRY") {
                message = `Username ${req.body.username} already taken!`
            } else {
                message = err.message
            }
            res.render('register', {error: message})
        }
    }
});

module.exports = router;