'use strict';
// =================================================================
// get the packages we need ========================================
// =================================================================
const express 	= require('express');
let app = express();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');
const path = require('path');
const jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
let config = require('./config'); // get our config file
let User = require('./app/models/user'); // get our mongoose model
const download = require('image-downloader');
const fs = require('fs');
const resizeImg = require('resize-img');
const { body, validationResult } = require('express-validator/check');
const jsonpatch = require('fast-json-patch');
// =================================================================
// configuration ===================================================
// =================================================================
const port = process.env.PORT || 8080;
// used to create, sign, and verify tokens
mongoose.connect(config.database);
// connect to database
app.set('superSecret', config.secret);
// secret variable
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// use morgan to log requests to the console
app.use(morgan('dev'));

// =================================================================
// routes ==========================================================
// =================================================================
app.get('/setup', (req, res) => {

	// create a sample user
	var nick = new User({
		name: 'Nick Cerminara',
		password: 'password',
		admin: true,
	});
	nick.save(function(err) {
		if (err) throw err;

		//console.log('User saved successfully');
		res.json({ success: true });
	});
});

// basic route (http://localhost:8080)
app.get('/', (req, res) => {
	res.send('Hello! The API is at http://localhost:' + port + '/api');
});

// ---------------------------------------------------------
// get an instance of the router for api routes
// ---------------------------------------------------------
let apiRoutes = express.Router();

// ---------------------------------------------------------
// authentication (no middleware necessary since this isnt authenticated)
// ---------------------------------------------------------
// http://localhost:8080/api/authenticate
apiRoutes.post('/authenticate', (req, res) => {

	// find the user
	User.findOne({
		name: req.body.name,
	}, (err, user) => {

		if (err) throw err;

		if (!user) {
			res.json({ success: false, message: 'Authentication failed. User not found.' });
		} else if (user) {
			// check if password matches
			if (user.password !== req.body.password) {
				res.json({ success: false, message: 'Authentication failed. Wrong password.' });
			} else {

				// if user is found and password is right
				// create a token
				var payload = {
					admin: user.admin,
				};
				var token = jwt.sign(payload, app.get('superSecret'), {
					expiresIn: 86400, // expires in 24 hours
				});

				res.json({
					success: true,
					message: 'Enjoy your token!',
					token: token,
				});
			}

		}

	});
});

// ---------------------------------------------------------
// route middleware to authenticate and check token
// ---------------------------------------------------------
apiRoutes.use((req, res, next) => {
// check header or url parameters or post parameters for token
	var token=req.body.token||req.param('token')||req.headers['x-access-token'];
	// decode token
	if(token){
		// verifies secret and checks exp
		jwt.verify(token,app.get('superSecret'),(err, decoded)=>{
			if (err) {
				return res.json({ success: false, message: 'Failed to authenticate token.' });
			} else {// if everything is good, save to request for use in other routes
				req.decoded = decoded;
				next();
			}
		});

	} else {

		// if there is no token
		// return an error
		return res.status(403).send({
			success: false,
			message: 'No token provided.',
		});

	}

});

const patch_json_patch = [
	body('jsonObject', 'JSON object must not be empty.').isLength({ min: 1 }),
	body('jsonPatchObject', 'JSON patch object must not be empty.').isLength({ min: 1 }),

	(req, res) => {
		const errors = validationResult(req);

		// Check if there were errors from the form.
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		// Save object-to-patch and patch-object from the request.
		const jsonObject = JSON.parse(req.body.jsonObject);
		const jsonPatchObject = JSON.parse(req.body.jsonPatchObject);

		// Save patch in new variable.
		const patchedObject = jsonpatch.applyPatch(jsonObject, jsonPatchObject).newDocument;
		// res.json({user: req.user.username, patchedObject: patchedObject})
		res.json({ patchedObject });
	},
];
const ThumbnailCreation = (req, res, next) => {
	let url = req.query.url;

	let ext = path.extname(url);

	if (ext === '.bmp' || ext === '.jpg' || ext === '.png'){
		// generate
		const options={
			url:url,
			dest:'./images',
		};
		download.image(options)
			.then(({ filename}) => {

				resizeImg(fs.readFileSync(filename), {width: 50, height: 50}).then(buf => {
					fs.writeFileSync('./thumbnails/' + filename, buf);
					next();
				}).catch((err) => {
					res.send(err);
				});

			});
	} else {
		res.send('File extensions allowed- [bmp,png,jpg]');
	}

};

// ---------------------------------------------------------
// authenticated routes
// ---------------------------------------------------------
apiRoutes.get('/', (req, res) => {
	res.json({ message: 'Welcome to the coolest API on earth!' });
});

apiRoutes.get('/users', (req, res) => {
	User.find({}, function(err, users) {
		res.json(users);
	});
});

apiRoutes.get('/image', ThumbnailCreation, (req, res) => {
	res.json({ success:true,message: 'successfully generated' });
});

apiRoutes.patch('/patch-object', patch_json_patch, (req, res) => {
	res.json({message: 'Done'});
});

app.use('/api', apiRoutes);

// =================================================================
// start the server ================================================
// =================================================================
const server=app.listen(port,()=>{
	//console.log('server running at http://localhost:' + port);
});

module.exports=server;