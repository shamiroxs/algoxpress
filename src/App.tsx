// App.tsx
import { Routes } from './app/routes';
import { ScrollToTop } from './ScrollToTop';
import { useEffect } from 'react';
import { getAnonymousUserId } from './utils/anonymousIdentity';
import './App.css'; 

function App() {
  useEffect(() => {
    // Ensure anonymous identity is initialized
    getAnonymousUserId();
  }, []);

  return (
    <>
      <ScrollToTop />
      <Routes />
    </>
  );
}

export default App;
