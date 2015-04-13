//Adding libraries and modules to app:
var express = require('express'),
    bodyParser = require('body-parser'),
    db = require("./models"),
//In order to track sessions, express-session is required (command-line:npm install --save express-session):
    session = require("express-session"),
    app = express();

//installed ejs to read html files under views/user directory:
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));

app.use(session({
  secret: 'super secret',
  resave: false,
  saveUninitialized: true
}))

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
  res.render("login");
});

//Creating get request for search page which renders the signup file in views/users directory (static page?):
app.get('/search', function(req,res){
  res.render("search");
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
        res.render("login");
    });
});

//Creating ability to track sessions:
app.use("/", function (req, res, next) {

  req.login = function (user) {
    req.session.userId = user.id;
  };

  req.currentUser = function () {
    return db.User.
      find({
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



//Telling server to listen to the site:
app.listen(3000, function () {
  console.log("SERVER RUNNING");
});