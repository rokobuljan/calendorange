/**
 * newDate() - Get a new Date by passing extra parameters - by roko.cb
 * - https://github.com/rokobuljan/newDate.js
 * @param {(string|number|object)} date - String, timestamp or Date Object
 * @param {string} modifiers - Adds or subtracts. "+7d" or like "-1y,+2m,+14d"
 * @param {string} weekday - To nearest weekday "0"(Sun) "6"(Sat). "-0" for previous Sunday
 * @return {object} - Returns a new Date Object with the reslut.
 */
function newDate(date, modifiers, weekday) {
    if (!date) {
        date = new Date();
    } else if (typeof date !== "object") {
        date = new Date(date);
    }
    if (modifiers && typeof modifiers === "string") {
        modifiers = modifiers.split(",");
        while (modifiers.length) {
            var mod = modifiers.shift(),
                    num = mod.split(/[dmy]/i)[0],
                    dmy = mod.replace(num, "") || "d",
                    props = {
                        y: ["setFullYear", "getFullYear"],
                        m: ["setMonth", "getMonth"],
                        d: ["setDate", "getDate"]
                    }[dmy.toLowerCase()];
            date = new Date(date[props[0]](date[props[1]]() + (+num)));
        }
    }
    if (weekday && typeof weekday === "string") {
        var i = weekday.indexOf("-") > -1 ? -1 : 1;
        while (date.getDay() !== Math.abs(+weekday % 7)) {
            date.setDate(date.getDate() + i);
        }
    }
    return date;
}
var $cal = $(".calendar"),
        $calWd = $cal.find(".calendar_weekdays"),
        $calMs = $cal.find(".calendar_months"),
        beforeStartDate = true; // all days before S.startDate

var S = {
    monthNames: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    dayNames: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    disabledWeekDays: [0, 1, 2, 3, 4, 6],
    firstWeekDay: 1, // 0=Sunday, 1=Monday...
    dateMin: newDate("", "", "5"), // Date Obj
    dateMax: newDate("", "+1y"), // Date Obj
    dateSelected: newDate("", "", "6"),
    dateRange: "",
    rangeMax: 28,
    onRangeStart: function (rangeArray) {
        //console.dir(rangeArray);
        $(".NS_periodFrom").val(rangeArray[0].dateFormatted);
        $(".NS_periodTo").val("");
        var fmt = rangeArray[0].dateFormatted + " → ";
        $(".NS_periodFromTo").val(fmt);
        // 
        $(".periodFrom").html(rangeArray[0].dateD + '. ' + this.monthNames[rangeArray[0].dateM] + ' ' + rangeArray[0].dateY);
        $(".periodTo").html("<i>Please select a date</i>");
    },
    onRangeEnd: function (rangeArray) {
        $(".NS_periodFrom").val(rangeArray[0].dateFormatted);
        $(".NS_periodTo").val(rangeArray[1].dateFormatted);
        var fmt = rangeArray[0].dateFormatted + " → " + rangeArray[1].dateFormatted;
        $(".NS_periodFromTo").val(fmt);
        //
        $(".periodFrom").html(rangeArray[0].dateD + '. ' + this.monthNames[rangeArray[0].dateM] + ' ' + rangeArray[0].dateY);
        $(".periodTo").html(rangeArray[1].dateD + '. ' + this.monthNames[rangeArray[1].dateM] + ' ' + rangeArray[1].dateY);
    }
};

var dateNow = new Date();
var now = {
    date: dateNow.getDate(),
    month: dateNow.getMonth(),
    year: dateNow.getFullYear()
};

// Rearrange by desired firstWeekDay
var temp_dayNames = S.dayNames.splice(S.firstWeekDay, 6);
S.dayNames = temp_dayNames.concat(S.dayNames);

function inArray(k, a) {
    for (var i = 0; i < a.length; i++) {
        if (a[i] === k) {
            return true;
        }
    }
    return false;
}

function getMonthFirstWeekDayNum(m, y) { // Returns: 0..6 where 0=firstWeekDay
    var firstDay = new Date((m + 1) + "/1/" + y);
    return (firstDay.getDay() + 7 - S.firstWeekDay) % 7;
}

function getMonthTotDays(m, y) {
    return 28 + [3, (m === 1 && ((y % 4 === 0) && (y % 100 !== 0) || (y % 400 === 0))) ? 1 : 0, 3, 2, 3, 2, 3, 3, 2, 3, 2, 3][m];
}

function toDateFormat(d, m, y) {
    m += 1;
    return (d > 9 ? d : "0" + d) + "." + (m > 9 ? m : "0" + m) + "." + y;
}



function HTML_month(m, y) {

    var mfdn = getMonthFirstWeekDayNum(m, y);
    var mtot = getMonthTotDays(m, y);
    var monthClass = "calendar_month" + (mfdn > 0 ? " calendar_month_overlap" : "");
    var MONTH = "<div class='" + monthClass + "' data-month-label='" + S.monthNames[m].slice(0, 3) + " " + y + "'><ul class='calendar_week'>";

    console.log(mfdn);

    for (var _d = mfdn; _d < mtot + mfdn; _d++) {


        var d = _d - mfdn + 1;
        var _d7 = _d % 7;
        var isToday = d === now.date && m === now.month && y === now.year;

        if (isToday) {
            beforeStartDate = false;
        }

        // Create new week
        if (_d7 === 0)
            MONTH += "</ul><ul class='calendar_week'>";

        // Various day classes
        var dayClass = "calendar_day" +
                (isToday ? " calendar_day_today" : "") +
                (d === 1 ? " calendar_day_1" : "") +
                (_d7 === 5 || _d7 === 6 ? " calendar_day_weekend" : "") +
                (inArray(_d7, S.disabledWeekDays) || beforeStartDate ? " calendar_day_disabled" : " calendar_day_enabled");

        var liHTML = "<span class='calendar_day_month'>" + S.monthNames[m].slice(0, 3) + "</span>" +
                "<span class='calendar_day_year'>" + y + "</span>" +
                "<span class='calendar_day_date'>" + d + "</span>";

        MONTH += "<li class='" + dayClass + "' data-date-formatted='" + toDateFormat(d, m, y) + "' data-date-d='" + d + "' data-date-m='" + m + "' data-date-y='" + y + "' >" + liHTML + "</li>";
    }
    return MONTH + "</ul></div>";
}

// HTML create weekdays
var html = "";
for (var i = 0; i < 7; i++) {
    html += "<li class='calendar_weekday'>" + S.dayNames[i] + "</li>";
}
$calWd.append(html);






function HTML_months() {
    var supermax = 0,
            HTML = "",
            aM = S.dateMin.getMonth(),
            aY = S.dateMin.getFullYear(),
            bM = S.dateMax.getMonth(),
            bY = S.dateMax.getFullYear();

    while (aY < bY || aM < bM && supermax < 200)
    {
        HTML += HTML_month(aM, aY);
        //console.log(am +' '+ ay);
        aM = ++aM % 12;
        if (!aM)
            ++aY;

        supermax++;
    }

    $calMs.append(HTML);


}
HTML_months();






var rangeArray = [];
var range = 0; // flag range toggler
var a = 0, b = 0;
var $days = $calMs.find("li");
var $daysEnabled = $days.filter(".calendar_day_enabled");
var $rangeDays;
var $lastSelected;
var $outOfRange;
var $inRange;

// /////
// Selection
$calMs.on("mousedown.calendar", ".calendar_day_enabled:not(.calendar_day_range_disabled)", function () {
    if ($lastSelected) {
        $lastSelected.not(this).removeClass("calendar_day_active");
    }
    $lastSelected = $(this);
    $lastSelected.addClass("calendar_day_active");
});


$calMs.on("mousedown.calendar", ".calendar_day_enabled:not(.calendar_day_range_disabled)", function () {

    range ^= 1;

    if (range === 1) { // Range start

        rangeArray = []; // reset array
        rangeArray.push($(this).data()); // push 1st date
        $days.removeClass('calendar_day_selected calendar_day_selected_first calendar_day_selected_last'); // Reset classes

        a = $days.index(this);
        $rangeDays = $(this);

        var $beforeInRange = $days.slice(Math.max(0, a - S.rangeMax), a + 1);
        var $afterInRange = $days.slice(a, a + S.rangeMax + 1);
        $inRange = $beforeInRange.add($afterInRange);
        $outOfRange = $days.not($inRange).addClass("calendar_day_range_disabled");

        S.onRangeStart(rangeArray);

    } else { // Range complete

        var date = $(this).data();
        // Don't allows same-date selection
        if (rangeArray[0] === date)
            return;

        rangeArray.push(date); // push 2nd date
        b = $days.index(this);
        b = b > a ? (b + 1) : [a += 1, a = b, rangeArray.reverse()][0]; //inverse selection mode
        $rangeDays = $days.slice(a, b);
        $rangeDays.removeClass("calendar_day_range_hover calendar_day_range_first calendar_day_range_last")
                .addClass("calendar_day_selected");
        $rangeDays.first().addClass("calendar_day_selected_first");
        $rangeDays.last().addClass("calendar_day_selected_last");
        $outOfRange.removeClass("calendar_day_range_disabled");

        S.onRangeEnd(rangeArray);
    }
});

// /////
// Range Hover styles
var $rangeHoverDays,
        rangeHoverArray = [],
        c = 0, d = 0;
$calMs.on("mouseenter.calendar", ".calendar_day_enabled:not(.calendar_day_range_disabled, .calendar_day_active)", function () {
    if (!range) {
        return;
    }
    c = $days.index($lastSelected);
    d = $days.index(this);
    d = d > c ? (d + 1) : [c += 1, c = d, rangeHoverArray.reverse()][0]; //inverse selection mode
    $rangeHoverDays = $days.slice(c, d);
    $rangeHoverDays.addClass("calendar_day_range_hover");
    $rangeHoverDays.first().addClass("calendar_day_range_first");
    $rangeHoverDays.last().addClass("calendar_day_range_last");
}).on("mouseleave.calendar", ".calendar_day", function () {
    if ($rangeHoverDays) {
        $rangeHoverDays.removeClass("calendar_day_range_hover calendar_day_range_first calendar_day_range_last");
    }
});


if (!!S.dateSelected) {
    var _formattedDate = toDateFormat(S.dateSelected.getDate(), S.dateSelected.getMonth(), S.dateSelected.getFullYear());
    //console.log(_formattedDate);
    $("[data-date-formatted='" + _formattedDate + "']").trigger("mousedown.calendar");
}



// /////
// SCROLL LABEL
/*
 var scrollTimeOut_out,
 scrollTimeOut_in,
 canShowLabels = true;
 
 $calMs.on("scroll", function(){
 
 var $that = $(this);
 clearTimeout(scrollTimeOut_out);
 clearTimeout(scrollTimeOut_in);
 
 if(canShowLabels){
 canShowLabels = false;
 scrollTimeOut_in = setTimeout(function(){
 if(canShowLabels){
 $that.addClass("calendar_months_scrolling");
 }
 }, 300);
 }
 
 scrollTimeOut_out = setTimeout(function() {
 $that.removeClass('calendar_months_scrolling');
 canShowLabels = true;
 }, 120);
 
 });*/





























