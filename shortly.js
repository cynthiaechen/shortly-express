var express = require('express');
var util = require('./lib/utility');
var partials = require('express-partials');
var bodyParser = require('body-parser');
var bcrypt = require('bcrypt-nodejs');
var session = require('express-session');

var db = require('./app/config');
var Users = require('./app/collections/users');
var User = require('./app/models/user');
var Links = require('./app/collections/links');
var Link = require('./app/models/link');
var Click = require('./app/models/click');
var uuid = require('uuid');

var app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(partials());
// Parse JSON (uniform resource locators)
app.use(bodyParser.json());
// Parse forms (signup/login)
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));

app.use(session({
  secret: 'ella fitzgerald'
}));


//ADD CALLBACK TO SEE IF AUTHENTICATED AND THEN REDIRECT ACCORDINGLY
app.get('/',
function(req, res) {
  console.log(req);
  res.redirect('/login');
  // res.render('index');
});
//ADD CALLBACK TO SEE IF AUTHENTICATED AND THEN REDIRECT ACCORDINGLY
app.get('/create', 
function(req, res) {
  res.redirect('/login');
  // res.render('index');
});
//ADD CALLBACK TO SEE IF AUTHENTICATED AND THEN REDIRECT ACCORDINGLY
//Robert: Sends back all link models data array of objects probably a json file
app.get('/links', 
function(req, res) {
//WHAT ARE THE RESET METHOD AND FETCH METHOD DOING HERE?
  // res.redirect('/login');
  Links.reset().fetch().then(function(links) {
    res.send(200, links.models);
  });
});

app.get('/login', 
function(req, res) {
  res.render('login');
});

app.post('/login', function(req, res) {
    //select model where username === req.body.username
    console.log('-----------------------------------------------!!!!');
  var loginUser = Users.findWhere({'username': req.body.username});
  if(loginUser) {
    var isPasswordCorrect;
    util.checkPassword(loginUser, req.body.password, function(isPasswordCorrect) {
      if (isPasswordCorrect) {
        req.session.user = loginUser;
        console.log(req.session.user);
        res.render('index');
      } else {
        res.end('Incorrect Password');
        // res.redirect('/login');
      }
    });
  }
  //use bcrypt.compare (req.body.password, model.password, function(err,res) {})
  //if (res), then redirect to '/create'
  //else tell user password is incorrect
});

app.get('/signup',
  function(req,res) {
    res.render('signup');
  });

app.post('/signup', 
function(req, res) {
  if(Users.findWhere({'username': req.body.username}) === undefined) {
    var newUser = new User({
      username : req.body.username,
      password: '',
      salt: '',
      tableName: 'users'
    });
    //??ARE WE SETTING THE ATTRIBUTES CORRECTLY ON THE mODEL
    util.saltNHash(newUser, req.body.password);
    Users.add(newUser);
    //Add new user to db
    req.session.user = newUser;
    res.writeHead(201, {'Content-Type': 'text/html'});
    res.end();
  } else {
    res.writeHead(422, {'Content-Type': 'text/html'});
    res.end('username taken');
  }
});

app.post('/links', 
function(req, res) {
  var uri = req.body.url;

  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.send(404);
  }
//CREATES A NEW LINK MODEL IF VALID URL AND PASSES IN THE REQ.BODY.URL. CHECKS IF THE URL EXISTS AND IF IT DOES SEND IT IN RESPONSE (found.attributes)

  new Link({ url: uri }).fetch().then(function(found) {
    if (found) {
      res.send(200, found.attributes);
    } else {
      util.getUrlTitle(uri, function(err, title) {
        if (err) {
          console.log('Error reading URL heading: ', err);
          return res.send(404);
        }
//CREATE A NEW LINK MODEL FROM THE COLLECTION WITH THE REQUEST.BODY.URL

        Links.create({
          url: uri,
          title: title,
          base_url: req.headers.origin
        })
        .then(function(newLink) {
          res.send(200, newLink);
        });
      });
    }
  });
});

/************************************************************/
// Write your authentication routes here
/************************************************************/



/************************************************************/
// Handle the wildcard route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/

//ANY GET REQUEST WILL CREATE A NEW LINK MODEL FROM THE REQ PARAMS AT INDEX 0. IF NOT A LINK THEN RETURN USER TO THE HOME PAGE

app.get('/*', function(req, res) {
  new Link({ code: req.params[0] }).fetch().then(function(link) {
    if (!link) {
      res.redirect('/');
    } else {
      //CREATING A NEW CLICK MODEL AND ASSIGNING THE LINK_ID TO THE ID OF THE LINK
      var click = new Click({
        link_id: link.get('id')
      });
      //INVOKES SAVE METHOD OF CLICK AND INCREMENTS VISIT COUNT FOR THAT LINK 
      //WHAT DOES THE REDIRECT METHOD DO EXACTLY?
      click.save().then(function() {
        link.set('visits', link.get('visits')+1);
        link.save().then(function() {
          return res.redirect(link.get('url'));
        });
      });
    }
  });
});

//SERVER LISTENING ON PORT 4568, MOST LIKELY AT IP 127.0.0.1
console.log('Shortly is listening on 4568');
app.listen(4568);
