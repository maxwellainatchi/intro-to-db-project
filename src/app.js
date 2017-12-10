const lib = require('./lib');

let PriCoSha = class {
	constructor({db, log}) {
		this.db = db;
		this.log = log || console;
		this.log.info("connecting to db");
		this.db.connect();
	}

	login (username, password) {
		this.log.info("login", {username});
		return lib.validateLogin(username, password).then(token => {
			this.log.info("login", {username, success: true});
			this.user = {username, token};
		});
	}

	getComments(pid) {
		return lib.getComments(pid)
	}

	getFriendGroups() {
        return lib.userGroups(this.user.username)
	}

	getUsername(firstName, lastName){
		return lib.getUsernames(firstName, lastName);
	}

	addFriendToGroup(username, friendgroup, owner){
        return lib.addFriendToGroup(username, friendgroup, this.user.username);
    }

    addContent(username, filePath, title, pub) {
		return lib.addContent(username, filePath, title, pub)
	}

	register (username, password) {
		this.log.info("register", {username});
		return lib.register(username, password).then(token => {
			this.log.info("register", {username, success: true});
			this.user = {username, token};
		});
	}

	// spin () {
	// 	let time = setInterval(() => {
	// 		if (this.shouldStop) {
	// 			clearInterval(time);
	// 		}
	// 	}, 1000);
	// }

	logout () {
		this.log.info("logout", {username: this.user.username});
		this.user = null;
	}

	stop () {
		this.shouldStop = true;
		this.log.info("disconnecting from db");
		this.user = null;
		this.db.disconnect();
	}
}

module.exports = PriCoSha