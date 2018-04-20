import React, { Component } from 'react'
import moment from 'moment'

const layout = 'grid'

export default class HeikinAshiCandlestick extends Component {

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
    const histo = this.props.histo.slice(20,80)

    let largest = Math.max.apply(Math, histo.map(candle => candle.high))
    let smallest = Math.min.apply(Math, histo.map(candle => candle.low))


    
    const range = largest - smallest
    


    const candleWidth = (this.props.deviceWidth < 1200 || this.props.fullwidth)  ? this.props.deviceWidth/65 : (this.props.deviceWidth/3)/65

    const chart = histo.map((candle,i) => {
      const boxHeight = (this.props.deviceWidth < 1200 || this.props.fullwidth) ? 400 : 200

      const date = moment.unix(candle.time)
      var formattedtime = date.format("MMM D H:mm")

      const HAclose =  (candle.open + candle.high + candle.low + candle.close) / 4
      const HAhigh =  Math.max.apply(Math, [candle.open, candle.high, candle.close])
      const HAlow = Math.min.apply(Math, [candle.open, candle.low, candle.close])
      const HAopen = (i > 0) ? ((histo[i-1].open + histo[i-1].close) / 2) : ((candle.open + candle.close) / 2)

      const color = HAopen > HAclose ? '#df4b7a' : '#48ea61'
      const wicktop = ((largest - HAhigh)/range)*boxHeight
      const wickbottom = ((largest - HAlow)/range)*boxHeight
      const candletop = ((largest - (HAopen < HAclose ? HAclose: HAopen))/range)*boxHeight
      const candlebottom = ((largest - (HAopen > HAclose ? HAclose : HAopen))/range)*boxHeight
      const height =  candlebottom - candletop

      return (
        <g key={i} transform="translate(0,12)">
          <line className="wick" style={{ fill:'#000000',stroke:color,strokeMiterLimit:10}} x1={(candleWidth*i)+(candleWidth/4)} y1={wickbottom} x2={(candleWidth*i)+(candleWidth/4)} y2={wicktop}/>
          <rect className="candle" style={{ stroke:color,strokeMiterLimit:10}} x={(candleWidth*i)} y={candletop} width={candleWidth/2} height={height}/>
          <rect className="time"  style={{ strokeMiterLimit:10}} 
                                x={(candleWidth*i)} 
                                y={0} 
                                width={candleWidth} 
                                height={boxHeight} 
                                onMouseEnter={() => this.props.overCandle((this.props.coin.tsym === 'BTC') ? Number(candle.close).toFixed(8) : Number(candle.close).toFixed(2), candle.time)}
                                onMouseLeave={() => this.props.overCandle( (this.props.coin.tsym === 'BTC') ? this.props.coin.price_btc : Number(this.props.coin.price).toFixed(2), '')} />
          <line className="timeline" style={{ strokeMiterLimit:10}} x1={(candleWidth*i)+(candleWidth/4)} y1={boxHeight} x2={(candleWidth*i)+(candleWidth/4)} y2={4}/>
          <text className="text" x={(i > histo.length/2) ? (candleWidth*i)-58 : (candleWidth*i)} y="0" >{formattedtime}</text>
          {/* "dddd, mmmm dS, yyyy, h:MM:ss" */}
        </g>
      )
    })
    
    // const upper = histo.map((candle,i) => {

    //   const dev = multKC * stdev[i]
    //   const upperBB = parseFloat(ma[i]) + parseFloat(dev)        
    //   const upperBBpos = ((largest - upperBB)/range)*200
    
    //   return (candleWidth*i).toString() + ' ' + upperBBpos.toString()        
    // })

    // const lower = histo.map((candle,i) => {

    //   const dev = multKC * stdev[i]
    //   const lowerBB = parseFloat(ma[i]) - parseFloat(dev)
    //   const lowerBBpos = ((largest - lowerBB)/range)*200
    
    //   return (candleWidth*i).toString() + ' ' + lowerBBpos.toString()        
    // }).reverse()
    // //console.log(lower)

    // PROPS: deviceWidth, coinIndex, coin,

    return (
        <svg className="shadow chart" style={{position:'absolute', left:0, top:20, width:'100%', height:'100%'}}>
          {chart}
        </svg>
      )
    }
}

