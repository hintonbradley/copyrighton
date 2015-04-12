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




// where the user submits the sign-up form
app.post("/users", function (req, res) {

  // grab the user from the params
  var user = req.body.user;

  // create the new user
  db.User.
    createSecure(user.email, user.password).
    then(function(){
        res.send("SIGNED UP!");
      });
});

app.listen(3000, function () {
  console.log("SERVER RUNNING");
});