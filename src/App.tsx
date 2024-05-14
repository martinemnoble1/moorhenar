
import React from 'react';
//@ts-ignore
import { MyARCanvas } from './MyARCanvas';
import { Button } from '@mui/material'
import { createBrowserRouter, RouterProvider, Link, Outlet } from 'react-router-dom'
import { MyScene } from './MyScene';

interface AppProps {

}
const App: React.FC<AppProps> = (props) => {
  const value = 'World';
  return <RouterProvider router={mainRouter}></RouterProvider>
}

const mainRouter = createBrowserRouter([
  {
    path: '', element: <MyScene root="7bmg" />, children: [
      {
        path: '7bmg', element: <MyScene root="7bmg" />,
      },
    ]
  }])

export default App;
