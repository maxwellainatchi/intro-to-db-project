const app = new (require("express"))();
const bodyParser = require('body-parser');
const service = new (require('./src/app'))({
	db: require('./src/db'),
	log: require('winston')
});

app.set("view engine", "pug");

app.use((req, res, next) => {
	service.log.info(`HTTP ${req.method} ${req.url}`);
	next();
});

app.use(bodyParser.urlencoded({ extended: true }));

app.get("/addFriend", async (req, res, next) => {
	service.
	res.render("addFriend")
});

app.post("/logout", async (req, res, next) => {
	if (!service.user) {
		res.status(400).send("not logged in")
	} else {
		service.logout()
	}
	res.redirect("/")
});

app.post("/login", async (req, res, next) => {
	if (service.user) {
		res.status(400).send("already logged in")
	} else if (req.body.username && req.body.password) {
		await service.login(req.body.username, req.body.password)
		res.redirect("/home")
	} else {
		res.status(400).send("missing required params")
	}
});

app.get("/login", (req, res, next) => {
	if (service.user) {
		res.redirect("/home")
	} else {
		res.render("login");
	}
})

app.post("/register", async (req, res, next) => {
	if (service.user) {
		res.status(400).send("already logged in")
	} else if (req.body.username && req.body.password) {
		await service.register(req.body.username, req.body.password)
		res.redirect("/home")
	} else {
		res.status(400).send("missing required params")
	}
})

app.get("/register", async (req, res, next) => {
	if (service.user) {
		res.redirect("/home")
	} else {
		res.render("register");
	}
})

app.get("/home", (req, res) => {
	if (service.user) {
		res.render("home")
	} else {
		res.redirect("/login");
	}
})

app.get("/", (req, res) => {
	if (service.user) {
		res.redirect("/home")
	} else {
		res.redirect("/login");
	}
});

app.use((err, req, res, next) => {
	service.log.error(err.toString(), {err});
	res.render("error", {err})
})

let port = process.env.PORT || 3000;
app.listen(port, function () {
	service.log.info("starting on port " + port)
});

process.on("SIGTERM", function () {
	service.stop();
});

process.on('unhandledRejection', (reason, p) => {
	p.then(service.log.error).catch(service.log.error)
});

process.on('uncaughtException', service.log.error)

module.exports = { app, service };