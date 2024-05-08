import { AmbientLight, BoxGeometry, Mesh, MeshStandardMaterial, PointLight } from "three"
import { ARCanvas, ARMarker } from "@artcom/react-three-arjs"

function Box() {
    return (
        <mesh
            onClick={e => {
                window.alert("click")
                console.log(e)
            }}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color={"hotpink"} />
        </mesh>
    )
}

export const MyARCanvas = (props) => {
    return <ARCanvas
        camera={{ position: [0, 0, 0] }}
        onCreated={({gl}) => {
            gl.setSize(window.innerWidth, window.innerHeight)
        }}>
        <ambientLight />
        <pointLight position={[10, 10, 0]} />
        <ARMarker
            type={"pattern"}
            patternUrl={"data/hiro.patt"}>
        </ARMarker>
    </ARCanvas>
}
