var mongoose = require('mongoose');
var userSchema = require('./user.schema.server');
var userModel = mongoose.model('UserModel', userSchema);

function findUserByCredentials(credentials) {
  return userModel.findOne(credentials);
}

function findUserById(userId) {
  return userModel.findById(userId);
}

function createUser(user) {
  return userModel.findOne({username: user.username})
                  .then(res => {
                    if(!res)
                      return userModel.create(user)
                    return null;
                  });
}

function findAllUsers() {
  return userModel.find();
}

function updateUser(userId, updatedUser) {
  console.log("here's the updated user.....");
  console.log(updatedUser);
  console.log("btw, the id we're updating is " + userId);
  //return userModel.update({_id: userId}, {$set: updatedUser});
  return userModel.findById(userId)
                  .then(user => {
                    return user.save(updatedUser);
                  });
}

var api = {
  createUser: createUser,
  findAllUsers: findAllUsers,
  findUserById: findUserById,
  findUserByCredentials: findUserByCredentials,
  updateUser: updateUser
};

module.exports = api;
