var Engine = require('tingodb')();
var openRandomNote = require('./randomNote');
const opn = require('opn');
var db = new Engine.Db('./', {});
db.createCollection("app_data")
var app_data_collection = db.collection("app_data");

// Module dependencies
var bodyParser = require('body-parser');
var express = require('express');
var expressSession = require('express-session');
var routes = require('./routes')(app_data_collection);

var app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'pug');

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(expressSession({
  secret: 'supersecretsecret3',
  resave: false,
  saveUnititialized: true
}));

// Routes
app.get('/', routes.index);
app.get('/oauth', routes.oauth);
app.get('/oauth_callback', routes.oauth_callback);
app.get('/clear', routes.clear);

app_data_collection.findOne({}, function(err, userData) {
  if (err) {
    throw err;
  } else if (userData && userData.oauthAccessToken) {
    openRandomNote(userData);
  } else {
    // Run
    app.listen(3000 , function() {
      console.log('Express server listening on port 3000');
      opn('http://localhost:3000/oauth');
    });
  }
})

    
    