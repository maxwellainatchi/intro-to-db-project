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
	let groups = await lib.userGroups(req.user.username)
	try {
        let friend = await lib.getUsernames(req.body.firstName, req.body.lastName)
        console.log("Friend you're trying to add is: " + friend)
        console.log("Group you're trying to add him to: " + req.body.friendGroup)
        let success = await
        lib.addFriendToGroup(String(friend), req.body.friendGroup, req.user.username)
        results = await
        lib.getProposedTags(req.user.username)
        res.render("addFriend", {
            groups,
            success: true
        })
    }
    catch(error) {
		console.log(error)
        res.render("addFriend", {
            groups,
            error: true
        })
	}
})

app.get("/addfriend", async (req, res, next) => {
	let groups = await lib.userGroups(req.user.username)
	res.render("addfriend",{
		groups
	})
})

app.get("/createfriendgroup", async(req, res, next) => {
	res.render("createfriendgroup")
})

app.post("/createfriendgroup", async(req, res, next) => {
	try {
		await lib.createFriendGroup(req.user.username, req.body.name, req.body.description)
		res.render("createfriendgroup", {
			success: true
		})
	}
	catch(error) {
		console.log(error)
		res.render("createfriendgroup", {
			error: true
    })
	}
})

app.get("/addcontent", async(req, res, next) => {
	res.render("addcontent")
})

app.post("/addcontent", async(req, res, next) => {
	let pub = 0
	if(req.body.public === "Public") {
        pub = 1
    }
	try {
		await lib.addContent(req.user.username, req.body.imageLink, req.body.title, pub)
        res.render("addcontent", {
            success: true
        })
	}
	catch(error) {
        res.render("addcontent", {
            error: true
        })
    }
})

app.get("/addTag", async(req, res, next) => {
    let content = await lib.getVisibleContent(req.user.username)
    res.render("addTag",{
        content
    })
})

app.post("/addTag", async(req, res, next) => {
	console.log(req.body.firstName +" "+ req.body.lastName)
    let friend = await lib.getUsernames(req.body.firstName, req.body.lastName)
	if (friend) {
		console.log("Friend you're trying to tag is: " + friend)
		console.log("Content to tag them in: "+req.body.content)
		try {
			let success = await lib.addTag(req.user.username, req.body.content, friend)
			if (!success) {
				throw new Error("Not visible");
			}
		} catch (err) {
			let message;
			if (err.code === "ER_DUP_ENTRY") {
				message = "Tag already exists!"
			} else {
				message = err.message
			}
            let content = await lib.getVisibleContent(req.user.username)
			res.render("addTag", {error: message, content})
		}
	} else {
        console.log("you don't have that friend")
        let content = await lib.getVisibleContent(req.user.username)
		res.render('addTag', {error: "You don't have that friend bb", content})
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
app.get("/proposedtags", async(req, res, next) => {
	let results = await lib.getProposedTags(req.user.username)
	for (result in results) {
		console.log(result.id)
	}
	res.render("proposedtags", {
		results
    })
})

app.post("/proposedtags", async(req, res, next) => {
    let results = await lib.getProposedTags(req.user.username)
	try {
        let selectedTag = JSON.parse(req.body.propTags)
        if(req.body.propAction == "accept") {
    		await lib.acceptTag(selectedTag.id, selectedTag.username_tagger, req.user.username)
		}
		else if(req.body.propAction == "reject"){
    		await lib.rejectTag(selectedTag.id, selectedTag.username_tagger, req.user.username)
		}
		results = await lib.getProposedTags(req.user.username)
		res.render("proposedtags", {
				results,
				success: true
		})
	}
	catch(error) {
		res.render("proposedtags", {
			results,
			error: true
		})
	}
})

app.post("/register", async (req, res, next) => {
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

app.use(async (err, req, res, next) => {
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