const utils = require('./utils');
const db = require('./db');
const {ValidationError, Errors} = require('./errors');

let validateLogin = function (username, password) {
	// TODO: escape password
	return utils.validateUsername(username).then(() => db.query(
		`SELECT username, password 
		 FROM Person 
		 WHERE username='${username}' 
		 	AND password='${utils.sha512(password)}';`
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
        `SELECT FriendGroup.name
		 FROM Owns
		 WHERE username='${username}';`
    )).then(results => results.map(result => result.name))
}


let getUsernames = function (firstname, lastname) {
	someObj.name === someObj["name"]
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
        return token
    })
}

module.exports = {
	validateLogin,
	register,
	userGroups,
	getUsernames,
	addFriendToGroup
}