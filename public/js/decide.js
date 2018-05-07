"use strict";

var CollapsibleInstance;
var selectorWidget;
$(document).ready(function () {
  M.AutoInit();
  var elem = document.querySelector('.collapsible');
  CollapsibleInstance = M.Collapsible.init(elem);
  var eventID = document.querySelector('meta[name=eventID]').content;
  $.post("/attend/".concat(eventID), {
    id: eventID
  }, function (data) {
    console.log(data); // time initialization

    initTime(data); // location initialization

    initLoc(data); // email initialization

    initEmail(data);
  });
});

function initTime(data) {
  var presenterData = data.presenterData;
  var tmp = [];
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = presenterData[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var item = _step.value;
      var arr = item.slot_score_list.split(',');
      tmp.push({
        date: item.date,
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

  selectorWidget = new TimeSlotSelector($('#time-content'));
  selectorWidget.renderPresenter(tmp, function (str) {});
}

function initLoc(data) {
  var sample_locations = [["CIT", 4], ["SCILab", 8], ["Main Green", 5]];
  var locations = data.pickerData.locations.split(',');
  var num_attendents = data.pickerData.attendee_names;

  if (num_attendents == null) {
    num_attendents = 0;
  } else {
    num_attendents = num_attendents.split(',').length;
  }

  var location_data = []; //data.pickerData.locations_votes;

  console.log(data.pickerData.location_votes);

  if (data.pickerData.location_votes == null) {
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = locations[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        var loc = _step2.value;
        location_data.push({
          location: loc,
          vote: 0,
          width: 10
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
  } else {
    var location_votes = data.pickerData.location_votes.split(',');

    for (var i = 0; i < locations.length; i++) {
      var vote = parseInt(location_votes[i]);
      location_data.push({
        location: locations[i],
        vote: vote,
        width: num_attendents == 0 ? 10 : vote / num_attendents * 90 + 10
      });
    }
  }

  var $form = $('#location-chart');

  for (var _i = 0; _i < location_data.length; _i++) {
    var d = location_data[_i];
    var location = d.location;
    var location_vote = d.vote;
    var $p = $('<p></p>');
    var $label = $('<label></label>');
    var input = $('<input class="with-gap" name="locations" type="radio" value="' + location + '">');
    var span = $('<span class="location-bar" style="width: ' + d.width + '%' + '"></span><span>' + location + ' (' + location_vote + '/' + num_attendents + ')' + '</span>');
    $label.append(input);
    $label.append(span);
    $p.append($label);
    $form.append($p);
  }
}

function removeTip(elem) {
  console.log(elem);
}

function onChipAdd(elem) {
  console.log("on chip add!");
  var chips = $('#email-recipients .chip');
  console.log(chips);
  $('#num-recipients')[0].innerText = chips.length;
}

function initEmail(initdata) {
  var recipients = [["Helen", "a@b.com"], ["Pamela", "c@d.com"]];
  var emails = initdata.pickerData.attendee_emails;

  if (emails == null) {
    emails = [];
  } else {
    emails = emails.split(',');
  }

  var data = [];

  for (var i = 0; i < emails.length; i++) {
    data.push({
      tag: emails[i]
    });
  }

  console.log(data);
  $('.chips-initial').chips({
    data: data,
    placeholder: 'Enter emails',
    secondaryPlaceholder: '+ Email',
    onChipDelete: removeTip,
    onChipAdd: onChipAdd
  }); // let chips = $('#email-recipients .chip');
  // for (let i = 0; i < chips.length; i++) {
  //     chips[i].className += " tooltipped";
  //     chips[i].setAttribute("data-position", "top");
  //     chips[i].setAttribute("data-tooltip", recipients[i][1]);
  //     chips[i].setAttribute("margin", 2);
  // }
  //
  // $('.tooltipped').tooltip();

  var email_header = $('#email-header');
  var num_recipients = emails.length;
  var span = $('<span class="new badge" id="num-recipients" data-badge-caption="recipients">' + num_recipients + '</span>');
  email_header.append(span);
}

function confirmTime() {
  CollapsibleInstance.close(0);
  CollapsibleInstance.open(1);
}

function confirmLocation() {
  CollapsibleInstance.close(1);
  CollapsibleInstance.open(2);
  var location = $('input[name=locations]:checked').val();

  if (location == "" || location == undefined) {
    return;
  }

  var loc_header = $('#location-header');
  var span = $('#location-header span');

  if (span.length == 0) {
    span = $('<span class="new badge" data-badge-caption="">' + location + '</span>');
    loc_header.append(span);
    return;
  } else {
    span[0].innerText = location;
    return;
  }
  /*    let icon = loc_header.firstChild;
      loc_header.innerHTML = "";
      loc_header.append(icon);
      loc_header.append("Location: " + location);
      loc_header.className += ' teal lighten-2';*/

}

function confirmEmail() {
  CollapsibleInstance.close(2);
  return; // $('#email-header')[0].className += ' teal lighten-2';
}