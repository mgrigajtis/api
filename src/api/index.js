import { name, version, description } from '../../package.json';
import { Router } from 'express';
import facets from './facets';
import https from 'https';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

export default ({ config, db }) => {
	const api = Router();

	// This is the secret key used to encrypt and decrypt the JWT
	// Ideally, this will be a private key file
	const secretKey = process.env.jwt_secret;

  // This function ensures that the JWT is present on the API calls that require
	// the user to be authenticated
	function ensureToken(req, res, next) {
		if (typeof req.headers['authorization'] !== 'undefined') {
			req.token = req.headers['authorization'];
			next();
		} else {
			res.sendStatus(403);
		}
	}

	// mount the facets resource
	api.use('/facets', facets({ config, db }));

	// This is just the index function.  Shows the name, version, and description
	// found in the package.json file.
	api.get('/', (req, res) => {
		res.json({ name, version, description });
	});

	// This API call was written as a test to make sure that authentiaction is working.
	// The data that is returned to the browser is the decrypted JWT, which contains the user
	// information.
	api.get('/protected', ensureToken, (req, res) => {
		jwt.verify(req.token, secretKey, (err, data) => {
			if (err) {
				res.sendStatus(403);
			} else {
				res.json(data);
			}
		});
	});

	// This API call verifies the token
	api.get('/verifytoken', ensureToken, (req, res) => {
		jwt.verify(req.token, secretKey, (err, data) => {
			if (err) {
				res.sendStatus(403);
			} else {
				res.sendStatus(200);
			}
		});
	});

  // This is the signup API call.  Anything that touches the database gets scrubbed.
	api.post('/signup', async (req, res) => {
		let email = '', password = '', name = '', address1 = '', address2 = '', city = '', state = '', zip = '', errorMessage = '';

		if (typeof req.body.email !== 'undefined') {
			email = req.body.email.replace(/[^a-z0-9\@\-._]/gmi, '').replace(/\s+/gmi, ' ').trim();
		}

		if (typeof req.body.name !== 'undefined') {
			name = req.body.name.replace(/[^a-z\s]/gmi, '').replace(/\s+/gmi, ' ').trim();
		}

		if (typeof req.body.password !== 'undefined') {
			password = req.body.password.trim();
		}

		if (typeof req.body.address1 !== 'undefined') {
			address1 = req.body.address1.replace(/[^a-z0-9\s]/gmi, '').replace(/\s+/gmi, ' ').trim();
		}

		if (typeof req.body.address2 !== 'undefined') {
			address2 = req.body.address2.replace(/[^a-z0-9\s]/gmi, '').replace(/\s+/gmi, ' ').trim();
		}

		if (typeof req.body.city !== 'undefined') {
			city = req.body.city.replace(/[^a-z\s]/gmi, '').replace(/\s+/gmi, ' ').trim();
		}

		if (typeof req.body.state !== 'undefined') {
			state = req.body.state.replace(/[^a-z]+/gmi, '').trim();
		}

		if (typeof req.body.zip !== 'undefined') {
			zip = req.body.zip.replace(/[^0-9]+|\s+/gmi, '').trim();
		}

		if (email === '') {
			errorMessage = 'Email address is missing.\n';
		} else {
			if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
				errorMessage = 'Email address is in the incorrect format.\n';
			}
		}

		if (password === '') {
      errorMessage += 'Password is required.\n';
    }

    if (!/[a-zA-Z0-9!@#$%^&*]$/.test(password)) {
      errorMessage += 'Password has characters that are not allowed.\n';
    }

    if (password.length < 8) {
      errorMessage += 'Password must be at least 8 characters in length.\n';
    }

		if (name === '') {
			errorMessage += 'Name is missing.\n';
		}

		if (address1 === '') {
			errorMessage += 'Address Line 1 is missing.\n';
		}

		if (city === '') {
			errorMessage += 'City is missing.\n';
		}

		if (state === '') {
			errorMessage += 'State is missing.\n';
		}

		if (zip === '') {
			errorMessage += 'Zip code is missing.\n';
		}

		if (errorMessage === '') {
			// So far everything is good.  We need to make sure that the email address isn't already
			// in the database, and then we can save the new user.
			let results;

			try {
				 results = await db.query('SELECT email FROM users WHERE email = $1', [email]);
			} catch(ex) {
				res.status(400).send({ error: ex });
			}

			if (results.rows.length > 0) {
				res.status(400).send({ error: 'User already exists.' });
			} else {
				// Create the password salt and then hash the password
				let passwordSalt = crypto.createHash('sha256').update(name + email + address1 + address2 + city + state + zip).digest('hex');
				let passwordToSave = crypto.createHash('sha256').update(password + passwordSalt).digest('hex');

				// Save the user in the database
				await db.query('INSERT INTO users(name, email, password, password_salt, address1, address2, city, state, zip) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
			        [name, email, passwordToSave, passwordSalt, address1, address2, city, state, zip]);

				res.sendStatus(200);
			}
		} else {
			res.status(400).send({ error: errorMessage });
		}
	});

  // The sign in API call
	api.post('/signin', async (req, res) => {
		let results;
		let email = '', password = '';

		if (typeof req.body.email !== 'undefined') {
			email = req.body.email.replace(/[^a-z0-9\@\-._]/gmi, '').replace(/\s+/gmi, ' ').trim();
		}

		if (typeof req.body.password !== 'undefined') {
			password = req.body.password.trim();
		}

		try {
			 results = await db.query('SELECT id, email, name, password, password_salt, address1, address2, city, state, zip FROM users WHERE email = $1', [email]);
		} catch(ex) {
			res.status(400).send({ error: ex });
		}

		if (results.rows.length === 0) {
			res.status(400).send({ error: 'User not found' });
		} else {
			if (crypto.createHash('sha256').update(password + results.rows[0].password_salt).digest('hex') === results.rows[0].password) {
				const user = {
								 id: results.rows[0].id,
								 name: results.rows[0].name,
								 email:  results.rows[0].email,
								 address1: results.rows[0].address1,
								 address2: results.rows[0].address2,
								 city: results.rows[0].city,
								 state: results.rows[0].state,
								 zip: results.rows[0].zip
							 };
				const token = jwt.sign({ user }, secretKey);
				res.json({ token });
			} else {
				res.status(400).send({ error: 'Password is incorrect.' });
			}
		}
	});

	return api;
}
