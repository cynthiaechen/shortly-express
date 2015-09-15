var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');
var utility = require('')





var User = db.Model.extend({
  username: 'username',
  password: '',
  salt: ''
});

//look up bcrypt doc
//Encrypt password plus salt in user model instantiation
//determine how to create/add salt
//Add username, salted encrypted password to db and salt
//
module.exports = User;