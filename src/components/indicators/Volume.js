import React, { Component } from 'react'

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

    let largest = Math.max.apply(Math, histo.map(candle => candle.volumefrom))
    let smallest = Math.min.apply(Math, histo.map(candle => candle.volumefrom))
    
    const range = largest - smallest

    

    const candleWidth = (this.props.deviceWidth < 1200 || layout === 'row')  ? this.props.deviceWidth/65 : (this.props.deviceWidth/3)/65

    const details = histo.map((candle,i) => {
        //const color = candle.open > candle.close ? 'rgb(40,40,40)' : 'rgb(100,100,100)'
        const color = candle.open > candle.close ? '#df4b7a' : '#48ea61'

        return (
            <rect key={i} className="volume" style={{ fill:color,strokeMiterLimit:10}} 
                x={(candleWidth*i)} 
                y={(200-((candle.volumefrom * 0.5)/range)*200)} 
                width={candleWidth} 
                height={((candle.volumefrom * 0.5)/range)*200} />
        )
    })

    

    return (
        <svg className="volume" style={{position:'absolute', left:0, top:20, width:'100%', height:'100%'}}>
            <g transform="translate(0,12)">
                {details}
            </g>
        </svg>
      )
    }
}

