import { PerspectiveCamera  } from "@react-three/drei";
import { Canvas             } from "@react-three/fiber";

import Model from "./Model"
import { useState } from "react";

// Avatar Model
export default function Avatar( { animation }) {
    return (
        <div className="h-full w-full">
            <Canvas>
                <PerspectiveCamera makeDefault position={[0,  0, 10]} fov={50} />
                <directionalLight              position={[0, 10, 10]} intensity={5} />
                <Model animation={animation} />
            </Canvas>
        </div>
    );
}
