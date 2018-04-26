import React from 'react'
import "typeface-exo"
import { AppRegistry, Dimensions } from 'react-native'
import Coin from'./components/Coin'

import Select from 'react-select';
import 'react-select/dist/react-select.css';

import styled, { css } from 'styled-components';



// import sma from 'sma'
// import stats from 'stats-lite'

const coinlist = []
const COUNT = 6
const MAX_CONTRIBUTORS = 6;
const ASYNC_DELAY = 500;

export default class App extends React.Component {

  constructor(props) {
    super(props);
    let deviceWidth = Dimensions.get('window').width

    this.state = {
      data:[],
      coins:coinlist,
      deviceWidth: deviceWidth,
      scales:[
        // ['1M', 'minute', 1, 0],
        // ['5M', 'minute', 5, 0],
        // ['15M', 'minute', 15, 0],
        // ['30M', 'minute', 30, 0],
        ['1H', 'hour', 1, 1],
        ['2H', 'hour', 2, 0],
        ['3H', 'hour', 3, 0],
        ['4H', 'hour', 4, 0],
        ['6H', 'hour', 6, 0],
        ['8H', 'hour', 8 ,0],
        ['12H', 'hour', 12, 0],
        ['1D', 'day', 1, 0],
        ['1W', 'day', 7, 0]
      ],
      current:0,
      selectedOption: '',
      allcoins:[]
    }
    
    const _this = this
    _this.defaultCoinList('BTC', COUNT)

    
    // setInterval(function() {
    //   _this.defaultCoinList('BTC', count)
    // }, (60 * 8) * 1000)

    this.gotoCoin = this.gotoCoin.bind(this)
    this.onChange = this.onChange.bind(this)
    this.getCoins = this.getCoins.bind(this)

  }

  updateDimensions() {
    let deviceWidth = Dimensions.get('window').width
    this.setState({deviceWidth: deviceWidth})
  }

  async defaultCoinList(tsym, count){

    const list = await fetch('https://api.coinmarketcap.com/v1/ticker/?limit='+count)
    const myCoins = await list.json().then((data) => data)
    this.setState({
      data:myCoins
    }, () => {

      const theCoins = myCoins.map((coin,index) => {
        return {
          fsym: coin.symbol, 
          tsym: (coin.symbol === 'BTC' ? 'USD' : tsym), 
          name: coin['name'], 
          volume: coin['24h_volume_usd'], 
          price: coin['price_usd'], 
          price_btc: coin['price_btc'], 
          rank: coin['rank'], 
          percent_change_24h: coin['percent_change_24h']
        }
      })
      const options = myCoins.map((coin,index) => {
        return {
          symbol: coin.symbol, 
          name: coin['name'] + ' [' + coin.symbol + ']'
        }
      })
      this.setState({
        coins:theCoins,
        allcoins: options

      }, () => {
        this.getAllCoins()
      })
    });
    
  }

  async myCoinList(value){
    //https://min-api.cryptocompare.com/data/generateAvg?fsym=BTC&tsym=USD&e=CCCAGG
    
    const data = Promise.all(
      value.map(async (i) => {
        const tsym = (i.symbol === 'BTC' ? 'USD' : 'BTC')
        return await (await fetch('https://min-api.cryptocompare.com/data/generateAvg?fsym='+i.symbol+'&tsym='+tsym+'&e=CCCAGG')).json()
      })
    )
    return data  
  }

  async getAllCoins(){
    const list = await fetch('https://min-api.cryptocompare.com/data/all/coinlist')
    const myCoins = await list.json().then((data) => data.Data)

    const sorteddata = Object.values(myCoins).sort((a, b) => {
      return a.SortOrder - b.SortOrder;
    })
    const allcoins = await sorteddata.map((coin,index) => {
      return {
        symbol: coin.Symbol, 
        name: coin.CoinName + ' [' + coin.Symbol + ']'
      }
    })
    this.setState({
      allcoins:allcoins
    })

  }
  
  async updateAllCoins(scaleIndex){
    console.log(scaleIndex)
    this.setState({
      current: scaleIndex
    })

  }

  //https://www.cryptocompare.com/api/data/coinsnapshot/?fsym=BTC&tsym=USD

  componentWillMount() {
    this.updateDimensions();
    }

    componentWillUnmount() {
    //window.removeEventListener("resize", this.updateDimensions.bind(this));
    }

  componentDidMount() {
    this.updateDimensions()
    //window.addEventListener("resize", this.updateDimensions.bind(this));

  }

  onChange(value) {
		this.setState({
			value: value,
		},() => {

      this.myCoinList(this.state.value).then(data => {
        const theCoins = data.map((coin, index) => {
          return {
            fsym: coin.RAW.FROMSYMBOL, 
            tsym: coin.RAW.TOSYMBOL,
            name: coin.RAW.FROMSYMBOL, 
            volume: coin.RAW.VOLUME24HOURTO, 
            price: coin.RAW.PRICE, 
            price_btc: coin.RAW.PRICE, 
            rank: index, 
            percent_change_24h: coin.RAW.CHANGEPCT24HOUR
          }
        })
        console.log(theCoins)
        if(theCoins.length > 0){
          this.setState({
            coins:theCoins,  
          })
        }else{
          this.defaultCoinList('USD', COUNT)
        }

      })
    });
  }
  
  gotoCoin(value, event) {
		console.log(value, event)
  }
  
  getCoins(input, callback) {
    input = input.toUpperCase();
		var options = this.state.allcoins.filter(i => {
			return i.symbol.substr(0, input.length) === input
    });
		var data = {
			options: options.slice(0, MAX_CONTRIBUTORS),
			complete: options.length <= MAX_CONTRIBUTORS,
		};
		setTimeout(function() {
			callback(null, data);
		}, ASYNC_DELAY)
	}

  
  render() {

    const ScaleButton = styled.button`
      align-items: center;
      flex:1;
      padding: 4px;
      background:transparent;
      border:2px solid transparent;
      color:white;
      cursor:pointer;

      ${props => props.selected && css`
        border-bottom-width:2px;
        border-bottom-color: white;
      `};
      width: ${props => props.width};
    `


    let globalsqueezetimes = this.state.scales.map((item, scaleIndex)=> {
      return (
        <ScaleButton 
          key={scaleIndex} 
          selected={(this.state.current === scaleIndex) ? true : false} 
          width={100/this.state.scales.length+'%'} 
          onClick={() => this.updateAllCoins(scaleIndex)}>
            {item[0]}
        </ScaleButton>
      )
    })

    const sorteddata = this.state.coins.sort((a, b) => {
    
      return a.rank - b.rank;
    })
    const griditems = sorteddata.map((coin, coinIndex) => {
      return (
        <Coin
          key={coinIndex}
          coin={coin}
          coinIndex={coinIndex} 
          deviceWidth={this.state.deviceWidth}
          scales={this.state.scales}
          current={this.state.current}
          fullwidth={false}
          count={COUNT}  />
      )
    })

    const Wrapper = styled.div`
      margin: 0 auto;
      min-height:100vh;
      display: flex;
      flex-direction:column;
    `

    const Header = styled.div`
      padding: 10px;
      position:relative;
      z-index:9;
      box-sizing:border-box;
    `
    const HeaderText = styled.div`
      font-size: 2em;
      text-transform: uppercase;
      font-style: italic;
      font-weight: 700;
      letter-spacing: 3px;
      font-family: 'Exo 2', Arial, san-serif;
    `

    const SqueezeTimeWrap = styled.div`
      display:flex;
      flex-direction: row;
      justify-content: space-between;
      flex-wrap: wrap;
      height:24px;
    `

    const Grid = styled.div`
      flex:1;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      flex-wrap: wrap;
      padding:5px;
    `

    return (
        <Wrapper>
          <Header>
            <HeaderText>Squeeze Watch</HeaderText>
            <SqueezeTimeWrap>{globalsqueezetimes}</SqueezeTimeWrap>            
            <Select.Async 
              multi={true} 
              onChange={this.onChange} 
              onValueClick={this.gotoCoin} 
              valueKey="symbol" 
              labelKey="name" 
              loadOptions={this.getCoins} 
              backspaceRemoves={true}
              name="form-field-name"
              value={this.state.value}
            />  
          </Header>
          <Grid>
            {griditems}
          </Grid>
        </Wrapper>
    );
  }
}


AppRegistry.registerComponent('App', () => App);
AppRegistry.runApplication('App', { rootTag: document.getElementById('root') });



// WEBPACK FOOTER //
// ./src/App.js