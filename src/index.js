const PriCoSha = require('./app');
const db = require('./db');
const log = require('winston')

let instance = new PriCoSha({db, log});

instance.login("max", "somepass");
instance.spin();
setTimeout(() => {
	instance.logout();
	setTimeout(() => {
		instance.stop();
	}, 1000);
}, 5000);