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
var calendar = require('calendar-js');
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
  event_id TEXT, \
  date DATE, \
  slot_score_list TEXT \
)";
connEvents.query(timeSlots, function(err, data) {});

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
  var date = new Date();
  var year = date.getFullYear();
  var month = date.getMonth();
  var calArray = calendar().of(year, month).calendar;
  console.log(calArray);
  a = {month: calendar().of(year, month).month}
  for(var i=0; i< calArray.length; i++){
    for(var j = 0; j<calArray[0].length; j++){
      if(calArray[i][j] != 0)
        a["a"+(i*7+j)] = calArray[i][j];
      else
        a["a"+(i*7+j)] = '';
    }
  }
  console.log(a)
	response.render('index', a);
  
});


//pass all the information to the server and perform the needed backend functions
app.post('/event/createEvent', function(request, response) {
  var id = uuidv4();
  var event_name = request.body.event_name;
  var creator_email = request.body.creator_email;
  var start_date = request.body.start_date;
  var start_time_list = request.body.start_time_list;
  var end_date = request.body.end_date;
  var end_time_list = request.body.end_time_list;
  var locations = request.body.locations;

  var createNewEvent = "INSERT INTO events (id, name, creator_email, start_date, start_time_list, end_date, end_time_list, locations) VALUES($1,$2,$3,$4,$5,$6,$7,$8)";
  connEvents.query(createNewEvent,[id,event_name,creator_email,start_date,start_time_list,end_date,end_time_list,locations],function(err,data) {
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
  console.log(id.red);
	response.render('attend', {id: id});
});

//get the information for a particular event and send it to the client 
app.post('/attend/:id', function(request, response) {
  var id = request.params.id;
  var eventQuery = "SELECT name, locations, location_votes, start_date, end_date, start_time_list, end_time_list FROM events WHERE id = ?";
  connEvents.query(eventQuery, id, function(err, data1) {
    if (err) {
      console.log(err);
      //do we want to do anything more than this?
    } else {
      const slotQuery = "SELECT date, slot_score_list FROM time_slots WHERE event_id = ?";
      connEvents.query(slotQuery, id, (err, data2) => {
          if (err) {
            console.log(err.red);
          } else {
              response.json({
                  pickerData: data1.rows[0],
                  presenterData: data2.rows
              });
          }
      });
    }
  })
});

app.post('/attend/updatetimeslots/:id', (req, res) => {
    const id = req.params.id;
    const pickerData = JSON.parse(req.body.pickerData);
    const sql = "SELECT date, slot_score_list FROM time_slots WHERE event_id = ?";
    connEvents.query(sql, id, (err, data) => {
        if (err) {
            console.log(err.red);
        } else {
            if (data.rows.length === 0) {
                for (let item of pickerData) {
                    const sql = "INSERT INTO time_slots(event_id, date, slot_score_list) VALUES($1,$2,$3)";
                    connEvents.query(sql, [id, item.date, item.slotScoreList.join()], (err, data) => {
                        if (err) {
                            console.log(err.red);
                        } else {
                            console.log(data.blue);
                        }
                    });
                }
            } else {
                for (let row of data.rows) {
                    let tmp = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
                    let arr = !!row.slot_score_list ? row.slot_score_list.split(',') : tmp;
                    for (let item of pickerData) {
                        if (item.date == row.date) {
                            for (let i = 0; i < 48; i++) {
                                arr[i] = parseInt(arr[i]) + parseInt(item.slotScoreList[i]);
                            }
                            break;
                        }
                    }
                    const sql = "UPDATE time_slots SET slot_score_list = $1 WHERE date = $2 and event_id = $3";
                    connEvents.query(sql, [arr.join(), row.date, id], (err, data) => {
                        if (err) {
                            console.log(err.red);
                        } else {
                            console.log(data.blue);
                        }
                    });
                }
            }

            const slotQuery = "SELECT date, slot_score_list FROM time_slots WHERE event_id = ?";
            connEvents.query(slotQuery, id, (err, data2) => {
                if (err) {
                    console.log(err.red);
                } else {
                    res.json({
                        presenterData: data2.rows
                    });
                }
            });
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