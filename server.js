const http = require('http');
const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const colors = require('colors');
const babel = require('@babel/core');
const index = require('./routes/index'); 
const uuidv4 = require('uuid/v4');
var buildUrl = require('build-url');
var nodemailer = require('nodemailer');

// View engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));

//Database
var anyDB = require('any-db');
var connEvents = anyDB.createConnection('sqlite3://events.db');
var connTimeSlots = anyDB.createConnection('sqlite3://time_slots.db');

var events = "CREATE TABLE events ( \
  id TEXT PRIMARY KEY, \
  name TEXT, \
  creator_email TEXT,\
  start_date DATE, \
  end_date DATE, \
  start_time_list TEXT, \
  end_time_list TEXT, \
  attendee_names TEXT, \
  attendee_emails TEXT, \
  locations TEXT, \
  location_votes TEXT, \
  decided_date DATE,\
  decided_start_time TIME, \
  decided_end_time TIME, \
  decided_location TEXT \
)";
connEvents.query(events, function(err, data) {});

var timeSlots = "CREATE TABLE time_slots (\
  event_id TEXT FOREIGN KEY REFERENCES events(id), \
  attendee_name TEXT, \
  date DATE, \
  slot_score_list TEXT \
)";
connTimeSlots.query(timeSlots, function(err, data) {});

//Email setup
var transporter = nodemailer.createTransport({
  service:' gmail',
  auth: {
    user: 'meetng132@gmail.com',
    pass: 'meetng1322018'
  }
});

// ROUTES 

//get the create page up for the creator to start making the event
app.get('/event/create', function(request, response) {
	response.render('index');
});

//pass all the information to the server and perform the needed backend functions
app.post('/event/createEvent', function(request, response) {
  var id = uuidv4()
  var event_name = request.params.event_name;
  var creator_email = request.params.creator_email;
  var start_date = request.params.start_date;
  var end_date = request.params.end_date;
  var locations = request.params.locations;
  var createNewEvent = "INSERT INTO events (id, event_name, creator_email, start_date, end_date, locations) VALUES($1,$2,$3,$4,$5)";
  conn.query(createNewEvent,[id,name,creator_email,start_date,end_date,locations],function(err,data) {
    if (err) {
      console.log(err);
      //maybe alert the user and redirect somewhere?
    } else {
      //create link to emit to email to the creator
      //how are we doing this - locally or serving this on aws or something like that? 
      var decision_url = buildUrl('http://localhost:8080', {
        path: 'event/' + id + '/decide'
      });
      //email content set up
      var mailoptions = {
        from: 'meetng132@gmail.com',
        to: creator_email,
        subject: 'Link to Decision Page for ' + event_name,
        text: 'Here\'s your link! ' + decision_url
      };
      //url we're sending to the creator so they can send it to attendees
      var attend_url = buildUrl('hhtp://localhost:8080', {
        path: 'attend/' + id
      });
      //send email to creator with link to 
      transporter.sendMail(mailoptions, function(err, data) {
        if (err) {
          console.log(err);
          response.json({decision: decision_url, attned: attend_url});
        } else {
          response.json({attend: attend_url});
        }
      });
    }
  });
});

//serve the page where attendees fill out their availability
app.get('/attend/:id', function(request, response) {
  var id = request.params.id;
	response.render('index');
});

//get the information for a particular event and send it to the client 
app.post('/attend/:id', function(request, resposne) {
  var id = request.params.id;
  var eventQuery = "SELECT name, locations, location_votes, attendents FROM events WHERE id = ?";
  conn.query(eventQuery, id, function(err, data) {
    if (err) {
      console.log(err);
      //do we want to do anything more than this?
    } else {
      response.json({eventData: data}); 
    }
  })
});

//update the server with the attendee's preferences 
app.post("/attend/:id/updatetimeslot", function(request, resposne) {
  //get variables from request (might get errors if not in params)
  var id = request.params.id;
  var attendee_name = request.params.attendee_name;
  //i do the check with the empty string because emails and locations are optional
  var attendee_email = "";
  if (request.params.attendee_email) {
    attendee_email = request.params.attendee_email;
  }
  var slotinfo = request.params.slotinfo;
  var location_votes = "";
  if (request.params.location_votes) {
    location_votes = request.params.location_votes;
  }
  //get all the names, emails, and location votes for the event
  var eventInfoeQuery = "SELECT attendee_names, attendee_emails, location_votes FROM events WHERE id = ?"; 
  var old_names = "";
  var old_emails = "";
  var old_location_votes = "";
  conn.query(eventInfoQuery, id, function(err, data){
    if (err) {
      console.log(err);
    } else {
      //assign variables with results from query
      var row = data.data.rows;
      old_names = row.attendee_names;
      old_emails = row.attndee_emails;
      old_location_votes = row.location_votes;
    }
  });
  //create the new entries using the data just retrieved from the DB and the data from request.params
  var new_names = old_names + "," + attendee_name;
  var new_emails = "";
  if (attendee_email) {
    new_emails = old_emails + "," + attendee_email;
  }
  var new_location_votes = "";
  if (location_votes) {
    new_location_votes = old_location_votes + "," +
  }
  //update events with new vars created right above 
  var updateEvents = "UPDATE events \
                      SET attendee_names = ?, attendee_emails = ?, location_votes = ? \
                      WHERE id = ?";
  conn.query(updateEvents, new_names, new_emails, new_location_votes, id, function(err, data) {
    if (err) {
      console.log(err);
    }
  });
  //update time_slots table with time slots from request
  var slotsToInsert = [];
  for (slot in slotinfo) {
    var currSlot = slotinfo[slot];
    var currInfo = [id, attendee_name, currSlot["Date"], currSlot["slotScoreList"]];
    slotsToInsert.push(currInfo);
  }
  var addToTimeSlots = "INSERT INTO time_slots (event_id, attendee_name, date, slot_score_list) VALUES ?";
  conn.query(addToTimeSlots, slotsToInsert, function(err, data) {
    if (err) {
      console.log(err);
    }
  });
});

// 404
app.use((req, res) => {
    res.status = 404;
    res.json('error');
});

app.listen(8080);
console.log('Server is listening to port 8080.'.green);