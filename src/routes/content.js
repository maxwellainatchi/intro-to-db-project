const lib = require('../lib');
const log = require('winston');
const router = new (require('express').Router)();

router.get("/addcontent", async(req, res, next) => {
    res.render("addcontent")
});

router.post("/addcontent", async(req, res, next) => {
    let pub = 0
    if(req.body.public === "Public") {
        pub = 1
    }
    try {
        await lib.addContent(req.state.user.username, req.body.imageLink, req.body.title, pub)
        res.render("addcontent", {
            success: true
        })
    }
    catch(error) {
        res.render("addcontent", {
            error: true
        })
    }
});

module.exports = router;