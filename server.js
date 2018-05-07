const http = require('http');
const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const colors = require('colors');
const babel = require('@babel/core');
const index = require('./routes/index'); 
const uuidv4 = require('uuid/v4');
const _ = require('lodash');
var buildUrl = require('build-url');
var nodemailer = require('nodemailer');
var calendar = require('calendar-js');
var cron = require('node-schedule');

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
  attendee_name TEXT,\
  date DATE, \
  slot_score_list TEXT, \
  PRIMARY KEY(event_id, attendee_name, date) \
)";
connEvents.query(timeSlots, function(err, data) {});

const locationVote = "CREATE TABLE loc_vote (\
  event_id TEXT, \
  attendee_name TEXT,\
  vote TEXT, \
  PRIMARY KEY(event_id, attendee_name) \
)";
connEvents.query(locationVote, function(err, data) {});

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
  a = {month: calendar().of(year, month).month}
  for(var i=0; i< calArray.length; i++){
    for(var j = 0; j<calArray[0].length; j++){
      if(calArray[i][j] != 0)
        a["a"+(i*7+j)] = calArray[i][j];
      else
        a["a"+(i*7+j)] = '';
    }
  }
	response.render('create', a);
  
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
  var location_votes = "";
  var split_locs = locations.split(',');
  var split_len = split_locs.length;
  for (let s in split_locs) {
    if ((parseInt(s) + 1) == split_len) {
      location_votes += "0";
    } else {
      location_votes += "0,";
    } 
  }
  console.log(location_votes);
  var createNewEvent = "INSERT INTO events \
                      (id, name, \
                        creator_email, \
                        start_date, \
                        start_time_list, \
                        end_date, \
                        end_time_list, \
                        locations, \
                        location_votes) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)";
  connEvents.query(createNewEvent,
                    [id,
                    event_name,
                    creator_email,
                    start_date,
                    start_time_list,
                    end_date,
                    end_time_list,
                    locations,
                    location_votes],
                    function(err,data) {
    if (err) {
      console.log(err);
    } else {
      //create link to emit to email to the creator
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
      var attend_url = buildUrl('hhtp://localhost:8081', {
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
  const id = request.params.id;

  // Update events(location_votes first)
  const sql = "SELECT vote FROM loc_vote WHERE event_id = $1";
  connEvents.query(sql, [id], (err, data) => {
      if (err) {
          console.log(err.red);
      } else {
          const voteArr = [0, 0, 0];
          for (let row of data.rows) {
              let voteB = parseInt(row.vote);
              for (let i = 0; i < 3; i++) {
                  if (((voteB >> i) & 1) === 1)
                      voteArr[i]++;
              }
          }

          const sql = "UPDATE events SET location_votes = $1 WHERE id = $2";
          connEvents.query(sql, [voteArr.join(','), id], (err, data) => {
              if (err) {
                  console.log(err.red);
              } else {
                  // Response with data
                  const eventQuery = "SELECT * FROM events WHERE id = ?";
                  connEvents.query(eventQuery, id, function(err, data1) {
                      if (err) {
                          console.log(err);
                      } else {
                          const slotQuery = "SELECT date, slot_score_list FROM time_slots WHERE event_id = ?";
                          connEvents.query(slotQuery, id, (err, data2) => {
                              if (err) {
                                  console.log(err.red);
                              } else {
                                  let tmpDic = {};
                                  for (let row of data2.rows) {
                                      let tmpSlotList = row.slot_score_list.split(',').map(e => parseInt(e));
                                      if (tmpDic.hasOwnProperty(row.date)) {
                                          for (let i = 0; i < tmpDic[row.date].length; i++)
                                              tmpDic[row.date][i] += tmpSlotList[i];
                                      } else {
                                          tmpDic[row.date] = tmpSlotList;
                                      }
                                  }
                                  let arr = [];
                                  for (let k of Object.keys(tmpDic))
                                      arr.push({
                                          date: k,
                                          slot_score_list: tmpDic[k].join(','),
                                      })
                                  response.json({
                                      pickerData: data1.rows[0],
                                      presenterData: arr,
                                  });
                              }
                          });
                      }
                  });
              }
          });
      }
  });
});

//update the db with the times/locations that user inputs
app.post('/attend/updatetimeslots/:id', (req, res) => {
    const id = req.params.id;
    const attendeeName = req.body.attendeeName;
    const attendeeEmail = !!req.body.attendeeEmail ? req.body.attendeeEmail : "";
    let sql;
    if (!attendeeName) {
        console.log('[updateTimeSlots] No attendeeName!'.red)
    }
    const pickerData = JSON.parse(req.body.pickerData);
    const locationVoteB = req.body.locationVote.toString();

    // Update events(attendee_names, attendee_emails)
    sql = "SELECT attendee_names, attendee_emails FROM events WHERE id = $1";
    connEvents.query(sql, [id], (err, data) => {
        if (err) {
            console.log(err.red);
        } else {
            const nameArr = !!data.rows[0].attendee_names ? data.rows[0].attendee_names.split(',') : [];
            const emailArr = !!data.rows[0].attendee_emails ? data.rows[0].attendee_emails.split(',') : [];
            let idx;
            if ((idx = _.indexOf(nameArr, attendeeName)) === -1) {
                // New attendee
                nameArr.push(attendeeName);
                emailArr.push(attendeeEmail);
            } else {
                emailArr[idx] = attendeeEmail;
            }

            const sql = "UPDATE events SET attendee_names = $1, attendee_emails = $2 WHERE id = $3";
            connEvents.query(sql, [nameArr.join(), emailArr.join(), id], (err, data) => {
                if (err) {
                    console.log(err.red);
                } else {

                }
            });
        }
    });

    // Update time_slot
    sql = "SELECT date, slot_score_list FROM time_slots WHERE event_id = $1 and attendee_name = $2";
    connEvents.query(sql, [id, attendeeName], (err, data) => {
        if (err) {
            console.log(err.red);
        } else {
            if (data.rows.length === 0) {
                for (let item of pickerData) {
                    const sql = "INSERT INTO time_slots(event_id, date, slot_score_list, attendee_name) VALUES($1,$2,$3,$4)";
                    connEvents.query(sql, [id, item.date, item.slotScoreList.join(), attendeeName], (err, data) => {
                        if (err) {
                            console.log(err.red);
                        }
                    });
                }
            } else {
                for (let item of pickerData) {
                    const sql = "UPDATE time_slots SET slot_score_list = $1 WHERE date = $2 and event_id = $3 and attendee_name = $4";
                    connEvents.query(sql, [item.slotScoreList.join(), item.date, id, attendeeName], (err, data) => {
                        if (err) {
                            console.log(err.red);
                        }
                    });
                }
            }

            // Update loc_vote
            const sql = "SELECT vote FROM loc_vote WHERE event_id = $1 and attendee_name = $2";
            connEvents.query(sql, [id, attendeeName], (err, data) => {
                if (err) {
                    console.log(err.red);
                } else {
                    if (data.rows.length === 0) {
                        const sql = "INSERT INTO loc_vote(attendee_name, event_id, vote) VALUES($1,$2,$3)";
                        connEvents.query(sql, [attendeeName, id, locationVoteB], (err, data) => {
                            if (err) {
                                console.log(err.red);
                            }
                        });

                    } else {
                        const sql = "UPDATE loc_vote SET vote = $1 WHERE event_id = $2 and attendee_name = $3";
                        connEvents.query(sql, [locationVoteB, id, attendeeName], (err, data) => {
                            if (err) {
                                console.log(err.red);
                            }
                        });
                    }
                }
            });

            // Response with updated data
            const slotQuery = "SELECT date, slot_score_list FROM time_slots WHERE event_id = ?";
            connEvents.query(slotQuery, id, (err, data2) => {
                if (err) {
                    console.log(err.red);
                } else {
                    let tmpDic = {};
                    for (let row of data2.rows) {
                        let tmpSlotList = row.slot_score_list.split(',').map(e => parseInt(e));
                        if (tmpDic.hasOwnProperty(row.date)) {
                            for (let i = 0; i < tmpDic[row.date].length; i++)
                                tmpDic[row.date][i] += tmpSlotList[i];
                        } else {
                            tmpDic[row.date] = tmpSlotList;
                        }
                    }
                    let arr = [];
                    for (let k of Object.keys(tmpDic))
                        arr.push({
                            date: k,
                            slot_score_list: tmpDic[k].join(','),
                        });
                    res.json({
                        presenterData: arr
                    });
                    // if (location) {
                    //   const locationQuery = "SELECT location_votes, locations FROM events WHERE id = ?";
                    //   console.log("setup done");
                    //   connEvents.query(locationQuery, id, function(err, locData) {
                    //     //this query doesn't happen - why?
                    //     console.log("query happens");
                    //     if (err) {
                    //       console.log(err.red);
                    //     } else {
                    //       console.log(locData);
                    //       var locs = (data.rows[0].locations).split(',');
                    //       var locVotes = (data.rows[0].location_votes).split(',');
                    //       var currVotes = -1;
                    //       for (l in locs) {
                    //         if (locs[l] == location) {
                    //           currVote = parseInt(locVotes[l]) + 1;
                    //           break;
                    //         }
                    //       }
                    //       var newVotes = "";
                    //       var locVotesLen = locVotes.length;
                    //       for (l in locVotes) {
                    //         if (locs[l] == location) {
                    //           newVotes += currVote.toString();
                    //         } else {
                    //           newVotes += locVotes[l];
                    //         }
                    //         if (!(l+1 == locVotesLen)) {
                    //           newVotes += ",";
                    //         }
                    //       }
                    //       const insertLocQuery = "UPDATE events \
                    //                               SET location_votes = $1 \
                    //                               WHERE id = $2";
                    //       connEvents.query(insertLocQuery, [newVotes, id], (err, data) => {
                    //         if (err) {
                    //           console.log(err);
                    //         } else {
                    //           console.log("inserted");
                    //         }
                    //       });
                    //     }
                    //   });
                    // }

                }
            });
        }
    });

});

//return the pug files for the decide page
app.get('/event/:id/decide', (request, response) => {
    var id = request.params.id;
    response.render('decide', {id: id});
});

//schedule email
app.post('/event/:id/decide', (req, res) => {
  const id = req.params.id;
  const decided_time_start = req.body.decided_time_start;
  const decided_time_end = req.body.decided_time_end;
  const decided_date = req.body.decided_date;
  var valid_date = true;
  validateDate(decided_date, valid_date);
  if (!valid_date) {
    console.log("invalid date")
  }
  var valid_start = true;
  var valid_end = true;
  if (decided_time_start) {
    validateTime(decided_time_start, valid_start);
  } else {
    console.log("invalid start time");
  }
  if (decided_time_end) {
    validateTime(decided_time_end, valid_end);
  } else {
    console.log("invalid end time");
  }
  if (!valid_start) {
    console.log("invalid start time");
  } 
  if (!valid_end) {
    console.log("invalid end time");
  }
  var decided_location = "";
  if (req.body.decided_location) {
    decided_location = req.body.decided_location;
  }
  var attendee_emails = req.body.attendee_emails;
  attendee_emails = attendee_emails.split(',');
  const decisionQuery = "UPDATE events \
                        SET decided_start_time = $1, decided_end_time = $2, \
                        decided_date = $3, decided_location = $4 \
                        WHERE id = $5";
  connEvents.query(decisionQuery,
                  [decided_time_start,
                    decided_time_end,
                    decided_date,
                    decided_location,
                    id],
                  (err, data) => {
    if (err) {
      console.log(err.red);
    } else {
      var event_name = "";
      const eventNameQuery = "SELECT name FROM events WHERE id = ?";
      connEvents.query(eventNameQuery, id, function(err, data) {
        if (err) {
          console.log(err.red);
        } else {
          event_name = data.rows[0].name;
          var split_date = decided_date.split("-");
          var emailReminderDate = new Date(parseInt(split_date[0]),
                                  parseInt(split_date[1]) - 1,
                                  parseInt(split_date[2]),
                                  0,
                                  0);
          cron.scheduleJob(emailReminderDate, function() {
            for (e in attendee_emails) {
              var email = attendee_emails[e];
              var email_body = 'Reminder! You have event: ' +
                              event_name +
                              ' starting at ' +
                              decided_time_start;
              if (decided_location) {
                email_body = email_body + ' in ' + decided_location;
              }
              var mailoptions = {
                from: 'meetng132@gmail.com',
                to: email,
                subject: 'Reminder for your event: ' + event_name,
                text: email_body
              };
              transporter.sendMail(mailoptions, function(err, data) {
                if (err) {
                  console.log(err);
                }
              });
            }
          });
        }
      });
    }
  });
});

// 404
app.get("*", (req, res) => {
  res.send('error');
})

//Helper Functions
function validateTime(time, valid) {
  var time_check = time.split(":");
  var t0 = parseInt(time_check[0]);
  var t1 = parseInt(time_check[1]);
  if (t0 < 0 || t0 > 23 || t1 < 0 || t1 > 59) {
    console.log("Invalid start or end time".red);
    valid = false;
  }
}

function validateDate(date, valid) {
  var date_check = Date.parse(date);
  if (isNaN(date_check)) {
    console.log("Invalid date".red);
    valid = false;
  }
}

//Listener
app.listen(8081);
console.log('Server is listening to port 8081.'.green);