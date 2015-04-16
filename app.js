//ADDING LIBRARIES/MODULES/MIDDLEWARE TO APP://
///////////////////////////////////////////////
//Creating an Express application:
var express = require('express'),
//Adding bodyParser Middleware:
bodyParser = require('body-parser'),

db = require("./models"),
//For API request?
    request = require('request'),
//In order to track sessions, express-session is required (command-line:npm install --save express-session):
    session = require("express-session"),
    app = express();
//Adding key information for API:
var env = process.env;
//var api_key = env.MY_API_KEY;
var methodOveride = require('method-override');

app.use(methodOveride("_method"));

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
  if((req.session.userId===null)||(req.session.userId===undefined)) {
    // If no user is currently logged in, then render the login page:
      res.render("user/login");
    } 
    else {
    //If user is already in a session, redirect to the profile page:
    res.redirect('/profile');
  }
});

//Creating get request for signup page which renders the signup file in views/users directory (static page?):
app.get('/profile', function(req,res){
  if(req.session.userId === null) {
    // User is not logged in, so don't let them pass
    res.redirect("/login");
  } else {
    //If user information is valid, allow them to continue to their profile:
    req.currentUser().then(function(user){
      if (user) {
        user.getSongs().then(function(songs) {
          res.render('user/profile', { user: user, songs: songs });
        });
      }
    });
  }
});

//Creating post request to add a new favorite song to the users table:
app.put("/profile", function (req, res) {
  //Creating variables from params entered by new user (from user/signup.ejs form):
  var song = req.body.songTitle;
  var user = req.session.userId;
  //Creates a new user using createSecure function (from user.js file):
  db.Song.create({song_title:song,UserId:user}).then(function(song){
        res.redirect("/profile");
    });
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


app.get('/search', function(req,res) {
  res.render('search')
});

app.get('/songs', function (req, res) {
  var spotifyUrl = "https://api.spotify.com/v1/search?q=track:";
  var songSearch = req.query.songTitle;
  var searchArray = songSearch.split(' ').join("+");
  console.log("This is my array:" +searchArray);
  var url = spotifyUrl + searchArray + "&type=track";
  console.log(url);
  request(url, function(err, resp, body){
    if (!err && resp.statusCode === 200) {
        var jsonData = JSON.parse(body);
//        var albumName = jsonData.tracks.href;
  //      console.log("This is my albumName: "+ albumName);
    }
    console.log("This is my object data: " +jsonData);
    console.log(body);
    res.render('songs',{taco: jsonData});
  });
});



app.get('/album/:id', function (req, res) {
  var url = "https://api.spotify.com/v1/albums/" + req.params.id;
  console.log("This is my url /n/n/n/n/n/n/n/" + url);
  request(url, function(err, resp, body){
    if (!err && resp.statusCode === 200) {
        var jsonData = JSON.parse(body);
//        var albumName = jsonData.tracks.href;
  //      console.log("This is my albumName: "+ albumName);
    }
    res.render('album',{taco: jsonData});
  });
});



//Creating logout for current User:
app.get('/logout', function(req,res){
  req.logout();
  res.redirect('/login');
});

//Telling server to listen to the site:
app.listen(process.env.PORT || 3000), function () {
  console.log("SERVER RUNNING");
};