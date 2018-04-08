import * as React from 'react'
import * as moment from 'moment';

export const isDateValid = (str: string, format: string, min?: moment.Moment, max?: moment.Moment): boolean => {
  return moment(str, format, true).isValid() && (!max || max.diff(moment(str), 'days') >= 0) && (!min || min.diff(moment(str), 'days') <= 0);
}

export class Dates {
    title: string
    value: moment.Moment
    inMonth: boolean
    isInInterval: boolean
    selected: boolean
}

export class CalendarProps {
  valueLink: {
    get(): moment.Moment
    set(value: moment.Moment)
  }
  format?: string = "YYYY-MM-DD"
  weeks?: string[] = ['Su', 'Mn', 'Th', 'Wn', 'Tr', 'Fr', 'Sa']
  min?: moment.Moment
  max?: moment.Moment
  weeksPerMonth?: number
  className?: string
}

export class CalendarState {
  now?: moment.Moment = moment().startOf('month')
  dates?: Dates[][]
}

export class Calendar extends React.Component<CalendarProps, CalendarState> {

  public static defaultProps = new CalendarProps()

  state = new CalendarState()

  componentWillReceiveProps(nextProps: CalendarProps, nextContext) {
    const { valueLink } = this.props
    if (nextProps.valueLink.get() && nextProps.valueLink.get() !== this.state.now) {
      this.state.now = nextProps.valueLink.get().startOf('month');
    }
  }

  getDaysArrayByCalendarMonth(date): Dates[][] {
    let startDate = moment(date).startOf('month');

    let endDate = moment(date).endOf('month');

    let weeksInMonth = 1;
    if (this.props.weeksPerMonth) {
      weeksInMonth = this.props.weeksPerMonth;
    }
    else {
      let tempDate = moment(startDate).add(1, "weeks").startOf('week');

      for (; tempDate.month() == date.month(); weeksInMonth++) {
        tempDate.add(1, "weeks").startOf('week');
      }
    }

    let arr: Dates[][] = [];

    for (let k = 0; k < weeksInMonth; k++) {
      let arrWeek: Dates[] = [];

      let currentWeek = moment(startDate).add(k, "weeks").startOf('week');

      for (let i = 0; i < 7; i++) {
        let current = moment(currentWeek).add(i, "days");
        arrWeek.push({
          title: current.format("DD"),
          value: current,
          inMonth: current.month() == date.month(),
          isInInterval: this.isInInterval(current),
          selected: this.props.valueLink.get() && (current.year() == this.props.valueLink.get().year() && current.month() == this.props.valueLink.get().month() && current.date() == this.props.valueLink.get().date()),
        });
      }

      arr.push(arrWeek);
    }

    return arr;
  }

  goPrev() {
    this.state.now = this.state.now.subtract(1, "months").startOf('month')
    this.setState({now: this.state.now})
  }

  goNext() {
    this.state.now = this.state.now.add(1, "months").startOf('month')
    this.setState({now: this.state.now})
  }

  selection(item) {
    if (item.isInInterval) {
      let value = moment(item.value);
      this.props.valueLink.set(value);
    }
  }

  isInInterval(value) {
    return (!this.props.max || this.props.max.diff(value, 'days') >= 0) && (!this.props.min || this.props.min.diff(value, 'days') <= 0)
  }

  render() {

    this.state.dates = this.getDaysArrayByCalendarMonth(this.state.now);

    let weeks = this.props.weeks.map((week) => (
      <div key={week} className="box">
        {week}
      </div>
    ));

    let days = this.state.dates.map((week, i) => (
      <div key={i}>
        {week.map((day, k) => {
          return (
            <div key={k} className={"box item" + (day.isInInterval ? '' : ' disabled text subsubsub') + (day.inMonth ? ' text' : ' text sub') + (day.selected ? ' active' : '')} onClick={()=>{this.selection.call(this, day)}}>
              {day.title}
            </div>
          )
        })}
      </div>
    ));

    return (
      <div className={"calendar " + (this.props.className || '')}>
        <div className="table-layout text center">
          <div>
            <div className="item box" onClick={this.goPrev.bind(this)}>
              {'<'}
            </div>
            <div className="box selectable">
              {this.state.now.format("YYYY/MM")}
            </div>
            <div className="item box" onClick={this.goNext.bind(this)}>
              {'>'}
            </div>
          </div>
        </div>
        <div className="table-layout">
          <div>
            {weeks}
          </div>
          {days}
        </div>
      </div>
    );
  }
}