(() => {
  'use strict';

  const BearerStrategy = require('passport-http-bearer');
  const BodyParser = require('body-parser');
  const chai = require('chai');
  const CrudManager = require('../../lib/helpers/crud-manager');
  const EventEmitter = require('events');
  const express = require('express');
  const MessageCenter = require('../../lib/message-center');
  const passport = require('passport');
  const request = require('supertest');

  const {expect} = chai;

  const TOKEN = {
    user: {
      scopes: [{name: 'base'}, {name: 'test'}]
    }
  };

  class BaseServer extends EventEmitter {
    constructor() {
      super();
      this._express = express();

      this._express.use(BodyParser.json());
      this._express.use(BodyParser.urlencoded({extended: false}));
      this._express.use(passport.initialize());
      passport.use(new BearerStrategy((token, done) => {
        if ('1234' === token) {
          done(null, TOKEN.user);
        } else {
          done(new Error('user not found'));
        }
      }));
    }

    use(path, middleware) {
      if (middleware.auth) middleware = middleware.func;
      return Promise.resolve(this._express.use(path, middleware));
    }

    get express() {
      return this._express;
    }
  };

  describe('CrudRouter', () => {
    let messageCenter = null;
    let baseServer = null;
    let manager = null;
    let item = null;

    beforeEach('Create message center', () => {
      messageCenter = new MessageCenter(require('cluster'), process);
    });

    beforeEach('Create base server', () => {
      baseServer = new BaseServer();
    });

    beforeEach('Create manager', () => {
      manager = new CrudManager('crud#Test', {
        readScopes: ['test'],
        writeScopes: ['base', 'test'],
        routePath: '/api/test/helpers'
      });
      return manager.load(messageCenter, baseServer);
    });

    beforeEach('Create dummy entry', () => {
      const req = {
        foo: 'bar',
        num: 42,
        managers: ['@nbroeking', '@JaMaconMeCray']
      };
      return Promise.resolve()
      .then(() => manager.create(req))
      .then((res) => Promise.resolve(item = res));
    });

    /**
     * Auth tests
     */
    it('should FAIL / op without token', (done) => {
      const EventEmitter = require('events');
      const emitter = new EventEmitter();
      const req = {
        items: item,
        emit: (event, data) => emitter.emit(event, data)
      };
      req.emit('data', JSON.stringify(TOKEN.user));
      Promise.resolve()
      .then(() => {
        request(baseServer.express)
        .post('/api/test/helpers/create')
        .send(req)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(500)
        .end((err, res) => done());
      })
      .catch(done);
    });

    /**
     * CREATE tests
     */
    it('should POST / create an entry from single item', (done) => {
      const req = {
        items: item
      };
      Promise.resolve()
      .then(() => {
        request(baseServer.express)
        .post('/api/test/helpers/create')
        .send(req)
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer 1234')
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          const {result} = res.body;
          expect(!!result.id).to.be.true;
          done();
        });
      })
      .catch(done);
    });

    it('should POST / create entries from array', (done) => {
      const req = {
        items: [item]
      };
      Promise.resolve()
      .then(() => {
        request(baseServer.express)
        .post('/api/test/helpers/create')
        .send(req)
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer 1234')
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          const {result} = res.body;
          expect(result).to.be.an('array');
          expect(result).to.have.lengthOf(1);
          result.forEach((r) => expect(!!r.id).to.be.true);
          done();
        });
      })
      .catch(done);
    });

    /**
     * UPDATE tests
     */
    it('should POST / update an entry from single id', (done) => {
      const req = {
        ids: item.id,
        update: {num: 43}
      };
      Promise.resolve()
      .then(() => {
        request(baseServer.express)
        .post('/api/test/helpers/update')
        .send(req)
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer 1234')
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          const {result} = res.body;
          expect(result.num).to.be.equal(43);
          done();
        });
      })
      .catch(done);
    });

    it('should POST / update entries from array of ids', (done) => {
      const req = {
        ids: [item.id],
        update: {num: 43}
      };
      Promise.resolve()
      .then(() => {
        request(baseServer.express)
        .post('/api/test/helpers/update')
        .send(req)
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer 1234')
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          const {result} = res.body;
          expect(result).to.be.an('array');
          expect(result).to.have.lengthOf(1);
          result.forEach((r) => expect(r.num).to.be.equal(43));
          done();
        });
      })
      .catch(done);
    });

    /**
     * DELETE tests
     */
    it('should POST / delete an entry from single id', (done) => {
      const req = {
        ids: item.id
      };
      Promise.resolve()
      .then(() => {
        request(baseServer.express)
        .post('/api/test/helpers/delete')
        .send(req)
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer 1234')
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          const {result} = res.body;
          expect(result.id).to.be.equal(item.id);
          done();
        });
      })
      .catch(done);
    });

    it('should POST / delete entries from array of ids', (done) => {
      const req = {
        ids: [item.id]
      };
      Promise.resolve()
      .then(() => {
        request(baseServer.express)
        .post('/api/test/helpers/delete')
        .send(req)
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer 1234')
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          const {result} = res.body;
          expect(result).to.be.an('array');
          expect(result).to.have.lengthOf(1);
          result.forEach((r) => expect(r.id).to.be.equal(item.id));
          done();
        });
      })
      .catch(done);
    });

    /**
     * GET tests
     */
    it('should GET / get an entry from single id', (done) => {
      Promise.resolve()
      .then(() => {
        request(baseServer.express)
        .get(`/api/test/helpers/${item.id}`)
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer 1234')
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {
          const {result} = res.body;
          if (err) {
            return done(err);
          }
          const resultKeys = Object.keys(result);
          expect(resultKeys.length).to.be.equal(Object.keys(item).length);
          resultKeys.forEach((key) => {
            const val = result[key];
            if (Array.isArray(val)) {
              val.forEach((v) => expect(item[key]).to.include(v));
            } else {
              expect(val).to.be.equal(item[key]);
            }
          });
          expect(result.id).to.be.equal(item.id);
          done();
        });
      })
      .catch(done);
    });

    /**
     * LIST tests
     */
    it('should GET / list all entries', (done) => {
      Promise.resolve()
      .then(() => {
        request(baseServer.express)
        .get('/api/test/helpers/')
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer 1234')
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          const {result} = res.body;
          expect(result).to.be.an('array');
          expect(result.length).to.be.equal(1);
          expect(result[0].id).to.be.equal(item.id);
          done();
        });
      })
      .catch(done);
    });

    /**
     * COUNT tests
     */
    it('should GET / count all entries', (done) => {
      Promise.resolve()
      .then(() => {
        request(baseServer.express)
        .get('/api/test/helpers/count')
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer 1234')
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          const {result} = res.body;
          expect(result).to.be.a('number');
          expect(result).to.be.equal(1);
          done();
        });
      })
      .catch(done);
    });
  });
})();
