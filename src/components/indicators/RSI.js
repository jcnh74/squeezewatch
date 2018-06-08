import React, { Component } from 'react'
import styled from 'styled-components'

//import technicalindicators from 'technicalindicators'
//const _RSI = require('technicalindicators/dist/browser').RSI;
//import keltnerchannel from 'keltnerchannel'

//const rsi = technicalindicators.rsi


//const ema = keltnerchannel.ema

export default class RSI extends Component {

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
    const length = this.props.length

    const histo = this.props.histo.slice(this.props.histo.length - display,this.props.histo.length)
    const test = this.props.histo.slice(this.props.histo.length + 1 - (display + length),this.props.histo.length)

    const closes = test.map(candle => candle.close)
    // closes.map((num)=>{
    //     console.log(num)
    // })
    console.log(closes)

    // let largest = Math.max.apply(Math, histo.map(candle => candle.high))
    // let smallest = Math.min.apply(Math, histo.map(candle => candle.low))

    //const estimateMovingAverage = _RSI(closes, 14); // [3, 4]
    //console.log(estimateMovingAverage)

    
    // const range = largest - smallest

    // const candleWidth = 400/histo.length
    // const points = histo.map((candle,i) => {
    //     const candletop = ((largest - (candle.open < candle.close ? candle.close : candle.open))/range)*200
    //     return (candleWidth*i)+(candleWidth/4) + ', ' + candletop + ' '
    // })
    // console.log(points)

    const Line = styled.svg`
        opacity:0.3;
        position:absolute;
        bottom:0;
        left:0;
        width:100%;
        height:100%;
        padding: 0;
        box-sizing:border-box;
    `

    return (
        <Line viewBox="0 0 400 200" preserveAspectRatio="none">
            {/* <linearGradient id="SVGID_1_" gradientUnits="userSpaceOnUse" x1="208" y1="0" x2="208" y2="200">
                <stop  offset="0" style={{stopColor:'#00B4FF',stopOpacity:0.8}}/>
                <stop  offset="1" style={{stopColor:'#00B4FF',stopOpacity:0}}/>
            </linearGradient>
            <polyline transform="translate(0,12)" class="st0" points={ '0, 200 ' + points + ' 400, 200'}/> */}
        </Line>
      )
    }
}

