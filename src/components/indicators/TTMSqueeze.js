import React, { Component } from 'react'
import styled from 'styled-components';

const boxwidth = 400
const boxheight = 100

const lightblue = "#00ffff"
const darkpuple = "#cc00cc"
const darkblue = "#009b9b"
const lightpurple = "#ff9bff"


export default class TTMSqueeze extends Component {

  constructor(props) {

    super(props);
    this.state = {
        chart: ''
    }

  }

  componentWillMount() {
  }

  componentDidMount() {
    const display = this.props.display

    const candleWidth = boxwidth/display
    let chart = ''
    
    if(this.props.osc.length){

        let largest = Math.max.apply(null, this.props.osc.map(o => o < 0 ? o * -1 : o))
        
        const ratio = 100/(largest*2)

        const osc_color = this.props.osc.map((o,i) => {
            return this.props.osc[i-1] < o ? o >= 0 ? lightblue : darkpuple : o >= 0 ? darkblue : lightpurple
        })



        chart = this.props.osc.map((candle,i) => {
            
            const color = osc_color[i]
            const y1 = 50
            const y2 = this.props.osc[i] < 0 ? 50 + (ratio * (this.props.osc[i])*-1) : 50 -(ratio*this.props.osc[i])
            const dotcolor = this.props.diff[i] ? '#008000': '#FF0000'

      
            return (
                <g key={i}>
                    <line strokeLinecap="round" className="time" stroke={color} style={{ strokeMiterLimit:5,fill:color}} 
                        x1={(candleWidth*i + candleWidth/4)} 
                        x2={(candleWidth*i + candleWidth/4)}
                        y1={y1} 
                        y2={y2} 
                        strokeWidth="2" />
                    <circle cx={(candleWidth*i + candleWidth/4)} cy={50} r="2" stroke="black" strokeWidth="0" fill={dotcolor} style={{opacity:0.9}} />
                </g>
            )
        })
        
    
    }
    this.setState({
        chart:chart
    })
  }

  componentWillReceiveProps(nextProps){
  }

  
  render() {

    //console.log(this.props.current)


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
        <Chart viewBox={'0 0 '+boxwidth+' '+boxheight} preserveAspectRatio="none">{this.state.chart}</Chart>
      )
    }
    
}

