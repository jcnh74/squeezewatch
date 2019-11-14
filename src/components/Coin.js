import React, { Component } from 'react'
import "typeface-exo"
import formatCurrency from 'format-currency'
import keltnerchannel from 'keltnerchannel'

import styled, { keyframes } from 'styled-components';

import Candlestick from './indicators/Candlestick'
//import HeikinAshiCandlestick from'./indicators/HeikinAshiCandlestick'
import Volume from './indicators/Volume'
import BollingerBands from './indicators/BollingerBands'
import KeltnerChannel from './indicators/KeltnerChannel'
import TTMSqueeze from './indicators/TTMSqueeze'
//import Line from'./indicators/Line'
//import RSI from'./indicators/RSI'

const kc = keltnerchannel.kc
const sma = keltnerchannel.sma
//const ema = keltnerchannel.ema
const boll = keltnerchannel.boll

const lightblue = "#00ffff"
const darkpuple = "#cc00cc"
const darkblue = "#009b9b"
const lightpurple = "#ff9bff"

const ASYNC_DELAY = 1000



export default class Coin extends Component {

  constructor(props) {

    super(props)
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
        ['1H', 'hour', 1, 0, [], [], []],
        ['2H', 'hour', 2, 0, [], [], []],
        ['3H', 'hour', 3, 0, [], [], []],
        ['4H', 'hour', 4, 0, [], [], []],
        ['6H', 'hour', 6, 0, [], [], []],
        ['8H', 'hour', 8, 0, [], [], []],
        ['12H', 'hour', 12, 0, [], [], []],
        ['1D', 'day', 1, 0, [], [], []],
        ['1W', 'day', 7, 0, [], [], []]
      ],
      current: this.props.current,
      coinprice: 0,
      cointime: '',
      fullwidth: this.props.fullwidth,
      settings: false,
      batch: 220,
      display: 100,
      length: 20
    }
  }

  // setState(state) {
  //   return new Promise((resolve) => {
  //     this.setState(state, resolve)
  //   });
  // }

  componentWillMount() {
  }

  componentDidMount() {
    //this.setSqueezeAlert(scaleIndex)
    const _this = this
    this.state.scales.map((item, scaleIndex) => {
      setTimeout(function () {
        _this.getCoin(scaleIndex)
      }, ASYNC_DELAY * scaleIndex)

      return ''

    })
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
      cointime: time
    })
    // this.state.coinprice = price
    // this.state.cointime = time

    // re-render
    //this.forceUpdate();
  }

  setSqueezeAlert(index, data) {
    //console.log(data)
    //this.state.scales[time][3] = type

    //this.getCoin(index)

    let scales = this.state.scales
    scales[index][4] = data

    this.setState({
      scales: scales
    })
    if (scales[index][4].length === this.state.batch) {


      const test = scales[index][4].slice(scales[index][4].length - (this.state.display + this.state.length), scales[index][4].length)
      const histo = scales[index][4].slice(this.state.length, test.length)

      const closes = test.map(candle => candle.close)

      const keltner = kc(test, this.state.length, 1, false)
      const simpleMovingAverage = sma(closes, this.state.length); // [3, 4]
      const bollinger = boll(closes, this.state.length, 2, true); // { upper: [], mid: [], lower: []}

      const linearRegression = (y, x) => {

        let lr = {}
        let n = y.length
        let sum_x = 0
        let sum_y = 0
        let sum_xy = 0
        let sum_xx = 0

        for (let i = 0; i < y.length; i++) {
          sum_x += x[i]
          sum_y += y[i]
          sum_xy += (x[i] * y[i])
          sum_xx += (x[i] * x[i])
        }

        lr['slope'] = (n * sum_xy - sum_x * sum_y) / (n * sum_xx - sum_x * sum_x)

        return lr
      }


      const e1 = histo.map((can, i) => {
        const from = this.state.batch - (this.state.display + this.state.length) + i
        const to = this.state.batch - this.state.display + i
        const highest = Math.max.apply(null, scales[index][4].slice(from, to).map(candle => candle.high))
        const lowest = Math.min.apply(null, scales[index][4].slice(from, to).map(candle => candle.low))
        const output = (highest + lowest + simpleMovingAverage[i]) / 3

        return output
      })


      const input_x = Array.from(Array(this.state.length), (_, x) => (this.state.length - 1 - x) * (((this.state.length - 1 - x) === 0) ? 1 : -1))

      // histo is only the display data where this.props. histo is the batch data
      const osc = histo.map((can, i) => {
        const input_y = scales[index][4]
          .slice(this.state.batch - (this.state.display + this.state.length) + i, this.state.batch - this.state.display + i)
          .map((histo, i) => histo.close - (e1[i] / 2))

        const lg = linearRegression(input_y, input_x)
        return lg.slope

      })


      //let largest = Math.max.apply(null, osc.map(o => o < 0 ? o * -1 : o))
      const bband = bollinger.upper.slice(bollinger.upper.length - this.state.display, bollinger.upper.length).map((upper, i) => {
        return upper - bollinger.lower[i]
      })
      const kelt = keltner.upper.slice(keltner.upper.length - this.state.display, keltner.upper.length).map((upper, i) => {
        return upper - keltner.lower[i]
      })

      const diff = histo.map((hist, i) => {
        return bband[i] > kelt[i]
      })

      const osc_color = osc.map((o, i) => {
        return osc[i - 1] < o ? o >= 0 ? lightblue : darkpuple : o >= 0 ? darkblue : lightpurple
      })

      scales[index][5] = osc
      scales[index][6] = diff
      this.setState({
        scales: scales
      })

      let inSqueeze = false
      let lastSqueeze = null

      histo.map((candle, i) => {
        const hasSqueeze = diff[i] ? false : true

        if (hasSqueeze) {
          inSqueeze = true
          lastSqueeze = i
        }
        return ''
      })

      if (inSqueeze) {

        if (lastSqueeze + 1 === histo.length) {
          scales[index][3] = 1
        } else {
          let trend = true
          let current_color = osc_color[lastSqueeze + 1]
          histo.slice(lastSqueeze + 1, histo.length).map((candle, i) => {
            if (trend) {
              trend = (current_color === osc_color[i + lastSqueeze + 1]) ? true : false
            }
            return ''
          })
          if (trend) {
            scales[index][3] = (current_color === lightblue || current_color === darkpuple) ? 3 : 2
          }
        }
        this.setState({
          scales: scales
        })
      }
    }
  }

  async getCoin(index) {

    let _fsym = (this.state.coin.fsym === 'MIOTA') ? 'IOT' : this.state.coin.fsym

    if (this.state.scales[index][0] === '12H') {

  
      const url1 = 'https://min-api.cryptocompare.com/data/histo' + this.state.scales[index][1] + '?fsym=' + _fsym + '&tsym=' + this.state.coin.tsym + '&limit=' + (this.state.batch - 1) + '&aggregate=' + this.state.scales[index][2] + '&e=CCCAGG'
      
  
      // date.setDate(date.getDate() - 1);
      
      // date ;
  // console.log(url1);
      var data = await Promise.all([
        fetch(url1).then((response) => response.json()),// parse each response as json
      ]);

      const url2 = 'https://min-api.cryptocompare.com/data/histo' + this.state.scales[index][1] + '?fsym=' + _fsym + '&tsym=' + this.state.coin.tsym + '&limit=' + (this.state.batch - 1) + '&aggregate=' + this.state.scales[index][2] + '&e=CCCAGG&toTs=' + data[0].TimeFrom
      var data2 = await Promise.all([
        fetch(url2).then((response) => response.json()),// parse each response as json
      ]);

      const _data = data2[0].Data.concat(data[0].Data)
      this.setSqueezeAlert(index, _data.slice(_data.length - 220, _data.length))

    }else{
      const historyres = await fetch('https://min-api.cryptocompare.com/data/histo' + this.state.scales[index][1] + '?fsym=' + _fsym + '&tsym=' + this.state.coin.tsym + '&limit=' + (this.state.batch - 1) + '&aggregate=' + this.state.scales[index][2] + '&e=CCCAGG')
      await historyres.json().then((data) => {
  
        //console.log('getCoin', data)
        this.setSqueezeAlert(index, data.Data)
      })
    }




    //this.state.scales[index][4] = histo.Data
    // this.setStateAsync({
    //   coinprice: 0, 
    //   cointime: 0,
    // })

  }

  componentWillReceiveProps(nextProps) {
    //this.updateCoin(nextProps.current)
  }

  updateCoin(scaleIndex) {
    this.setState({
      current: scaleIndex
    })
    this.getCoin(scaleIndex)
  }




  render() {

    const squeezetimes = this.state.scales.map((item, scaleIndex) => {

      //console.log(this.state.current, scaleIndex)
      let watchstate = ''
      if (item[3] === 0) {
        watchstate = ''
      } else if (item[3] === 1) {
        watchstate = 'watch'
      } else if (item[3] === 2) {
        watchstate = 'fired-short'
      } else if (item[3] === 3) {
        watchstate = 'fired-long'
      } else {
        watchstate = ''
      }
      return (
        <div
          key={scaleIndex}
          className={((this.state.current === scaleIndex) ? 'squeezetimeselected ' : 'squeezetime ') + watchstate}
          onClick={() => this.updateCoin(scaleIndex)}>
          <div className={'squeezetimetext'}>{item[0]}</div>
        </div>
      )
    })

    const symbol = (this.props.coin.tsym === 'USD') ? '$' : '฿'
    //const order = (this.state.fullwidth) ? ((this.props.coinIndex % 3 === 0) ? this.props.coinIndex : ((this.props.coinIndex % 3 === 1) ?  this.props.coinIndex - 2 :  ((this.props.coinIndex % 3 === 2) ?  this.props.coinIndex - 3 : this.props.coinIndex)) )   : this.props.coinIndex
    //const order = (this.state.fullwidth) ? ((this.props.coinIndex === 1) ? -1 : this.props.coinIndex) : this.props.coinIndex


    //#region STYLES

    const SqueezeTimeWrap = styled.div`
      display:flex;
      flex-direction: row;
      justify-content: space-between;
      flex-wrap: wrap;
      height:28px;
      text-align:center;
      background-color:rgba(0,0,0,0.65);
    `

    const throughSpace = keyframes`
      0%{
        transform: perspective(300px) rotateX(80deg) translateY(5.8%);
      }
      100%{
        transform: perspective(300px) rotateX(80deg) translateY(0%);
      }
    `
    const CoinBackground = styled.div`
      // top: -400px;
      // bottom: -400px;
      // left: -400px;
      // right: -400px;
      position: absolute;
      top: 0px;
      bottom: 0px;
      left: 0px;
      right: 0px;
      // background-size:1% 1%, 2% 2%;
      // background-position:0 0, 0 0;
      // animation: ${throughSpace} 20s linear;
      // animation-play-state: paused;
      // animation-iteration-count: infinite;
      // transition: top 0.3s, bottom 0.3s;
      // transform: perspective(300px) rotateX(80deg);
      background-image: url(https://i.pinimg.com/originals/55/a2/de/55a2de454d44dc13bbfb17113465118d.gif);
      background-size:cover;
      background-position:center;
      opacity:0;
      // background-image: ${props => props.color === 'red' ? 'linear-gradient(#48ea61 0.4px, transparent 0.6px), linear-gradient(90deg, #48ea61 0.4px, transparent 0.6px);' : 'linear-gradient(#df4b7a 0.4px, transparent 0.6px), linear-gradient(90deg, #df4b7a 0.4px, transparent 0.6px);'}
    `

    const CoinBox = styled.div`
     
      //background-color: rgba(242,266,247,0.07);
      border-width:10px;
      border-color: #15151e;
      position: relative;
      margin:5px;
      overflow:hidden;

      //background-color: rgba(242,266,247,0.07);
      background-color: rgba(242,266,247,0.015);
      height:auto;
      flex: 1 0 30%;
      align-self:flex-start;
      min-height: 180px;

      @media (max-width: 1200px) {
        flex: 1 1 40%;
        height:auto;
      }
  


      &:hover ${CoinBackground}
        {
          // animation-play-state: running;
          opacity:1;
        }  
    `

    // const CoinGradient = styled.div`
    //   top: 0px;
    //   bottom: 0px;
    //   left: 0px;
    //   right: 0px;
    //   position: absolute;
      
    //   //background: linear-gradient(to bottom, rgba(21,21,30,1) 0%,rgba(21,21,30,1) 60%,rgba(21,21,30,0.3) 95%,rgba(21,21,30,0.3) 100%);
    // `

    const CoinWrap = styled.div`
      display: flex;
      flex-direction: column;

      height:100%;
    `

    const BoxBody = styled.div`
      padding: 0px;
      flex:1;
      display: flex;
      flex-direction: column;
      overflow:hidden;
    `

    const Indicator = styled.div`
      height:10px;
      background-color: ${props => props.color === 'red' ? '#48ea61;' : '#df4b7a;'}
    `

    const CoinInfo = styled.div`
      width:100%;
      display:flex;
      flex-direction: row;
      height:120px;
    `
    const CoinInfoWrap = styled.div`
      padding:10px;
      box-sizing:border-box;
      position:relative;
      z-index:9999;
      width:100%;
      display:flex;
      flex-direction: column;
      height:130px;
      background: linear-gradient(to bottom, rgba(0,0,0,0.65) 0%,rgba(0,0,0,0) 100%);
    `

    const CoinName = styled.div`
      display:flex;
      flex-direction: row;
      width: 50%;
    `

    const CoinNameText = styled.div`
      font-size: 3.2em;
      font-weight: 700;
      width: auto;
      letter-spacing: 3px;
      display: inline-block;
      font-family: 'Exo 2', Arial, san-serif;
    `

    const CointNamePairText = styled.div`
      padding-top: 32px;
      font-size: 1em;
      width: auto;
      display: inline-block;
      font-family: 'Exo 2', Arial, san-serif;
    `

    const CoinPrice = styled.div`
      width: 50%;
    `

    const CoinPriceText = styled.div`
      padding-top: 5px;
      font-size: 1.8em;
      font-family: Exo 2;
      font-weight: 700;
      text-align: right;
    `

    const CoinLabel = styled.div`
      font-size: 0.7em;
      font-family: 'Exo 2', Arial, san-serif;
      text-align: ${props => props.align}
    `
    const CoinPriceChangeText = styled.div`
      padding-top: 5px;
      font-size: 1.8em;
      font-family: 'Exo 2', Arial, san-serif;
      color:${props => props.color === 'red' ? '#48ea61;' : '#df4b7a;'}
    `

    const ChartBlock = styled.div`
      height:300px;
      padding: 10px 0;
      width:100%;
      flex:2;
      display:flex;
      flex-direction: column;
      position: relative;
      //display:none;
    `

    const ChartWrap = styled.div`
      position:relative;
      width:100%;
      height:100%;
    `

    const HistogramBlock = styled.div`
      height:150px;
      width:100%;
      display:flex;
      flex-direction: column;
      width:100%;
      flex:1;
      display:flex;
      flex-direction: column;
      position: relative;
      //display:none;
    `

    //#endregion
    return (
      <CoinBox className={'coin full'} ref={'coin'} key={this.props.coinIndex}>
        {/* <CoinBackground className={'coin-background'}  color={(this.state.coin.percent_change_24h > 0) ? 'red' : 'green'} /> */}
        {/* <CoinGradient /> */}
        <CoinWrap>
          <Indicator color={(this.state.coin.percent_change_24h > 0) ? 'red' : 'green'} />
          <SqueezeTimeWrap>
            {squeezetimes}
          </SqueezeTimeWrap>
          <BoxBody>
            <CoinInfoWrap>
              <CoinInfo>
                <CoinName>
                  <CoinNameText>{this.props.coin.fsym}</CoinNameText>
                  <CointNamePairText>{'/' + this.props.coin.tsym}</CointNamePairText>
                </CoinName>
                <CoinPrice>
                  <CoinPriceText>{symbol + ((this.state.coinprice === 0) ? (this.state.coin.tsym === 'BTC') ? this.state.coin.price_btc : formatCurrency(this.state.coin.price) : (this.state.coin.tsym === 'BTC') ? this.state.coinprice : formatCurrency(this.state.coinprice))}</CoinPriceText>
                  <CoinLabel align={'right'}>{(this.state.cointime !== '' ? this.state.cointime : 'Last trade price')}</CoinLabel>
                </CoinPrice>
              </CoinInfo>
              <CoinInfo>
                <CoinPrice>
                  <CoinPriceChangeText color={this.state.coin.percent_change_24h > 0 ? 'red' : 'green'}>{((this.props.coin.percent_change_24h > 0) ? '+' : '') + Number(this.props.coin.percent_change_24h).toFixed(2) + '%'}</CoinPriceChangeText>
                  <CoinLabel align={'left'}>24 hour price</CoinLabel>
                </CoinPrice>
                <CoinPrice>
                  <CoinPriceText>{'$' + formatCurrency(this.props.coin.volume).split('.')[0]}</CoinPriceText>
                  <CoinLabel align={'right'}>24 hour volume</CoinLabel>
                </CoinPrice>
              </CoinInfo>
            </CoinInfoWrap>
            <ChartBlock>
              <ChartWrap>
                <Volume
                  coin={this.state.coin}
                  display={this.state.display}
                  length={this.state.length}
                  sample={this.state.sample}
                  histo={this.state.scales[this.state.current][4]}
                  className={(this.state.settings) ? 'hide' : ''} />
                <BollingerBands
                  coin={this.state.coin}
                  display={this.state.display}
                  length={this.state.length}
                  batch={this.state.batch}
                  histo={this.state.scales[this.state.current][4]}
                  className={(this.state.settings) ? 'hide' : ''} />
                <KeltnerChannel
                  coin={this.state.coin}
                  display={this.state.display}
                  length={this.state.length}
                  batch={this.state.batch}
                  histo={this.state.scales[this.state.current][4]}
                  className={(this.state.settings) ? 'hide' : ''} />
                <Candlestick
                  coin={this.state.coin}
                  display={this.state.display}
                  length={this.state.length}
                  batch={this.state.batch}
                  histo={this.state.scales[this.state.current][4]}
                  overCandle={(price, time) => this.overCandle(price, time)}
                  className={(this.state.settings) ? 'hide' : ''}
                  count={this.props.count} />
              </ChartWrap>
              {/* <div className={(this.state.settings) ? '' : 'hide'}>
                  <div className={'text'}>{'rank: '+ this.props.coin.rank}</div>
                </div> */}
            </ChartBlock>
            <HistogramBlock>
              <ChartWrap>
                <TTMSqueeze
                  coin={this.state.coin}
                  current={this.state.current}
                  display={this.state.display}
                  length={this.state.length}
                  batch={this.state.batch}
                  osc={this.state.scales[this.state.current][5]}
                  diff={this.state.scales[this.state.current][6]}
                  className={(this.state.settings) ? 'hide' : ''} />
                {/* <RSI 
                    coin={this.state.coin} 
                    display={this.state.display}
                    length={this.state.length}
                    sample={this.state.sample}
                    histo={this.state.scales[this.state.current][4]} 
                    className={(this.state.settings) ? 'hide' : ''} /> */}
              </ChartWrap>
            </HistogramBlock>
          </BoxBody>
        </CoinWrap>
      </CoinBox>
    )
  }
}

