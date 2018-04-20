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
    const sample = this.props.sample
    //console.log(this.props.histo.length - 1, this.props.limit)

    const candleWidth = boxwidth/display
    let chart = []
    //console.log(this.props.histo.length,this.props.limit)
    if(this.props.histo.length - 1 === sample){
        //console.log(this.props.histo.length - display,this.props.histo.length)
        const histo = this.props.histo.slice(this.props.histo.length - display,this.props.histo.length)
        const test = this.props.histo.slice(this.props.histo.length + 1 - (display + length),this.props.histo.length)


        //console.log(this.props.histo)

        const closes = test.map(candle => candle.close)

        const keltner = kc(test, length, 1, false)
        const simpleMovingAverage = sma(closes, length); // [3, 4]
        const exponentialMovingAverage = ema(closes, length); // [4, 4]
        const bollinger = boll(closes, length, 2, true); // { upper: [], mid: [], lower: []}
        


        const linearRegression = (y,x) => {
            
            var lr = {}
            var n = y.length
            var sum_x = 0
            var sum_y = 0
            var sum_xy = 0
            var sum_xx = 0
            var sum_yy = 0
    
            for (var i = 0; i < y.length; i++) {
    
                sum_x += x[i]
                sum_y += y[i]
                sum_xy += (x[i]*y[i])
                sum_xx += (x[i]*x[i])
                sum_yy += (y[i]*y[i])

            } 
            lr['slope'] = (n * sum_xy - sum_x * sum_y) / (n*sum_xx - sum_x * sum_x)
            lr['intercept'] = (sum_y - lr.slope * sum_x)/n
            return lr
        }

        //const yCloses = this.props.histo.map(candle => candle.close)
        const _sma = sma(closes, length)
        console.log(_sma.length)

        const e1 = histo.map((can,i) => {
            
            const highest = Math.max.apply(null, this.props.histo.slice(sample - display - length + i, sample - display + i).map(candle => candle.high))
            const lowest = Math.min.apply(null, this.props.histo.slice(sample - display - length + i, sample - display + i).map(candle => candle.low))
            const output = (highest + lowest)/2 + _sma[i]

            return output
        })


        const arr = Array.from(Array(length), (_,x) => (length - 1 - x) * (((length - 1 - x) === 0 ) ? 1 : -1))
        
        // histo is only the display data where this.props.histo is the sample data
        const osc = histo.map((can,i) => {
            const lg = linearRegression(arr, this.props.histo
                .slice(sample - display - length + i, sample - display + i)
                .map((histo,i) => ((histo.close - e1[i])/2))
            )
            return lg.intercept + lg.slope * (length - 1 - i)
            
        })
        const osc_color = osc.map((o,i) => {
            return osc[i+1] < o ? o >= 0 ? '#009b9b' :  '#ff9bff' : o >= 0 ? '#00ffff' :'#cc00cc'
        })

        let largest = Math.max.apply(Math, osc.map(o => o < 0 ? o * -1 : o))
        const range = largest*2
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

        const ratio = 100/(largest*2)

        

        
        chart = histo.map((candle,i) => {
            
            const boxHeight = (osc[i] < 0 ? osc[i]*-1 : osc[i])*2

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

