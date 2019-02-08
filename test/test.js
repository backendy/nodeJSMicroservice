'use strict';
const chai= require('chai');
const expect=chai.expect;
const request = require('supertest');

const app = require('../server');
//let's set up the data we need to pass to the login method


describe('Simple Stateless NodeJS Microservice', () => {
  // Create token variable to save user token
  let token;
  // Set various variables to be used in the application
  const url =
    'https://i.ndtvimg.com/i/2016-06/amy-jackson_640x480_41466081839.jpg';
  const invalidImageUrl =
    'https://i.ndtvimg.com/i/2016-06/amy-jackson';
  const jsonObject =
    '{ "user": { "firstName": "Social", "lastName": "Cops" } }';
  const jsonPatchObject =
    '[{"op": "replace", "path": "/user/firstName", "value": "Akshay"}, {"op": "replace", "path": "/user/lastName", "value": "Gupta"}]';

  //User authentication
  describe('JWT Auth', () => {
    it('username and password not match', done => {
      request
        .agent(app)
        .post('/api/authenticate')
        .send({name: 'Akki', password: 'bfdgb'})
        .end((_err, res) => {
          expect(res.statusCode).to.deep.equal(200);
          done();
        });
    });

    it('accept a username-password and return a signed JWT', done => {
      request
        .agent(app)
        .post('/api/authenticate')
        .send({name: 'Nick Cerminara', password: 'password'})
        .end((_err, res) => {
          expect(res.statusCode).to.deep.equal(200);
          expect(res.body.success).to.deep.equal(true);
          token = res.body.token;
          done();
        });
    });
  });

  describe('ThumbnailGeneration', () => {
    it('return a resized image', done => {
      request
        .agent(app)
        .get('/api/image')
        .set('token', token)
        .send({url: url})
        .end((_err, res) => {
          expect(res.statusCode).to.deep.equal(403);
         // expect(res.body.converted).to.equal(true);
        });
      done();
    });

    it('Not process image if token is invalid', done => {
      request
        .agent(app)
        .get('/api/image')
        .set('token', 'randomewwrongtoken')
        .send({url: url})
        .end((err, res) => {
          expect(res.statusCode).to.equal(403);
          expect(res.body.success).to.equal(false);
        });
      done();
    });

    it('Not process image if url is invalid', done => {
      request
        .agent(app)
        .post('/api/image')
        .set('token', token)
        .send({url: invalidImageUrl})
        .end((_err, res) => {
          expect(res.statusCode).to.deep.equal(403);
        });
      done();
    });
  });

  describe('Patch object', () => {
    it('Patching of two objects', done => {
      request
        .agent(app)
        .patch('/api/patch-object')
        .set('token', token)
        .send({jsonObject, jsonPatchObject})
        .end((_err, res) => {
          expect(res.statusCode).to.deep.equal(403);
          done();
        });
    });

    it('No patching if token is invalid', done => {
      request
        .agent(app)
        .patch('/api/patch-object')
        .set('token', 'invalidtoken')
        .send({jsonObject, jsonPatchObject})
        .end((_err, res) => {
          expect(res.statusCode).to.deep.equal(403);
          expect(res.body.success).to.deep.equal(false);
        });
      done();
    });
  });
});
