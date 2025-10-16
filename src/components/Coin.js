import React, { Component } from "react";
import "typeface-exo";
import keltnerchannel from "keltnerchannel";

import Candlestick from "./indicators/Candlestick";
//import HeikinAshiCandlestick from'./indicators/HeikinAshiCandlestick'
import Volume from "./indicators/Volume";
import BollingerBands from "./indicators/BollingerBands";
import KeltnerChannel from "./indicators/KeltnerChannel";
import TTMSqueeze from "./indicators/TTMSqueeze";
//import Line from'./indicators/Line'
//import RSI from "./indicators/RSI";

import "./Coin.scss";

// Modern currency formatter using built-in Intl API
const formatCurrency = (value) => {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "0.00";
  return num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};
const formatCurrencyLong = (value) => {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "0.00";
  return num.toLocaleString("en-US", {
    minimumFractionDigits: 7,
    maximumFractionDigits: 7,
  });
};

const kc = keltnerchannel.kc;
const sma = keltnerchannel.sma;
//const ema = keltnerchannel.ema
const boll = keltnerchannel.boll;

const lightblue = "#00ffff";
const darkpuple = "#cc00cc";
const darkblue = "#009b9b";
const lightpurple = "#ff9bff";

const ASYNC_DELAY = 1000;

export default class Coin extends Component {
  constructor(props) {
    super(props);
    this.coinRef = React.createRef();
    this.state = {
      coin: this.props.coin,
      // data: {
      //   histo: []
      // },
      scales: [
        // [short name, focus, focus scale, squeeze status (1,2,3), data, osc, diff]
        // ['1M', 'minute', 1, 0, [], [], []],
        // ['5M', 'minute', 5, 0, [], [], []],
        // ['15M', 'minute', 15, 0, [], [], []],
        // ['30M', 'minute', 30, 0, [], [], []],
        ["1H", "hour", 1, 0, [], [], []],
        ["2H", "hour", 2, 0, [], [], []],
        ["3H", "hour", 3, 0, [], [], []],
        ["4H", "hour", 4, 0, [], [], []],
        ["6H", "hour", 6, 0, [], [], []],
        ["8H", "hour", 8, 0, [], [], []],
        ["12H", "hour", 12, 0, [], [], []],
        ["1D", "day", 1, 0, [], [], []],
        ["1W", "day", 7, 0, [], [], []],
      ],
      current: this.props.current,
      coinprice: 0,
      cointime: "",
      fullwidth: this.props.fullwidth,
      settings: false,
      batch: 220,
      display: 100,
      length: 20,
    };
  }

  // setState(state) {
  //   return new Promise((resolve) => {
  //     this.setState(state, resolve)
  //   });
  // }

  componentDidMount() {
    //this.setSqueezeAlert(scaleIndex)
    const _this = this;
    this.state.scales.map((item, scaleIndex) => {
      setTimeout(function () {
        _this.getCoin(scaleIndex);
      }, ASYNC_DELAY * scaleIndex);

      return "";
    });
    //console.log(this.refs.coin)

    // AsyncStorage.setItem('COIN', JSON.stringify({}), () => {
    //   AsyncStorage.mergeItem('COIN', JSON.stringify({}), () => {
    //     AsyncStorage.getItem('COIN', (err, result) => {
    //       console.log(result);
    //     });
    //   });
    // });
  }

  overCandle(price, time) {
    this.setState({
      coinprice: price,
      cointime: time,
    });
    // this.state.coinprice = price
    // this.state.cointime = time

    // re-render
    //this.forceUpdate();
  }

  setSqueezeAlert(index, data) {
    //console.log(data)
    //this.state.scales[time][3] = type

    //this.getCoin(index)

    let scales = this.state.scales;
    scales[index][4] = data;

    this.setState({
      scales: scales,
    });
    if (scales[index][4].length === this.state.batch) {
      const test = scales[index][4].slice(
        scales[index][4].length - (this.state.display + this.state.length),
        scales[index][4].length
      );
      const histo = scales[index][4].slice(this.state.length, test.length);

      const closes = test.map((candle) => candle.close);

      const keltner = kc(test, this.state.length, 1, false);
      const simpleMovingAverage = sma(closes, this.state.length); // [3, 4]
      const bollinger = boll(closes, this.state.length, 2, true); // { upper: [], mid: [], lower: []}

      const linearRegression = (y, x) => {
        let lr = {};
        let n = y.length;
        let sum_x = 0;
        let sum_y = 0;
        let sum_xy = 0;
        let sum_xx = 0;

        for (let i = 0; i < y.length; i++) {
          sum_x += x[i];
          sum_y += y[i];
          sum_xy += x[i] * y[i];
          sum_xx += x[i] * x[i];
        }

        lr["slope"] =
          (n * sum_xy - sum_x * sum_y) / (n * sum_xx - sum_x * sum_x);

        return lr;
      };

      const e1 = histo.map((can, i) => {
        const from =
          this.state.batch - (this.state.display + this.state.length) + i;
        const to = this.state.batch - this.state.display + i;
        const highest = Math.max.apply(
          null,
          scales[index][4].slice(from, to).map((candle) => candle.high)
        );
        const lowest = Math.min.apply(
          null,
          scales[index][4].slice(from, to).map((candle) => candle.low)
        );
        const output = (highest + lowest + simpleMovingAverage[i]) / 3;

        return output;
      });

      const input_x = Array.from(
        Array(this.state.length),
        (_, x) =>
          (this.state.length - 1 - x) *
          (this.state.length - 1 - x === 0 ? 1 : -1)
      );

      // histo is only the display data where this.props. histo is the batch data
      const osc = histo.map((can, i) => {
        const input_y = scales[index][4]
          .slice(
            this.state.batch - (this.state.display + this.state.length) + i,
            this.state.batch - this.state.display + i
          )
          .map((histo, i) => histo.close - e1[i] / 2);

        const lg = linearRegression(input_y, input_x);
        return lg.slope;
      });

      //let largest = Math.max.apply(null, osc.map(o => o < 0 ? o * -1 : o))
      const bband = bollinger.upper
        .slice(
          bollinger.upper.length - this.state.display,
          bollinger.upper.length
        )
        .map((upper, i) => {
          return upper - bollinger.lower[i];
        });
      const kelt = keltner.upper
        .slice(keltner.upper.length - this.state.display, keltner.upper.length)
        .map((upper, i) => {
          return upper - keltner.lower[i];
        });

      const diff = histo.map((hist, i) => {
        return bband[i] > kelt[i];
      });

      const osc_color = osc.map((o, i) => {
        return osc[i - 1] < o
          ? o >= 0
            ? lightblue
            : darkpuple
          : o >= 0
          ? darkblue
          : lightpurple;
      });

      scales[index][5] = osc;
      scales[index][6] = diff;
      this.setState({
        scales: scales,
      });

      let inSqueeze = false;
      let lastSqueeze = null;

      histo.map((candle, i) => {
        const hasSqueeze = diff[i] ? false : true;

        if (hasSqueeze) {
          inSqueeze = true;
          lastSqueeze = i;
        }
        return "";
      });

      if (inSqueeze) {
        if (lastSqueeze + 1 === histo.length) {
          scales[index][3] = 1;
        } else {
          let trend = true;
          let current_color = osc_color[lastSqueeze + 1];
          histo.slice(lastSqueeze + 1, histo.length).map((candle, i) => {
            if (trend) {
              trend =
                current_color === osc_color[i + lastSqueeze + 1] ? true : false;
            }
            return "";
          });
          if (trend) {
            scales[index][3] =
              current_color === lightblue || current_color === darkpuple
                ? 3
                : 2;
          }
        }
        this.setState({
          scales: scales,
        });
      }
    }
  }

  async getCoin(index) {
    let _fsym = this.state.coin.fsym === "MIOTA" ? "IOT" : this.state.coin.fsym;

    if (this.state.scales[index][0] === "12H") {
      const url1 =
        "https://min-api.cryptocompare.com/data/histo" +
        this.state.scales[index][1] +
        "?fsym=" +
        _fsym +
        "&tsym=" +
        this.state.coin.tsym +
        "&limit=" +
        (this.state.batch - 1) +
        "&aggregate=" +
        this.state.scales[index][2] +
        "&e=CCCAGG";

      // date.setDate(date.getDate() - 1);

      // date ;
      //console.log(url1);
      var data = await Promise.all([
        fetch(url1).then((response) => response.json()), // parse each response as json
      ]);

      const url2 =
        "https://min-api.cryptocompare.com/data/histo" +
        this.state.scales[index][1] +
        "?fsym=" +
        _fsym +
        "&tsym=" +
        this.state.coin.tsym +
        "&limit=" +
        (this.state.batch - 1) +
        "&aggregate=" +
        this.state.scales[index][2] +
        "&e=CCCAGG&toTs=" +
        data[0].TimeFrom;
      var data2 = await Promise.all([
        fetch(url2).then((response) => response.json()), // parse each response as json
      ]);
      //console.log(data2);
      const firstPart = Array.isArray(data2[0]?.Data) ? data2[0].Data : [];
      const secondPart = Array.isArray(data[0]?.Data) ? data[0].Data : [];
      const _data = firstPart.concat(secondPart);
      this.setSqueezeAlert(
        index,
        _data.slice(_data.length - 220, _data.length)
      );
    } else {
      const historyres = await fetch(
        "https://min-api.cryptocompare.com/data/histo" +
          this.state.scales[index][1] +
          "?fsym=" +
          _fsym +
          "&tsym=" +
          this.state.coin.tsym +
          "&limit=" +
          (this.state.batch - 1) +
          "&aggregate=" +
          this.state.scales[index][2] +
          "&e=CCCAGG"
      );
      await historyres.json().then((data) => {
        const safeData = Array.isArray(data?.Data) ? data.Data : [];
        this.setSqueezeAlert(index, safeData);
      });
    }

    //this.state.scales[index][4] = histo.Data
    // this.setStateAsync({
    //   coinprice: 0,
    //   cointime: 0,
    // })
  }

  updateCoin(scaleIndex) {
    this.setState({
      current: scaleIndex,
    });
    this.getCoin(scaleIndex);
  }

  render() {
    const squeezetimes = this.state.scales.map((item, scaleIndex) => {
      //console.log(this.state.current, scaleIndex)
      let watchstate = "";
      if (item[3] === 0) {
        watchstate = "";
      } else if (item[3] === 1) {
        watchstate = "watch";
      } else if (item[3] === 2) {
        watchstate = "fired-short";
      } else if (item[3] === 3) {
        watchstate = "fired-long";
      } else {
        watchstate = "";
      }
      return (
        <div
          key={scaleIndex}
          className={
            (this.state.current === scaleIndex
              ? "squeezetimeselected "
              : "squeezetime ") + watchstate
          }
          onClick={() => this.updateCoin(scaleIndex)}
        >
          <div className={"squeezetimetext"}>{item[0]}</div>
        </div>
      );
    });

    const symbol = this.props.coin.tsym === "USD" ? "$" : "฿";
    const indicatorColor =
      this.state.coin.percent_change_24h > 0 ? "red" : "green";

    return (
      <div
        className="coin-box coin"
        ref={this.coinRef}
        key={this.props.coinIndex}
      >
        {/* <div className="coin-background" /> */}
        <div className="coin-wrap">
          <div className={`coin-indicator ${indicatorColor}`} />
          <div className="squeeze-time-wrap">{squeezetimes}</div>
          <div className="box-body">
            <div className="coin-info-wrap">
              <div className="coin-info">
                <div className="coin-name">
                  <div className="coin-name-text">{this.props.coin.fsym}</div>
                  <div className="coin-name-pair-text">
                    {"/" + this.props.coin.tsym}
                  </div>
                </div>
                <div className="coin-price">
                  <div className="coin-price-text">
                    {symbol +
                      (this.state.coinprice === 0
                        ? this.state.coin.tsym === "BTC"
                          ? formatCurrencyLong(this.state.coin.price_btc)
                          : formatCurrency(this.state.coin.price)
                        : this.state.coin.tsym === "BTC"
                        ? formatCurrencyLong(this.state.coinprice)
                        : formatCurrency(this.state.coinprice))}
                  </div>
                  <div className="coin-label align-right">
                    {this.state.cointime !== ""
                      ? this.state.cointime
                      : "Last trade price"}
                  </div>
                </div>
              </div>
              <div className="coin-info">
                <div className="coin-price">
                  <div className={`coin-price-change-text ${indicatorColor}`}>
                    {(this.props.coin.percent_change_24h > 0 ? "+" : "") +
                      Number(this.props.coin.percent_change_24h).toFixed(2) +
                      "%"}
                  </div>
                  <div className="coin-label align-left">24 hour price</div>
                </div>
                <div className="coin-price">
                  <div className="coin-price-text">
                    {"$" + formatCurrency(this.props.coin.volume).split(".")[0]}
                  </div>
                  <div className="coin-label align-right">24 hour volume</div>
                </div>
              </div>
            </div>
            <div className="chart-block">
              <div className="chart-wrap">
                <Volume
                  coin={this.state.coin}
                  display={this.state.display}
                  length={this.state.length}
                  sample={this.state.sample}
                  histo={this.state.scales[this.state.current][4]}
                  className={this.state.settings ? "hide" : ""}
                />
                <BollingerBands
                  coin={this.state.coin}
                  display={this.state.display}
                  length={this.state.length}
                  batch={this.state.batch}
                  histo={this.state.scales[this.state.current][4]}
                  className={this.state.settings ? "hide" : ""}
                />
                <KeltnerChannel
                  coin={this.state.coin}
                  display={this.state.display}
                  length={this.state.length}
                  batch={this.state.batch}
                  histo={this.state.scales[this.state.current][4]}
                  className={this.state.settings ? "hide" : ""}
                />
                <Candlestick
                  coin={this.state.coin}
                  display={this.state.display}
                  length={this.state.length}
                  batch={this.state.batch}
                  histo={this.state.scales[this.state.current][4]}
                  overCandle={(price, time) => this.overCandle(price, time)}
                  className={this.state.settings ? "hide" : ""}
                  count={this.props.count}
                />
              </div>
              {/* <div className={(this.state.settings) ? '' : 'hide'}>
                  <div className={'text'}>{'rank: '+ this.props.coin.rank}</div>
                </div> */}
            </div>
            <div className="histogram-block">
              <div className="chart-wrap">
                <TTMSqueeze
                  coin={this.state.coin}
                  current={this.state.current}
                  display={this.state.display}
                  length={this.state.length}
                  batch={this.state.batch}
                  osc={this.state.scales[this.state.current][5]}
                  diff={this.state.scales[this.state.current][6]}
                  className={this.state.settings ? "" : ""}
                />
                {/* <RSI
                  coin={this.state.coin}
                  display={this.state.display}
                  length={this.state.length}
                  sample={this.state.sample}
                  histo={this.state.scales[this.state.current][4]}
                  className={this.state.settings ? "hide" : ""}
                /> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
