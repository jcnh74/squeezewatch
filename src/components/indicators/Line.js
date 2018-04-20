import React, { Component } from 'react'
import moment from 'moment'

const layout = 'grid'

export default class Line extends Component {

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


    //const closes = coin.histo.map(candle => candle.close)
    // const stdev = Object.values(closes.map((close,i) => stats.stdev(closes.slice(i,-20)))).slice(0,60)
    // const ma = sma(Object.values(closes), 20).slice(0,60)
    // const multKC = 1.5
    
    const range = largest - smallest

    const candleWidth = (this.props.deviceWidth < 1200 || layout === 'row')  ? this.props.deviceWidth/65 : (this.props.deviceWidth/3)/65

    const details = histo.map((candle,i) => {
        const date = moment.unix(candle.time)
        var formattedtime = date.format("MMM D H:mm")

        return (
            <g>
            <rect className="time"  style={{ strokeMiterLimit:10}} 
                                  x={(candleWidth*i)} 
                                  y={0} 
                                  width={candleWidth} 
                                  height={200} 
                                  onMouseEnter={() => this.props.overCandle((this.props.coin.tsym === 'BTC') ? Number(candle.close).toFixed(8) : Number(candle.close).toFixed(2), candle.time)}
                                  onMouseLeave={() => this.props.overCandle( (this.props.coin.tsym === 'BTC') ? this.props.coin.price_btc : Number(this.props.coin.price).toFixed(2), '')} />
            <line className="timeline" style={{ strokeMiterLimit:10}} x1={(candleWidth*i)+(candleWidth/4)} y1={200} x2={(candleWidth*i)+(candleWidth/4)} y2={4}/>
            <text className="text" x={(i > histo.length/2) ? (candleWidth*i)-58 : (candleWidth*i)} y="0" >{formattedtime}</text>
            {/* "dddd, mmmm dS, yyyy, h:MM:ss" */}
          </g>
        )
    })

    const points = histo.map((candle,i) => {

        const candletop = ((largest - (candle.open < candle.close ? candle.close : candle.open))/range)*200
        return (candleWidth*i)+(candleWidth/4) + ', ' + candletop + ' '
    })
    console.log(points)
    

    return (
        <svg className="shadow chart" style={{position:'absolute', left:0, top:20, width:'100%', height:'100%'}}>
            <linearGradient id="SVGID_1_" gradientUnits="userSpaceOnUse" x1="208" y1="0" x2="208" y2="200">
                <stop  offset="0" style={{stopColor:'#00B4FF',stopOpacity:0.8}}/>
                <stop  offset="1" style={{stopColor:'#00B4FF',stopOpacity:0}}/>
            </linearGradient>
            <polyline transform="translate(0,12)" class="st0" points={ '0, 200 ' + points + ' ' + (this.props.deviceWidth/3) + ', 200'}/>
            <g transform="translate(0,12)">
                {details}
                </g>
        </svg>
      )
    }
}

