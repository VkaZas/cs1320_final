"use strict";

let startDate, endDate;
let rangePickerWidget;

$(() => {
    const $startDatePicker = $('#start-date-input');
    const $endDatePicker = $('#end-date-input');
    const $btnSubmit = $('#btn-submit');

    $startDatePicker.datepicker();
    $startDatePicker.datepicker({
        onClose: () => {
            startDate = _.cloneDeep($startDatePicker[0].M_Datepicker.date);
            $endDatePicker.datepicker({
                minDate: startDate,
                onClose: () => {
                    endDate = _.cloneDeep($endDatePicker[0].M_Datepicker.date);
                    endDate.setDate($endDatePicker[0].M_Datepicker.date.getDate() + 1);
                    const pickerData = [];
                    for (let date = startDate, i = 0; date.getDate() !== endDate.getDate(); date.setDate(date.getDate() + 1), i++) {
                        pickerData.push({
                            date: date.Format('yyyy-MM-dd'),
                            startTime: 16,
                            endTime: 40,
                        });
                    }

                    rangePickerWidget = new TimeRangeSelector($('#range-picker-container'));
                    rangePickerWidget.renderPicker(pickerData);
                }
            });
        }
    });

    $btnSubmit.click(() => {
        const name = $('#name-input').val();
        const email = $('#email-input').val();
        const loc1 = $('#location-input-1').val();
        const loc2 = $('#location-input-2').val();
        const loc3 = $('#location-input-3').val();

        if (!name || !email) {
            M.toast({html: 'Please input both username and email.'});
            return;
        }
        if (!loc1 && !loc2 && !loc3) {
            M.toast({html: 'Please input at least one location.'});
            return;
        }
        const locations = [];
        if (!!loc1) locations.push(loc1);
        if (!!loc2) locations.push(loc2);
        if (!!loc3) locations.push(loc3);
        if (!startDate || !endDate) {
            M.toast({html: 'Please select both start date and end date.'});
            return;
        }
        const data = rangePickerWidget.getPickerData();
        const startTimeList = data.map(e => e.minV);
        const endTimeList = data.map(e => e.maxV);

        console.log($startDatePicker[0].M_Datepicker.date.Format('yyyy-MM-dd'));
        console.log($endDatePicker[0].M_Datepicker.date.Format('yyyy-MM-dd'));

        $.post('/event/createEvent', {
            "event_name": name,
            "creator_email": email,
            "start_date": $startDatePicker[0].M_Datepicker.date.Format('yyyy-MM-dd'),
            "start_time_list": startTimeList.join(),
            "end_date": $endDatePicker[0].M_Datepicker.date.Format('yyyy-MM-dd'),
            "end_time_list": endTimeList.join(),
            "locations": locations.join(),
        }, (data) => {
            window.location = data.attend;
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