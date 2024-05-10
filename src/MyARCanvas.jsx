import { AmbientLight, BoxGeometry, Mesh, MeshStandardMaterial, PointLight, Scene, Object3D } from "three"
import { ARCanvas, ARMarker } from "@artcom/react-three-arjs"
import { useRef, useState } from "react";
import { useFrame, useLoader } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const Model = () => {
    const gltf1 = useLoader(GLTFLoader, '/data/7bmg-redo-2.glb');
    const gltf2 = useLoader(GLTFLoader, '/data/7bmg-redo-1.glb');
    const gltf3 = useLoader(GLTFLoader, '/data/7bmg-masked.glb');
    const gltfs = [gltf1, gltf2, gltf3]
    const parent = new Object3D()
    const boundingBoxMiddle = [
        (gltf3.scene.children[0].geometry.boundingBox.min.x + gltf3.scene.children[0].geometry.boundingBox.max.x) / 2,
        (gltf3.scene.children[0].geometry.boundingBox.min.y + gltf3.scene.children[0].geometry.boundingBox.max.y) / 2,
        (gltf3.scene.children[0].geometry.boundingBox.min.z + gltf3.scene.children[0].geometry.boundingBox.max.z) / 2,
    ]
    console.log({ boundingBoxMiddle })
    gltfs.forEach(gltf => {
        gltf.scene.children.forEach(sceneChild => {
            sceneChild.geometry.translate(-boundingBoxMiddle[0], -boundingBoxMiddle[1], -boundingBoxMiddle[2])
            //console.log(sceneChild.geometry.computeBoundingBox)
        })
        parent.add(gltf.scene)
    })
    useFrame((frame) => {
        console.log(frame.clock.elapsedTime*1000 - frame.clock.oldTime)
        parent.rotateY((frame.clock.elapsedTime*1000 - frame.clock.oldTime)/100000)
    })

    return (
        <>
            <primitive object={parent} scale={0.1} />
        </>
    );
};


const Box = () => {
    const [selected, setSelected] = useState(false);

    return <mesh onClick={() => setSelected(!selected)}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={selected ? "yellow" : "hotpink"} />
    </mesh>
}

export const MyARCanvas = () => {
    return <ARCanvas
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
            type={"pattern"}
            patternUrl={"data/patt.hiro"}
            onMarkerFound={() => {
                console.log("Marker Found")
            }}>
            <Model />
        </ARMarker>
    </ARCanvas>
}
