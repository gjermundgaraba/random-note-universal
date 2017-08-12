var Evernote = require('evernote').Evernote;
var config = require('../config.json');
var callbackUrl = "http://localhost:3000/oauth_callback";
var openRandomNote = require('../randomNote');

var routes = function (app_data_collection) {
  var loginRoutes = {};

  loginRoutes.index = function(req, res) {
    res.render('index', {session: req.session});
  };

  loginRoutes.oauth = function(req, res) {
    req.session.redirectUrl = req.query.redirectUrl;
    var client = new Evernote.Client({
      consumerKey: config.API_CONSUMER_KEY,
      consumerSecret: config.API_CONSUMER_SECRET,
      sandbox: config.SANDBOX,
      china: config.CHINA
    });

    client.getRequestToken(callbackUrl, function(error, oauthToken, oauthTokenSecret, results) {
      if (error) {
        console.log(error);
        res.render(error.data);
        //throw error;
      } else {
        // store the tokens in the session
        req.session.oauthToken = oauthToken;
        req.session.oauthTokenSecret = oauthTokenSecret;

        // redirect the user to authorize the token
        res.redirect(client.getAuthorizeUrl(oauthToken));
      }
    });
  };

  // OAuth callback
  loginRoutes.oauth_callback = function(req, res) {
    var client = new Evernote.Client({
      consumerKey: config.API_CONSUMER_KEY,
      consumerSecret: config.API_CONSUMER_SECRET,
      sandbox: config.SANDBOX,
      china: config.CHINA
    });

    client.getAccessToken(
      req.session.oauthToken, 
      req.session.oauthTokenSecret, 
      req.query.oauth_verifier,
      function(error, oauthAccessToken, oauthAccessTokenSecret, results) {
        if (error) {
          throw err;
        } else {
          // store the access token in the session
          var userData = {
            oauthAccessToken: oauthAccessToken,
            oauthAccessTokenSecret: oauthAccessTokenSecret,
            edamShard: results.edam_shard,
            edamUserId: results.edam_userId,
            edamExpires: results.edam_expires,
            edamNoteStoreUrl: results.edam_noteStoreUrl,
            edamWebApiUrlPrefix: results.edam_webApiUrlPrefix
          }

          app_data_collection.findOne({}, function(err, item) {
            if (err) {
              throw err;
            } else if (item) {
              app_data_collection.update (
                  { _id : item._id },
                  { $set : userData },
                  function( err, result ) {
                      if ( err ) throw err;
                  }
              );
            } else {
              app_data_collection.insert(userData, function(err, result) {
                  if (err) throw err;
              });
            }
          })

          if (req.session.redirectUrl) {
            res.redirect(req.session.redirectUrl);
          } else {
            res.redirect('/');
          }

          openRandomNote(userData);
          setTimeout(function() { // To give some time for serving up index
            process.exit();
          }, 3000);
          
        }
    });
  };

  // Clear session
  loginRoutes.clear = function(req, res) {
    req.session.destroy();
    res.redirect('/');
  };

  return loginRoutes;

}

module.exports = routes;