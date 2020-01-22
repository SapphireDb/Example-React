// import React, { Component, useEffect } from 'react';
// import { render } from 'react-dom';
// import './style.css';
// import { SapphireDb } from 'sapphiredb';
//
// class App extends Component {
//   constructor() {
//     super();
//     this.db = new SapphireDb({
//       apiSecret: 'pw1234',
//       apiKey: 'webapp',
//       useSsl: false,
//       serverBaseUrl: 'localhost:5000'
//     });
//
//     this.values = [];
//     // db.collection('demo.entries').values().subscribe((values) => {
//     //   this.values = values;
//     // });
//   }
//
//   render() {
//     useEffect(() => {
//       const subscription = this.db.collection('demo.entries').values().subscribe((values) => {
//         this.values = values;
//       });
//       return () => subscription.unsubscribe();
//     });
//
//     const listItems = this.values.map(v =>
//       <li key={v.id}>{v.content}</li>
//     );
//
//     return (
//       <div>
//         <h1>React demo</h1>
//         <ul>
//           {listItems}
//         </ul>
//       </div>
//     );
//   }
// }
//
// render(<App />, document.getElementById('root'));

import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { SapphireDb } from 'sapphiredb';

function App() {
  const [values, setValues] = useState();

  const db = new SapphireDb({
    apiSecret: 'pw1234',
    apiKey: 'webapp',
    useSsl: false,
    serverBaseUrl: 'localhost:5000'
  });

  useEffect(() => {
    const subscription = db.collection('demo.entries').values().subscribe(setValues);
    return () => subscription.unsubscribe();
  }, []);

  return (
      <div className="App">
        <h1>SapphireDb with React</h1>
        <ul>
          {values?.map(item => (
              <li>{item.content}</li>
          ))}
        </ul>
      </div>
  );
}

const rootElement = document.getElementById('root');
ReactDOM.render(<App />, rootElement);

