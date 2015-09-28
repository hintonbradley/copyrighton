//Most up to date!

///////////////////////////////////////////////
//ADDING LIBRARIES/MODULES/MIDDLEWARE TO APP://
///////////////////////////////////////////////

//Creating an Express application:
var express = require('express'),
//Adding bodyParser Middleware:
bodyParser = require('body-parser'),
//Creating models to define how data is to be stored:
db = require("./models"),
//Create ability to make API/http calls:
    request = require('request'),
//In order to track sessions, express-session is required (command-line:npm install --save express-session):
    session = require("express-session"),
    app = express();

// Add public file for css
app.use(express.static(__dirname + '/public'));

//Overrides the method of a request (for PUTS?)
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

/////////////////////////
//CREATING GET REQUESTS//
/////////////////////////

//Creating get request for index page which renders the index file in views directory (static page):

//Creating get request for index page which renders the index file in views directory (static page):
app.get("/", function (req, res) {
  if((req.session.userId === null)||(req.session.userId === undefined)) {
    // User is not logged in.
    var signedIn=0;
  }
  // Need to pass in the signedIn variable in order to toggle between the two navbar options.  In the key value pair below, the key 'taco' is what is referenced on the index page so it knows when to toggle back and forth. The value 'signedIn' refers to the variable that is defined above.
  res.render('index', {taco:signedIn});
});

//Creating get request for signup page:
app.get('/signup', function(req,res){
  res.render("user/signup");
});

//Creating get request for login page:
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

//Get request for search page:
app.get('/search', function(req,res) {
  if((req.session.userId === null)||(req.session.userId === undefined)) {
    // User is not logged in.
    var signedIn=0;
  }
  res.render('search', {taco:signedIn});
});

//Get request for songs page:
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
    res.render('songs',{taco: jsonData, songTitle: req.query.songTitle});
  });
});

//Creating get request for album page:
app.get('/album/:id/:name/:album/:artist', function (req, res) {
    if((req.session.userId === null)||(req.session.userId === undefined)) {
    // User is not logged in.
    var signedIn=0;
  }
  var url = "https://api.spotify.com/v1/albums/" + req.params.id;
  request(url, function(err, resp, body){
    if (!err && resp.statusCode === 200) {
        var jsonData = JSON.parse(body);
//        var albumName = jsonData.tracks.href;
  //      console.log("This is my albumName: "+ albumName);
    }
    console.log(jsonData);
    // Passing url params (albumId: req.params.id and songTitle: req.params.name, etc.) as (an object) parameter to render the /album page.  ejs file would list albumId, songTitle, etc as undefined without the object parameters below.
    res.render('album',{taco: jsonData, albumId: req.params.id, songTitle: req.params.name, albumName: req.params.album, artistName: req.params.artist, batman:signedIn});
  });
});

app.get('/songs/:id', function(req,res) {
  if((req.session.userId === null)||(req.session.userId === undefined)) {
  // User is not logged in.
  var signedIn=0;
}
// Need to pass in the signedIn variable in order to toggle between the two navbar options.  In the key value pair below, the key 'taco' is what is referenced on the index page so it knows when to toggle back and forth. The value 'signedIn' refers to the variable that is defined above.
  var songId = req.params.id;
  console.log("THIS IS THE songId: " + songId);
  db.Song.find({ where: {id: songId }})
    .then(function(foundSong) {
      console.log(foundSong);
      res.render('songs/show', { mySong: foundSong, taco: signedIn});
    });  
});


//Creating get request for profile page which renders the signup file in views/users directory (static page?):
app.get('/profile', function(req,res){
  if((req.session.userId === null)||(req.session.userId === undefined)) {
    // User is not logged in.
    var signedIn=0;
  }
  if(req.session.userId === null) {
    // User is not logged in, so don't let them pass
    res.redirect("/login");
  } else {
    //If user information is valid, allow them to continue to their profile:
    req.currentUser().then(function(user){
      if (user) {
        user.getSongs().then(function(songs) {
          res.render('user/profile', { user: user, songs: songs, taco:signedIn});
        });
      }
    });
  }
});

/////////////////
//POST REQUESTS//
/////////////////

//Creating post for profile page so user can save a copyright (for now just the title) to their profile:
app.post('/profile', function(req, res) {
  console.log("Req.params.artist are: " +req.params.artist);
  var userId = req.session.userId || null;
  // Taking the key: values from the hidden form on the album.ejs file and naming it 'favorite'.
  var favorite = req.body.favorite;
  var taco = req.body.taco;
  // If there is no current user logged in, then redirect the user to login.
  if(!userId) {
    res.redirect('/login');
  } else {
    // When a user adds data to the table...
    db.Song.create({
      // ...the user id will be taken from whoever the current user who's logged in at the time...
      UserId: req.session.userId,
      // and the rest of the data will be taken from the form field from the album.ejs file. (Remember that favorite is equal to req.body.favorite, and everything that comes after is referring to the specific key:value pair in the ejs file.)
      song_title: favorite.songTitle,
      artist_name: favorite.artistName,
      album_title: favorite.albumName,
      album_id: favorite.albumId,
      copyright: taco.copyrights
    }).then(function() {
      res.redirect('/profile');
    });
  }
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

//Creating logout for current User:
app.get('/logout', function(req,res){
  req.logout();
  res.redirect('/login');
});

///////////////
//PUT REQUEST//
///////////////
app.delete('/songs/:id', function(req,res) {
  var songId = req.params.id;
  db.Song.find(songId)
    .then(function(foundSong){
      foundSong.destroy()
      .then(function() {
        res.redirect('/profile');
      });
    });
});

//////////////
//LOCAL HOST//
//////////////

//Telling server to listen to the site:
app.listen(process.env.PORT || 3000), function () {
  console.log("SERVER RUNNING");
};