import React, { Component } from 'react'
import styled from 'styled-components';
import keltnerchannel from 'keltnerchannel'
const kc = keltnerchannel.kc
const sma = keltnerchannel.sma
const ema = keltnerchannel.ema
const boll = keltnerchannel.boll
const boxwidth = 400
const boxheight = 100


export default class TTMSqueeze extends Component {

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
    const batch = this.props.batch
    //console.log(this.props.histo.length - 1, this.props.limit)

    const candleWidth = boxwidth/display
    let chart = []
    
    if(this.props.histo.length === batch){
        //console.log(this.props.histo.length - display,this.props.histo.length)
        const test = this.props.histo.slice(this.props.histo.length - (display + length), this.props.histo.length)
        const histo = this.props.histo.slice(length, test.length)

        const closes = test.map(candle => candle.close)

        const keltner = kc(test, length, 1, false)
        const simpleMovingAverage = sma(closes, length); // [3, 4]
        //const exponentialMovingAverage = ema(closes, length); // [4, 4]
        const bollinger = boll(closes, length, 2, true); // { upper: [], mid: [], lower: []}
        


        const linearRegression = (y,x) => {
            
            var lr = {}
            var n = y.length
            var sum_x = 0
            var sum_y = 0
            var sum_xy = 0
            var sum_xx = 0
            var sum_yy = 0;

            for (var i = 0; i < y.length; i++) {
                sum_x += x[i]
                sum_y += y[i]
                sum_xy += (x[i]*y[i])
                sum_xx += (x[i]*x[i])
                sum_yy += (y[i]*y[i]);
            } 

            //( sum(y) * sum(x^2) - sum(x) * sum(x*y) ) / (n*sum(x^2)-sum(x)^2)
            lr['lr'] = ( sum_y * sum_xx - sum_x * sum_xy ) / (n * sum_xx - (sum_x * sum_x))
            lr['slope'] = (n * sum_xy - sum_x * sum_y) / (n*sum_xx - sum_x * sum_x)
            lr['intercept'] = (sum_y - lr.slope * sum_x) / n
            lr['r2'] = Math.pow((n*sum_xy - sum_x*sum_y)/Math.sqrt((n*sum_xx-sum_x*sum_x)*(n*sum_yy-sum_y*sum_y)),2);

            return lr
        }

        //const yCloses = this.props.histo.map(candle => candle.close)
        //const _sma = sma(closes, length)

        //console.log(simpleMovingAverage)
        
        const e1 = histo.map((can,i) => {
            const from = batch - (display + length) + i
            const to = batch - display + i
            const highest = Math.max.apply(null, this.props.histo.slice(from, to).map(candle => candle.high))
            const lowest = Math.min.apply(null, this.props.histo.slice(from, to).map(candle => candle.low))
            //const _sma = sma(this.props.histo.slice(batch - (display + display + length - 1) + i, batch - display + i).map(candle => candle.close), length)
            const output = (highest + lowest + simpleMovingAverage[i])/3

            return output
        })

        //console.log(e1)

        const input_x = Array.from(Array(length), (_,x) => (length - 1 - x) * (((length - 1 - x) === 0 ) ? 1 : -1))
        //const input_x = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20].reverse()
        // histo is only the display data where this.props.histo is the batch data
        
        const osc = histo.map((can,i) => {
            //console.log(e1[i])
            const input_y = this.props.histo
            .slice(batch - (display + length) + i, batch - display + i)
            .map((histo,i) => histo.close - (e1[i]/2))
            
            const lg = linearRegression(input_y, input_x)
            console.log(input_x, input_y)
            return lg.slope
            
        })


        let largest = Math.max.apply(null, osc.map(o => o < 0 ? o * -1 : o))
        //const range = largest * 2
        const bband = bollinger.upper.slice(bollinger.upper.length - display, bollinger.upper.length ).map((upper, i) => {
            return upper - bollinger.lower[i]
        })
        const kelt = keltner.upper.slice(keltner.upper.length - display, keltner.upper.length ).map((upper, i) => {
            return upper - keltner.lower[i]
        })
        
        const diff = histo.map((hist,i) => {
            //console.log(bband[i] < kelt[i])
            return bband[i] > kelt[i]
        })
        
        //console.log(largest, osc.map(o => o < 0 ? o * -1 : o))
        const ratio = 100/(largest*2)

        const osc_color = osc.map((o,i) => {
            return osc[i-1] < o ? o >= 0 ? '#00ffff' : '#cc00cc' : o >= 0 ? '#009b9b' : '#ff9bff'
        })
        
        chart = histo.map((candle,i) => {
            
            //const boxHeight = (osc[i] < 0 ? osc[i]*-1 : osc[i])*2

            const color = osc_color[i]
            const y1 = 50
            const y2 = osc[i] < 0 ? 50 + (ratio * (osc[i])*-1) : 50 -(ratio*osc[i])
            const dotcolor = diff[i] ? '#008000': '#FF0000'

      
            return (
                <g key={i}>
                    <line strokeLinecap="round" className="time" stroke={color} style={{ strokeMiterLimit:10,fill:color}} 
                        x1={(candleWidth*i)} 
                        x2={(candleWidth*i)}
                        y1={y1} 
                        y2={y2} 
                        strokeWidth="2" />
                    <circle cx={(candleWidth*i)} cy={50} r="2" stroke="black" strokeWidth="0" fill={dotcolor} style={{opacity:0.9}} />
                </g>
            )
          })
    
    }

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
        <Chart viewBox={'0 0 '+boxwidth+' '+boxheight} preserveAspectRatio="none">{chart}</Chart>
      )
    }
    
}

