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
const mongoose = require('mongoose');

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

  // after(done => {
  //   async.auto({
  //     deleteProducts: callback => {
  //       Product
  //         .deleteMany({})
  //         .then(() => {
  //           callback() 
  //         })
  //         .catch(error => {
  //           callback(error);
  //         })
  //     }
  //   }, done)
  // }),

  describe('/index', () => {
    it('should fetch the index view with two products', done => {
      request(app)
        .get('/')
        .send()
        .expect(200)
        .end((error, res) => {
          if (error) { return done(error) }
          fs.readFile(path.join(__dirname, '..', '..', 'data', 'getIndex.html'), 'utf8', (error, getIndex) => {
            assert.strictEqual(res.text, getIndex);
            done();
          })
        })
    })
  }),

  describe('/products/productId', () => {
    it('should fetch details of a single product', done => {
      console.log(`/products/${mongoose.Types.ObjectId(1)}`)
      request(app)
        .get(`/products/${mongoose.Types.ObjectId(1)}`)
        .send()
        .expect(200)
        .end((error, res) => {
          if (error) { return done(error) }
          console.log(res.text);
          fs.readFile(path.join(__dirname, '..', '..', 'data', 'getIndex.html'), 'utf8', (error, getIndex) => {
            assert.strictEqual(res.text, getIndex);
            done();
          })
        })
    })
  })
})