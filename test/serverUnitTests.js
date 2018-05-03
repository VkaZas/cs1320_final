var server = require('../server');
var expect  = require('chai').expect;
var request = require('request');
var superagent = require('superagent');

describe('Basic Status Tests', function() {
	it('bad page test', function(done) {
		request('http://localhost:8080', function(err, res, body) {
			expect(res.statusCode).to.equal(200);
			expect(body).to.equal('error');
			done();
		});
	});

	it('create page', function(done) {
		request('http://localhost:8080/create/event', function(err, res, body) {
			expect(res.statusCode).to.equal(200);
			done();
		});
	});

	it('attend page', (done) => {
		request('http://localhost:8080/attend/4d0668f2-978b-4987-8cb2-1494cf7ebd39', function(err, res, body) {
			expect(res.statusCode).to.equal(200);
		});
		done();
	}).timeout(5000);

	it('decide page', function(done) {
		request('http://localhost:8080/event/4d0668f2-978b-4987-8cb2-1494cf7ebd39/decide', function(err, res, body) {
			expect(res.statusCode).to.equal(200);
			done();
		});
	});
});

//this is timing out - figure out how to make it not timeout
describe('Scheduling emails tests', function() {
	it('correct cron data', (done) => {
		superagent.post('http://localhost:8080/event/4d0668f2-978b-4987-8cb2-1494cf7ebd39/decide')
		.send({"id":"4d0668f2-978b-4987-8cb2-1494cf7ebd39"})
		.send({"decided_start_time":"17:00"})
		.send({"decided_end_time":"18:00"})
		.send({"decided_date":"2018-04-30"})		
		.send({"attendee_emails":"denisenko.helen@gmail.com,yelena_denisenko@brown.edu"})
		.end(function(err, res) {
			if (err){
				console.log(err);
			} else {
				expect(res.data.decided_date).to.equal("2018-04-30");
				expect(res.data.decided_start_time).to.equal("17:00");
				expect(res.data.decided_end_time).to.equal("18:00");
				expect(res.data.attendee_emails).to.equal(["denisenko.helen@gmail.com","yelena_denisenko@brown.edu"]);
				expect(res.data.id).to.equal("4d0668f2-978b-4987-8cb2-1494cf7ebd39");
			}
		});
		done();
	}).timeout(10000);
});

