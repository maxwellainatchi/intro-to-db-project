const lib = require('../lib');
const log = require('winston');
const router = new (require('express').Router)();

router.get("/addcontent", async(req, res, next) => {
    let groups = await lib.userGroups(req.state.user.username)
    res.render("addcontent", {
        groups
    })
});

router.post("/addcontent", async(req, res, next) => {
    let pub = 0
    let groups = await lib.userGroups(req.state.user.username)
    if(req.body.public === "Public") {
        pub = 1
    }
    try {
        let id = await lib.addContent(req.state.user.username, req.body.imageLink, req.body.title, pub)
        console.log(id)
        if(pub == 0) {
            await lib.shareToGroup(id, req.body.friendgroup, req.state.user.username)
        }
        res.render("addcontent", {
            groups,
            success: true
        })
    }
    catch(error) {
        console.log(error)
        res.render("addcontent", {
            groups,
            error: true
        })
    }
});

router.post("/addLike", async(req, res, next) => {
    try {
        let success = await lib.addLike(req.user.username, req.body.content)
        if (!success) {
            throw new Error("Not visible");
        }
    } catch (err) {
        let message;
        if (err.code === "ER_DUP_ENTRY") {
            message = "already Liked"
        } else {
            message = err.message
        }
    }
})

module.exports = router;