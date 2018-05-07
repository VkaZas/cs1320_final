"use strict";

var pickerData = [];
var presenterData = [];
$(function () {
  var $btnSubmit = $('#btn-submit');
  var $locationForm = $('#location').find('form');
  var $checkBoxes;
  var eventID = document.querySelector('meta[name=eventID]').content;
  $.post("/attend/".concat(eventID), {
    id: eventID
  }, function (data) {
    console.log(data); // Render picker

    var startDate = new Date(data.pickerData.start_date);
    var endDate = new Date(data.pickerData.end_date);
    endDate.setDate(endDate.getDate() + 1);
    var startTimeList = data.pickerData.start_time_list.split(',');
    var endTimeList = data.pickerData.end_time_list.split(',');
    pickerData = [];

    for (var date = startDate, i = 0; date.getDate() !== endDate.getDate(); date.setDate(date.getDate() + 1), i++) {
      pickerData.push({
        date: date.Format('yyyy-MM-dd'),
        startTime: parseInt(startTimeList[i]),
        endTime: parseInt(endTimeList[i])
      });
    }

    widget.renderPicker(pickerData); // Render presenter

    presenterData = data.presenterData;
    var tmp = [];
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = presenterData[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var _item = _step.value;

        var arr = _item.slot_score_list.split(',');

        tmp.push({
          date: _item.date,
          scoreList: arr.map(function (e) {
            return parseInt(e) / 5.0;
          })
        });
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return != null) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    if (tmp.length === 0) {
      for (var _i = 0; _i < pickerData.length; _i++) {
        var item = pickerData[_i];
        tmp.push({
          date: item.date,
          scoreList: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        });
      }
    }

    widget.renderPresenter(tmp); // Render location

    var locations = data.pickerData.locations.split(',');

    for (var _i2 = 0; _i2 < locations.length; _i2++) {
      $locationForm.append('<p>' + "<input type=\"checkbox\" id=\"location-".concat(_i2, "\"/>") + "<label for=\"location-".concat(_i2, "\">").concat(locations[_i2], "</label>") + '</p>');
    }

    $checkBoxes = $('input[type="checkbox"]');
  }); // Sample data
  // $.post('/event/createEvent', {
  //     "event_name": "test_event",
  //     "creator_mail": "test@gmail.com",
  //     "start_date": "2018-04-20",
  //     "start_time_list": "20,20,20,20",
  //     "end_date": "2018-04-23",
  //     "end_time_list": "25,23,30,25",
  //     "locations": "loc1,loc2,loc3"
  // }, (data) => {
  //     console.log(data);
  // });
  // example data
  // var pickerData = [{
  //     date: '4/10',
  //     startTime: 20,
  //     endTime: 21
  // }, {
  //     date: '4/11',
  //     startTime: 20,
  //     endTime: 22
  // }, {
  //     date: '4/12',
  //     startTime: 20,
  //     endTime: 23
  // }, {
  //     date: '4/14',
  //     startTime: 20,
  //     endTime: 24
  // }, {
  //     date: '4/15',
  //     startTime: 20,
  //     endTime: 30
  // }];
  // var presenterData = [{
  //     date: '4/10',
  //     scoreList: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.1, 0.5, 0.5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  // }, {
  //     date: '4/11',
  //     scoreList: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.5, 0.7, 0.5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  // }, {
  //     date: '4/12',
  //     scoreList: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.1, 0.3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  // }];

  var widget = new TimeSlotWidget($('#widget-container')); // widget.renderPresenter(presenterData);

  window.widget = widget;
  $btnSubmit.click(function () {
    console.log('clicked!');
    var name = $('#name-input').val();

    if (!name) {
      alert('Please input your name');
      return;
    }

    var locationVoteB = 0;

    for (var i = 0; i < $checkBoxes.length; i++) {
      if ($("#location-".concat(i)).prop('checked') === true) {
        locationVoteB |= 1 << i;
      }
    }

    $.post("/attend/updatetimeslots/".concat(eventID), {
      locationVote: locationVoteB,
      attendeeName: name,
      attendeeEmail: $('#email-input').val(),
      pickerData: JSON.stringify(widget.getPickerData()),
      test: 1
    }, function (res) {
      // Render presenter
      presenterData = res.presenterData;
      var tmp = [];
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = presenterData[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var item = _step2.value;
          var arr = item.slot_score_list.split(',');
          tmp.push({
            date: item.date,
            scoreList: arr.map(function (e) {
              return parseInt(e) / 5.0;
            })
          });
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }

      widget.renderPresenter(tmp);
    });
  });
});

Date.prototype.Format = function (fmt) {
  //author: meizz
  var o = {
    "M+": this.getMonth() + 1,
    "d+": this.getDate(),
    "h+": this.getHours(),
    "m+": this.getMinutes(),
    "s+": this.getSeconds(),
    "q+": Math.floor((this.getMonth() + 3) / 3),
    "S": this.getMilliseconds()
  };
  if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));

  for (var k in o) {
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
  }

  return fmt;
};