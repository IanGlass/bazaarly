'use strict'

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
const fs = require('fs');
const path = require('path');
const Product = require('../../../models/product');
const { products } = require('../../data/products');
const log = require('../../../logger');

describe('ShopController', () => {
  before(done => {
    async.auto({
      createProducts: callback => {
        Product
          .create(products)
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
  })

  after(done => {
    async.auto({
      deleteProducts: callback => {
        Product
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

  describe('/index', () => {
    it('should fetch the index view with two products', done => {
      request(app)
        .get('/')
        .expect(200)
        .end((error, res) => {
          if (error) { return done(error) }
          fs.readFile(path.join(__dirname, '..', '..', 'data', 'getIndex.html'), 'utf8', (error, getIndex) => {
            assert.strictEqual(res.text, getIndex);
            done(error);
          })
        })
    })
  }),

  describe('/products/productId', () => {
    it('should fetch details of a single product', done => {
      Product
        .findOne({
          title: products[0].title,
        })
        .then(product => {
          request(app)
            .get(`/products/${product._id}`)
            .expect(200)
            .end((error, res) => {
              if (error) { return done(error) }
              fs.readFile(path.join(__dirname, '..', '..', 'data', 'getProduct.html'), 'utf8', (error, getProduct) => {
                assert.strictEqual(res.text, getProduct);
                done(error);
              })
            })
        })
        .catch(error => {
          done(error);
        })
    }),
    it('should return an 302 error for invalid productId', done => {
      const logError = sinon.spy(log, 'error');
      request(app)
        .get(`/products/100`)
        .expect(302)
        .end((error) => {
          assert.strictEqual(logError.args[0][0].message, 'Cast to ObjectId failed for value "100" at path "_id" for model "Product"');
          done(error);
        })
    })
  })
})