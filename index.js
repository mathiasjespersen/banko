const express = require('express');
const Datastore = require('nedb');

const app = express();

let port = process.env.PORT;
if (port == null || port == "") {
	port = 8000;
}
app.listen(port, () => console.log(`Listening at ${port}`));

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

// Remove # from attendees board
app.post('/remove', (request, response) => {
	const data = request.body;	

	database.find({ userid: data.userid }, (err, query) => {
		if (err) {response.end(); return;}

		// If userid doesn't exists, create new record
		if (query.length != 0) {		
			console.log('remove number: ' + data.number);
			database.update({ userid: data.userid }, { $pull: { number: data.number } }, {}, function () {});
		}	
	});

	response.json({
		status: 'number removed',
		data: data 
	});
});