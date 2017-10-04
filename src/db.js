import pg from 'pg';

export default callback => {
	// We're reading in the database info from environment variables
	let endPoint = process.env.api_database_url;
	let port = process.env.api_database_port;
	let user = process.env.api_database_user;
	let password = process.env.api_database_password;
	let db = process.env.api_database_name;

	let connectionString = 'postgres://' + user + ':' + password + '@' + endPoint + ':' + port + '/' + db;
	const pgclient = new pg.Client(connectionString);
	pgclient.connect((err, client, done) => {
		if (client) {
			console.log('Successfully connected to Database.');
		}

	// Handle connection errors
    if (err) {
      console.log(err);
    }
  });

	// connect to a database if needed, then pass it to `callback`:
	callback(pgclient);
}
