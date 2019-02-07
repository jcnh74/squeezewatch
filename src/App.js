import React from 'react'
import "typeface-exo"
import { AppRegistry, Dimensions } from 'react-native'
import Coin from'./components/Coin'

import Select from 'react-select';
import 'react-select/dist/react-select.css';

import styled, { css } from 'styled-components';

// import binance from 'node-binance-api';

// const Binance = require('binance-api-node').default

// const client = Binance()

// // Authenticated client, can make signed calls
// const client2 = Binance({
//   apiKey: 'xbvmdpeXTtTAgr2H9eibioZCzlClKBHt7EsaVUmEkORq2aOpZvWrCJY6XmVqfyCv',
//   apiSecret: '9brjZ0wgQXiaCDoqalxdoGb55iUdvV4LWvtbbUfaQOtCh7nqLAX76euOsKpfkJBY',
// })

// client.time().then(time => console.log(time))

// const binance = require('node-binance-api')().options({
//   APIKEY: 'xbvmdpeXTtTAgr2H9eibioZCzlClKBHt7EsaVUmEkORq2aOpZvWrCJY6XmVqfyCv',
//   APISECRET: '9brjZ0wgQXiaCDoqalxdoGb55iUdvV4LWvtbbUfaQOtCh7nqLAX76euOsKpfkJBY',
//   useServerTime: true // If you get timestamp errors, synchronize to server time at startup
// });

// binance.prices('BNBBTC', (error, ticker) => {
//   console.log("Price of BNB: ", ticker.BNBBTC);
// });



// import sma from 'sma'
// import stats from 'stats-lite'

function getParameterByName(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
      results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

let page = getParameterByName('p')
page = (page !== 'undefined') ? page : 0


const coinlist = []
const COUNT = 6
const OFFSET = COUNT*page
const MAX_CONTRIBUTORS = 6
const ASYNC_DELAY = 1500



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
        ['1H', 'hour', 1, 0],
        ['2H', 'hour', 2, 0],
        ['3H', 'hour', 3, 0],
        ['4H', 'hour', 4, 0],
        ['6H', 'hour', 6, 0],
        ['8H', 'hour', 8, 0],
        ['12H', 'hour', 12, 0],
        ['1D', 'day', 1, 0],
        ['1W', 'day', 7, 0]
      ],
      current:0,
      selectedOption: '',
      allcoins:[],
      settings: false
    }
    

    
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
    

    const list = await fetch('https://api.coinmarketcap.com/v1/ticker/?start='+OFFSET+'&limit='+count)
    //const list = await fetch('https://api.binance.com/api/v1/exchangeInfo')
    const myCoins = await list.json().then((data) => data)



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
      allcoins: options,
      data:myCoins
    })
    this.getAllCoins()

  }

  async myCoinList(value){
    //https://min-api.cryptocompare.com/data/generateAvg?fsym=BTC&tsym=USD&e=CCCAGG
    
    const data = Promise.all(
      value.map(async (pair) => {
        const tsym = (pair.symbol === 'BTC' ? 'USD' : 'BTC')
        //const url = 'https://min-api.cryptocompare.com/data/generateAvg?fsym=POA&tsym=BTC&e=Binance'
        const url = 'https://min-api.cryptocompare.com/data/generateAvg?fsym='+pair.symbol+'&tsym='+tsym+'&e=CCCAGG'
        return await (await fetch(url)).json()
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
  
  updateAllCoins(scaleIndex){
    //console.log(scaleIndex)
    this.setState({
      current: scaleIndex
    })

  }

  //https://www.cryptocompare.com/api/data/coinsnapshot/?fsym=BTC&tsym=USD

  componentWillMount() {
    //this.updateDimensions();
  }

  componentWillUnmount() {
    //window.removeEventListener("resize", this.updateDimensions.bind(this));
  }

  componentDidMount() {
    this.defaultCoinList('BTC', COUNT)

    //this.updateDimensions()
    //window.addEventListener("resize", this.updateDimensions.bind(this));
  }

  onChange(value) {

    this.myCoinList(value).then(data => {
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
      if(theCoins.length > 0){
        this.setState({
          coins:theCoins,
          value: value, 
        })
      }else{
        this.defaultCoinList('USD', COUNT)
      }

    })
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
  
  toggleSettings(){
    this.setState({
      settings:!this.state.settings
    })
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
          style={{'height': '180px', 'align-self':'flex-start'}}
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
    `

    const Header = styled.div`
      padding: 10px;
      position:relative;
      z-index:9;
      box-sizing:border-box;
    `
    const HeaderGroup = styled.div`
      flex:1;
      
    `
    const HeaderWrapper = styled.div`
      display: flex;
    `

    const HeaderLogo = styled.div`
      position:relative;
      font-size: 2em;
      text-transform: uppercase;
      font-style: italic;
      font-weight: 700;
      letter-spacing: 3px;
      font-family: 'Exo 2', Arial, san-serif;
      max-width:300px;
    `

    const SqueezeTimeWrap = styled.div`
      position:absolute;
      top:30px;
      left:30px;
      right:-4px;
      display:flex;
      flex-direction: row;
      justify-content: space-between;
      
      height:24px;
      
    `
    const SettingsToggle = styled.div`
      width:100%;
      text-align:right;
      flex-shrink: 2;
    `

    const Main = styled.div`
    width:100vw;
  `

    const Settings = styled.div`
      
    `

    const SettingsWrap = styled.div`
      width:100%;
      position:absolute;
      top:0;
      left:0;
      bottom:0;
    `

    const Grid = styled.div`
      flex:1;
      display: flex;
      align-content:flex-start;
      flex-direction: row;
      justify-content: space-between;
      flex-wrap: wrap;
      padding:5px;
      @media (max-width: 1200px) {
        flex-direction: column;
      }
    `

    return (
        <Wrapper className={'wrapper ' + (this.state.settings ? 'open' : '')}>
          <Main>
            <Header>
              <HeaderWrapper>
                <HeaderGroup>
                  <HeaderLogo>
                    <svg viewBox="0 0 645.6 119" preserveAspectRatio="none">
                      <path style={{'fill':'#019E9F'}} d="M101,54L101,54c-1.7,0-3-1.3-3-3V3c0-1.6,1.3-3,3-3l0,0c1.7,0,3,1.3,3,3v48C104,52.7,102.7,54,101,54z"/>
                      <path style={{'fill':'#019E9F'}} d="M85,54L85,54c-1.7,0-3-1.3-3-3V13c0-1.6,1.3-3,3-3l0,0c1.7,0,3,1.3,3,3v38C88,52.7,86.7,54,85,54z"/>
                      <path style={{'fill':'#019E9F'}} d="M69,54L69,54c-1.7,0-3-1.3-3-3V25c0-1.6,1.3-3,3-3l0,0c1.7,0,3,1.3,3,3v26C72,52.7,70.7,54,69,54z"/>
                      <path style={{'fill':'#019E9F'}} d="M53,54L53,54c-1.7,0-3-1.3-3-3V37c0-1.6,1.3-3,3-3h0c1.6,0,3,1.3,3,3v14C56,52.7,54.7,54,53,54z"/>
                      <path style={{'fill':'#812292'}} d="M37,100L37,100c-1.7,0-3-1.3-3-3V79c0-1.7,1.3-3,3-3h0c1.6,0,3,1.3,3,3v18C40,98.7,38.7,100,37,100z"/>
                      <path style={{'fill':'#812292'}} d="M21,119L21,119c-1.7,0-3-1.3-3-3V79c0-1.7,1.3-3,3-3h0c1.6,0,3,1.3,3,3v37C24,117.7,22.7,119,21,119z"/>
                      <path style={{'fill':'#AD77BE'}} d="M5,106L5,106c-1.7,0-3-1.3-3-3V79c0-1.7,1.3-3,3-3h0c1.6,0,3,1.3,3,3v24C8,104.7,6.7,106,5,106z"/>
                      <circle style={{'fill':'#48EA61'}} cx="5" cy="65" r="5"/>
                      <circle style={{'fill':'#48EA61'}} cx="21" cy="65" r="5"/>
                      <circle style={{'fill':'#48EA61'}} cx="37" cy="65" r="5"/>
                      <circle style={{'fill':'#DE4A7A'}} cx="53" cy="65" r="5"/>
                      <circle style={{'fill':'#DE4A7A'}} cx="69" cy="65" r="5"/>
                      <circle style={{'fill':'#48EA61'}} cx="85" cy="65" r="5"/>
                      <circle style={{'fill':'#48EA61'}} cx="101" cy="65" r="5"/>
                      <g>
                        <path style={{'fill':'#FFFFFF'}} d="M151.5,38.6c-0.7-0.9-1.6-1.6-2.6-2.1c-1-0.5-2.2-0.7-3.5-0.7c-0.6,0-1.2,0.1-1.9,0.2
                          c-0.7,0.2-1.3,0.4-1.8,0.8c-0.5,0.4-1,0.8-1.4,1.4c-0.4,0.6-0.5,1.2-0.5,2c0,1,0.4,1.9,1.2,2.5c0.8,0.6,1.9,1.2,3.4,1.7
                          c1.6,0.6,3,1.2,4.3,1.8c1.2,0.7,2.3,1.4,3.2,2.3c0.9,0.9,1.5,1.8,2,2.9c0.5,1.1,0.7,2.3,0.7,3.7c0,2.2-0.5,4.1-1.4,5.7
                          c-0.9,1.6-2.1,2.8-3.6,3.8c-1.5,1-3.1,1.7-4.9,2.2c-1.8,0.5-3.6,0.7-5.4,0.7c-1.3,0-2.6-0.1-4-0.4c-1.3-0.2-2.6-0.6-3.8-1.1
                          c-1.2-0.5-2.3-1.1-3.4-1.8s-1.9-1.6-2.7-2.5l6.4-5.2c0.7,1.1,1.8,2,3.2,2.7c1.4,0.7,2.9,1,4.3,1c0.8,0,1.5-0.1,2.2-0.2
                          c0.7-0.2,1.3-0.4,1.9-0.8c0.6-0.4,1-0.8,1.3-1.4c0.3-0.6,0.5-1.3,0.5-2.1c0-1.3-0.5-2.3-1.6-3c-1-0.7-2.4-1.4-4.2-2
                          c-1.2-0.4-2.3-0.9-3.4-1.4c-1.1-0.5-2-1.2-2.8-1.9c-0.8-0.8-1.4-1.7-1.9-2.7c-0.5-1.1-0.7-2.3-0.7-3.8c0-1.9,0.4-3.6,1.2-5.1
                          c0.8-1.5,1.8-2.8,3.2-3.8c1.4-1.1,2.9-1.9,4.7-2.4c1.8-0.6,3.7-0.9,5.8-0.9c1.1,0,2.2,0.1,3.3,0.3c1.1,0.2,2.2,0.5,3.2,0.9
                          c1,0.4,2,0.9,2.8,1.5c0.9,0.6,1.6,1.3,2.2,2L151.5,38.6z"/>
                        <path style={{'fill':'#FFFFFF'}} d="M205.4,44.3c0,2.2-0.3,4.1-0.8,5.8c-0.5,1.7-1.1,3.1-1.9,4.4c-0.8,1.2-1.6,2.3-2.4,3.1c-0.9,0.9-1.6,1.5-2.4,2
                          l-0.1,0.2l7.8-0.2l-1.2,6.9h-20.7c-2.6,0-5-0.4-7.1-1.1c-2.2-0.7-4-1.8-5.5-3.1c-1.5-1.4-2.7-3-3.6-4.9c-0.8-1.9-1.2-4.1-1.2-6.5
                          c0-3.1,0.5-6,1.6-8.7s2.6-5,4.5-7c1.9-2,4.2-3.6,6.8-4.7s5.5-1.7,8.6-1.7c2.6,0,5,0.4,7.2,1.1c2.2,0.7,4,1.8,5.5,3.1
                          c1.5,1.3,2.7,3,3.5,4.9C205,39.7,205.4,41.9,205.4,44.3z M196.4,45.4c0-1.2-0.2-2.4-0.6-3.5c-0.4-1.1-1-2-1.7-2.9
                          c-0.7-0.8-1.7-1.5-2.8-1.9c-1.1-0.5-2.4-0.7-3.8-0.7c-1.8,0-3.5,0.4-5,1.1c-1.5,0.8-2.8,1.8-3.8,3c-1.1,1.3-1.9,2.7-2.4,4.3
                          c-0.6,1.6-0.9,3.3-0.9,5c0,1.2,0.2,2.4,0.6,3.5c0.4,1.1,1,2.1,1.7,2.9c0.8,0.8,1.7,1.5,2.8,2c1.1,0.5,2.4,0.7,3.9,0.7
                          c1.8,0,3.4-0.4,4.9-1.1c1.5-0.8,2.8-1.8,3.8-3c1.1-1.3,1.9-2.7,2.4-4.4C196.1,48.8,196.4,47.1,196.4,45.4z"/>
                        <path style={{'fill':'#FFFFFF'}} d="M246.9,58.9c-0.9,1.8-2,3.3-3.4,4.5s-3.1,2.2-5,2.9c-1.9,0.7-4.2,1-6.7,1c-2.2,0-4.2-0.3-6-0.8
                          c-1.8-0.5-3.3-1.3-4.6-2.3c-1.3-1-2.2-2.2-2.9-3.6c-0.7-1.4-1-3-1-4.8c0-0.5,0-1,0.1-1.6c0.1-0.6,0.1-1.1,0.2-1.6l4.1-23.1h8.6
                          l-4,22.3c-0.1,0.3-0.1,0.7-0.1,1.1c0,0.4,0,0.7,0,1c0,0.8,0.1,1.5,0.3,2.2c0.2,0.7,0.6,1.3,1.1,1.8c0.5,0.5,1.1,1,1.9,1.3
                          c0.8,0.3,1.8,0.5,2.9,0.5c1.5,0,2.7-0.2,3.6-0.7c1-0.5,1.7-1.1,2.3-1.8c0.6-0.7,1.1-1.6,1.4-2.5c0.3-0.9,0.6-1.8,0.7-2.8l4-22.4
                          h8.5L248.8,53C248.4,55.2,247.8,57.1,246.9,58.9z"/>
                        <path style={{'fill':'#FFFFFF'}} d="M260.6,66.5l6.5-36.8h23.6l-1.3,7.4h-15.3l-1.2,7.1h14.6l-1.2,7h-14.6l-1.4,7.9H287l-1.3,7.4H260.6z"/>
                        <path style={{'fill':'#FFFFFF'}} d="M298,66.5l6.5-36.8H328l-1.3,7.4h-15.3l-1.2,7.1h14.6l-1.2,7h-14.6l-1.4,7.9h16.7l-1.3,7.4H298z"/>
                        <path style={{'fill':'#FFFFFF'}} d="M332.8,66.5l1.3-7.5l21.4-21.9h-16l1.3-7.4h27.2l-1.2,7L345.1,59h18.3l-1.4,7.5H332.8z"/>
                        <path style={{'fill':'#FFFFFF'}} d="M374.4,66.5l6.5-36.8h23.6l-1.3,7.4h-15.3l-1.2,7.1h14.6l-1.2,7h-14.6l-1.4,7.9h16.7l-1.3,7.4H374.4z"/>
                        <path style={{'fill':'#FFFFFF'}} d="M421.3,61.6c0,0.7-0.1,1.4-0.4,2s-0.6,1.2-1.1,1.7c-0.5,0.5-1,0.9-1.6,1.1c-0.6,0.3-1.3,0.4-2.1,0.4
                          c-1.4,0-2.6-0.4-3.5-1.2c-0.9-0.8-1.3-1.9-1.3-3.2c0-1.5,0.5-2.8,1.5-3.8c1-1,2.3-1.5,3.7-1.5c1.4,0,2.5,0.4,3.4,1.3
                          C420.9,59.3,421.3,60.3,421.3,61.6z"/>
                        <path style={{'fill':'#FFFFFF'}} d="M469.4,66.5h-8.6l-2.5-25.2h-0.2l-12.2,25.2h-8.6l-3.2-36.8h9.2l1.1,24.8h0.2l11.4-24.8h8.9l2,24.8h0.2
                          l11-24.8h9.1L469.4,66.5z"/>
                        <path style={{'fill':'#FFFFFF'}} d="M515,66.5l-1.2-7.3h-14.2l-4.4,7.3h-9.9l23.5-36.8h8.4l7,36.8H515z M511,39.1l-7.7,13.1h9.6L511,39.1z"/>
                        <path style={{'fill':'#FFFFFF'}} d="M551.2,37.1L546,66.5h-8.6l5.1-29.4h-10.3l1.4-7.4h29l-1.3,7.4H551.2z"/>
                        <path style={{'fill':'#FFFFFF'}} d="M598,61.4c-0.7,0.8-1.6,1.6-2.5,2.3c-1,0.7-2,1.4-3.3,2c-1.2,0.6-2.6,1-4.1,1.4c-1.5,0.3-3.1,0.5-4.9,0.5
                          c-2.6,0-4.9-0.4-7-1.1c-2.1-0.8-3.8-1.8-5.3-3.2c-1.5-1.4-2.6-3.1-3.4-5.1c-0.8-2-1.2-4.2-1.2-6.6c0-3.2,0.6-6.1,1.7-8.9
                          c1.1-2.8,2.6-5.2,4.6-7.3c2-2.1,4.3-3.7,6.9-4.9c2.7-1.2,5.6-1.8,8.7-1.8c2.9,0,5.5,0.5,7.9,1.5c2.3,1,4.1,2.3,5.3,3.9l-6.4,5.7
                          c-0.6-0.9-1.5-1.7-2.6-2.4c-1.2-0.7-2.6-1-4.3-1c-1.8,0-3.5,0.4-5,1.2c-1.5,0.8-2.8,1.8-3.9,3.1c-1.1,1.3-1.9,2.8-2.5,4.5
                          c-0.6,1.7-0.9,3.4-0.9,5.2c0,1.2,0.2,2.4,0.6,3.6c0.4,1.1,1,2.1,1.7,2.9s1.7,1.5,2.8,2c1.1,0.5,2.4,0.7,3.9,0.7
                          c1.6,0,3.2-0.3,4.6-1c1.5-0.7,2.7-1.7,3.8-3L598,61.4z"/>
                        <path style={{'fill':'#FFFFFF'}} d="M630.5,66.5l2.7-15.5h-14.3l-2.8,15.5h-8.6l6.5-36.8h8.6l-2.5,14h14.4l2.4-14h8.7l-6.5,36.8H630.5z"/>
                      </g>
                    </svg>
                    <SqueezeTimeWrap>{globalsqueezetimes}</SqueezeTimeWrap>
                  </HeaderLogo>
                </HeaderGroup>
                <HeaderGroup>
                  <Select.Async
                    className={'search'}

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
                </HeaderGroup>
                <HeaderGroup className={'settings-group'}>
                  <div className={'legend'}>
                    <div className={'legend-text'}>Legend: </div>
                    <div className={'watch'}>Watch</div>
                    <div className={'fired-long'}>Fired Long</div>
                    <div className={'fired-short'}>Fired Short</div>
                  </div>
                  {/* <SettingsToggle className={'app-settings'} onClick={() => this.toggleSettings()}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 24 24"><path fill="#FFFFFF" d="M24 13.616v-3.232c-1.651-.587-2.694-.752-3.219-2.019v-.001c-.527-1.271.1-2.134.847-3.707l-2.285-2.285c-1.561.742-2.433 1.375-3.707.847h-.001c-1.269-.526-1.435-1.576-2.019-3.219h-3.232c-.582 1.635-.749 2.692-2.019 3.219h-.001c-1.271.528-2.132-.098-3.707-.847l-2.285 2.285c.745 1.568 1.375 2.434.847 3.707-.527 1.271-1.584 1.438-3.219 2.02v3.232c1.632.58 2.692.749 3.219 2.019.53 1.282-.114 2.166-.847 3.707l2.285 2.286c1.562-.743 2.434-1.375 3.707-.847h.001c1.27.526 1.436 1.579 2.019 3.219h3.232c.582-1.636.75-2.69 2.027-3.222h.001c1.262-.524 2.12.101 3.698.851l2.285-2.286c-.744-1.563-1.375-2.433-.848-3.706.527-1.271 1.588-1.44 3.221-2.021zm-12 2.384c-2.209 0-4-1.791-4-4s1.791-4 4-4 4 1.791 4 4-1.791 4-4 4z"/></svg>
                    <label className="switch">
                      <input type="checkbox" />
                      <span className="slider"></span>
                    </label>
                  </SettingsToggle> */}
                </HeaderGroup>
              </HeaderWrapper>
            </Header>
            <Grid>
              {griditems}
            </Grid>
          </Main>
          {/* <Settings className={'settings'}>
            <SettingsWrap>
              SettingsWrap
            </SettingsWrap>
          </Settings> */}
        </Wrapper>
    );
  }
}


AppRegistry.registerComponent('App', () => App);
AppRegistry.runApplication('App', { rootTag: document.getElementById('root') });



// WEBPACK FOOTER //
// ./src/App.js