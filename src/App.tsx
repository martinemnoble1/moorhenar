
import React from 'react';
//@ts-ignore
import { MyARCanvas } from './MyARCanvas';

interface AppProps {

}
const App: React.FC<AppProps> = (props) => {
  const value = 'World';
  return <>
    <div>Hello to you my dear{value}</div>
    <MyARCanvas />
  </>
}

export default App;
