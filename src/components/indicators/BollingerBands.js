import React, { Component } from 'react'
import styled from 'styled-components';

import keltnerchannel from 'keltnerchannel'
const boll = keltnerchannel.boll


export default class BollingerBands extends Component {

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


    let largest = Math.max.apply(Math, histo.map(candle => candle.high))
    let smallest = Math.min.apply(Math, histo.map(candle => candle.low))


    const closes = test.map(candle => candle.close)

    const bollinger = boll(closes, length, 2, true); // { upper: [], mid: [], lower: []}
    
    const range = largest - smallest

    const candleWidth = 400/histo.length
    const boxWidth = 400
    const boxHeight = 200

    let upperPoints = '';
    let lowerPoints = '';
    bollinger.upper.forEach((boll,i) => {        
        const bollpoint = ((largest - boll)/range)*boxHeight
          upperPoints =  upperPoints + ((i === 0) ? ' M -' + candleWidth/4 + 0.5 + ' ' + bollpoint + ' ' : ' L') + 
          (candleWidth * i + candleWidth/4) + ' ' + bollpoint + ' ' + 
          ((i === bollinger.upper.length -1 ) ? ' L ' + (candleWidth * (i+1) + candleWidth/4) + 0.5 +' ' + bollpoint : '')
    })
    
    bollinger.lower.reverse().forEach((boll,i) => {
        const bollpoint = ((largest - boll)/range)*boxHeight
          lowerPoints = lowerPoints + ((i === 0) ? ' L ' + (boxWidth - (candleWidth*(i) - candleWidth/4)) +  0.5 + ' ' + bollpoint + ' ' : ' L ') + 
          (boxWidth - (candleWidth*(i + 1) - candleWidth/4)) + ' ' + bollpoint + ' ' + 
          ((i === bollinger.upper.length -1 ) ? ' L ' + (boxWidth - (candleWidth*(i + 1) + candleWidth/4)) +  0.5 + ' ' + bollpoint : '')
    })
    const d =  (bollinger.upper.length) ? upperPoints  + lowerPoints + ' Z' : ''

    const Chart = styled.svg`
      position:absolute;
      top:0;
      left:0;
      width:100%;
      height:100%;
      padding: 20px 0 0 0;
      box-sizing:border-box;
      overflow: visible;
    `

    return (
        <Chart viewBox="0 0 400 200" preserveAspectRatio="none">
            <path style={{ stroke:'rgba(41,171,226,0.3)',fill:'rgba(41,171,226,0.1)',strokeMiterLimit:10}} d={d}/>
        </Chart>
      )
    }
}

