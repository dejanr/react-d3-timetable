import d3 from 'd3';
import {
  select,
  selectAll,
  axisTop,
  axisLeft,
  scaleTime,
  scaleBand,
  scaleOrdinal,
  scaleLinear,
  timeHour,
  timeDay,
  timeMonday,
  timeSunday,
  timeWeek,
  timeMonth,
  timeFormat,
} from 'd3';

/**
 * Default config.
 */

const DEFAULT_ZOOM = 'month';
const AXIS_TICKS = {
  day: 1000,
  week: 600,
  month: 120,
}

const defaults = {
  // target element or selector to contain the svg
  target: '#timetable-chart',

  // width of chart
  width: 550,

  // height of chart
  height: 170,

  // margin
  margin: { top: 50, right: 0, bottom: 50, left: 0, },

  // zoom beetween day, week, or month
  zoom: DEFAULT_ZOOM,

  // axis
  axis: {
    height: 50,
    ticks: AXIS_TICKS
  },

  // margin
  margin: { top: 15, right: 30, bottom: 35, left: 150 },
}

export default class TimetableChart {
  constructor(config) {
    this.configure(config)
    this.initialize()
  }

	configure(config) {
    Object.assign(this, defaults, config)
  }

	initialize() {
    const { target, width, height, margin, axis } = this;
    const { scaleWidth, scaleHeight } = this.scaleDimensions();
    let offset = 4;

    this.chart = select(target)
      .attr('width', width)
      .attr('height', height)

    this.timeAxes = this.chart.append('g')
      .attr('class', 'Chart-timeAxes');

    this.timeAxes = this.timeAxes.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`)

    this.timeAxes.append('g')
      .attr('class', 'Chart-hourAxis')
      .attr('transform', `translate(0, ${(axis.height/2) * --offset})`)

    this.timeAxes.append('g')
      .attr('class', 'Chart-dayAxis')
      .attr('transform', `translate(0, ${(axis.height/2) * --offset})`)

    this.timeAxes.append('g')
      .attr('class', 'Chart-monthAxis')
      .attr('transform', `translate(0, ${(axis.height/2) * --offset})`)

    this.resourceAxis = this.chart.append('g')
      .attr('class', 'Chart-resourceAxis')
      .attr('width', width)
      .attr('height', height)
      .attr('transform', `translate(${2 * axis.height}, ${2 * axis.height})`);

    this.adjustAxes();
  }

  adjustAxes() {
    const { axis } = this;

    select(this.target)
      .attr('width', this.width)
      .attr('height', this.height)
      .attr('class', this.zoom)

    this.monthAxis = axisTop(this.scaleTime())
    this.dayAxis = axisTop(this.scaleTime())
    this.hourAxis = axisTop(this.scaleTime())

    this.adjustMonthAxis();
    this.adjustDayAxis();
    this.adjustHourAxis();

    this.chart.select('.Chart-monthAxis').call(this.monthAxis);
    this.chart.select('.Chart-dayAxis').call(this.dayAxis);
    this.chart.select('.Chart-hourAxis').call(this.hourAxis);
  }

  adjustMonthAxis() {
    const { scaleHeight } = this.scaleDimensions();

    switch(this.zoom) {
      case 'month':
        this.monthAxis
          .ticks(timeMonday, 1)
          .tickSize(-scaleHeight, 0, 0)
          .tickFormat(month => timeFormat('%B %e')(month));
        break;
      case 'week':
        this.monthAxis
          .ticks(timeWeek, 1)
          .tickSize(-scaleHeight, 0, 0)
          .tickFormat(month => timeFormat('%B %e')(month));
        break;
      case 'day':
        this.monthAxis
          .ticks(timeHour, 21)
          .tickSize(-scaleHeight, 0, 0)
          .tickFormat(month => timeFormat('%B %e')(month));
        break;
    }
  }

  adjustDayAxis() {
    const { scaleHeight } = this.scaleDimensions();

    switch(this.zoom) {
      case 'month':
        this.dayAxis
          .ticks(timeDay, 1)
          .tickSize(-scaleHeight, 0, 0)
          .tickFormat(day => timeFormat('%d')(day));
        break;
      case 'week':
        this.dayAxis
          .ticks(timeDay, 1)
          .tickSize(-scaleHeight, 0, 0)
          .tickFormat(day => timeFormat('%A')(day));
        break;
      case 'day':
        this.dayAxis
          .ticks(timeHour, 21)
          .tickSize(-scaleHeight, 0, 0)
          .tickFormat(hour => timeFormat('%A')(hour))
        break;
    }
  }

  adjustHourAxis() {
    const { scaleHeight } = this.scaleDimensions();

    switch(this.zoom) {
      case 'month':
        this.hourAxis
          .ticks(timeHour, 6)
          .tickSize(0, 0, 0)
          .tickFormat(() => '')
        break;
      case 'week':
        this.hourAxis
          .ticks(timeHour, 6)
          .tickSize(0, 0, 0)
          .tickFormat((hour, index) => timeFormat('%H')(hour))
        break;
      case 'day':
        this.hourAxis
          .ticks(timeHour, 1)
          .tickSize(-scaleHeight, 0, 0)
          .tickFormat(hour => timeFormat('%H:%M')(hour))
        break;
    }
  }

  scaleDimensions() {
    const { width, height, margin } = this
    const scaleWidth = width - margin.left - margin.right
    const scaleHeight = height - margin.top - margin.bottom

    return { scaleWidth, scaleHeight };
  }

  scaleTime() {
    const now = new Date();
    const { scaleWidth } = this.scaleDimensions();
    const ticks = this.width /
               (AXIS_TICKS[this.zoom]);

    if (this.zoom === 'day') {
      return scaleTime()
        .domain([
          timeHour.offset(timeDay(now), 6),
          timeHour.offset(timeDay(now), 21),
        ])
        .rangeRound([0, scaleWidth]);
    } else if (this.zoom === 'week') {
      return scaleTime()
        .domain([
          timeMonday(now),
          timeSunday.offset(timeSunday(now), 1)
        ])
        .rangeRound([0, scaleWidth]);
    } else if (this.zoom === 'month') {
      return scaleTime()
        .domain([
          timeMonth(now),
          timeDay.offset(timeMonth.offset(timeMonth(now), 1), -1)
        ])
        .rangeRound([0, scaleWidth]);
    }
  }

  scaleResource(resources) {
    const { scaleHeight } = this.scaleDimensions();

    return scaleOrdinal()
      .domain(resources)
      .range(resources.map((val, index) => {
        return index * scaleHeight/resources.length;
      }));
  }

  update(data, { zoom, width, height }) {
    this.zoom = zoom || this.zoom;
    this.width = width || this.width;
    this.height = height || this.height;

    this.adjustAxes();

    this.render(data, {
      animate: true
    });
  }

  renderResourceAxis(data, options) {
    const resources = data.reduce((all, appointment) => {
      const appointmentResources = appointment.resources.map(r => r.name);
      return all.concat(appointmentResources);
    }, []);

    this.resourceAxis = axisLeft(this.scaleResource(resources))
      .tickSize(0, 0, 0);
    this.chart.select('.Chart-resourceAxis').call(this.resourceAxis);
  }

  renderData(data, options) {
  }

  render(data, options) {
    this.renderResourceAxis(data, options);
    this.renderData(data, options);
  }
}
