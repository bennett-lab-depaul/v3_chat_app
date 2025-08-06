import { PerspectiveCamera  } from "@react-three/drei";
import { Canvas             } from "@react-three/fiber";

import Model2 from "./Model2";
import Model3 from "./Model3";
import { useState } from "react";

// Avatar Model
export default function Avatar() {
    const [animation, setAnimation] = useState('SHAKE NO');
    return (
        <div className="h-full w-full">
            <Canvas>
                <PerspectiveCamera makeDefault position={[0,  0, 10]} fov={50} />
                <directionalLight              position={[0, 10, 10]} intensity={5} />
                <Model3 animation={animation} setAnimation={setAnimation}/>
            </Canvas>
            <button className="p-4 border-1">Click me to cycle animation!</button>
        </div>
    );
}
