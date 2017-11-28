const koa = require("koa");
const PriCoSha = require('./src/app');
const views = require("koa-views")

let web;
let app;
let start = function () {
	web = new koa();
	app = new PriCoSha();

	web.use(views("views/", { extension: 'pug' }))

	web.use("/login", async (ctx, next) => {
		if (ctx.query.username && ctx.query.password) {
			await app.login(ctx.query.username, ctx.query.password)
			ctx.redirect("/");
		} else {
			await next()
		}
	});

	web.use("/", {

	})
}