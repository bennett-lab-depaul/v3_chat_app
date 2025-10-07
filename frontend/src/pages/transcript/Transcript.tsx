import { ChatSession } from "@/api";
import { useLocation, useNavigate } from "react-router-dom";

export function Transcript() {
    const { state } = useLocation() as { state?: { chatSession?: ChatSession } };
    if (!state?.chatSession) { useNavigate()("/chat"); };
    return (
        <div>
            TODO: transcript page
        </div>
    )
}