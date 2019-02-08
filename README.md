# nodeJSMicroservice

Task to build simple stateless microservice in Nodejs with three major functionalities:
- JWT Authentication
- JSON Patching
- Image Thumbnail Generation

### Requirements

- node and npm
- git

### Usage

1. Install dependencies: `npm install`
2. Change SECRET in `config.js`
3. Add your own MongoDB database to `config.js`
4. Start the server: `node server.js`
5. Create sample user by visiting: `http://localhost:8080/setup`

Once everything is set up, we can begin to use our app by creating and verifying tokens.

### Getting a Token

Send a `POST` request to `http://localhost:8080/api/authenticate` with test user parameters as `x-www-form-urlencoded`. 

```
  {
    name: 'Akshay',
    password: 'password'
  }
```

### Verifying a Token and Listing Users

Send a `GET` request to `http://localhost:8080/api/users` with a header parameter of `x-access-token` and the token.

You can also send the token as a URL parameter: `http://localhost:8080/api/users?token=YOUR_TOKEN_HERE`

Or you can send the token as a POST parameter of `token`.

### Endpoints
use postman
The API features the following endpoint functionalities  
1. */api/authenticate*
    * Request body should contain an arbitrary username/password pair
    * Treat it as a mock authentication service and accept any username/password.
    * Return a signed [Json Web Token](https://jwt.io/) which can be used to validate future requests.
**Protected Endpoints**  

The following two endpoints should be protected. The JWT obtained in the _/authenticate_ endpoint must be attached to each request.  If the JWT is missing or invalid, these endpoints should reject the request.
1. */api/patch-object*
    * Request body should contain a JSON object and a [JSON patch object](http://jsonpatch.com/).
    * Apply the json patch to the json object, and return the resulting json object.
2. */api/image*
    * Request should contain a public image URL.
    * Download the image, resize to 50x50 pixels, and return the resulting thumbnail.
___


### Install

```bash
$ npm install
```


### Start the server

```bash
$ npm start
```


### Run test suite with mocha

```bash
$ npm test
```


### Run eslint

```bash
$ npm run lint
``` 
```
