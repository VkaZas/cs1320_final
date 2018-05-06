let CollapsibleInstance;
let selectorWidget;
$(document).ready(function(){
    M.AutoInit();
    let elem = document.querySelector('.collapsible');
    CollapsibleInstance = M.Collapsible.init(elem);

    const eventID = document.querySelector('meta[name=eventID]').content;
    $.post(`/attend/${eventID}`, {id: eventID}, (data) => {

        console.log(data);
        // time initialization
        initTime(data);
        // location initialization
        initLoc(data);
        // email initialization
        initEmail(data);
    });

});

function initTime(data) {
    const presenterData = data.presenterData;
    const tmp = [];
    for (let item of presenterData) {
        const arr = item.slot_score_list.split(',');
        tmp.push({
            date: item.date,
            scoreList: arr.map(e => parseInt(e) / 5.0)
        })
    }
    selectorWidget = new TimeSlotSelector($('#time-content'));
    selectorWidget.renderPresenter(tmp, (str) => {

    });
}

function initLoc(data){
    let sample_locations = [["CIT", 4], ["SCILab", 8], ["Main Green", 5]];
    const locations = data.pickerData.locations.split(',');
    let num_attendents = data.pickerData.attendee_names;
    if (num_attendents == null) {
        num_attendents = 0;
    } else {
        num_attendents = num_attendents.split(',').length;
    }
    let location_data = [];//data.pickerData.locations_votes;
    console.log(data.pickerData.location_votes);
    if (data.pickerData.location_votes == null){
        for (let loc of locations){
            location_data.push({
                location: loc,
                vote: 0,
                width: 10,
            });
        }
    } else {
        let location_votes = data.pickerData.location_votes.split(',');

        for (let i = 0; i < locations.length; i++){
            let vote = parseInt(location_votes[i]);
            location_data.push({
                location: locations[i],
                vote: vote,
                width: num_attendents == 0 ? 10 : vote / num_attendents * 90 + 10,
            });
        }
    }
    let $form = $('#location-chart');

    for (let d of location_data) {
        let location = d.location;
        let location_vote = d.vote;
        let $p = $('<p></p>');
        let $label = $('<label></label>');
        let input = $('<input class="with-gap" name="locations" type="radio" value="' +
            location + '">');
        let span = $('<span class="location-bar" style="width: ' + d.width + '%' +
            '"></span><span>' + location + ' (' + location_vote + '/' + num_attendents + ')' +
             '</span>');
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
    let chips = $('#email-recipients .chip');
    console.log(chips);
    $('#num-recipients')[0].innerText = chips.length;
}

function initEmail(initdata){
    let recipients=[["Helen","a@b.com"], ["Pamela","c@d.com"]];
    let emails = initdata.pickerData.attendee_emails;
    if (emails == null){
        emails = [];
    } else {
        emails = emails.split(',');
    }
    let data = [];
    for (let i = 0; i < emails.length; i++) {
        data.push({
            tag: emails[i],
        });
    }
    console.log(data);
    $('.chips-initial').chips({
        data: data,
        placeholder: 'Enter emails',
        secondaryPlaceholder: '+ Email',
        onChipDelete: removeTip,
        onChipAdd: onChipAdd,
    });

    // let chips = $('#email-recipients .chip');
    // for (let i = 0; i < chips.length; i++) {
    //     chips[i].className += " tooltipped";
    //     chips[i].setAttribute("data-position", "top");
    //     chips[i].setAttribute("data-tooltip", recipients[i][1]);
    //     chips[i].setAttribute("margin", 2);
    // }
    //
    // $('.tooltipped').tooltip();

    let email_header = $('#email-header');
    let num_recipients = emails.length;
    let span = $('<span class="new badge" id="num-recipients" data-badge-caption="recipients">' +
        num_recipients + '</span>');
    email_header.append(span);
}


function confirmTime() {
    CollapsibleInstance.close(0);
    CollapsibleInstance.open(1);
}

function confirmLocation() {
    CollapsibleInstance.close(1);
    CollapsibleInstance.open(2);
    let location = $('input[name=locations]:checked').val();
    if (location == "" || location == undefined){
        return
    }
    let loc_header = $('#location-header');
    let span = $('#location-header span');
    if (span.length == 0) {
        span = $('<span class="new badge" data-badge-caption="">'+location + '</span>');
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
    return;
    // $('#email-header')[0].className += ' teal lighten-2';
}