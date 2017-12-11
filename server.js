const app = new (require("express"))();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const service = new (require('./src/app'))({
	db: require('./src/db'),
	log: require('winston')
});
const lib = require('./src/lib');
const log = require('winston');

app.set("view engine", "pug");

// Logging
app.use((req, res, next) => {
	service.log.info(`HTTP ${req.method} ${req.url}`);
	next();
});

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

// Create req.state
app.use((req, res, next) => {
	req.state = {}
	next()
});

// Login redirects/fill into req.state.user
app.use((req, res, next) => {
    if (["/login", "/register"].includes(req.url)) { return next() }
    let username = req.cookies.username;
    let token = req.cookies.usertoken;
	if (!(username && token)) {
		res.render('login')
	} else {
		req.state.user = {username, token};
		next()
	}
})
app.use((req, res, next) => {
	if (["/login", "/register"].includes(req.url) && req.state.user) {
		res.redirect('home')
	} else {
		next()
	}
})

app.use(require('./src/routes/auth'));
app.use(require('./src/routes/tags'));
app.use(require('./src/routes/friends'));
app.use(require('./src/routes/content'));

app.get("/", (req, res) => {
	res.redirect("/home")
});

app.use((req, res) => {
	let viewName = req.url.slice(1);
	if (require.resolve(`./views/${viewName}.pug`)) {
		res.render(viewName, req.state)
	} else {
		next()
	}
});

// Error handling
app.use(async (err, req, res, next) => {
	log.error(err.stack, {err});
	res.render("error", {err: err.message})
});

let port = process.env.PORT || 3000;
app.listen(port, function () {
	service.log.info("starting on port " + port)
});

process.on("SIGTERM", function () {
	service.stop();
});

process.on('unhandledRejection', (reason, p) => {
	p.then(service.log.error).catch(log.error)
});

process.on('uncaughtException', log.error)

module.exports = { app, service };