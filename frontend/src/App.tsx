import { useEffect, useState } from 'react';
import './App.css';
import Api from './api';

function App() {
  const [principal, setPrincipal] = useState<string>();

  useEffect(() => {
    async function doFetch() {
      const response = await fetch(Api.profile);
      const text = await response.text();
      setPrincipal(text);
    }
    void doFetch();
  }, []);

  return (
    <>
      <p>Welcome {principal}</p>
    </>
  );
}

export default App;
