const lib = require('../lib');
const log = require('winston');
const router = new (require('express').Router)();

router.post("/addFriend", async(req, res, next) => {
    let groups = await lib.userGroups(req.state.user.username)
    try {
        let friend = await lib.getUsernames(req.body.firstName, req.body.lastName)
        console.log("Friend you're trying to add is: " + friend)
        console.log("Group you're trying to add him to: " + req.body.friendGroup)
        let success = await
            lib.addFriendToGroup(String(friend), req.body.friendGroup, req.state.user.username)
        results = await
            lib.getProposedTags(req.state.user.username)
        res.render("addFriend", {
            groups,
            success: true
        })
    }
    catch(error) {
        console.log(error)
        res.render("addFriend", {
            groups,
            error: true
        })
    }
});

router.get("/addfriend", async (req, res, next) => {
    let groups = await lib.userGroups(req.state.user.username)
    res.render("addfriend",{
        groups
    })
});

router.get("/createfriendgroup", async(req, res, next) => {
    res.render("createfriendgroup")
});

router.post("/createfriendgroup", async(req, res, next) => {
    try {
        await lib.createFriendGroup(req.state.user.username, req.body.name, req.body.description)
        res.render("createfriendgroup", {
            success: true
        })
    }
    catch(error) {
        console.log(error)
        res.render("createfriendgroup", {
            error: true
        })
    }
});

module.exports = router;