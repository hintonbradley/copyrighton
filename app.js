//Adding libraries and modules to app:
var express = require('express'),
    bodyParser = require('body-parser'),
    db = require("./models"),
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

//Creating post request to add a new user to the users table (not working yet) - will get the "SIGNED UP" message, but will not list on /allUsers page:

// where the user submits the sign-up form
app.post("/signup", function (req, res) {

  // grab the user from the params
  var email = req.body.email;
  var password = req.body.password;
  // create the new user
  db.User.create({email:email, password:password}).then(function(newUser){
        res.send("SIGNED UP!");
      });
});

app.listen(3000, function () {
  console.log("SERVER RUNNING");
});