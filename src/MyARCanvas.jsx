import { AmbientLight, BoxGeometry, Mesh, MeshStandardMaterial, PointLight, Scene, Object3D, Vector3, Matrix4, Quaternion } from "three"
import { ARCanvas, ARMarker } from "@artcom/react-three-arjs"
import { createRef, forwardRef, useCallback, useMemo, useRef, useState } from "react";
import { useFrame, useLoader } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { InputLabel, Radio, FormGroup, FormControl, FormControlLabel, Toolbar, Button } from "@mui/material";
import { Download } from "@mui/icons-material";
import { doDownload } from "./utils";
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
    const boundingBox = targetGLTF.scene.children[0].geometry.boundingBox
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
    console.log({ boundingBoxMiddle })
    parent.translateOnAxis(boundingBoxMiddle, -1.0)
    parent.translateOnAxis(new Vector3(0., 1., 0.), 1.0 * (boundingBox.max.y - boundingBox.min.y))

    const scale = 0.05
    const m = new Matrix4();
    m.makeScale(scale, scale, scale)
    parent.applyMatrix4(m)

    parent.castShadow = true
    //parent.translateOnAxis(new Vector3(1.,0.,0.), -1.0/scale)
    return <primitive ref={ref} object={shell} scale={1.0} />
});


const Box = () => {
    const [selected, setSelected] = useState(false);
    const boxGLTF = useLoader(GLTFLoader, `/data/MultiUVTest.glb`);
    //boxGLTF.scene.translateY(0.5)
    console.log({ boxGLTF })
    const boxAndArrows = new Object3D()
    boxAndArrows.add(boxGLTF.scene)
    for (let axis of [[3, .2, .2], [0.2, 3, 0.2], [0.2, 0.2, 3]]) {
        const xArrowsMesh = new Mesh()
        xArrowsMesh.material = new MeshStandardMaterial({ color: "#FF9999" })
        xArrowsMesh.geometry = new BoxGeometry(axis[0], axis[1], axis[2])
        xArrowsMesh.translateOnAxis(axis, 0.5)
        console.log(xArrowsMesh)
        boxAndArrows.add(xArrowsMesh)
    }
    return <primitive object={boxAndArrows} scale={1.0} position={[0, 0, 0]} />
    {/*
    <mesh onClick={() => setSelected(!selected)}>
        <boxGeometry args={[0.1, 1, 1]} />
        <meshStandardMaterial color={selected ? "yellow" : "hotpink"} />
    </mesh>
 */}
}
function Box1() {
    const [selected, setSelected] = useState(false);

    return (
        <mesh onClick={() => setSelected(!selected)}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color={selected ? "yellow" : "hotpink"} />
        </mesh>
    );
}

export const MyARCanvas = (props) => {
    const [display, setDisplay] = useState(['target'])
    const modelRef = useRef(null)

    const theModel = useMemo(() => {
        console.log(window.innerWidth , window.devicePixelRatio , window.innerHeight , window.devicePixelRatio)
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

    const handleDownload = useCallback(() => {
        // Instantiate a exporter
        const exporter = new GLTFExporter();

        // Parse the input and generate the glTF output
        exporter.parse(
            modelRef.current,
            // called when the gltf has been generated
            function (gltf) {

                console.log(gltf);
                doDownload(JSON.stringify(gltf))
                //downloadJSON(gltf);

            },
            // called when there is an error in the generation
            function (error) {

                console.log('An error happened');

            },
            //options
        )

    }, [theModel])

    return <>
        <Toolbar sx={{ backgroundColor: '#fff5' }}>
            {['target', 'map', 'drug', 'surface'].map(objectName =>

                <FormControl key={objectName}>
                    <FormControlLabel control={<Radio
                        checked={display.includes(objectName)}
                        onClick={handleToggle} name={objectName}
                    />}
                        label={objectName}
                    />
                </FormControl>
            )}
            <Button onClick={handleDownload}><Download /></Button>
        </Toolbar>

        <ARCanvas
            key={JSON.stringify(display)}
            //canvasWidth={window.innerWidth}
            //canvasHeight={window.innerHeight}
            //arEnabled={false}
            gl={{ antialias: true, powerPreference: "default" }}
            onCameraStreamReady={(a) => console.log("Camera stream ready", a)}
            onCameraStreamError={() => console.error("Camera stream error")}
            onCreated={({ gl }) => {
                //gl.setSize(window.innerWidth * window.devicePixelRatio , window.innerHeight * window.devicePixelRatio)
            }}
        //onCameraStreamReady={() => console.log("Camera stream ready")}
        //onCameraStreamError={() => console.error("Camera stream error")}
        sourceType={"webcam"}
        >
            <ambientLight />
            <pointLight position={[10, 10, 0]} intensity={1.0} />
            <ARMarker
                debug={true}
                params={{ smooth: true }}
                smoothCount={3}
                smoothTolerance={0.005}

                type={"pattern"} //['pattern', 'barcode', 'unknown' ]
                //barcodeValue={6}
                patternUrl={"data/patt.hiro"}
                onMarkerFound={() => {
                    console.log("Marker Found")
                }}
            >
                <Box />
                {theModel}
            </ARMarker>
        </ARCanvas>

        {/*<ARCanvas
    onCameraStreamReady={() => console.log("Camera stream ready")}
    onCameraStreamError={() => console.error("Camera stream error")}
    sourceType={"webcam"}
  >
    <ambientLight />
    <pointLight position={[10, 10, 0]} intensity={10.0} />
    <ARMarker
      debug={true}
      params={{ smooth: true }}
      type={"pattern"}
      patternUrl={"data/patt.hiro"}
      onMarkerFound={() => {
        console.log("Marker Found");
      }}
    >
      <Box1 />
    </ARMarker>
  </ARCanvas>
  */}
    </>
}
