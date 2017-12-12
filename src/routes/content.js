const lib = require('../lib');
const log = require('winston');
const router = new (require('express').Router)();

router.get("/addcontent", async(req, res, next) => {
    let groups = await lib.userGroups(req.state.user.username);
    res.render("addcontent", {
        groups
    })
});

router.post("/addcontent", async(req, res, next) => {
    let pub = 0;
    let groups = await lib.userGroups(req.state.user.username);
    if(req.body.public === "Public") {
        pub = 1
    }
    try {
        let id = await lib.addContent(req.state.user.username, req.body.imageLink, req.body.title, pub);
        if (pub === 0) {
            await lib.shareToGroup(id, req.body.friendgroup, req.state.user.username)
        }
        res.render("addcontent", {
            groups,
            success: true
        })
    } catch(error) {
        log.error(error);
        res.render("addcontent", {
            groups,
            error: true
        })
    }
});

router.post('/addComment', async (req, res, next) => {
    await lib.addComment(req.state.user.username, req.body.text, req.body.itemId);
    let content = await lib.getContentItem(req.body.itemId);
    res.render('content', {
        content
    })
});

router.get('/content', async (req, res, next) => {
    let id = req.query.id;
    let content = await lib.getContentItem(id);
    res.render('content', {
        content
    })
});

router.get('/home', async (req, res, next) => {
    let content = await lib.getVisibleContent(req.state.user.username);
    res.render('home', {
        content,
        user: req.state.user
    })
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