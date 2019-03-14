import React, { useState } from 'react';

const App = function() {
  // Declare a new state variable, which we'll call "count"

  const deviceWidth = '1400';

  const scales = [
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
  ];

  const [count, setCount] = useState(0);


  const [data, setData] = useState([]);
  const [allcoins, setAllcoins] = useState(0);
  const [current, setCurrent] = useState(0);

  const doCount = function(){
    setCount(count + 1)
  }

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => doCount()}>
        Click me
      </button>
    </div>
  );
}
export default App