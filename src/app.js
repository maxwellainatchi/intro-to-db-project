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

    createFriendGroup(title, desc) {
		return lib.createFriendGroup(this.rect.user.username, title, desc)

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

	getProposedTags() {
		return lib.getProposedTags(this.user.username)
	}

	acceptTag(pid, tagger, taggee) {
		return lib.acceptTag(pid, tagger, taggee)
    }

    rejectTag(pid, tagger, taggee) {
		return lib.rejectTag(pid, tagger, taggee)
	}

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