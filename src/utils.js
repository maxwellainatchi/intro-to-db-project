const crypto = require('crypto');
const {ValidationError, Errors} = require('./errors');

let sha512 = function(password) {
	let hash = crypto.createHmac('sha512', "salt");
	hash.update(password);
	return hash.digest('hex');
};

let validateUsername = function (username) {
	return new Promise(function (resolve, reject) {
		if (username.length >= 50 || !username.match(/^[a-zA-Z][a-zA-Z_0-9]*$/)) {
			reject(new ValidationError(Errors.InvalidCharacters, {username}));
		} else {
			resolve();
		}
	})

};

module.exports = {
	sha512,
	validateUsername
};