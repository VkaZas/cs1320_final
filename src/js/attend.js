"use strict";

let pickerData = [];
let presenterData = [];


$(() => {
    const $btnSubmit = $('#btn-submit');
    const $locationForm = $('#location').find('form');
    let $checkBoxes;
    const eventID = document.querySelector('meta[name=eventID]').content;

    $.post(`/attend/${eventID}`, {id: eventID}, (data) => {

        console.log(data);

        // Render picker
        const startDate = new Date(data.pickerData.start_date);
        const endDate = new Date(data.pickerData.end_date);
        endDate.setDate(endDate.getDate() + 1);
        const startTimeList = data.pickerData.start_time_list.split(',');
        const endTimeList = data.pickerData.end_time_list.split(',');

        pickerData = [];
        for (let date = startDate, i = 0; date.getDate() !== endDate.getDate(); date.setDate(date.getDate() + 1), i++) {
            pickerData.push({
                date: date.Format('yyyy-MM-dd'),
                startTime: parseInt(startTimeList[i]),
                endTime: parseInt(endTimeList[i]),
            });
        }

        widget.renderPicker(pickerData);

        // Render presenter
        presenterData = data.presenterData;
        const tmp = [];
        for (let item of presenterData) {
            const arr = item.slot_score_list.split(',');
            tmp.push({
                date: item.date,
                scoreList: arr.map(e => parseInt(e) / 5.0)
            })
        }
        widget.renderPresenter(tmp);

        // Render location
        const locations = data.pickerData.locations.split(',');
        for (let i = 0; i < locations.length; i++) {
            $locationForm.append('<p>' +
                    `<input type="checkbox" id="location-${i}"/>` +
                    `<label for="location-${i}">${locations[i]}</label>` +
                '</p>');
        }
        $checkBoxes = $('input[type="checkbox"]');
    });

    // Sample data
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
    var widget = new TimeSlotWidget($('#widget-container'));

    // widget.renderPresenter(presenterData);
    window.widget = widget;

    $btnSubmit.click(() => {
        console.log('clicked!');
        const name = $('#name-input').val();
        if (!name) {
            alert('Please input your name');
            return;
        }

        let locationVoteB = 0;
        for (let i = 0; i < $checkBoxes.length; i++) {
            if ($(`#location-${i}`).prop('checked') === true) {
                locationVoteB |= (1 << i);

            }
        }

        $.post(`/attend/updatetimeslots/${eventID}`, {
            locationVote: locationVoteB,
            attendeeName: name,
            attendeeEmail: $('#email-input').val(),
            pickerData: JSON.stringify(widget.getPickerData()),
            test: 1,
        }, (res) => {
            // Render presenter
            presenterData = res.presenterData;
            const tmp = [];
            for (let item of presenterData) {
                const arr = item.slot_score_list.split(',');
                tmp.push({
                    date: item.date,
                    scoreList: arr.map(e => parseInt(e) / 5.0)
                })
            }
            widget.renderPresenter(tmp);
        });
    });
});

Date.prototype.Format = function(fmt)
{ //author: meizz
    var o = {
        "M+" : this.getMonth()+1,
        "d+" : this.getDate(),
        "h+" : this.getHours(),
        "m+" : this.getMinutes(),
        "s+" : this.getSeconds(),
        "q+" : Math.floor((this.getMonth()+3)/3),
        "S"  : this.getMilliseconds()
    };
    if(/(y+)/.test(fmt))
        fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
    for(var k in o)
        if(new RegExp("("+ k +")").test(fmt))
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
    return fmt;
}

