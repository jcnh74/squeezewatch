import React, { Component } from 'react'
import styled from 'styled-components';

import keltnerchannel from 'keltnerchannel'
const kc = keltnerchannel.kc


export default class KeltnerChannel extends Component {

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


    const keltner = kc(test, length, 1, false)

    //console.log(keltner)
    
    const range = largest - smallest

    const candleWidth = 400/histo.length
    const boxWidth = 400
    const boxHeight = 200


    // const mid = keltner.mid.map((kelt,i) => {
    //     const keltpoint = ((largest - kelt)/range)*200
    //     return ' M ' + (candleWidth*i)+(candleWidth/4) + ', ' + keltpoint + ' '
    // })
    let upperPoints = '';
    keltner.upper.forEach((kelt,i) => {
        const keltpoint = ((largest - kelt)/range)*boxHeight
        upperPoints =  upperPoints + ((i === 0) ? ' M' : ' L') + (candleWidth* i) + ' ' + keltpoint + ' '

        //upperPoints =  upperPoints + ((i === 0) ? ' M ' : ' L ') + (candleWidth* (i - 1)) + ', ' + keltpoint + ' '
    })
    let lowerPoints = '';
    keltner.lower.reverse().forEach((kelt,i) => {
        const keltpoint = ((largest - kelt)/range)*boxHeight
        lowerPoints = lowerPoints + ' L' + (boxWidth - (candleWidth*(i + 1))) + ' ' + keltpoint + ' '

        //lowerPoints = lowerPoints + ' L ' + ((boxWidth - (candleWidth*i)) - candleWidth*4) + ', ' + keltpoint + ' '
    })

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

    const d =  (keltner.upper.length) ? upperPoints  + lowerPoints + ' Z' : ''


    return (
        <Chart viewBox="0 0 400 200" preserveAspectRatio="none">
            <path style={{ stroke:'rgba(41,226,167,0.3)',fill:'rgba(41,226,226,0.1)',strokeMiterLimit:10}} d={d}/>
        </Chart>
      )
    }
}

