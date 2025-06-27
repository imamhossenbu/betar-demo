// App.jsx
import React, { useContext } from 'react';
import AppRouter from './Router';
import { AuthContext } from './provider/AuthProvider';
import Loading from './components/Loading';

const App = () => {
  const { loading } = useContext(AuthContext);
  console.log('Auth loading state:', loading);


  // if (loading) return <Loading />;
  return <AppRouter />;
};

export default App;
