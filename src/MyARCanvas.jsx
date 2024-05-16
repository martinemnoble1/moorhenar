import { AmbientLight, BoxGeometry, Mesh, MeshStandardMaterial, PointLight, Scene, Object3D, Vector3, Quaternion } from "three"
import { ARCanvas, ARMarker } from "@artcom/react-three-arjs"
import { createRef, forwardRef, useCallback, useMemo, useRef, useState } from "react";
import { useFrame, useLoader } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { InputLabel, Radio, FormGroup, FormControl, FormControlLabel } from "@mui/material";

const Model = forwardRef((props, ref) => {
    const targetGLTF = useLoader(GLTFLoader, `/data/${props.root}-target.glb`);
    targetGLTF.scene.name = 'target'
    const drugGLTF = useLoader(GLTFLoader, `/data/${props.root}-drug.glb`);
    drugGLTF.scene.name = 'drug'
    const surfaceGLTF = useLoader(GLTFLoader, `/data/${props.root}-surface.glb`);
    surfaceGLTF.scene.name = 'surface'
    const mapGLTF = useLoader(GLTFLoader, `/data/${props.root}-map.glb`);
    mapGLTF.scene.name = 'map'
    const gltfs = []
    const lastFrameTime = useRef(0)

    if (props.display.includes("target")) { gltfs.push(targetGLTF) }
    if (props.display.includes("drug")) { gltfs.push(drugGLTF) }
    if (props.display.includes("surface")) { gltfs.push(surfaceGLTF) }
    if (props.display.includes("map")) { gltfs.push(mapGLTF) }
    console.log(gltfs)

    const shell = new Object3D()
    const parent = new Object3D()
    shell.add(parent)
    const boundingBoxMiddle = new Vector3(
        (drugGLTF.scene.children[0].geometry.boundingBox.min.x + drugGLTF.scene.children[0].geometry.boundingBox.max.x) / 2,
        (drugGLTF.scene.children[0].geometry.boundingBox.min.y + drugGLTF.scene.children[0].geometry.boundingBox.max.y) / 2,
        (drugGLTF.scene.children[0].geometry.boundingBox.min.z + drugGLTF.scene.children[0].geometry.boundingBox.max.z) / 2,
    )
    gltfs.forEach(gltf => {
        //console.log('translating', gltf)
        //gltf.scene.children[0].geometry.position = new Vector3(-boundingBoxMiddle[0], -boundingBoxMiddle[1], -boundingBoxMiddle[2])
        //translate(-boundingBoxMiddle[0], -boundingBoxMiddle[1], -boundingBoxMiddle[2])
        parent.add(gltf.scene)
    })

    useFrame((frame) => {
        shell.rotateY((frame.clock.elapsedTime - lastFrameTime.current))
        //rotation.w += (frame.clock.elapsedTime - lastFrameTime.current)
        lastFrameTime.current = frame.clock.elapsedTime
    })
    const scale = 0.1
    console.log({ boundingBoxMiddle })
    parent.translateOnAxis(boundingBoxMiddle, -1.0)

    return <primitive ref={ref} object={shell} scale={scale} />
});


const Box = () => {
    const [selected, setSelected] = useState(false);

    return <mesh onClick={() => setSelected(!selected)}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={selected ? "yellow" : "hotpink"} />
    </mesh>
}

export const MyARCanvas = (props) => {
    const [display, setDisplay] = useState(['target'])
    const modelRef = useRef(null)

    const theModel = useMemo(() => {
        return <Model ref={modelRef} root={props.root} display={display} />
    }, [props.root, display])

    const showTarget = useMemo(() => {
        return display.includes('target')
    }, [display])

    const handleToggle = useCallback(async (ev) => {
        //setDisplay([])
        console.log('theModel', theModel, modelRef)

        //console.log(theModel.getAttribute('scale'))
        if (display.includes(ev.target.name)) {
            setDisplay(display.filter(item => item !== ev.target.name))
        }
        else {
            setDisplay([...display, ev.target.name])
        }

    }, [theModel])

    return <>
        {['target', 'drug', 'surface', 'map'].map(objectName =>

            <FormControl key={objectName}>
                <FormControlLabel control={<Radio
                    checked={display.includes(objectName)}
                    onClick={handleToggle} name={objectName}
                />}
                    label={objectName}
                />
            </FormControl>
        )}
        <ARCanvas
            key={JSON.stringify(display)}
            //arEnabled={false}
            gl={{ antialias: true, powerPreference: "default", physicallyCorrectLights: false }}
            onCameraStreamReady={() => console.log("Camera stream ready")}
            onCameraStreamError={() => console.error("Camera stream error")}
            onCreated={({ gl }) => {
                gl.setSize(window.innerWidth, window.innerHeight)
            }}>
            <ambientLight />
            <pointLight position={[10, 10, 0]} intensity={1.0} />
            <ARMarker
                params={{ smooth: true }}
                type={"pattern"} //['pattern', 'barcode', 'unknown' ]
                //barcodeValue={6}
                patternUrl={"data/patt.hiro"}
                onMarkerFound={() => {
                    console.log("Marker Found")
                }}>
                {theModel}
            </ARMarker>
        </ARCanvas>
    </>
}
