const express = require('express');
const session = require('express-session');
let users = require("../bussiness_logic/Users.js");
var qs = require('querystring');
let app = express();

app.use(session({ 
    secret: 'Mkj1ZVtZhYR1ezi66XdaxUCtAPElXVNi',
    cookie: {maxAge: 3600000},
    resave: false,
    rolling: true,
    saveUninitialized: true,
}));

//COOKIE DOCUMENTATION BELOW.
/*
Documentation about cookie properties used,
From "https://github.com/expressjs/session#options":

resave
Forces the session to be saved back to the session store, even if the session was never modified during the request. Depending on your store this may be necessary, but it can also create race conditions where a client makes two parallel requests to your server and changes made to the session in one request may get overwritten when the other request ends, even if it made no changes (this behavior also depends on what store you're using).

The default value is true, but using the default has been deprecated, as the default will change in the future. Please research into this setting and choose what is appropriate to your use-case. Typically, you'll want false.

How do I know if this is necessary for my store? The best way to know is to check with your store if it implements the touch method. If it does, then you can safely set resave: false. If it does not implement the touch method and your store sets an expiration date on stored sessions, then you likely need resave: true.

rolling
Force the session identifier cookie to be set on every response. The expiration is reset to the original maxAge, resetting the expiration countdown.

The default value is false.

With this enabled, the session identifier cookie will expire in maxAge since the last response was sent instead of in maxAge since the session was last modified by the server.

This is typically used in conjuction with short, non-session-length maxAge values to provide a quick timeout of the session data with reduced potential of it occurring during on going server interactions.

saveUninitialized
Forces a session that is "uninitialized" to be saved to the store. A session is uninitialized when it is new but not modified. Choosing false is useful for implementing login sessions, reducing server storage usage, or complying with laws that require permission before setting a cookie. Choosing false will also help with race conditions where a client makes multiple parallel requests without a session.

The default value is true, but using the default has been deprecated, as the default will change in the future. Please research into this setting and choose what is appropriate to your use-case.


*/

app.use(express.urlencoded({extended: true}));


app.post("*", parseBody);
app.put("*", parseBody);

//parse the data sent in a post or put request, and save it
function parseBody(req, res, next){
    var body = '';

    req.on('data', function (data) {
        body += data;
    });

    req.on('end', function () {
        req.reqData = qs.parse(body);
        next();
    })
}

app.use(function(req,res,next){
    //parse the friendsList if the user is logged in
    if(req.session.loggedin){
        let ownerData = users.getUserById(req.session.playerID);
        let friendIDs = ownerData.friendsList;
        let friendsList = [];

        for(let i = 0; i < friendIDs.length; i++){
            let currFriend = users.getUserById(friendIDs[i]);
            let currFriendIndex = [];

            currFriendIndex.push(friendIDs[i]);
            currFriendIndex.push(currFriend.username);
            currFriendIndex.push(currFriend.online);
            friendsList.push(currFriendIndex);
        }

        req.session.friendsList = friendsList;
    }
    
	next();
});


app.engine('ejs', require('ejs').__express);
app.set("views", "../views");

app.use(express.static("../public"));

let userRouter = require("../bussiness_logic/UsersRouter.js");
let playRouter = require("../bussiness_logic/PlayRouter.js");
let profileRouter = require("../bussiness_logic/ProfileRouter.js");
let gamesRouter = require("../bussiness_logic/GamesRouter.js");
let indexRouter = require("../bussiness_logic/IndexRouter.js");
let accountRouter = require("../bussiness_logic/AccountRouter.js");
app.use("/users", userRouter);
app.use("/play", playRouter);
app.use("/profile", profileRouter);
app.use("/games", gamesRouter);
app.use("/account", accountRouter);
app.use("/index*", indexRouter);
app.use("/", indexRouter);

app.use(function(error, req, res, next){
    res.status(404).send(error);
    console.log(error);
});

app.listen(3000);
console.log("Server listening at http://localhost:3000");