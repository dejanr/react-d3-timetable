import React from 'react';
import Lokka from 'lokka';

import Chart from './Chart';

export default class Timetable extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      data: [],
      zoom: 'month'
    };
  }

  setZoom(zoom) {
    this.setState({ zoom });
  }

  componentDidMount() {
    this.chart = new Chart({
      target: this.refs.chart,
      width: this.props.width,
      height: this.props.height,
      zoom: this.state.zoom
    });
  }

  componentDidUpdate() {
    this.chart.update(this.state.data, {
      zoom: this.state.zoom,
      width: this.props.width,
      height: this.props.height,
    });
  }

  render() {
    return (
      <div className="Timetable">
        <svg ref="chart"></svg>
        <div className="TimetableControls">
          <button onClick={this.setZoom.bind(this, 'day')} className="TimetableControls-button">Day</button>
          <button onClick={this.setZoom.bind(this, 'week')} className="TimetableControls-button">Week</button>
          <button onClick={this.setZoom.bind(this, 'month')} className="TimetableControls-button">Month</button>
        </div>
      </div>
    );
  }
};
