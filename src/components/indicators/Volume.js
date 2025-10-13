import React, { Component } from "react";
import "./indicators.scss";

export default class Volume extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }


  render() {
    const display = this.props.display;

    const histo = this.props.histo.slice(
      this.props.histo.length - display,
      this.props.histo.length
    );

    let largest = Math.max.apply(
      Math,
      histo.map((candle) => candle.volumefrom)
    );
    let smallest = Math.min.apply(
      Math,
      histo.map((candle) => candle.volumefrom)
    );

    const range = largest - smallest;

    const candleWidth = 400 / histo.length;

    const details = histo.map((candle, i) => {
      //const color = candle.open > candle.close ? 'rgb(40,40,40)' : 'rgb(100,100,100)'
      const color = candle.open > candle.close ? "#df4b7a" : "#48ea61";

      return (
        <rect
          key={i}
          className="volume"
          style={{ fill: color, strokeMiterLimit: 10 }}
          x={candleWidth * i}
          y={200 - ((candle.volumefrom * 0.5) / range) * 200}
          width={candleWidth / 2}
          height={((candle.volumefrom * 0.5) / range) * 200}
        />
      );
    });

    return (
      <svg
        className="volume-chart"
        viewBox="0 0 400 200"
        preserveAspectRatio="none"
      >
        <g>{details}</g>
      </svg>
    );
  }
}
