import React, { Component } from 'react'
import moment from 'moment'

import styled from 'styled-components';

export default class Candlestick extends Component {

  constructor(props) {

    super(props);
    this.state = {}

  }

  componentWillMount() {
  }

  componentDidMount() {
  }

  componentWillReceiveProps(nextProps){
  }
  
  render() {

    const display = this.props.display

    const histo = this.props.histo.slice(this.props.histo.length - display,this.props.histo.length)


    let largest = Math.max.apply(Math, histo.map(candle => candle.high))
    let smallest = Math.min.apply(Math, histo.map(candle => candle.low))

    //const closes = coin.histo.map(candle => candle.close)
    // const stdev = Object.values(closes.map((close,i) => stats.stdev(closes.slice(i,-20)))).slice(0,60)
    // const ma = sma(Object.values(closes), 20).slice(0,60)
    // const multKC = 1.5

    const range = largest - smallest

    //console.log(histo.length)

    const candleWidth = 400/histo.length
    const chart = histo.map((candle,i) => {

      const boxHeight = 200

      const date = moment.unix(candle.time)
      var formattedtime = date.format("MMM D H:mm")

      const color = candle.open > candle.close ? '#df4b7a' : '#48ea61'
      const wicktop = ((largest - candle.high)/range)*boxHeight
      const wickbottom = ((largest - candle.low)/range)*boxHeight
      const candletop = ((largest - (candle.open < candle.close ? candle.close : candle.open))/range)*boxHeight
      const candlebottom = ((largest - (candle.open > candle.close ? candle.close : candle.open))/range)*boxHeight
      const height =  candlebottom - candletop

      return (
        <g key={i}>
          <rect className="candle" style={{ fill:color,strokeMiterLimit:10}} x={(candleWidth*i)} y={candletop} width={candleWidth/2} height={height}/>
          <line className="wick" style={{ stroke:color,strokeMiterLimit:10}} x1={(candleWidth*i)+(candleWidth/4)} y1={wickbottom} x2={(candleWidth*i)+(candleWidth/4)} y2={wicktop}/>
          <rect className="time"  style={{ strokeMiterLimit:10, opacity:0}} 
                                x={(candleWidth*i)} 
                                y={0} 
                                width={candleWidth} 
                                height={boxHeight} 
                                onMouseEnter={() => this.props.overCandle((this.props.coin.tsym === 'BTC') ? Number(candle.close).toFixed(8) : Number(candle.close).toFixed(2), candle.time)}
                                onMouseLeave={() => this.props.overCandle( (this.props.coin.tsym === 'BTC') ? this.props.coin.price_btc : Number(this.props.coin.price).toFixed(2), '')} />
          <line className="timeline" style={{ strokeMiterLimit:10}} x1={(candleWidth*i)+(candleWidth/4)} y1={boxHeight} x2={(candleWidth*i)+(candleWidth/4)} y2={4}/>
          <text className="text" font-size="6" x={(i > histo.length/2) ? (candleWidth*i)-78 : (candleWidth*i)+6} y={boxHeight/5} width="auto">{formattedtime}</text>
          {/* "dddd, mmmm dS, yyyy, h:MM:ss" */}
        </g>
      )
    })

    const Chart = styled.svg`
      position:absolute;
      top:0;
      left:0;
      width:100%;
      height:100%;
      padding: 20px 0 0 0;
      box-sizing:border-box;
    `
    

    return (
        <Chart className={'candlesticks'} viewBox="0 0 400 200" preserveAspectRatio="none">{chart}</Chart>
      )
    }
}

