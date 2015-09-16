var request = require('request');
var bcrypt = require('bcrypt-nodejs');
var Users = require('../app/collections/users');

exports.getUrlTitle = function(url, cb) {
  request(url, function(err, res, html) {
    if (err) {
      console.log('Error reading url heading: ', err);
      return cb(err);
    } else {
      var tag = /<title>(.*)<\/title>/;
      var match = html.match(tag);
      var title = match ? match[1] : url;
      return cb(err, title);
    }
  });
};

var rValidUrl = /^(?!mailto:)(?:(?:https?|ftp):\/\/)?(?:\S+(?::\S*)?@)?(?:(?:(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[0-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))|localhost)(?::\d{2,5})?(?:\/[^\s]*)?$/i;

exports.isValidUrl = function(url) {
  return url.match(rValidUrl);
};

/************************************************************/
// Add additional utility functions below
/************************************************************/


  
exports.saltNHash = function(user, password) { 
  if(typeof password !== 'string'){
    return null;
  }
  bcrypt.genSalt(10, function(err, salt) {
    user.set('salt', salt);
  bcrypt.hash(password, null, null, function(err, hash) {
      // Store hash in your password DB. 
      if(err) {
        console.log(err);
      } else {
        // hashResult = hash;
       
        user.set('password', hash);
        console.log('---------------------------------');
        console.log(Users.models);
      }
  });
});
};

exports.checkPassword = function(user, password, cb) {
  bcrypt.compare(password, user.get('password'), function(err, res) {
      if (err) {
        console.log(err);
      } else {
        cb(res);
      }
  });
}

// module.exports = util;