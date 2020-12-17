const express = require('express');
const Datastore = require('nedb');

const app = express();

app.listen(4321, () => console.log('Listening at 4321'));
app.use(express.static('public'));
app.use(express.json({ limit: '1mb' }));

const database = new Datastore('database.db');
database.loadDatabase();

// Load database
app.get('/dashboard', (request, response) => {
	database.find({}).sort({'name' : 1 }).exec((err, data) => {
		if (err) {response.end(); return;}
		response.json(data);
	});
});

// Add to database
app.post('/dashboard', (request, response) => {
	const data = request.body;
	console.log(data);

	database.find({ userid: data.userid }, (err, query) => {
		if (err) {response.end(); return;}

		// If userid doesn't exists, create new record
		if (query.length == 0) {
			database.insert(data);
		// else only update with the user selected numbers
		} else {
			database.update({ userid: data.userid }, { $push: { number: data.number } }, {}, function () {});
		}	
	});

	response.json({
		status: 'success',
		data: data 
	});
});