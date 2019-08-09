'use strict'

const { assert } = require('chai');
const {
  describe,
  it,
} = require('mocha');

const { app } = require('../../../app')
const request = require('supertest');

const fs = require('fs');
const path = require('path');

describe('ErrorController', () => {
  describe('/404', () => {
    it('should return error 404 page for invalid route request', done => {
      request(app)
        .get('/idontexist')
        .expect(404)
        .end((error, res) => {
          if (error) { return done(error) }
            fs.readFile(path.join(__dirname, '..', '..', 'data', 'error404.html'), 'utf8', (error, error404) => {
              assert.strictEqual(res.text, error404);
              done(error);
            })
        })
    })
  })
})