import React, { Component } from "react";
import "./indicators.scss";

const boxwidth = 400;
const boxheight = 100;

const lightblue = "#00ffff";
const darkpuple = "#cc00cc";
const darkblue = "#009b9b";
const lightpurple = "#ff9bff";

export default class TTMSqueeze extends Component {
  constructor(props) {
    super(props);
    this.state = {
      chart: "",
    };
  }

  componentDidMount() {
    this.computeChart();
  }

  componentDidUpdate(prevProps) {
    // Recompute when relevant props change (osc, diff, display)
    if (
      prevProps.display !== this.props.display ||
      prevProps.osc !== this.props.osc ||
      prevProps.diff !== this.props.diff
    ) {
      this.computeChart();
    }
  }

  computeChart() {
    const display = this.props.display;
    const candleWidth = boxwidth / display;
    let chart = "";
    if (this.props.osc.length) {
      let largest = Math.max.apply(
        null,
        this.props.osc.map((o) => (o < 0 ? o * -1 : o))
      );

      const ratio = 100 / (largest * 2);

      const osc_color = this.props.osc.map((o, i) => {
        return this.props.osc[i - 1] < o
          ? o >= 0
            ? lightblue
            : darkpuple
          : o >= 0
          ? darkblue
          : lightpurple;
      });

      chart = this.props.osc.map((candle, i) => {
        //console.log(this.props.osc[i]);
        const color = osc_color[i];
        const y1 = this.props.osc[i] < 0 ? 55 : 45;
        const y2 =
          this.props.osc[i] < 0
            ? 55 + ratio * this.props.osc[i] * -1
            : 45 - ratio * this.props.osc[i];
        const dotcolor = this.props.diff[i] ? "#48ea61" : "#ff0051";

        return (
          <g key={i}>
            <line
              strokeLinecap="round"
              className="time"
              stroke={color}
              style={{ strokeMiterLimit: 5, fill: color }}
              x1={candleWidth * i + candleWidth / 4}
              x2={candleWidth * i + candleWidth / 4}
              y1={y1}
              y2={y2}
              strokeWidth="2"
            />
            <circle
              cx={candleWidth * i + candleWidth / 4}
              cy={50}
              r="2"
              stroke="black"
              strokeWidth="0"
              fill={dotcolor}
              style={{ opacity: 0.9 }}
            />
          </g>
        );
      });
    } else {
      // console.log(this.props.osc);
    }
    this.setState({
      chart: chart,
    });
  }

  render() {
    //console.log(this.props.current)

    return (
      <svg
        className="ttm-squeeze-chart"
        viewBox={"0 0 " + boxwidth + " " + boxheight}
        preserveAspectRatio="none"
      >
        {this.state.chart}
      </svg>
    );
  }
}
