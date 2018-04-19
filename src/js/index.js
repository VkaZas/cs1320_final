window.addEventListener("DOMContentLoaded", () => {
    // const el = document.getElementById("embedded-typeform");
    //
    // // When instantiating a widget embed, you must provide the DOM element
    // // that will contain your typeform, the URL of your typeform, and your
    // // desired embed settings
    // window.typeformEmbed.makeWidget(el, "https://admin.typeform.com/to/dA5tpf", {
    //     hideFooter: true,
    //     hideHeaders: true,
    //     opacity: 0
    // });

    // example data
    const pickerData = [
        {
            date: '4/10',
            startTime: 20,
            endTime: 21,
        },
        {
            date: '4/11',
            startTime: 20,
            endTime: 22,
        },
        {
            date: '4/12',
            startTime: 20,
            endTime: 23,
        },
        {
            date: '4/14',
            startTime: 20,
            endTime: 24,
        },
        {
            date: '4/15',
            startTime: 20,
            endTime: 30,
        },
    ];
    const presenterData = [
        {
            date: '4/10',
            scoreList: [
                0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0,
                0, 0, 0, 0.1, 0.5, 0.5,
                0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0,
            ]
        },
        {
            date: '4/11',
            scoreList: [
                0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0,
                0, 0, 0, 0.5, 0.7, 0.5,
                0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0,
            ]
        },
        {
            date: '4/12',
            scoreList: [
                0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0,
                0, 0, 0, 0.1, 0.3, 1,
                0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0,
            ]
        },
    ];
    const widget = new TimeSlotWidget($('#widget-container'));
    widget.renderPicker(pickerData);
    widget.renderPresenter(presenterData);
    window.widget = widget;
});