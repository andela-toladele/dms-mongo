var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var UserSchema = new Schema({
  username: {
    type: String,
    index: {
      unique: true
    },
    required: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    firstname: String,
    lastname: String
  },
  email: {
    type: String
  },
  roleId: {
    type: String,
    ref: 'Role'
  }
}, {
  versionKey: false
});


var RoleSchema = new Schema({

  title: {
    type: String,
    index: {
      unique: true
    },
    required: true
  }
}, {
  versionKey: false
});

var DocumentSchema = new Schema({

  ownerId: {
    type: String,
    ref: 'User'
  },
  title: {
    type: String
  },
  content: {
    type: String
  },
  dateCreated: {
    type: Date,
    default: Date.now()
  },
  lastModified: {
    type: Date,
    default: Date.now()
  },
  roles: [Schema({
    role_ref: {
      type: String,
      ref: 'Role'
    }
  }, {_id: false})]

}, {
  versionKey: false
});

var User = mongoose.model('User', UserSchema);
var Role = mongoose.model('Role', RoleSchema);
var Document = mongoose.model('Document', DocumentSchema);

module.exports = {
  User: User,
  Role: Role,
  Document: Document
}
