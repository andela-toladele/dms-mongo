var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/dmsdb');

var DocumentManager = require('./documentManager');

var documentManager = new DocumentManager();

var models = require('./schema');

describe('Document Manager', function(done) {


  describe('User', function() {

    var user;

    beforeEach(function(done) {
      models.User.remove({}, function() {

        user = {};
        user.username = 'matt'
        user.name = {};
        user.name.firstname = 'Dame';
        user.name.lastname = 'Matt';
        user.email = 'matt@gmail.com';
        user.password = 'mattdame';
        done();
      });
    });

    it('should create a new user', function(done) {


      documentManager.createUser(user).then(function(newUser) {

        expect(newUser).toBeDefined();
        done();
      });

    });


    it('should create a new user with role defined', function(done) {


      documentManager.createUser(user).then(function(newUser) {

        expect(newUser.roleId).toBeDefined();
        done();
      });
    });

    it('should create a new user with firstname and lastname', function(done) {


      documentManager.createUser(user).then(function(newUser) {

        expect(newUser).toEqual(jasmine.objectContaining({
          username: 'matt',
        }));
        done();
      });
    });

    it('should create a not create user with duplicate username', function(done) {


      var promise = function() {

        return new Promise(function(resolve) {
          models.User.create(user, function(err, newUser) {

            resolve();
          });
        });
      }

      promise().then(function() {
        documentManager.createUser(user)
          .catch(function(err) {

            expect(err).not.toBeNull();
            done();
          });
      });
    });

    it('should retrieve number of user records created', function(done) {

      documentManager.createUser(user).then(function() {
        user.username = 'user1'
        documentManager.createUser(user).then(function() {
          user.username = 'user2'
          documentManager.createUser(user).then(function() {
            user.username = 'user3'
            documentManager.createUser(user).then(function() {

              documentManager.getAllUsers().then(function(count) {
                expect(count.length).toBe(4);
                done();
              });
            });
          });
        });
      });
    });

  });


  describe('Role', function() {

    beforeEach(function(done) {
      models.Role.remove({}, function() {

        done();
      });
    });

    it('should create a new role', function(done) {

      documentManager.createRole({
        title: 'admin'
      }).then(function(role) {

        expect(role).toBeDefined();
        done();
      })
    });

    it('should create a new role with the specified title', function(done) {

      documentManager.createRole({
        title: 'admin'
      }).then(function(role) {

        expect(role).toEqual(jasmine.objectContaining({
          title: 'admin'
        }));
        done();
      })
    });


    it('should create a not create role with duplicate title', function(done) {

      documentManager.createRole({
        title: 'admin'
      }).then(function(role) {

        documentManager.createRole({
          title: 'admin'
        }).catch(function(err) {
          expect(err).toBeDefined();
          done();
        });
      });
    });

    it('should retrieve number of roles created', function(done) {

      documentManager.createRole({
        title: 'guest'
      }).then(function() {

        documentManager.createRole({
          title: 'guest1'
        }).then(function() {

          documentManager.createRole({
            title: 'guest2'
          }).then(function() {

            documentManager.createRole({
              title: 'guest3'
            }).then(function() {

              documentManager.getAllRoles().then(function(roles) {
                expect(roles.length).toBe(4);
                done();
              });
            });
          });
        });
      });
    });
  });

  describe('Document', function() {
    var user;

    beforeEach(function(done) {

      models.Document.remove({}, function() {

        models.User.remove({}, function() {

          user = {};
          user.username = 'matt'
          user.name = {};
          user.name.firstname = 'Dame';
          user.name.lastname = 'Matt';
          user.email = 'matt@gmail.com';
          user.password = 'mattdame';

          documentManager.createUser(user).then(function(newUser) {
            user.id = newUser._id;
            done();
          });
        });
      });
    });

    it('should create a new document with date created field', function(done) {

      documentManager.createDocument({
        title: 'doc1',
        content: 'content1'
      }, user.username).then(function(doc) {

        expect(doc).toBeDefined();
        expect(doc.dateCreated).toBeDefined();

        expect(doc.ownerId.toString()).toBe(user.id.toString());
        done();
      })
    });


    it('should retrieve number of documents created based on the limit specified', function(done) {

      documentManager.createDocument({
        title: 'doc1',
        content: 'content1'
      }, user.username).then(function() {

        documentManager.createDocument({
          title: 'doc2',
          content: 'content2'
        }, user.username).then(function() {

          documentManager.createDocument({
            title: 'doc3',
            content: 'content3'
          }, user.username).then(function() {

            documentManager.createDocument({
              title: 'doc4',
              content: 'content4'
            }, user.username).then(function() {

              documentManager.getAllDocuments(2).then(function(docs) {
                expect(docs.length).toBe(2);
                done();
              });
            });
          });
        });
      });
    });


    it('should retrieve number of documents created based on the limit specified and in order of date created', function(done) {

      documentManager.createDocument({
        title: 'doc1',
        content: 'content1',
        dateCreated: new Date(2015, 9, 7)
      }, user.username).then(function() {

        documentManager.createDocument({
          title: 'doc2',
          content: 'content2',
          dateCreated: new Date(2015, 9, 5)
        }, user.username).then(function() {

          documentManager.createDocument({
            title: 'doc3',
            content: 'content3',
            dateCreated: new Date(2015, 9, 6)
          }, user.username).then(function() {

            documentManager.createDocument({
              title: 'doc4',
              content: 'content4',
              dateCreated: new Date(2015, 9, 4)
            }, user.username).then(function() {


              documentManager.getAllDocuments(2).then(function(docs) {
                expect(docs.length).toBe(2);
                expect(docs[0]).toEqual(jasmine.objectContaining({
                  title: 'doc1',
                  content: 'content1'
                }));

                expect(docs[1]).toEqual(jasmine.objectContaining({
                  title: 'doc3',
                  content: 'content3'
                }));

                done();
              });
            });
          });
        });
      });
    });
  });


  describe('Search', function() {

    var user;

    beforeEach(function(done) {
     
        models.Document.remove({}, function() {

          models.User.remove({}, function() {

            models.Role.remove({}, function() {

              user = {};
              user.username = 'matt'
              user.name = {};
              user.name.firstname = 'Dame';
              user.name.lastname = 'Matt';
              user.email = 'matt@gmail.com';
              user.password = 'mattdame';

              documentManager.createUser(user).then(function(newUser) {
                user = newUser;
                documentManager.createRole({
                  title: 'view1'
                }).then(function() {

                  documentManager.createRole({
                    title: 'view2'
                  }).then(function() {

                    documentManager.createDocument({
                      title: 'doc1',
                      content: 'content1',
                      dateCreated: new Date(2015, 9, 7)
                    }, user.username).then(function(doc) {

                      documentManager.addDocumentRole(doc._id, 'view1').then(function() {

                        documentManager.createDocument({
                          title: 'doc2',
                          content: 'content2',
                          dateCreated: new Date(2015, 9, 5)
                        }, user.username).then(function(doc) {

                          documentManager.addDocumentRole(doc._id, 'view2').then(function() {
                            documentManager.createDocument({
                              title: 'doc3',
                              content: 'content3',
                              dateCreated: new Date(2015, 9, 5)
                            }, user.username).then(function(doc) {

                              documentManager.addDocumentRole(doc._id, 'view1').then(function() {
                                documentManager.createDocument({
                                  title: 'doc4',
                                  content: 'content4',
                                  dateCreated: new Date(2015, 9, 6)
                                }, user.username).then(function(doc) {
                                  documentManager.addDocumentRole(doc._id, 'view1').then(function() {
                                    done();
                                  });
                                });
                              });
                            });
                          });
                        });
                      });
                    });
                  });
                });
              });
            });
          });
        });      
    });

    it('should create retrieve only the documents with role1 access', function(done) {

      documentManager.getAllDocumentsByRole('view1', 2).then(function(docs) {

        expect(docs.length).toBe(2);
        expect(docs[0]).toEqual(jasmine.objectContaining({
          title: 'doc1',
          content: 'content1'
        }));

        expect(docs[1]).toEqual(jasmine.objectContaining({
          title: 'doc4',
          content: 'content4'
        }));

        done();
      });
    });

    it('should create retrieve only the documents with role2 access', function(done) {

      documentManager.getAllDocumentsByRole('view2', 4).then(function(docs) {

        expect(docs.length).toBe(1);
        expect(docs[0]).toEqual(jasmine.objectContaining({
          title: 'doc2',
          content: 'content2'
        }));

        done();
      });
    });


    it('should create retrieve documents by specified date', function(done) {

      documentManager.getAllDocumentsByDate(new Date(2015, 9, 5)).then(function(docs) {

        expect(docs.length).toBe(2);
        done();
      });
    });

  });


});
