const {Enum} = require('enumify');

class Errors extends Enum {}
Errors.initEnum(["InvalidCredentials", "InvalidCharacters"]);

let ValidationError = class extends Error {
	constructor (type, metadata, message) {
		super()
		if (!type) { throw new Error(message, metadata) }
		if (typeof type === 'string') {
			this.type = Errors.enumValueOf(type);
		} else {
			this.type = type;
		}
		if (!message && typeof metadata === "string") {
			this.message = metadata;
		} else {
			this.metadata = metadata;
			this.message = message;
		}
	}

	toString() {
		console.log();
		return `${this.type}${this.metadata ? ` (${JSON.stringify(this.metadata)})`: ''}: ` +
			   `${this.stack.slice(this.stack.indexOf('\n'))}`;
	}
}

module.exports = {
	ValidationError,
	Errors
}