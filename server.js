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

app.use((req, res, next) => {
	service.log.info(`HTTP ${req.method} ${req.url}`);
	next();
});
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
    if (["/login", "/register"].includes(req.url)) { return next() }
    let username = req.cookies.username;
    let token = req.cookies.usertoken;
	if (!(username && token)) {
		res.render('login')
	} else {
		req.user = {username, token};
		next()
	}
})

app.use((req, res, next) => {
	if (["/login", "/register"].includes(req.url) && req.user) {
		res.redirect('home')
	} else {
		next()
	}
})

app.post("/logout", async (req, res, next) => {
	if (!req.user) {
		res.status(400).send("not logged in")
	} else {
		res.cookie("username", "");
		res.cookie("usertoken", "");
	}
	res.redirect("/")
});

app.post("/login", async (req, res, next) => {
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

app.get("/login", (req, res, next) => {
	res.render("login");
})

app.post("/addFriend", async(req, res, next) => {
	let friend = await service.getUsername(req.body.firstName, req.body.lastName)
	console.log("Friend you're trying to add is: "+friend)
	console.log("Group you're trying to add him to: "+req.body.friendGroup)
	let success = await service.addFriendToGroup(String(friend), req.body.friendGroup, service.user.username)
	if(success) {
		res.redirect("/home")
    }
    else {
		alert("Your attempt failed! Please try again")
	}
})

app.get("/addfriend", async (req, res, next) => {
	let groups = await service.getFriendGroups()
	res.render("addfriend",{
		groups
	})
})

app.get("/addcontent", async(req, res, next) => {
	res.render("addcontent")
})

app.post("/addcontent", async(req, res, next) => {
	let pub = 0
	if(req.body.public === "Public") {
        pub = 1
    }
	await service.addContent(service.user.username, req.body.imageLink, req.body.title, pub)
})

app.get("/proposedtags", async(req, res, next) => {
	let results = await service.getProposedTags()
	for (result in results) {
		console.log(result.id)
	}
	res.render("proposedtags", {
		results
    })
})

app.post("/proposedtags", async(req, res, next) => {
	let selectedTag = JSON.parse(req.body.propTags)
	// console.log(req.body.propTag)
	if(req.body.propAction == "accept") {
		await service.acceptTag(selectedTag.id, selectedTag.username_tagger, service.user.username)
	}
	else {
		await service.rejectTag(req.body.propTags.id, req.body.propTags.username_tagger, service.user.username)
	}

})

app.post("/register", async (req, res, next) => {
    if (!req.body.username) {
        res.render('register', {error: "Missing username!"})
    } else if (!req.body.password) {
        res.render('register', {error: "Missing username!"})
    } else {
        let {username, password} = req.body;
        let token = await lib.register(username, password);
        log.info("register", {username, success: true});
        res.cookie("username", username);
        res.cookie("usertoken", token);
        res.redirect("/home")
    }
})

app.get("/register", async (req, res, next) => {
	res.render("register");
})

app.get("/home", (req, res) => {
	res.render("home", {user: req.user})
})

app.get("/", (req, res) => {
	res.redirect("/home")
});

app.use((err, req, res, next) => {
	log.error(err.stack, {err});
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
	p.then(service.log.error).catch(log.error)
});

process.on('uncaughtException', log.error)

module.exports = { app, service };