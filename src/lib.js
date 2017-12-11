const utils = require('./utils');
const db = require('./db');
const {ValidationError, Errors} = require('./errors');

let validateLogin = function (username, password) {
	// TODO: escape password
	let token = utils.sha512(password);
	return utils.validateUsername(username).then(() => db.query(
		`SELECT username, password 
		 FROM Person 
		 WHERE username='${username}' 
		 	AND password='${token}';`
	)).then(results => {
		if (results[0]) {
			return results[0].password
		}
		throw new ValidationError(Errors.InvalidCredentials, {username, password});
	})
}

let register = function (username, password) {
	// TODO: escape password
	let token = utils.sha512(password);
	return utils.validateUsername(username).then(() => db.query(
		`INSERT INTO Person (username, password)
		 VALUES ('${username}', '${token}');`
	)).then(() => {
		return token
	})
}

let userGroups = function (username) {
    return utils.validateUsername(username).then(() => db.query(
        `SELECT FriendGroup.group_name
		 FROM FriendGroup
		 WHERE username='${username}';`
    )).then(results => results.map(result => result.group_name))
}


let getUsernames = function (firstname, lastname) {
    return db.query(
        `SELECT username
		 FROM Person 
		 WHERE first_name='${firstname}' AND last_name='${lastname}';`
    ).then(results => results.map(result => result.username))
}


let addFriendToGroup = function (username, friendgroup, owner) {
    return utils.validateUsername(username).then(() => db.query(
        `INSERT INTO Member (username, group_name, username_creator)
		 VALUES ('${username}','${friendgroup}','${owner}');`
    )).then(() => {
        return true
    })
}

let addContent = function(username, filePath, title, pub) {
	let today = new Date()
    let date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    let dateTime = date+' '+time;
	return utils.validateUsername(username).then(() => db.query(
		`INSERT INTO Content (username, timest, file_path, content_name, public)
		VALUES ('${username}','${dateTime}','${filePath}','${title}','${pub}');`
	)).then(() => {
		return true
	})
}

let getComments = function(pid) {
	return db.query(
		`SELECT comment_text FROM Comment
		WHERE id='${pid}';`
	).then(() => {
		return true
	})
}

let getProposedTags = function(username) {
	return utils.validateUsername(username).then(() => db.query(
		`SELECT Content.id, Content.content_name, Tag.username_tagger FROM Content
		JOIN Tag ON Tag.id = Content.id
		WHERE Tag.username_taggee='${username}' AND Tag.status=0;`
	)).then(results => {
		console.log(results)
		return results
    })
}

let acceptTag = function(pid, tagger, taggee) {
	console.log(pid, tagger, taggee)
	return utils.validateUsername(taggee).then(() => db.query(
		`UPDATE Tag 
		SET status=1
		WHERE id='${pid}' AND username_tagger='${tagger}' AND username_taggee='${taggee}';`
	)).then(results => {
		console.log(results)
	})
}

module.exports = {
	validateLogin,
	register,
	userGroups,
	getUsernames,
	addFriendToGroup,
	addContent,
	getComments,
	getProposedTags,
	acceptTag
}