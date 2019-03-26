/* I picked the calendar widget because it is the most difficult to create with vanilla javascript and no plugins.

* The code below can be used to create a functional calendar in any language. I have created an English and French version but this can be done for any language. To switch from English to French, all you have to do is set the html attribute lang-"en" to lang="fr" in the html file.
*
* You asked that there be interaction so there is a hover state for the dates but nothing happens when they are clicked as no action was was specified.
*
* You can switch between months. Only the present day is highlighted */

var CALENDAR = function () {

    //this sets the en/fr Month names. The day names are hardcoded into the html. French or English shows depending on the lang="" attribute. This demonstrates a knowledge of how to show/hide elements based on variable values.

    var months;
    if ( document.getElementsByTagName('html')[0].getAttribute('lang') == "en" ) {
        months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    } else if ( document.getElementsByTagName('html')[0].getAttribute('lang') == "fr" ) {
        months = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
    }

// The init function sets the heading label (the month and year) and sets up the prev/next buttons with eventListeners that will switch the month displayed. 'newWrap' is the id of the calendar (in this case #cal)
    function init(newWrap) {
        var calWrap = document.querySelector(newWrap),
            calLabel = calWrap.querySelector(".month-year-label");
        calLabel.innerHTML = (new Date().getMonth() + " " + new Date().getFullYear());

        calWrap.querySelector(".js-prev").addEventListener( 'click', function(){
            switchMonth(calWrap, false);
        }  );
        calWrap.querySelector(".js-next").addEventListener( 'click', function(){
            switchMonth(calWrap, true);
        }  );

        calLabel.addEventListener( 'click', switchMonth(calWrap, null, new Date().getMonth(), new Date().getFullYear()) );
        calLabel.click();
        clickDay(calWrap);

    }

// This function changes the month displayed. 'cal' is the calendar ID (in this case #cal)
    function switchMonth(cal, next, month, year) {
        var calWrap = cal,
            wrapLabel = calWrap.querySelector(".month-year-label"),
            curr = wrapLabel.innerHTML.trim().split(" "), calendar, tempYear = parseInt(curr[1], 10);

        // if the month is December and you want to move forward to a future date, this detects if the month you are moving from is December and (as there are no more months after December) it sets the next month to January. It does the reverse if you are on January and want to go to December of the previous year.

        month = month || ((next) ? ( (curr[0] === "December" || curr[0] === "Décembre") ? 0 : months.indexOf(curr[0]) + 1) : ( ( curr[0] === "January" || curr[0] === "Janvier"  ) ? 11 : months.indexOf(curr[0]) - 1));
        year = year || ((next && month === 0) ? tempYear + 1 : (!next && month === 11) ? tempYear - 1 : tempYear);

        if (!month) {
            if (next) {
                if (curr[0] === "December" || curr[0] === "Décembre" ) {
                    month = 0;
                } else {
                    month = months.indexOf(curr[0]) + 1;
                }
            } else {
                if (curr[0] === "January" || curr[0] === "Janvier") {
                    month = 11;
                } else {
                    month = months.indexOf(curr[0]) - 1;
                }
            }
        }

        if (!year) {
            if (next && month === 0) {
                year = tempYear + 1;
            } else if (!next && month === 11) {
                year = tempYear - 1;
            } else {
                year = tempYear;
            }
        }

        calendar = createCal(calWrap, year, month);

        var calFrame = calWrap.querySelector(".calendar-mobilelive__frame"),

            calObj = calFrame.querySelector(".curr");

        calObj.classList.remove("curr");
        calObj.classList.add("temp");

        var calTableTxt = calendar.calendar(),
            calTableNode = htmlToElement(calTableTxt);

        calFrame.insertBefore( calTableNode, calFrame.firstChild );
        calFrame.querySelector(".temp").style.display = "none";

        wrapLabel.innerHTML = calendar.label;
        clickDay(calWrap);
    }

    // This code creates the calendar by detecting the startDay
    function createCal(cal, year, month) {
        var day = 1, i, j, haveDays = true,
            calWrap = cal,
            startDay = new Date(year, month, day).getDay(),
            daysInMonths = [31, (((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0)) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
            calendar = [];

        // if the calendar month has already been created before (because you want to that month) and you go back to that month, the code will load the cached version of that month so you don't have to recreate the layout. If this is the first time you have visited this month, it creates the layout and caches it for future use.
        if (createCal.cache[year]) {
            if (createCal.cache[year][month]) {
                return createCal.cache[year][month];
            }
        } else {
            createCal.cache[year] = {};
        }

        i = 0;
        while (haveDays) {
            calendar[i] = [];
            for (j = 0; j < 7; j++) {
                if (i === 0) {
                    if (j === startDay) {
                        calendar[i][j] = "<div class='calendar-mobilelive__date--frame'>" + day++ + "</div>";
                        startDay++;
                    }
                } else if (day <= daysInMonths[month]) {
                    calendar[i][j] = "<div class='calendar-mobilelive__date--frame'>" + day++ + "</div>";
                } else {
                    calendar[i][j] = "";
                    haveDays = false;
                }
                if (day > daysInMonths[month]) {
                    haveDays = false;
                }
            }
            i++;
        }

        for (i = 0; i < calendar.length; i++) {
            calendar[i] = "<tr><td>" + calendar[i].join("</td><td>") + "</td></tr>";
        }

        calendar = "<table class='curr'>" + calendar.join("") + "</table>";

        if (month === new Date().getMonth()) {
            var tdArr = calWrap.querySelector(".calendar-mobilelive__frame").querySelectorAll("td");

            for (var i = 0; i < tdArr.length; i++) {

                if ( tdArr[i].innerHTML == new Date().getDate().toString() ) {
                    tdArr[i].classList.add("today");
                }
            }
        }
        createCal.cache[year][month] = { calendar: function () { return cloneObj(calendar) }, label: months[month] + " " + year };

        return createCal.cache[year][month];
    }

    createCal.cache = {};
    return {
        init: init,
        switchMonth: switchMonth,
        createCal: createCal
    };

};



function clickDay(cal) {
    var wrap = cal, months,
        tdArr = wrap.querySelector(".calendar-mobilelive__frame").querySelectorAll(".calendar-mobilelive__date--frame"),

        label = wrap.querySelector(".month-year-label"),
        curr = label.innerHTML.trim().split(" "),
        calMonth = curr[0];

    switch (calMonth) {

        case "January":  case "Janvier":
            calMonthNum = 0;
            break;
        case "February": case "Février":
            calMonthNum = 1;
            break;
        case "March": case "Mars":
            calMonthNum = 2;
            break;
        case "April": case "Avril":
            calMonthNum = 3;
            break;
        case "May": case "Mai":
            calMonthNum = 4;
            break;
        case "June": case "Juin":
            calMonthNum = 5;
            break;
        case "July": case "Juillet":
            calMonthNum = 6;
            break;
        case "August": case "Août":
            calMonthNum = 7;
            break;
        case "September": case "Septembre":
            calMonthNum = 8;
            break;
        case "October": case "Octobre":
            calMonthNum = 9;
            break;
        case "November": case "Novembre":
            calMonthNum = 10;
            break;
        case "December": case "Décembre":
            calMonthNum = 11;
            break;

    }

// This adds the class 'today' to the date element which matches the current date.day. That class highlights the day.
    if (calMonthNum  === new Date().getMonth()) {

        for (var i = 0; i < tdArr.length; i++) {
            if ( tdArr[i].innerHTML == new Date().getDate().toString() ) {
                tdArr[i].classList.add("today");
            }
        }
    }


// This adds the classes nil and disabled to dates before and after the current month's dates.
    var tdArr2 = wrap.querySelectorAll("td");
    for (var i = 0; i < tdArr2.length; i++) {
        if ( elementIsEmpty(tdArr2[i]) ) {
            tdArr2[i].classList.add("nil", "disabled");
        }
    }
}


<!-- this a useful vanilla javascript utility for determining if an element has a particular class. It replaces the jQuery hasClass() function. -->
function hasThisClass(element, cls) {
    return (' ' + element.className + ' ').indexOf(' ' + cls + ' ') > -1;
}

// This detects if a day element is empty
function elementIsEmpty(el) {
    return (/^(\s|&nbsp;)*$/.test(el.innerHTML));
}

// This is used to clone and cache a month layout
function cloneObj(obj) {
    if (null == obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    }
    return copy;
}

// This is a sneaky way of creating a html element, adding content to it and then returning just the content
// (without the container) - to be inserted into an existing html element.
// It gets around the dom process of rejecting text input as valid html (and instead displaying the content as text on the screen).
// It accepts text as html when it is inserted as the content of a valid, existing element's innerHTMLElement's first-child because the first-child itself is a valid html element.
function htmlToElement(html) {
    var template = document.createElement('template');
    template.innerHTML = html;
    return template.content.firstChild;
}

