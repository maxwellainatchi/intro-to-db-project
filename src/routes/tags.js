const lib = require('../lib');
const log = require('winston');
const router = new (require('express').Router)()

router.get("/addTag", async(req, res, next) => {
    let content = await lib.getVisibleContent(req.state.user.username)
    res.render("addTag",{
        content
    })
})

router.post("/addTag", async(req, res, next) => {
    console.log(req.body.firstName +" "+ req.body.lastName)
    let friend = await lib.getUsernames(req.body.firstName, req.body.lastName)
    if (friend) {
        console.log("Friend you're trying to tag is: " + friend)
        console.log("Content to tag them in: "+req.body.content)
        try {
            let success = await lib.addTag(req.state.user.username, req.body.content, friend)
            if (!success) {
                throw new Error("Not visible");
            }
        } catch (err) {
            let message;
            if (err.code === "ER_DUP_ENTRY") {
                message = "Tag already exists!"
            } else {
                message = err.message
            }
            let content = await lib.getVisibleContent(req.state.user.username)
            res.render("addTag", {error: message, content})
        }
    } else {
        console.log("you don't have that friend")
        let content = await lib.getVisibleContent(req.state.user.username)
        res.render('addTag', {error: "You don't have that friend bb", content})
    }
    res.redirect("/home")
})

router.get("/proposedtags", async(req, res, next) => {
    let results = await lib.getProposedTags(req.state.user.username)
    for (result in results) {
        console.log(result.id)
    }
    res.render("proposedtags", {
        results
    })
})

router.post("/proposedtags", async(req, res, next) => {
    let results = await lib.getProposedTags(req.state.user.username)
    try {
        let selectedTag = JSON.parse(req.body.propTags)
        if(req.body.propAction === "accept") {
            await lib.acceptTag(selectedTag.id, selectedTag.username_tagger, req.state.user.username)
        }
        else if(req.body.propAction === "reject"){
            await lib.rejectTag(selectedTag.id, selectedTag.username_tagger, req.state.user.username)
        }
        results = await lib.getProposedTags(req.state.user.username)
        res.render("proposedtags", {
            results,
            success: true
        })
    }
    catch(error) {
        res.render("proposedtags", {
            results,
            error: true
        })
    }
});

module.exports = router