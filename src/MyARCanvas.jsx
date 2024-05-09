import { AmbientLight, BoxGeometry, Mesh, MeshStandardMaterial, PointLight, Scene, Object3D } from "three"
import { ARCanvas, ARMarker } from "@artcom/react-three-arjs"
import { useRef, useState } from "react";
import { useLoader } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const Model = () => {
    const gltf = useLoader(GLTFLoader, '/data/1hck-1.glb');
    const parent = new Object3D()
    parent.add(gltf.scene)
    console.log(gltf.scene.children[0].geometry.boundingBox)
    const boundingBoxMiddle = [
        (gltf.scene.children[0].geometry.boundingBox.min.x + gltf.scene.children[0].geometry.boundingBox.max.x) / 2,
        (gltf.scene.children[0].geometry.boundingBox.min.y + gltf.scene.children[0].geometry.boundingBox.max.y) / 2,
        (gltf.scene.children[0].geometry.boundingBox.min.z + gltf.scene.children[0].geometry.boundingBox.max.z) / 2,
    ]
    console.log({ boundingBoxMiddle })
    gltf.scene.children.forEach(sceneChild=>{
        sceneChild.geometry.translate(-boundingBoxMiddle[0], -boundingBoxMiddle[1], -boundingBoxMiddle[2])
        //console.log(sceneChild.geometry.computeBoundingBox)
    })
    parent.add(gltf.scene)
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
            <Model />
        </ARMarker>
    </ARCanvas>
}
