//Adding libraries and modules to app:
var express = require('express'),
    bodyParser = require('body-parser'),
    db = require("./models"),
//For API request?
    request = require('request'),
//In order to track sessions, express-session is required (command-line:npm install --save express-session):
    session = require("express-session"),
    app = express();

//installed ejs to read html files under views/user directory:
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));

//Defining the req.session (specific user who logs in):
app.use(session({
  secret: 'Double Top Secret Probation',
  resave: false,
  save: {uninitialized: true
  }
}))

//Creating ability to track sessions:
app.use("/", function (req, res, next) {

//If user has not signed in, this code sets req.session.userId to null, otherwise, it will set to current user:
  req.session.userId = req.session.userId || null;


  req.login = function (user) {
    req.session.userId = user.id;
  };

  req.currentUser = function () {
    return db.User.find({
        where: {
          id: req.session.userId
       }
      }).
      then(function (user) {
        req.user = user;
        return user;
      })
  };

  req.logout = function () {
    req.session.userId = null;
    req.user = null;
  }

  next(); 
});

//Creating get request for index page which renders the index file in views directory (static page):
app.get("/", function (req, res) {
  res.render('index');
});

//Creating get request for signup page which renders the signup file in views/users directory (static page?):
app.get('/signup', function(req,res){
  res.render("user/signup");
});

//Creating get request for signup page which renders the signup file in views/users directory (static page?):
app.get('/login', function(req,res){
  res.render("user/login");
});

//Creating get request for signup page which renders the signup file in views/users directory (static page?):
app.get('/profile', function(req,res){
  if(req.session.userId === null) {
    // User is not logged in, so don't let them pass
    res.redirect("/login");
  } else {
    //If user information is valid, allow them to continue to their profile:
    req.currentUser().then(function(dbUser){
      if (dbUser) {
        res.render('user/profile',{User:dbUser})
      }
    });
  }
});


//Creating get request to display all users (for testing only):
app.get('/allusers', function(req,res) {
  db.User.all().then(function(allUsers){
    res.render('users', {dbUsers: allUsers});
  })
});


//Creating post request to add a new user to the users table:
//page where user will enter new user info:
app.post("/signup", function (req, res) {
  //Creating variables from params entered by new user (from user/signup.ejs form):
  var email = req.body.email;
  var password = req.body.password;
  //Creates a new user using createSecure function (from user.js file):
  db.User.createSecure(email,password).then(function(user){
        res.render("user/login");
    });
});

//Creating post request for user login:
app.post("/login", function (req, res) {
  var user = req.body;
  db.User.authenticate(user.email, user.password)
    .then(function (dbUser) {
      if(dbUser) {
        req.login(dbUser);
        res.redirect('/profile');
      } else {
        res.send('You failed');
      }
    });
});

app.get('/search', function (req, res) {
  console.log("hello world");
  var songSearch = req.query.songTitle;
  console.log("This is our song search " + songSearch);
  if (!songSearch) {
    res.render("search");
  } else {
    var url = "https://freemusicarchive.org/api/trackSearch?q="+songSearch+"&limit=10";

    request(url, function(err, resp, body){
      console.log("I'm in here 2");
      if (!err && resp.statusCode === 200) {
        console.log("I'm in here 3");
        var jsonData = JSON.parse(body);
        if (!jsonData.Search) {
          res.render("search", {songs: jsonData });
        }
        res.render("search", {songs: jsonData });
      }
    });
  }
});





//Creating logout for current User:
app.get('/logout', function(req,res){
  req.logout();
  res.redirect('/login');
});



//Telling server to listen to the site:
app.listen(3000, function () {
  console.log("SERVER RUNNING");
});