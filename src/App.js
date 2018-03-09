import React from 'react'
import "typeface-exo"
import { AppRegistry, StyleSheet, Text, View, TouchableHighlight, AsyncStorage, Dimensions } from 'react-native'
import moment from 'moment'
import formatCurrency from'format-currency'


// import sma from 'sma'
// import stats from 'stats-lite'

export default class App extends React.Component {

  constructor(props) {
    super(props);
    let deviceWidth = Dimensions.get('window').width

    this.state = {
      data:[],
      coins:[
        {fsym: 'BTC', tsym: 'USD', rank: 1}
      ],
      deviceWidth: deviceWidth,
      scale:[
        ['1H','hour',1, true, 0],
        ['2H','hour',2, false, 0],
        ['3H','hour',3, false, 0],
        ['4H','hour',4, false, 0],
        ['6H','hour',6, false, 0],
        ['8H','hour',8, false, 0],
        ['12H','hour',12, false, 0],
        ['1D','day',1, false, 0],
        ['1W','day',7, false, 0]
      ]
    }
    
    const _this = this
    _this.coinList('BTC', 9)
    
    setInterval(function() {
      _this.coinList('BTC', 9)
    }, (60 * 8) * 1000);

  }

  updateDimensions() {
    let deviceWidth = Dimensions.get('window').width
    this.setState({deviceWidth: deviceWidth})
  }

  async coinList(tsym, count){

    const list = await fetch('https://api.coinmarketcap.com/v1/ticker/?limit='+count)
    const myCoins = await list.json().then((data) => data)

    this.setState({
      coins:[{fsym: 'BTC', tsym: 'USD', rank: 1}],
      data:[]
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
      this.setState({
        coins:theCoins
      },() => {
        this.state.coins.map((coin,coinIndex) => {
          return this.getCoin(coin.fsym,coin.tsym,'hour',1, coin)
        })
      })
    });
    
  }

  async getCoin(fsym, tsym, scale, aggregate, current) {
    fsym = (fsym === 'MIOTA') ? 'IOT' : fsym
    const historyres = await fetch('https://min-api.cryptocompare.com/data/histo'+scale+'?fsym='+fsym+'&tsym='+tsym+'&limit=80&aggregate='+aggregate+'&e=CCCAGG')
    const histo = await historyres.json().then((data) => data)

    this.setState({
      data: this.state.data.concat([{
        current: current,
        coinprice: 0, 
        cointime: 0, 
        fsym:fsym, 
        tsym:tsym, 
        histo:histo.Data,
        scale: this.state.scale
      }])
    });

  }
  
  async updateAllCoins(scaleIndex){
    this.state.coins.map(async (coin, index) => {
      

      const historyres = await fetch('https://min-api.cryptocompare.com/data/histo'+this.state.scale[scaleIndex][1]+'?fsym='+coin.fsym+'&tsym='+coin.tsym+'&limit=80&aggregate='+this.state.scale[scaleIndex][2]+'&e=CCCAGG')
      const histo = await historyres.json().then((data) => data)

      const data = this.state.data;
      data[index].histo = histo.Data;
      data[index].scale = this.state.data[index].scale.map((s, i) => [s[0], s[1], s[2], (scaleIndex === i) ? true : false, s[4]])
      
      const scale = this.state.scale.map((s, i) => [s[0], s[1], s[2], (scaleIndex === i) ? true : false, s[4]])

      this.setState({
        scale:scale
      })
      

      
    })

  }
  async updateCoin(fsym, tsym, scale, aggregate, index, scaleIndex){

    const historyres = await fetch('https://min-api.cryptocompare.com/data/histo'+scale+'?fsym='+fsym+'&tsym='+tsym+'&limit=80&aggregate='+aggregate+'&e=CCCAGG')
    const histo = await historyres.json().then((data) => data)


    const data = this.state.data;
    data[index].histo = histo.Data;
    data[index].scale = this.state.data[index].scale.map((s, i) => [s[0], s[1], s[2], (scaleIndex === i) ? true : false, s[4]])
    //console.log(histo.Data)

    // re-render
    await this.forceUpdate()


  }

  //https://www.cryptocompare.com/api/data/coinsnapshot/?fsym=BTC&tsym=USD

  componentWillMount() {
    this.updateDimensions();
    }

    componentWillUnmount() {
    window.removeEventListener("resize", this.updateDimensions.bind(this));
    }

  componentDidMount() {
    this.updateDimensions()
    window.addEventListener("resize", this.updateDimensions.bind(this));

    let UID123_object = {
      name: 'Chris',
      age: 30,
      traits: {hair: 'brown', eyes: 'brown'},
    };

    // You only need to define what will be added or updated
    let UID123_delta = {
      age: 31,
      traits: {eyes: 'blue', shoe_size: 10},
    };
  
    AsyncStorage.setItem('UID123', JSON.stringify(UID123_object), () => {
      AsyncStorage.mergeItem('UID123', JSON.stringify(UID123_delta), () => {
        AsyncStorage.getItem('UID123', (err, result) => {
          console.log(result);
        });
      });
    });
  }

  overCandle(price,index, time){
    const data = this.state.data;
    data[index].coinprice = price;
    data[index].cointime = time;

    // re-render
    this.forceUpdate();
  }

  
  render() {

    let globalsqueezetimes = this.state.scale.map((item, scaleIndex)=> {
      console.log(item[3],scaleIndex)
      return (
        <TouchableHighlight key={scaleIndex} style={(item[3]) ? styles.squeezetimeselected : styles.squeezetime} onPress={() => this.updateAllCoins(scaleIndex)}>
          <Text style={styles.squeezetimetext}>{item[0]}</Text>
        </TouchableHighlight>
      )
    })

    const sorteddata = this.state.data.sort((a, b) => {
      return a.current.rank - b.current.rank;
    })
    const griditems = sorteddata.map((coin,coinIndex) => {

      // [scale = '1H,2H,3H...',histo = 'hour,minute,day',aggrigate = int,current = false,offWatchFired = 0,1,2]
      const squeezetimes = coin.scale.map((item, scaleIndex)=> {
        return (
          <TouchableHighlight key={scaleIndex} style={(item[3]) ? styles.squeezetimeselected : styles.squeezetime} onPress={() => this.updateCoin(coin.fsym,coin.tsym, item[1], item[2], coinIndex, scaleIndex)}>
            <Text style={styles.squeezetimetext}>{item[0]}</Text>
          </TouchableHighlight>
        )
      })

      const histo = coin.histo.slice(20,80)

      let largest = Math.max.apply(Math, histo.map(candle => candle.high))
      let smallest = Math.min.apply(Math, histo.map(candle => candle.low))


      //const closes = coin.histo.map(candle => candle.close)
      // const stdev = Object.values(closes.map((close,i) => stats.stdev(closes.slice(i,-20)))).slice(0,60)
      // const ma = sma(Object.values(closes), 20).slice(0,60)
      // const multKC = 1.5
      
      const range = largest - smallest

      const candleWidth = (this.state.deviceWidth > 1200) ? (this.state.deviceWidth/3)/65 : this.state.deviceWidth/65

      const chart = histo.map((candle,i) => {

        const date = moment.unix(candle.time)
        var formattedtime = date.format("MMM D H:mm")

        const color = candle.open > candle.close ? '#df4b7a' : '#48ea61'
        const wicktop = ((largest - candle.high)/range)*200
        const wickbottom = ((largest - candle.low)/range)*200
        const candletop = ((largest - (candle.open < candle.close ? candle.close : candle.open))/range)*200
        const candlebottom = ((largest - (candle.open > candle.close ? candle.close : candle.open))/range)*200
        const height =  candlebottom - candletop

        return (
          <g key={i} transform="translate(0,12)">
          <rect className="candle" style={{ fill:color,strokeMiterLimit:10}} x={(candleWidth*i)} y={candletop} width={candleWidth/2} height={height}/>
          <line className="wick" style={{ stroke:color,strokeMiterLimit:10}} x1={(candleWidth*i)+(candleWidth/4)} y1={wickbottom} x2={(candleWidth*i)+(candleWidth/4)} y2={wicktop}/>
          <rect className="time"  style={{ strokeMiterLimit:10}} 
                                  x={(candleWidth*i)} 
                                  y={0} 
                                  width={candleWidth} 
                                  height={200} 
                                  onMouseEnter={() => this.overCandle((coin.tsym === 'BTC') ? Number(candle.close).toFixed(8) : Number(candle.close).toFixed(2), coinIndex, candle.time)}
                                  onMouseLeave={() => this.overCandle( (coin.tsym === 'BTC') ? coin.current.price_btc : Number(coin.current.price).toFixed(2), coinIndex, '')} />
          <line className="timeline" style={{ strokeMiterLimit:10}} x1={(candleWidth*i)+(candleWidth/4)} y1={200} x2={(candleWidth*i)+(candleWidth/4)} y2={4}/>
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

      const symbol = (coin.tsym === 'USD') ? '$' : '฿' 

      return (
        <View className="coin" style={[styles.coinbox, {width: (this.state.deviceWidth > 1200) ? '33.33333333%':'100%'}]} key={coinIndex}>
          <View className={'coin-background '+((coin.current.percent_change_24h > 0) ? 'green' : 'red')} />
          <View className={'coin-gradient'} />
          <View style={[(coin.current.percent_change_24h > 0) ? styles.indicatorfire : styles.indicatorwatch]}></View>
          <View style={styles.squeezetimewrap}>
            {squeezetimes}
          </View>
          <View style={styles.boxbody}>
            <View style={styles.coininfo}>
              <View style={styles.coinname}>
                <Text style={styles.coinnametext}>{coin.fsym}</Text><Text style={styles.coinnamepairtext}>{'/'+coin.tsym}</Text>
              </View>
              <View style={styles.coinprice}>
                <Text style={styles.coinpricetext}>{symbol+((coin.coinprice === 0) ? (coin.tsym === 'BTC') ? coin.current.price_btc : formatCurrency(coin.current.price) : (coin.tsym === 'BTC') ? coin.coinprice : formatCurrency(coin.coinprice))}</Text>
                <Text style={styles.coinlabelright}>Last trade price</Text>
              </View>
            </View>
            <View style={styles.coininfo}>
              <View style={styles.coinpricechange}>
                <Text style={[styles.coinpricechangetext,{color:(coin.current.percent_change_24h > 0) ? '#48ea61' : '#df4b7a'}]}>{ ((coin.current.percent_change_24h > 0) ? '+' : '') + Number(coin.current.percent_change_24h).toFixed(2)+'%'}</Text>
                <Text style={styles.coinlabel}>24 hour price</Text>
              </View>
              <View style={styles.coinprice}>
                <Text style={styles.coinpricetext}>{'$'+formatCurrency(coin.current.volume).split('.')[0]}</Text>
                <Text style={styles.coinlabelright}>24 hour volume</Text>
              </View>
            </View>
            <View style={{width:'100%',height:'240px',flex: 1,flexDirection: 'row',position: 'relative'}}>
              <svg className="shadow chart" style={{position:'absolute', left:0, top:20, width:'100%', height:'100%'}}>{chart}</svg>
              {/* <svg style={{position:'absolute', left:0, top:20, width:'100%', height:'100%'}}>
                <polygon fill="none" stroke="white" points={lower + ',' + upper} />
              </svg> */}
            </View>
            <Text style={styles.text}>{'rank: '+ coin.current.rank}</Text>
          </View>
        </View>
      )
    })

    return (
      <View style={styles.box}>
        <View style={[styles.wrapper,{width: (this.state.deviceWidth+'px' ? this.state.deviceWidth+'px' : '1400px'),}]}>
          <View style={styles.header}>
            <Text style={styles.headertext}>Squeeze Watch</Text>
            <View style={styles.squeezetimewrap}>{globalsqueezetimes}</View>
          </View>
          <View style={styles.grid}>
            {griditems}
          </View>
        </View>
      </View>
    );
  }
}


const styles = StyleSheet.create({
  box: { 
    alignItems: 'center',
    padding: 20,
  },
  wrapper: {
    margin: '0 auto',
  },
  header: {
    padding: '10px'
  },
  headertext: {
    fontSize: '2em',
    textTransform: 'uppercase',
    fontStyle: 'italic',
    fontWeight: '700',
    letterSpacing: '3px',
    fontFamily: 'Exo 2'
  },
  grid: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  coinbox: {
    backgroundColor: 'rgba(242,266,247,0.07)',
    borderWidth:'10px',
    borderColor: '#15151e'
  },
  boxbody: {
    padding: '10px',
    
  },
  text: {
    fontSize: '0.9em',
    width: 'auto'
  },
  indicatorwatch: {
    height:'10px',
    backgroundColor: '#df4b7a'
  },
  indicatorfire: {
    height:'10px',
    backgroundColor: '#48ea61'
  },
  squeezetimewrap: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  squeezetime: {
    alignItems: 'center',
    width: '11.11111111%',
    padding: '4px',
  },
  squeezetimeselected:{
    alignItems: 'center',
    width: '11.11111111%',
    padding: '4px',
    borderBottomWidth:'2px',
    borderColor: 'white'
  },
  coininfo:{
    flex: 1,
    flexDirection: 'row',
  },
  coinname: {
    flex: 1, 
    flexDirection: 'row',
    width: '50%'
  },
  coinprice: {
    width: '50%',
  },
  coinpricechange: {
    width: '50%',
  },
  coinpricechangetext: {
    paddingTop: '5px',
    fontSize: '1.8em',
    fontFamily: 'Exo 2'
  },
  coinlabel: {
    fontSize: '0.7em',
    fontFamily: 'Exo 2'
  },
  coinlabelright: {
    fontSize: '0.7em',
    fontFamily: 'Exo 2',
    textAlign: 'right'
  },
  coinpricetext: {
    paddingTop: '5px',
    fontSize: '1.8em',
    fontFamily: 'Exo 2',
    fontWeight: '700',
    textAlign: 'right'


  },
  coinnametext: {
    fontSize: '3.2em',
    fontWeight: '700',
    width: 'auto',
    letterSpacing: '3px',
    display: 'inline-block',
    fontFamily: 'Exo 2'
  },
  coinnamepairtext: {
    paddingTop: '32px',
    fontSize: '1em',
    width: 'auto',
    display: 'inline-block',
    fontFamily: 'Exo 2'
  }
});

AppRegistry.registerComponent('App', () => App);
AppRegistry.runApplication('App', { rootTag: document.getElementById('root') });



// WEBPACK FOOTER //
// ./src/App.js