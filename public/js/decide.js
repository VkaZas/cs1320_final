"use strict";

var CollapsibleInstance;
$(document).ready(function () {
  M.AutoInit();
  var elem = document.querySelector('.collapsible');
  CollapsibleInstance = M.Collapsible.init(elem); // location initialization

  initLoc(); // email initialization

  initEmail();
});

function initLoc() {
  var locations = [["CIT", 4], ["SCILab", 8], ["Main Green", 5]];
  var $form = $('#location-chart');
  var total = 0;

  for (var i = 0; i < locations.length; i++) {
    total += locations[i][1];
    console.log(locations[i][1], total);
  }

  for (var i = 0; i < locations.length; i++) {
    var $p = $('<p></p>');
    var $label = $('<label></label>');
    var input = $('<input class="with-gap" name="locations" type="radio" value="' + locations[i][0] + '">');
    var width = locations[i][1] / total * 80;
    var span = $('<span class="location-bar" style="width: ' + width + '%' + '"></span><span>' + locations[i][0] + ' (' + locations[i][1] + '/' + total + ')' + '</span>');
    $label.append(input);
    $label.append(span);
    $p.append($label);
    $form.append($p);
  }
}

function removeTip(elem) {
  console.log(elem);
}

function initEmail() {
  var recipients = [["Helen", "a@b.com"], ["Pamela", "c@d.com"]];
  var data = [];

  for (var i = 0; i < recipients.length; i++) {
    data.push({
      tag: recipients[i][0]
    });
  }

  $('.chips-initial').chips({
    data: data,
    placeholder: 'Enter emails',
    secondaryPlaceholder: '+ Email',
    onChipDelete: removeTip
  });
  var chips = $('#email-recipients .chip');

  for (var i = 0; i < chips.length; i++) {
    chips[i].className += " tooltipped";
    chips[i].setAttribute("data-position", "top");
    chips[i].setAttribute("data-tooltip", recipients[i][1]);
    chips[i].setAttribute("margin", 2);
  }

  $('.tooltipped').tooltip();
  var email_header = $('#email-header');
  var recipients = chips.length;
  email_header.append($('<span class="new badge" data-badge-caption="recipients">' + recipients + '</span>'));
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
  /*    var icon = loc_header.firstChild;
      loc_header.innerHTML = "";
      loc_header.append(icon);
      loc_header.append("Location: " + location);
      loc_header.className += ' teal lighten-2';*/

}

function confirmEmail() {
  CollapsibleInstance.close(2);
  return; // $('#email-header')[0].className += ' teal lighten-2';
}