
import React from 'react';
//@ts-ignore
import { MyARCanvas } from './MyARCanvas';
import {Button} from '@mui/material'

interface AppProps {

}
const App: React.FC<AppProps> = (props) => {
  const value = 'World';
  return <>
    <Button>Press</Button>
    <MyARCanvas />
  </>
}

export default App;
