$(document).ready(function(){
  // this should probably be stored somewhere and imported
  const keyCodes = {
    enter: 13,
    esc: 27,
    space: 32,
    left: 37,
    up: 38,
    right: 39,
    down: 40,
    pageUp: 33,
    pageDown: 34
  };

  // will need locale-specific month names
  const monthNames = [
    {short: 'Ene', long: 'Enero'},
    {short: 'Feb', long: 'Febrero'},
    {short: 'Mar', long: 'Marzo'},
    {short: 'Abr', long: 'Abril'},
    {short: 'May', long: 'Mayo'},
    {short: 'Jun', long: 'Junio'},
    {short: 'Jul', long: 'Julio'},
    {short: 'Ago', long: 'Agosto'},
    {short: 'Sep', long: 'Septiembre'},
    {short: 'Oct', long: 'Octubre'},
    {short: 'Nov', long: 'Noviembre'},
    {short: 'Dic', long: 'Diciembre'},
  ];

  // helper function, determines if an element has focus within it
  function elContainsFocus(el) {
    const focusedEl = document.activeElement;
    return el.contains(focusedEl);
  }

  /* Root of the custom element */
  const customElementMock = document.querySelector('*[data-widget-id=custom]');

  /* Root of the native element */
  const nativeElementMock = document.querySelector('*[data-widget-id=native]');

  /* Calendar function */
  const DojoCalendar = function(el, date) {
    this.el = el;
    this.days = {};
    this.currentDate = date || new Date();
    this.focusedDate = this.currentDate.getDate();
    this.focusedMonth = this.currentDate.getMonth();
    this.focusedYear = this.currentDate.getFullYear();
  }

  // month is 0-based
  DojoCalendar.prototype._getMonthLength = function(month) {
    let d = new Date(this.focusedYear, month + 1, 0);
    return d.getDate();
  }

  /* Keyboard focus helper, deals with out of range dates */
  DojoCalendar.prototype._focusOn = function(newDate, focus=true) {
    // deal with out of range dates
    let monthLength = this._getMonthLength(this.focusedMonth);

    if (newDate < 1 || newDate > monthLength) {
      if (newDate < 1) {
        this._previousMonth();
        monthLength = this._getMonthLength(this.focusedMonth);
        newDate += monthLength;
      } else {
        this._nextMonth();
        newDate -= monthLength;
      }
    }

    // focus on the correct day
    // remove currently focused date's tabindex=0 if applicable
    if (this.days[this.focusedDate] && newDate !== this.focusedDate) {
      this.days[this.focusedDate].setAttribute('tabindex', -1);
    }

    // update focusedDate and dom attributes
    this.focusedDate = newDate;
    this.days[newDate].setAttribute('tabindex', 0);

    // if focus is true, focus
    if (focus) {
      this.days[newDate].focus();
    }
  }

  // Return td element. In dojo, this would be done much more concisely with d()
  DojoCalendar.prototype._createDayCell = function(day, classes = '', selected = false) {
    const cell = document.createElement('td');
    cell.setAttribute('role', 'gridcell');
    cell.innerHTML = '<span>' + day + '</span>';

    // add classes
    cell.className = 'date ' + classes;

    // set tabindex and aria-selected
    if (selected) {
      cell.setAttribute('aria-selected', true);
      cell.setAttribute('tabindex', 0);
    } else {
      cell.setAttribute('aria-selected', false);
      cell.setAttribute('tabindex', -1);
    }

    return cell;
  }

  // populate a single month with days
  DojoCalendar.prototype._populateDays = function(focus = true) {
    const curMonthLength = this._getMonthLength(this.focusedMonth),
    prevMonthLength = this._getMonthLength(this.focusedMonth - 1),
    dayOfWeek = new Date(this.focusedYear, this.focusedMonth, 1).getDay();

    let dayIndex = 0,
    date = dayOfWeek > 0? prevMonthLength - dayOfWeek : 0,
    isCurrentMonth = dayOfWeek > 0? false : true,
    month = document.createDocumentFragment(),
    week,
    day,
    i;

    // 6 weeks
    for (let w = 0; w < 6; w++) {
      week = document.createElement('tr');

      for (i = 0; i < 7; i++) {
        // find the next date
        // if we've reached the end of the previous month, reset to 1
        if (date > dayIndex && date >= prevMonthLength) {
          date = 1;
          isCurrentMonth = true;
        }
        // if we've reached the end of the current month, reset to 1
        else if (date <= dayIndex && date >= curMonthLength) {
          date = 1;
          isCurrentMonth = false;
        }
        else {
          date++;
        }
        dayIndex++;

        // based on date and month, set classes
        let classes = isCurrentMonth? 'active' : 'inactive',
        selected = false;

        // check if this is the selected date
        if (isCurrentMonth && new Date(this.focusedYear, this.focusedMonth, date).toDateString() === this.currentDate.toDateString()) {
          selected = true;
          classes += ' selected';
        }

        // create the day element and save it in this.days if it's in the current month
        day = this._createDayCell(date, classes, selected);
        if (isCurrentMonth) {
          this.days[date] = day;
        }

        // add day to week
        week.appendChild(day);
      }

      // add week to month fragment
      month.appendChild(week);
    }

    // update dom
    const monthContainer = this.el.querySelector('.date-grid');
    monthContainer.innerHTML = '';
    monthContainer.appendChild(month);

    // update current month and year
    // need locale-based month names at some point
    this.el.querySelector('.current-month').innerHTML = monthNames[this.focusedMonth].long;
    this.el.querySelector('.current-year').innerHTML = this.focusedYear;

    // update tabbable date, and add focus if focus param is true
    this._focusOn(this.focusedDate, focus);
  }

  /* Move to the next or previous month */
  DojoCalendar.prototype._nextMonth = function() {
    this.focusedMonth++;

    if (this.focusedMonth > 11) {
      this.focusedMonth = 0;
      this.focusedYear++;
    }

    this._populateDays();
  }

  DojoCalendar.prototype._previousMonth = function() {
    this.focusedMonth--;

    if (this.focusedMonth < 0) {
      this.focusedMonth = 11;
      this.focusedYear--;
    }

    this._populateDays();
  }

  DojoCalendar.prototype.selectDate = function(date) {
    // remove class and tabindex from previously selected date, if applicable
    if (this.currentDate.getMonth() === this.focusedMonth && this.currentDate.getFullYear() === this.focusedYear) {
      const prev = this.days[this.currentDate.getDate()];
      prev.classList.remove('selected');
      prev.setAttribute('tabindex', -1);
      prev.setAttribute('aria-selected', false);
    }

    // update to new current date
    this.currentDate = date;
    this._focusOn(date.getDate());

    // update newly selected element's attributes
    const newDate = this.days[this.focusedDate];
    newDate.classList.add('selected');
    newDate.setAttribute('aria-selected', true);
  }

  /* Month/Year picker functions */
  DojoCalendar.prototype._buildMonthPicker = function() {
    // build month selector
    const monthRadios = document.createDocumentFragment();
    let radio,
    label,
    month;

    // this is the only radio button in the datepicker, but should ideally be split into its own funciton/widget
    for (month in monthNames) {
      label = document.createElement('label');
      radio = document.createElement('input');

      label.innerHTML = '<abbr title="' + monthNames[month].long + '">' + monthNames[month].short + '</abbr>';

      radio.setAttribute('type', 'radio');
      radio.setAttribute('name', 'dojocalendar-month');
      radio.setAttribute('tabindex', '-1');
      radio.value = month;

      if (month == this.focusedMonth) {
        radio.checked = true;
      }

      label.insertBefore(radio, label.firstChild);
      monthRadios.appendChild(label);
    }

    this.el.querySelector('.month-control').appendChild(monthRadios);
  }

  DojoCalendar.prototype._updateYearSpinner = function() {
    const yearSpinner = this.el.querySelector('.year-spinner'),
    yearNext = this.el.querySelector('.spinner-next'),
    yearPrev = this.el.querySelector('.spinner-prev');

    yearSpinner.setAttribute('aria-valuenow', this.focusedYear);
    yearSpinner.innerHTML = this.focusedYear;

    yearNext.innerHTML = this.focusedYear + 1;
    yearPrev.innerHTML = this.focusedYear - 1;
  }

  // year: 'previous' | 'next' | number
  DojoCalendar.prototype.changeYear = function(year) {
    if (year === 'next') {
      this.focusedYear++;
    }
    else if (year === 'previous') {
      this.focusedYear--;
    }
    else {
      this.focusedYear = year;
    }

    this._updateYearSpinner();
    this._populateDays(false);
  }

  DojoCalendar.prototype.openMonthPicker = function() {
    // update year
    this._updateYearSpinner();

    // update month
    const checkedMonth = this.el.querySelector('input:checked');
    if (checkedMonth.value != this.focusedMonth) {
      checkedMonth.checked = false;
      this.el.querySelector('input[value="' + this.focusedMonth + '"]').checked = true;
    }

    const popupEl = this.el.querySelector('.month-popup');

    // Focus handling. Should use focus helper to make all outside focusable elements tabindex="-1"
    let focusables = popupEl.querySelectorAll('[tabindex]'),
    focusableEl;

    for (focusableEl of focusables) {
      focusableEl.setAttribute('tabindex', '0');
    }

    // open popup
    popupEl.classList.remove('hidden');
    popupEl.setAttribute('aria-hidden', false);
    document.querySelector('.month-trigger').setAttribute('aria-expanded', 'true');

    // focus on first focusable element in popup
    focusables[0].focus();
  }

  DojoCalendar.prototype.closeMonthPicker = function() {
    const popupEl = this.el.querySelector('.month-popup');

    // Focus handling. Should use focus helper to do this
    let focusables = popupEl.querySelectorAll('[tabindex], [type=radio]'),
    focusableEl;

    for (focusableEl of focusables) {
      focusableEl.setAttribute('tabindex', '-1');
    }

    // close popup
    popupEl.classList.add('hidden');
    popupEl.setAttribute('aria-hidden', true);
    document.querySelector('.month-trigger').setAttribute('aria-expanded', 'false');

    // focus back on button/modal trigger
    this.el.querySelector('.month-trigger').focus();
  }

  DojoCalendar.prototype.init = function() {
    this._populateDays();
    this._buildMonthPicker();

    // bind keyboard events on calendar table
    this.el.querySelector('table').addEventListener('keydown', (event) => {
      // change focus on arrow keys
      if (event.which === keyCodes.up) {
        event.preventDefault();
        this._focusOn(this.focusedDate - 7);
      }
      else if (event.which === keyCodes.left) {
        event.preventDefault();
        this._focusOn(this.focusedDate - 1);
      }
      else if (event.which === keyCodes.down) {
        event.preventDefault();
        this._focusOn(this.focusedDate + 7);
      }
      else if (event.which === keyCodes.right) {
        event.preventDefault();
        this._focusOn(this.focusedDate + 1);
      }

      // select on enter or space
      else if (event.which === keyCodes.enter || event.which === keyCodes.space) {
        event.preventDefault();
        this.selectDate(new Date(this.focusedYear, this.focusedMonth, this.focusedDate));
      }

      // page up and page down go to first/last of month
      else if (event.which === keyCodes.pageUp) {
        event.preventDefault();
        this._focusOn(1);
      }
      else if (event.which === keyCodes.pageDown) {
        event.preventDefault();
        this._focusOn(this._getMonthLength(this.focusedMonth));
      }
    });

    // click events on calendar table
    this.el.querySelector('table').addEventListener('click', (event) => {
      let target = event.target,
      dayClicked = target.textContent.trim();

      // make sure target is td and not span
      if (target.nodeName !== 'TD') {
        target = target.parentNode;

        // if target still isn't a td, return
        if (target.nodeName !== 'TD') return;
      }

      // update month if clicking on an inactive day
      if (target.classList.contains('inactive')) {
        if (dayClicked < 15) {
          this._nextMonth();
        } else {
          this._previousMonth();
        }
      }

      // would prefer to access and store this in state
      let date = new Date(this.focusedYear, this.focusedMonth, dayClicked);
      this.selectDate(date);
    });

    // month picker events
    this.el.querySelector('.calendar-header').addEventListener('click', (event) => {
      const target = event.target;

      // open/close month popup
      if (target.classList.contains('month-trigger')) {
        const monthPopup = this.el.querySelector('.month-popup');
        if (monthPopup.classList.contains('hidden')) {
          this.openMonthPicker();
        } else {
          this.closeMonthPicker();
        }
      }

      // previous/next month arrows
      if (target.classList.contains('previous-month')) {
        this._previousMonth();
      }
      else if (target.classList.contains('next-month')) {
        this._nextMonth();
      }

      // previous/next year
      if (target.classList.contains('spinner-prev')) {
        this.changeYear('previous');
      }
      else if (target.classList.contains('spinner-next')) {
        this.changeYear('next');
      }
    });

    // update month when a new radio option is selected
    this.el.querySelector('.month-popup').addEventListener('change', (event) => {
      const newMonth = parseInt(event.target.value, 10);

      this.focusedMonth = newMonth;
      this._populateDays(false);
    });

    // update year on click or arrow keys
    this.el.querySelector('.month-popup').addEventListener('keydown', (event) => {
      // arrow presses on year selector
      if (event.target.classList.contains('year-spinner')) {
        if (event.which === keyCodes.up || event.which === keyCodes.left) {
          event.preventDefault();
          this.changeYear('previous');
        }

        if (event.which === keyCodes.down || event.which === keyCodes.right) {
          event.preventDefault();
          this.changeYear('next');
        }
      }

      // pressing enter or escape on anything within the year popup should close it
      if (
        event.which === keyCodes.enter ||
        event.which === keyCodes.esc ||
        event.which === keyCodes.space
      ) {
        event.preventDefault();
        event.stopPropagation();
        this.closeMonthPicker();
      }
    });

    // clicking out of month popup should close it
    document.body.addEventListener('click', (event) => {
      if (!this.el.querySelector('.month-picker').contains(event.target) && !this.el.querySelector('.month-popup').classList.contains('hidden')) {
        this.closeMonthPicker();
      }
    }, true);
  }


  let calendar = new DojoCalendar(nativeElementMock);
  calendar.init();

});
