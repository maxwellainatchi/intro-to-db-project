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

module.exports = {
	validateLogin,
	register
}