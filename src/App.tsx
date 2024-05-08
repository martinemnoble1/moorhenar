
import React from 'react';

interface AppProps {

}
const App: React.FC<AppProps> = (props) => {
  const value = 'World';
  return <div>Hello to you my dear{value}</div>;
}

export default App;
