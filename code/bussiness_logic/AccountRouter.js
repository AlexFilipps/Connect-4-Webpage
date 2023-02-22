//This router is responsible for all incoming requests related to accounts
//this includes functionality such as account creation, and signing in and out

let users = require("./Users.js");
const express = require('express');
const session = require('express-session');

let router = express.Router();



//------------------------------------------------------------------------
//------------------------------------------------------------------------
//----------------------GET REQUESTS -------------------------------------
//------------------------------------------------------------------------
//------------------------------------------------------------------------
router.get("/logout", logout);
router.get("/getId", getId);

function logout(req, res, next){
    if(req.session.loggedin){
        users.setOffline(req.session.playerID);
		req.session.loggedin = false;
        req.session.playerID = null;
		res.status(200).send("Logged out.");
	}else{
		res.status(200).send("Not logged in");
	}
}

function getId(req, res, next){
    if(req.session.username){
        var id = users.getUserIDByUsername(req.session.username);
        if(id){
            res.status(200).send(id);
        }
        else{
            res.status(404).send(-1);
        }
    }
}
//--------------------------------------------------------------------------
//--------------------------------------------------------------------------
//----------------------END OF GET REQUESTS --------------------------------
//--------------------------------------------------------------------------
//--------------------------------------------------------------------------




//------------------------------------------------------------------------
//------------------------------------------------------------------------
//----------------------POST REQUESTS -------------------------------------
//------------------------------------------------------------------------
//------------------------------------------------------------------------
router.post("/login", login);
router.post("/create", create);

function login(req, res, next){
	if(req.session.loggedin){
		res.status(403).send("Already logged in.");
		return;
	}
	let username = req.reqData.username;
	let password = req.reqData.password;
    let user = users.getUserByUsername(username);
    
    if(user){
        if(user.password === password){
			req.session.loggedin = true;
			req.session.username = username;
            req.session.playerID = users.getUserIDByUsername(username);
            users.setOnline(req.session.playerID);
			res.status(200).send("Logged in");
        }
        else{
            res.status(401).send("Password incorrect");
        }
    }
    else{
		res.status(401).send("Username incorrect");
		return;
	}
}

function create(req, res, next){
    if(req.session.loggedin){
		res.status(403).send("Already logged in.");
		return;
	}
	let username = req.reqData.username;
	let password = req.reqData.password;
    let user = users.getUserByUsername(username);
    
    if(user){
        res.status(409).send("Username already exists");
    }
    else{
        req.session.loggedin = true;
        req.session.playerID = users.createUser(username, password);
		res.status(201).send("Created account");
	}
}
//--------------------------------------------------------------------------
//--------------------------------------------------------------------------
//----------------------END OF POST REQUESTS --------------------------------
//--------------------------------------------------------------------------
//--------------------------------------------------------------------------





//------------------------------------------------------------------------
//------------------------------------------------------------------------
//----------------------PUT REQUESTS -------------------------------------
//------------------------------------------------------------------------
//------------------------------------------------------------------------
router.put("*", (req, res, next) => {next("Account Router received a PUT request that it cannot handle!");});
//--------------------------------------------------------------------------
//--------------------------------------------------------------------------
//----------------------END OF PUT REQUESTS --------------------------------
//--------------------------------------------------------------------------
//--------------------------------------------------------------------------






//------------------------------------------------------------------------
//------------------------------------------------------------------------
//----------------------DELETE REQUESTS -------------------------------------
//------------------------------------------------------------------------
//------------------------------------------------------------------------
router.delete("/delete", deleteUser);

function deleteUser(req, res, next){
    if(req.session.loggedin){
        users.deleteUser(req.session.playerID);
        res.status(200).send("Deleted account");
    }
    else{
        res.status(404).send("Could not find user");
    }
}
//--------------------------------------------------------------------------
//--------------------------------------------------------------------------
//----------------------END OF DELETE REQUESTS --------------------------------
//--------------------------------------------------------------------------
//--------------------------------------------------------------------------

module.exports = router;