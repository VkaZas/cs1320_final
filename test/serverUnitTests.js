var server = require('../server');
var expect  = require('chai').expect;
var request = require('request');
var superagent = require('superagent');

describe('Basic Status Tests', function() {
	it('bad page test', function(done) {
		request('http://localhost:8081', function(err, res, body) {
			expect(res.statusCode).to.equal(200);
			expect(body).to.equal('error');
			done();
		});
	});

	it('create page', function(done) {
		request('http://localhost:8081/create/event', function(err, res, body) {
			expect(res.statusCode).to.equal(200);
			done();
		});
	});

	it('attend page', (done) => {
		request('http://localhost:8081/attend/4d0668f2-978b-4987-8cb2-1494cf7ebd39', function(err, res, body) {
			expect(res.statusCode).to.equal(200);
		});
		done();
	}).timeout(5000);

	it('decide page', (done) => {
		request('http://localhost:8081/event/4d0668f2-978b-4987-8cb2-1494cf7ebd39/decide', function(err, res, body) {
			expect(res.statusCode).to.equal(200);
		});
		done();
	}).timeout(5000);

	it('bad page', (done) => {
		request('http://localhost:8081', function(err, res, body) {
			expect(res.statusCode).to.equal(200);
			done();
		});
	});
});

describe('Scheduling emails tests', function() {
	it('correct cron data', (done) => {
		superagent.post('http://localhost:8081/event/3202abb5-d0d1-4a0c-be58-59a019170d43/decide')
		.send({"id":"3202abb5-d0d1-4a0c-be58-59a019170d43"})
		.send({"decided_time_start":"12:00"})
		.send({"decided_time_end":"13:00"})
		.send({"decided_date":"2018-05-05"})		
		.send({"attendee_emails":"denisenko.helen@gmail.com,yelena_denisenko@brown.edu"})
		.end(function(err, res) {
			if (err){
				console.log(err);
			} else {
				expect(res.data.decided_date).to.equal("2018-05-05");
				expect(res.data.decided_start_time).to.equal("12:00");
				expect(res.data.decided_end_time).to.equal("13:00");
				expect(res.data.attendee_emails).to.equal(["denisenko.helen@gmail.com","yelena_denisenko@brown.edu"]);
				expect(res.data.id).to.equal("3202abb5-d0d1-4a0c-be58-59a019170d43");
			}
		});
		done();
	}).timeout(10000);
});

describe('Create an Event', function() {
	it('correct event data', (done) => {
		superagent.post('http://localhost:8081/event/createEvent')
		.send({"event_name":"Helen's other Event"})
		.send({"creator_email":"yelena_denisenko@brown.edu"})
		.send({"start_date":"2018-05-04"})
		.send({"start_time_list":"12:00,12:00,13:00"})
		.send({"end_date":"2018-05-06"})
		.send({"end_time_list":"17:00,17:00,16:00"})
		.send({"locations":"CIT,Barus&Holley,SciLi"})
		.end(function(err, res) {
			if (err) {
				console.log(err);
			} else {
				expect(res.data.event_name).to.equal("Helen's Event");
				expect(res.data.creator_email).to.equal("yelena_denisenko@brown.edu");
				expect(res.data.start_date).to.equal("2018-05-04");
				expect(res.data.start_time_list).to.equal("12:00,12:00,13:00");
				expect(res.data.end_date).to.equal("2018-05-06");
				expect(res.data.end_time_list).to.equal("17:00,17:00,16:00");
				expect(res.data.locations).to.equal("CIT,Barus&Holley,SciLi");
			}
		});
		done();
	}).timeout(30000);
});

describe('Fill out calendar', function() {
	it('correct calendar data', (done) => {
		superagent.post('http://localhost:8081/attend/daacf4d2-c149-482b-9453-2a9ebb0ea2b8')
		.end(function(err, res) {
			if (err) {
				console.log(err);
			} else {
				expect(res.data.id).to.equal("daacf4d2-c149-482b-9453-2a9ebb0ea2b8");
			}
		});
		done()
	}).timeout(10000);
});

var date1 = [0,0,0,0,0,0,0,0,
             0,0,0,0,0,0,0,0,
             0,0,0,0,0,0,0,0,
             3,3,2,2,2,1,0,0,
             0,1,0,0,0,0,0,0,
             0,0,0,0,0,0,0,0];

var date2 = [0,0,0,0,0,0,0,0,
             0,0,0,0,0,0,0,0,
             0,0,0,0,0,0,0,0,
             3,0,3,2,1,0,2,3,
             1,1,0,0,0,0,0,0,
             0,0,0,0,0,0,0,0];

var date3 = [0,0,0,0,0,0,0,0,
             0,0,0,0,0,0,0,0,
             0,0,0,0,0,0,0,0,
             0,0,2,2,2,1,2,3,
             0,0,0,0,0,0,0,0,
             0,0,0,0,0,0,0,0];

var pickerData = JSON.stringify([{"date":"2018-05-05","slotScoreList":[date1,date2,date3]}]);

describe('Update time slots check', function() {
	it('correct data passed, first response', (done) => {
		superagent.post('http://localhost:8081/attend/updatetimeslots/4d0668f2-978b-4987-8cb2-1494cf7ebd39')
		.send({"pickerData":pickerData})
		.send({"location":"CIT"})
		.end(function(err, res) {
			if (err) {
				console.log(err);
			} else {
				expect(res.data.pickerData).to.equal([{"date":"2018-05-05","slotScoreList":[date1,date2,date3]}]);
				expect(res.data.location).to.equal("CIT");
			}
		});
		done();
	}).timeout(100000);
});

