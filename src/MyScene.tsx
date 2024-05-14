import { Button, Radio, Switch, ToggleButton } from '@mui/material';
//@ts-ignore
import { MyARCanvas } from './MyARCanvas'
import { MouseEventHandler, useMemo, useState } from 'react';
interface MySceneProps {
    root: string;
}
export const MyScene: React.FC<MySceneProps> = ({ root }) => {

    return <>
        <MyARCanvas {...{ root, display:['target'] }} />
    </>
}