var models = require('./schema');
var Promise = require('promise');

DocumentManager = function() {}

//Create a new user and assign default guest role to the user
DocumentManager.prototype.createUser = function(user) {

  var promise = function() {

    return new Promise(function(resolve, reject) {

      models.User.create(user, function(err, newUser) {


        if (err) {
          reject(err);
        } else {

          models.Role.findOne({
              title: 'guest'
            },
            function(err, role) {
              if (!role) {

                models.Role.create({
                  title: 'guest'
                }, function(err, newRole) {

                  newUser.roleId = newRole._id;
                  newUser.save(function(err) {
                    resolve(newUser);
                  });
                });
              } else {

                newUser.roleId = role._id;
                newUser.save(function(err) {
                  resolve(newUser);
                });
              }
            });
        }
      });
    });
  }
  return promise();
}

//Returns all users
DocumentManager.prototype.getAllUsers = function() {

  var promise = function() {
    return new Promise(function(resolve) {

      models.User.find({}, function(err, users) {
        resolve(users);
      })
    });
  }

  return promise();
}

//Create a new role
DocumentManager.prototype.createRole = function(role) {

  var promise = function() {
    return new Promise(function(resolve, reject) {

      models.Role.create(role, function(err, role) {
        if (err) {
          reject(err)
        } else {
          resolve(role);
        }
      })
    });
  }

  return promise();
}

//Returns all roles
DocumentManager.prototype.getAllRoles = function() {

  var promise = function() {
    return new Promise(function(resolve) {

      models.Role.find({}, function(err, roles) {
        resolve(roles);
      })
    });
  }

  return promise();

}


//Create a new document object, assigning ownerId to the document, based
//on the username passed as createdBy param
DocumentManager.prototype.createDocument = function(document, createdBy) {

  var promise = function() {
    return new Promise(function(resolve, reject) {

      models.Document.create(document, function(err, doc) {
        if (err) {
          reject(err)
        } else {
          models.User.findOne({
            username: createdBy
          }, function(err, user) {

            if (user) {

              doc.ownerId = user._id;
              doc.save(function(err, doc) {
                resolve(doc);
              });

            } else {
              resolve(doc);
            }

          });
        }
      })
    });
  }

  return promise();

}

//Add role to a document avoiding duplicate with addToSet option
DocumentManager.prototype.addDocumentRole = function(docId, roleTitle) {

  var promise = function() {
    return new Promise(function(resolve) {

      models.Role.findOne({
        title: roleTitle
      }, function(err, role) {

        if (!role) {
          resolve();
        } else {

          models.Document.findByIdAndUpdate(docId, {
              $addToSet: {
                roles: {
                  role_ref: role._id
                }
              }
            }, {
              new: true
            },
            function(err, doc) {
              resolve();
            }
          );
        }
      });
    });
  }

  return promise();
}

//Return at most (limit) number of documents in descending order of date created
DocumentManager.prototype.getAllDocuments = function(limit) {

  var promise = function() {
    return new Promise(function(resolve) {

      var q = models.Document.find({}).sort({
        'dateCreated': -1
      }).limit(limit);
      q.exec(function(err, docs) {
        resolve(docs);
      });
    });
  }

  return promise();
}

//Get all documents containing the role specified and in order of date created
DocumentManager.prototype.getAllDocumentsByRole = function(roleTitle, limit) {

  var promise = function() {
    return new Promise(function(resolve) {

      models.Role.findOne({
        title: roleTitle
      }, function(err, role) {

        if (!role) {
          resolve([]);
        } else {
          var q = models.Document.find({
            'roles.role_ref': role._id
          }).sort({
            'dateCreated': -1
          }).limit(limit);
          q.exec(function(err, docs) {
            resolve(docs);
          });
        }
      });
    });
  }

  return promise();

}

//Get all documents created on the date specified
DocumentManager.prototype.getAllDocumentsByDate = function(date) {


  if (typeof date === 'string') {

    //convert date form yyyy-mm-dd format to date object
    var dateArr = date.split('-');
    if (dateArr.length > 2) {
      date = new Date(dateArr[0], dateArr[1], dateArr[2]);
    } else {
      date = Date.now();
    }

  }

  var promise = function() {
    return new Promise(function(resolve) {

      models.Document.find({
        dateCreated: date
      }, function(err, doc) {

        resolve(doc);
      });
    });
  }

  return promise();

}

module.exports = DocumentManager;
