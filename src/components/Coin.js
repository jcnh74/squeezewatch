import React, { Component } from 'react'
import "typeface-exo"
import formatCurrency from'format-currency'

import styled, {keyframes} from 'styled-components';

import Candlestick from'./indicators/Candlestick'
//import HeikinAshiCandlestick from'./indicators/HeikinAshiCandlestick'
//import Volume from'./indicators/Volume'
import BollingerBands from './indicators/BollingerBands'
import KeltnerChannel from'./indicators/KeltnerChannel'

import TTMSqueeze from'./indicators/TTMSqueeze'


//import Line from'./indicators/Line'



export default class Coin extends Component {

  constructor(props) {

    super(props)
    this.state = {
      coin: this.props.coin,
      data: {
        histo: []
      },
      scales: this.props.scales,
      current: this.props.current,
      coinprice: 0,
      cointime: 0,
      fullwidth: this.props.fullwidth,
      settings: false,
      batch: 220,
      display: 100,
      length: 20
    }
  }

  componentWillMount() {
  }

  componentDidMount() {
    this.getCoin(this.state.current)
    //console.log(this.refs.coin)

    // AsyncStorage.setItem('COIN', JSON.stringify({}), () => {
    //   AsyncStorage.mergeItem('COIN', JSON.stringify({}), () => {
    //     AsyncStorage.getItem('COIN', (err, result) => {
    //       console.log(result);
    //     });
    //   });
    // });
  }

  overCandle(price, time){

    this.setState({
      coinprice:price,
      cointime:time
    })
    // this.state.coinprice = price
    // this.state.cointime = time

    // re-render
    this.forceUpdate();
  }

  async getCoin(index) {

    const _fsym = (this.state.coin.fsym === 'MIOTA') ? 'IOT' : this.state.coin.fsym
    const historyres = await fetch('https://min-api.cryptocompare.com/data/histo'+this.state.scales[index][1]+'?fsym='+_fsym+'&tsym='+this.state.coin.tsym+'&limit='+(this.state.batch-1)+'&aggregate='+this.state.scales[index][2]+'&e=CCCAGG')
    const histo = await historyres.json().then((data) => data)

    this.setState({
      data:{
        histo:histo.Data
      },
      coinprice: 0, 
      cointime: 0
    });

  }

  componentWillReceiveProps(nextProps){
    this.updateCoin(nextProps.current)
  }

  updateCoin(scaleIndex){
    this.setState({
      current: scaleIndex
    }, () => {
      this.getCoin(scaleIndex)
    })
  }

  toggleFullWidth(){
    this.setState({
      fullwidth: !this.state.fullwidth
    },() => console.log(this.state.fullwidth))

  }
  toggleCoinSettings(){
    this.setState({
      settings: !this.state.settings
    },() => console.log(this.state.settings))
  }

  setWatches(){

  }
  
  render() {

    const squeezetimes = this.state.scales.map((item, scaleIndex)=> {
      let watchstate = ''
      if(item[3] === 0){
        watchstate = ''
      }else if(item[3] === 1){
        watchstate = 'watch'
      }else if(item[3] === 2){
        watchstate = 'fired-long'
      }else{
        watchstate = ''
      }
      return (
        <div 
          key={scaleIndex} 
          className={(this.state.current === scaleIndex) ? 'squeezetimeselected ' : 'squeezetime ' + watchstate} 
          style={[{width:100/this.state.scales.length}]} 
          onClick={() => this.updateCoin(scaleIndex)}>
          <div className={'squeezetimetext'}>{item[0]}</div>
        </div>
      )
    })

    const symbol = (this.props.coin.tsym === 'USD') ? '$' : '฿' 
    //const order = (this.state.fullwidth) ? ((this.props.coinIndex % 3 === 0) ? this.props.coinIndex : ((this.props.coinIndex % 3 === 1) ?  this.props.coinIndex - 2 :  ((this.props.coinIndex % 3 === 2) ?  this.props.coinIndex - 3 : this.props.coinIndex)) )   : this.props.coinIndex
    //const order = (this.state.fullwidth) ? ((this.props.coinIndex === 1) ? -1 : this.props.coinIndex) : this.props.coinIndex

    const SqueezeTimeWrap = styled.div`
      display:flex;
      flex-direction: row;
      justify-content: space-between;
      flex-wrap: wrap;
      height:24px;
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
      top: -400px;
      bottom: -400px;
      left: -400px;
      right: -400px;
      position: absolute;
      background-size:1% 1%, 2% 2%;
      background-position:0 0, 0 0;
      animation: ${throughSpace} 20s linear;
      animation-play-state: paused;
      animation-iteration-count: infinite;
      transition: top 0.3s, bottom 0.3s;
      transform: perspective(300px) rotateX(80deg);
      background-image: ${props => props.color === 'red' ? 'linear-gradient(#48ea61 0.4px, transparent 0.6px), linear-gradient(90deg, #48ea61 0.4px, transparent 0.6px);' : 'linear-gradient(#df4b7a 0.4px, transparent 0.6px), linear-gradient(90deg, #df4b7a 0.4px, transparent 0.6px);'}
    `

    const CoinBox = styled.div`
      overflow:hidden;
      //flex: 1;
      flex: 1 0 30%;
      background-color: rgba(242,266,247,0.07);
      border-width:10px;
      border-color: #15151e;
      position: relative;
      margin:5px;
      min-height:600px;

      &:hover ${CoinBackground}
        {
          animation-play-state: running;
        }  
    `
        
    const CoinGradient = styled.div`
      top: 0px;
      bottom: 0px;
      left: 0px;
      right: 0px;
      position: absolute;
      background: linear-gradient(to bottom, rgba(21,21,30,1) 0%,rgba(21,21,30,1) 60%,rgba(21,21,30,0.3) 95%,rgba(21,21,30,0.3) 100%);
    `

    const CoinWrap = styled.div`
      display: flex;
      flex-direction: column;
      position: absolute;
      top:0;
      right:0;
      bottom:0;
      left:0;
      height:100%;
    `

    const BoxBody = styled.div`
      padding: 10px;
      flex:1;
      display: flex;
      flex-direction: column;
    `

    const Indicator = styled.div`
      height:10px;
      background-color: ${props => props.color === 'red' ? '#48ea61;' : '#df4b7a;'}
    `

    const CoinInfo = styled.div`
      width:100%;
      display:flex;
      flex-direction: row;
      height:100px;
    `
    const CoinInfoWrap = styled.div`
      width:100%;
      display:flex;
      flex-direction: column;
      height:100px;
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
      height:400px;
      padding: 10px 0;
      width:100%;
      flex:2;
      display:flex;
      flex-direction: column;
      position: relative;
    `

    const ChartWrap = styled.div`
      position:relative;
      width:100%;
      height:100%;
    `

    const HistogramBlock = styled.div`
      height:200px;
      width:100%;
      display:flex;
      flex-direction: column;
      width:100%;
      flex:1;
      display:flex;
      flex-direction: column;
      position: relative;
    `

    const FullWidth = styled.div`
      opacity:0 !important;
      transition: opacity 0.15s;
      position:absolute;
      top:20px;
      right:0px;
      width:20px;
      height:20px;
    `

    const Settings = styled.div`
      opacity:0 !important;
      transition: opacity 0.15s;
      position:absolute;
      bottom:10px;
      right:10px;
    `


    return (
        <CoinBox  className={'coin'} ref={'coin'} key={this.props.coinIndex}>
          <CoinBackground className={'coin-background'}  color={(this.state.coin.percent_change_24h > 0) ? 'red' : 'green'} />
          <CoinGradient />
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
                    <CointNamePairText>{'/'+this.props.coin.tsym}</CointNamePairText>
                  </CoinName>
                  <CoinPrice>
                    <CoinPriceText>{symbol+((this.state.coinprice === 0) ? (this.state.coin.tsym === 'BTC') ? this.state.coin.price_btc : formatCurrency(this.state.coin.price) : (this.state.coin.tsym === 'BTC') ? this.state.coinprice : formatCurrency(this.state.coinprice))}</CoinPriceText>
                    <CoinLabel align={'right'}>Last trade price</CoinLabel>
                  </CoinPrice>
                </CoinInfo>
                <CoinInfo>
                  <CoinPrice>
                    <CoinPriceChangeText color={this.state.coin.percent_change_24h > 0 ? 'red' : 'green'}>{ ((this.props.coin.percent_change_24h > 0) ? '+' : '') + Number(this.props.coin.percent_change_24h).toFixed(2)+'%'}</CoinPriceChangeText>
                    <CoinLabel align={'left'}>24 hour price</CoinLabel>
                  </CoinPrice>
                  <CoinPrice>
                    <CoinPriceText>{'$'+formatCurrency(this.props.coin.volume).split('.')[0]}</CoinPriceText>
                    <CoinLabel align={'right'}>24 hour volume</CoinLabel>
                  </CoinPrice>
                </CoinInfo>
              </CoinInfoWrap>
              <ChartBlock>
                <ChartWrap>
                  <BollingerBands 
                    coin={this.state.coin} 
                    display={this.state.display}
                    length={this.state.length}
                    batch={this.state.batch}
                    histo={this.state.data.histo} 
                    className={(this.state.settings) ? 'hide' : ''} />
                  <KeltnerChannel 
                    coin={this.state.coin} 
                    display={this.state.display}
                    length={this.state.length}
                    batch={this.state.batch}
                    histo={this.state.data.histo} 
                    className={(this.state.settings) ? 'hide' : ''} />
                  <Candlestick 
                    coin={this.state.coin} 
                    display={this.state.display}
                    length={this.state.length}
                    batch={this.state.batch}
                    histo={this.state.data.histo} 
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
                      display={this.state.display}
                      length={this.state.length}
                      batch={this.state.batch}
                      histo={this.state.data.histo} 
                      overCandle={(price, time) => this.overCandle(price, time)}
                      className={(this.state.settings) ? 'hide' : ''} />
                  {/* <Volume 
                      coin={this.state.coin} 
                      display={this.state.display}
                      length={this.state.length}
                      sample={this.state.sample}
                      histo={this.state.data.histo} 
                      overCandle={(price, time) => this.overCandle(price, time)}
                      className={(this.state.settings) ? 'hide' : ''} /> */}
                </ChartWrap>
              </HistogramBlock>
            </BoxBody>
          </CoinWrap>
          <FullWidth  onClick={() => this.toggleFullWidth()}>
              {(this.state.fullwidth) ? (
                <svg fill="#FFFFFF" width="20px" height="20px" viewBox="0 0 20 20">
                  <g>
                    <path d="M6.7,12.4H0.9c-0.4,0-0.6,0.2-0.8,0.5C0,13.3,0,13.6,0.3,13.9l1.9,1.9L0,17.9V20h2.1l2.2-2.2l1.9,1.9C6.4,20,6.7,20,7,19.9
                      c0.3-0.1,0.5-0.4,0.5-0.8v-5.8c0-0.2-0.1-0.4-0.2-0.6C7.2,12.5,7,12.4,6.7,12.4z"/>
                    <path d="M12.4,13.3v5.8c0,0.4,0.2,0.6,0.5,0.8c0.3,0.1,0.6,0.1,0.9-0.2l1.9-1.9l2.2,2.2H20v-2.1l-2.2-2.2l1.9-1.9
                      c0.3-0.3,0.3-0.6,0.2-0.9c-0.1-0.3-0.4-0.5-0.8-0.5h-5.8c-0.2,0-0.4,0.1-0.6,0.2C12.5,12.8,12.4,13,12.4,13.3z"/>
                    <path d="M7.6,6.7V0.9c0-0.4-0.2-0.6-0.5-0.8C6.7,0,6.4,0,6.1,0.3L4.3,2.2L2.1,0H0v2.1l2.2,2.2L0.3,6.1C0,6.4,0,6.7,0.1,7
                      c0.1,0.3,0.4,0.5,0.8,0.5h5.8c0.2,0,0.4-0.1,0.6-0.2C7.5,7.2,7.6,7,7.6,6.7z"/>
                    <path d="M13.3,7.6h5.8c0.4,0,0.6-0.2,0.8-0.5C20,6.7,20,6.4,19.7,6.1l-1.9-1.9L20,2.1V0h-2.1l-2.2,2.2l-1.9-1.9
                      C13.6,0,13.3,0,13,0.1c-0.3,0.1-0.5,0.4-0.5,0.8v5.8c0,0.2,0.1,0.4,0.2,0.6C12.9,7.5,13,7.6,13.3,7.6z"/>
                  </g>
                </svg>
              ) : (
                <svg fill="#FFFFFF" width="20px" height="20px" viewBox="0 0 20 20">
                  <g>
                    <path d="M18.6,7.3c0.2,0.2,0.4,0.2,0.6,0.2c0.1,0,0.2,0,0.3-0.1C19.8,7.3,20,7,20,6.7V0.8c0-0.2-0.1-0.4-0.2-0.6
                      C19.6,0.1,19.4,0,19.2,0h-5.8c-0.4,0-0.6,0.2-0.8,0.5c-0.1,0.3-0.1,0.6,0.2,0.9l1.9,1.9L10,7.9L5.4,3.3l1.9-1.9
                      c0.3-0.3,0.3-0.6,0.2-0.9C7.3,0.2,7,0,6.7,0H0.8C0.6,0,0.4,0.1,0.2,0.2C0.1,0.4,0,0.6,0,0.8v5.8C0,7,0.2,7.3,0.5,7.4
                      c0.1,0,0.2,0.1,0.3,0.1c0.2,0,0.4-0.1,0.6-0.2l1.9-1.9L7.9,10l-4.6,4.6l-1.9-1.9c-0.3-0.3-0.6-0.3-0.9-0.2C0.2,12.7,0,13,0,13.3
                      v5.8c0,0.2,0.1,0.4,0.2,0.6C0.4,19.9,0.6,20,0.8,20h5.8c0.4,0,0.6-0.2,0.8-0.5c0.1-0.3,0.1-0.6-0.2-0.9l-1.9-1.9l4.6-4.6l4.6,4.6
                      l-1.9,1.9c-0.3,0.3-0.3,0.6-0.2,0.9c0.1,0.3,0.4,0.5,0.8,0.5h5.8c0.2,0,0.4-0.1,0.6-0.2c0.2-0.2,0.2-0.4,0.2-0.6v-5.8
                      c0-0.4-0.2-0.6-0.5-0.8c-0.4-0.1-0.7-0.1-0.9,0.2l-1.9,1.9L12.1,10l4.6-4.6L18.6,7.3z"/>
                  </g>
                </svg>
              )}
          </FullWidth>
          <Settings onClick={() => this.toggleCoinSettings()}>
            <svg width="20px" height="20px" viewBox="0 0 20 20">
              <path fill="#FFFFFF" d="M20,11.9V8.2l-2.3-0.4c-0.2-0.6-0.4-1.2-0.7-1.7l1.3-1.8l-2.6-2.6l-1.9,1.3c-0.5-0.3-1.1-0.5-1.7-0.7L11.9,0H8.2L7.8,2.3
                C7.2,2.4,6.6,2.7,6.1,3L4.3,1.7L1.6,4.3L3,6.1C2.7,6.6,2.4,7.2,2.3,7.8L0,8.2v3.7l2.3,0.4c0.2,0.6,0.4,1.2,0.7,1.7l-1.3,1.9l2.6,2.6
                l1.9-1.3c0.5,0.3,1.1,0.5,1.8,0.7L8.2,20h3.7l0.4-2.3c0.6-0.2,1.2-0.4,1.7-0.7l1.9,1.3l2.6-2.6l-1.3-1.9c0.3-0.5,0.5-1.1,0.7-1.7
                L20,11.9z M10,13.9c-2.1,0-3.8-1.7-3.8-3.8S7.9,6.2,10,6.2s3.8,1.7,3.8,3.8S12.2,13.9,10,13.9z"/>
            </svg> 
          </Settings>
        </CoinBox>
      )
    }
}

