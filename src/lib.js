const utils = require('./utils');
const db = require('./db');
const {ValidationError, Errors} = require('./errors');

let validateLogin = async function (username, password) {
	// TODO: escape password
	let token = utils.sha512(password);
	await utils.validateUsername(username);
	let results = await db.query(
		`SELECT username, password 
		 FROM Person 
		 WHERE username='${username}' 
		    AND password='${token}';`
	);
	if (results[0]) {
		return results[0].password
	}
	throw new ValidationError(Errors.InvalidCredentials, {username, password});
}

let register = function (username, password, name) {
	// TODO: escape password
	let token = utils.sha512(password);
	let [firstName, ...lastName] = name.split();
	lastName = lastName.join(" ");
	return utils.validateUsername(username).then(() => db.query(
		`INSERT INTO Person (username, password, first_name, last_name)
		 VALUES ('${username}', '${token}', '${firstName}', '${lastName}');`
	)).then(() => {
		return token
	})
}

let userGroups = function (username) {
    return utils.validateUsername(username).then(() => db.query(
        `SELECT FriendGroup.group_name
		 FROM FriendGroup
		 WHERE username='${username}';`
    )).then(results => results.map(result => result.group_name))
}

let userGroupsOwn = function (username) {
    return utils.validateUsername(username).then(() => db.query(
        `SELECT Friendgroup.group_name
		 FROM Friendgroup
		 WHERE username='${username}';`
    )).then(results => results.map(result => result.group_name))
}

let getVisibleContent = async function (username) {
    let groups = await utils.validateUsername(username).then(() => db.query(
        `SELECT FriendGroup.group_name
		 FROM FriendGroup
		 WHERE username='${username}';`
    )).then(results => results.map(result => result.group_name))
	let content = []
	for (group in groups){
       let contentx = await db.query(
            `SELECT content.content_name, content.id
		 FROM Share
		 JOIN Content ON Content.id = Share.id
		 WHERE group_name='${group}';`
        )
		for (i = 0; i < contentx.length; i++){
			content.push(contentx[i])
		}
	}
    let contenty = await db.query(
        `SELECT content.content_name,id
		 FROM content
		 WHERE public='1';`
    )
    for (i = 0; i < contenty.length; i++){
        content.push(contenty[i])
    }
	return content
}

let addLike = async function(username, content) {
    await utils.validateUsername(username).then(() => db.query(
        `INSERT INTO Like (id, username) 
    VALUES ('${content}','${username}');`
    ));
}

let countLikes = async function( content) {
    let contentx = await db.query(
        `SELECT count(date) as numLikes
		 FROM content
		 WHERE id='${content}';`
    )
	return contentx
}


let getUsernames = async function (firstname, lastname) {
    var userlist = []
    userlist = await db.query(
        `SELECT username
		 FROM Person
		 WHERE first_name='${firstname}' AND last_name='${lastname}';`
    ).then(results => results.map(result => result.username))
    console.log("user list is:" + userlist.length)
    console.log(userlist[0])
    return userlist[0]
}


let addFriendToGroup = function (username, friendgroup, owner) {
    return utils.validateUsername(username).then(() => db.query(
        `INSERT INTO Member (username, group_name, username_creator)
		 VALUES ('${username}','${friendgroup}','${owner}');`
    )).then(() => {
        return true
    })
}

let removeFriendfromGroup = function (username, friendgroup, owner) {
    return utils.validateUsername(username).then(() => db.query(
        `DELETE FROM Member
		 WHERE group_name ='${friendgroup}' AND username = '${username}';`
    )).then(() => {
        return true
    })
}

let createFriendGroup = function(owner, title, desc) {
	return utils.validateUsername(owner).then(() => db.query(
		`INSERT INTO FriendGroup (group_name, username, description)
		VALUES ('${title}','${owner}','${desc}');`
	))
}

let addContent = function(username, filePath, title, pub) {
	return utils.validateUsername(username).then(() => db.query(
		`INSERT INTO Content (username, file_path, content_name, public)
		VALUES ('${username}','${filePath}','${title}','${pub}');`
	)).then(() =>
		db.query(
			`SELECT LAST_INSERT_ID()`
		)
	).then(results => results.map(result => result['LAST_INSERT_ID()']))
}


let isVisible = async function(username, content) {
    let groupsShared = await utils.validateUsername(username).then(() => db.query(
        `SELECT group_name
		 FROM Share
		 WHERE id='${content.id}';`
    )).then(results => results.map(result => result.group_name))
    let friendGroups = await db.query(
        `SELECT group_name
		 FROM member
		 WHERE username='${username}';`
    ).then(results => results.map(result => result.group_name))
    for (i =0;i<groupsShared.length;i++){
        for (j =0;j<friendGroups.length;j++)
        {
            if (friendGroups[i] === groupsShared[j])
                return true
        }
    }
    return false
}

let shareToGroup = async function(pid, group_name, username) {
	return utils.validateUsername(username).then(() => db.query(
		`INSERT INTO Share (id, group_name, username)
		VALUES ('${pid}','${group_name}','${username}');`
	))
}

let addTag = async function(usernamex, content, usernamey) {
    let approved = false;
    if (usernamex === usernamey)
    	approved = true;
    if (isVisible(usernamey, content)) {
		await utils.validateUsername(usernamex).then(() => db.query(
			`INSERT INTO Tag (id, username_tagger, username_taggee, status)
			VALUES ('${content}','${usernamex}','${usernamey}', ${approved});`
		));
		return true
    } else {
    	return false
	}
}

let getComments = function(pid) {
	return db.query(
		`SELECT comment_text FROM Comment
		WHERE id='${pid}';`
	).then(() => {
		return true
	})
}

let getProposedTags = function(username) {
	return utils.validateUsername(username).then(() => db.query(
		`SELECT Content.id, Content.content_name, Tag.username_tagger FROM Content
		JOIN Tag ON Tag.id = Content.id
		WHERE Tag.username_taggee='${username}' AND Tag.status=0;`
	)).then(results => {
		console.log(results)
		return results
    })
}

let acceptTag = function(pid, tagger, taggee) {
	return utils.validateUsername(taggee).then(() => db.query(
		`UPDATE Tag 
		SET status=1
		WHERE id='${pid}' AND username_tagger='${tagger}' AND username_taggee='${taggee}';`
	))
}

let rejectTag = function(pid, tagger, taggee) {
    return utils.validateUsername(taggee).then(() => db.query(
        `DELETE FROM Tag
		WHERE id='${pid}' AND username_tagger='${tagger}' AND username_taggee='${taggee}';`
    ))
}

module.exports = {
	validateLogin,
	register,
	userGroups,
	userGroupsOwn,
	getVisibleContent,
	getUsernames,
	addFriendToGroup,
	removeFriendfromGroup,
	addContent,
	getComments,
	getProposedTags,
	rejectTag,
	createFriendGroup,
	acceptTag,
	addTag,
	isVisible,
	shareToGroup,
	addLike
}