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

