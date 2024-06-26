import { Button, Radio, Switch, ToggleButton } from '@mui/material';
//@ts-ignore
import { MyARCanvas } from './MyARCanvas'
import { MouseEventHandler, useMemo, useState } from 'react';
export const MyScene1 = ({ root }) => {

  return (<span></span>
  )
}

export const MyScene = ({ root }) => {

  return (
    <a-scene embedded arjs="trackingMethod: best; sourceType: webcam;debugUIEnabled: false;"
      renderer="antialias: true; logarithmicDepthBuffer: true;">
      <a-assets>
        <a-asset-item id="myModel" src="./data/downloadGLTF.gltf"></a-asset-item>
      </a-assets>
      <a-box position='0 0.5 0' material=' opacity: 0.5; '></a-box>
      <a-entity position='0 0.5 0' gltf-model="#myModel"></a-entity>
      <a-marker-camera smooth="true" smoothCount="10" smoothTolerance=".01" smoothThreshold="5"
        preset='hiro'></a-marker-camera>
      <a-entity text="value: Hello World;"></a-entity>
    </a-scene>
  )
}