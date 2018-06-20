const fetch = require('node-fetch');

const JAVA_URI = "http://localhost:8080";

module.exports = function (app) {
  app.get('/api/user', findAllUsers);
  app.get('/api/user/:userId', findUserById);
  app.post('/api/user', createUser);
  app.get('/api/profile', profile);
  app.post('/api/logout', logout);
  app.post('/api/login', login);
  app.post('/api/user/update/:userId', updateUser);

  var userModel = require('../models/user/user.model.server');

  function login(req, res) {
    var credentials = req.body;
    userModel
      .findUserByCredentials(credentials)
      .then(function(user) {
        if(user) {
          console.log("user found");
          console.log(user);
          req.session['currentUser'] = user;
          res.json(user);
        }
        else {
          loginAdmin(credentials)
          .then(function (user) {
            req.session['currentUser'] = user;
            res.send(user);
          });
        }
      });
  }

  function loginAdmin(credentials) {
    console.log("attemping to log in as admin...");
    console.log(credentials);
    return fetch(JAVA_URI + "/api/login", {
      method: 'post',
      body: JSON.stringify(credentials),
      headers: {
        'content-type': 'application/json'
      },
      credentials: "same-origin"
    })
    .then((response) => {
      return response.json();
    })
    .then((user) => {
      console.log("admin user found!");
      user.isAdmin = true;
      return userModel.createUser(user);
    });
  }

  function logout(req, res) {
    req.session.destroy();
    res.send(200);
  }

  function findUserById(req, res) {
    var id = req.params['userId'];
    userModel.findUserById(id)
      .then(function (user) {
        res.json(user);
      })
  }

  function profile(req, res) {
    res.send(req.session['currentUser']);
  }

  function createUser(req, res) {
    console.log("creating user");
    var user = req.body;
    userModel.createUser(user)
      .then(function (user) {
        req.session['currentUser'] = user;
        res.send(user);
      })
  }

  function updateUser(req, res) {
    var id = req.params['userId'];
    console.log(id);
    var updatedUser = req.body;
    console.log(JSON.stringify(updatedUser));
    userModel.updateUser(id, updatedUser)
             .then(updatedUserInDB => {
               console.log("here's the updated user in the database");
               console.log(updatedUserInDB);
               res.send(updatedUserInDB);
             });
  }

  function findAllUsers(req, res) {
    userModel.findAllUsers()
      .then(function (users) {
        res.send(users);
      })
  }
}
