const lib = require('../lib');
const log = require('winston');
const router = new (require('express').Router)();

router.post("/addFriend", async(req, res, next) => {
    let groups = await lib.userGroups(req.state.user.username);
    try {
        let friend = await lib.getUsernames(req.body.firstName, req.body.lastName);
        console.log("Friend you're trying to add is: " + friend);
        console.log("Group you're trying to add him to: " + req.body.friendGroup);
        let success = await
            lib.addFriendToGroup(String(friend), req.body.friendGroup, req.state.user.username);
        let results = await
            lib.getProposedTags(req.state.user.username);
        res.render("addFriend", {
            groups,
            success: true
        })
    }
    catch(error) {
        console.log(error);
        res.render("addFriend", {
            groups,
            error: true
        })
    }
});

router.get("/addfriend", async (req, res, next) => {
    let groups = await lib.userGroups(req.state.user.username);
    res.render("addfriend",{
        groups
    })
});

router.get("/createfriendgroup", async(req, res, next) => {
    res.render("createfriendgroup")
});

router.post("/createfriendgroup", async(req, res, next) => {
    try {
        await lib.createFriendGroup(req.state.user.username, req.body.name, req.body.description);
        res.render("createfriendgroup", {
            success: true
        })
    }
    catch(error) {
        console.log(error);
        res.render("createfriendgroup", {
            error: true
        })
    }
});

router.post("/deleteFriend", async(req, res, next) => {
    let groups = await lib.userGroupsOwn(req.state.user.username)
    console.log(groups.length)
    let friend = await lib.getUsernames(req.body.firstName, req.body.lastName)
    console.log("Friend you're trying to remove is: " + friend)
    console.log("Group you're trying to remove him from: " + req.body.friendGroup)
    if (friend) {
        try {
            let success = await
                lib.removeFriendfromGroup(String(friend), req.body.friendGroup)
            results = await
                res.render("deleteFriend", {
                    groups,
                    success: true
                })
        }
        catch (error) {
            console.log(error)
            res.render("deleteFriend", {
                groups,
                error: true
            })
        }
    }else {
        console.log("you don't have that friend")
        let content = await lib.getVisibleContent(req.state.user.username)
        res.render('deleteFriend', {error: "You don't have that friend bb", content, groups})
    }
});

router.get("/deleteFriend", async(req, res, next) => {
    let groups = await lib.userGroupsOwn(req.state.user.username)
    res.render("deleteFriend",{
        groups
    })
});

module.exports = router;