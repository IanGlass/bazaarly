'use strict'

process.env.testing = true;

const { assert } = require('chai');
const {
  describe,
  after,
  before,
  it,
} = require('mocha');

const { app } = require('../../../app')
const request = require('supertest');
const sinon = require('sinon');

const async = require('async');
const User = require('../../../models/user');
const { users } = require('../../data/users');
const log = require('../../../logger');

describe('AuthController', () => {
  before(done => {
    async.auto({
      createUsers: callback => {
        User
          .create(users)
          .then(() => {
            callback();
          })
          .catch(error => {
            callback(error);
          })
      },
    }, done)
  }),

  beforeEach(done => {
    this.sinon = sinon.createSandbox();
    done();
  }),

  after(done => {
    async.auto({
      deleteUsers: callback => {
        User
          .deleteMany({})
          .then(() => {
            callback() 
          })
          .catch(error => {
            callback(error);
          })
      }
    }, done)
  }),

  afterEach(done => {
    this.sinon.restore();
    done();
  }),

  describe('POST /login', () => {
    it('should succeed login', done => {
      const logInfo = this.sinon.spy(log, 'info');
      request(app)
        .post('/login')
        .send({
          email: users[0].email,
          password: users[0].unhashedPassword,
        })
        .expect(302)
        .end((error, res) => {
          assert.strictEqual(logInfo.getCall(0).args[0], 'POST /login - User Logged In                  - user.email: admin@admin.com');
          done(error)
        })
    }),
    it('should fail login with incorrect password', done => {
      const logInfo = this.sinon.spy(log, 'info');
      request(app)
        .post('/login')
        .send({
          email: users[0].email,
          password: 'iamnotcorrect',
        })
        .expect(302)
        .end((error, res) => {
          assert.strictEqual(logInfo.getCall(0).args[0], 'POST /login - Password Mismatch                  - user.email: admin@admin.com');
          done(error);
        })
    }),
    it('should fail for invalid user email', done => {
      const logInfo = this.sinon.spy(log, 'info');
      request(app)
        .post('/login')
        .send({
          email: 'invalid@user.com',
          password: 'iamnotcorrect',
        })
        .expect(302)
        .end((error, res) => {
          assert.strictEqual(logInfo.getCall(0).args[0], 'POST /login - No User Found                  - req.body.email: invalid@user.com');
          done(error);
        })
    })
  }),

  describe('POST /signup', () => {
    it('should create a user', done => {
      request(app)
        .post('/signup')
        .send({
          email: 'asd@asd.com',
          password: 'supersecure',
          confirmPassword: 'supersecure',
          admin: false,
        })
        .expect(302)
        .end((error, res) => {
          User
            .findOne({ email: 'asd@asd.com' })
            .then(user => {
              assert.strictEqual(user.email, 'asd@asd.com');
              done(error)
            })
            .catch(error => {
              done(error);
            })
        })
    }),
    it('should fail for existing user email', done => {
      const logInfo = this.sinon.spy(log, 'info');
      request(app)
        .post('/signup')
        .send({
          email: 'admin@admin.com',
          password: 'supersecure',
          confirmPassword: 'supersecure',
          admin: false,
        })
        .expect(302)
        .end((error, res) => {
          assert.strictEqual(logInfo.getCall(0).args[0], 'POST /login - User Email Already Exists                 - req.body.email: admin@admin.com');
          done(error);
        })
    })
  }),

  describe('POST /reset', done => {
    it('should send a reset link', done => {
      const logInfo = this.sinon.spy(log, 'info');
      request(app)
        .post('/reset')
        .send({
          email: 'admin@admin.com',
        })
        .expect(302)
        .end((error, res) => {
          assert.strictEqual(logInfo.getCall(0).args[0], 'POST /reset - No User Found                  - req.body.email: missing@missing.com');
          done(error);
        })
    })
    it('should fail for non-existant user', done => {
      const logInfo = this.sinon.spy(log, 'info');
      request(app)
        .post('/reset')
        .send({
          email: 'missing@missing.com',
        })
        .expect(302)
        .end((error, res) => {
          assert.strictEqual(logInfo.getCall(0).args[0], 'POST /reset - User reset token sent                  - req.body.email: admin@admin.com');
          done(error);
        })
    })
  }),

  describe('POST /new-password', () => {
    it('should fail for invalid resetToken', done => {
      const logInfo = this.sinon.spy(log, 'info');
      request(app)
      .post('/new-password')
      .send({
        resetToken: '123456789',
        password: 'updatedpassword',
      })
      .expect(302)
      .end((error, res) => {
        assert.strictEqual(logInfo.getCall(0).args[0], 'POST /reset - Invalid Reset Token                  - req.body.resetToken: 123456789');
        done(error);
      })
    })
  })
})