import { BiomarkerType, ChatSession } from "@/api";
import { useAuth } from "@/context/AuthProvider";
import { getBiomarkerDefinition, getBiomarkerDescription, getBiomarkerExemplar, getBiomarkerFlagged, getBiomarkerName } from "@/utils/misc/descriptions";
import { blockStyle } from "@/utils/styling/sharedStyles";
import { useState } from "react";

import { HiMiniSpeakerWave } from "react-icons/hi2";
import { IoShieldCheckmarkOutline, IoFlag } from "react-icons/io5";
import ChatExample from "./ChatExample";
import { dateFormatOptionsShort } from "@/utils/styling/numFormatting";
import { useNavigate } from "react-router-dom";

export default function BiomarkerCard({
    biomarker, 
    flaggedDays, 
    exemplarDays, 
    performance 
} : {
    biomarker: BiomarkerType, 
    flaggedDays: ChatSession[], 
    exemplarDays: ChatSession[], 
    performance: string
}) {
    const role = useAuth().profile.role.toLowerCase();
    const navigate = useNavigate();
    const [example, setExample] = useState<string>("exemplar")

    const toDaySummary = (session: ChatSession) => navigate("/day", { state: { chatSession: session, albumDisplay: "grid" } } )

    return (
        <div className={`${blockStyle} flex flex-col`}>
            <h2 className={`${role}-text mb-0`}>{getBiomarkerDescription(biomarker)}</h2>
            <h5 className={`${role}-text font-normal text-lg mb-0`}>({getBiomarkerName(biomarker)})</h5>
            <p>{getBiomarkerDefinition(biomarker)}</p>
            <h3 className={`${role}-text`}>Example</h3>
            <p>An example of good (exemplar) and bad (flagged) {getBiomarkerDescription(biomarker).toLowerCase()} ({getBiomarkerName(biomarker)}).</p>
            <span className="flex flex-row justify-between">
                <div className="flex flex-row gap-0">
                    <button className={`${role}-button${example == "exemplar" ? "" : "-outline"} p-2 rounded-l-md flex flex-row items-center`} 
                        onClick={() => setExample("exemplar")}> <IoShieldCheckmarkOutline size={"2rem"} /> Exemplar</button>
                    <button className={`${role}-button${example == "flagged" ? "" : "-outline"} p-2 rounded-r-md flex flex-row items-center`} 
                        onClick={() => setExample("flagged")}> <IoFlag size={"2rem"} /> Flagged</button>
                </div>
                <button className={`${role}-button-outline rounded-md p-2`}><HiMiniSpeakerWave size={"2rem"} /></button>
            </span>
            <div className="text-lg my-[1rem]">
                <ChatExample messages={example == "exemplar" ? getBiomarkerExemplar(biomarker) : getBiomarkerFlagged(biomarker)} />
            </div>
            <div className="text-lg border-t border-solid border-gray-300 py-2">
                <p><b>Your Performance</b></p>
                <ul className={`list-disc marker:text-${role == "patient" ? "green" : "violet"}-600`}>
                    <li><p>This past week: <b>{performance}</b></p></li>
                    <li>
                        <p><b>Good days:</b> 
                        {exemplarDays.map((day, idx) => {
                            return <button 
                                    className={`${role}-text px-2 underline`}
                                    key={idx}
                                    onClick={() => {toDaySummary(day)}}
                                >
                                    {new Date(day.date).toLocaleDateString("en-US", dateFormatOptionsShort)}
                                </button>
                        })}
                        </p>
                    </li>
                    <li>
                        <p><b>Bad days:</b> 
                        {flaggedDays.map((day, idx) => {
                            return <button 
                                    className={`${role}-text px-2 underline`}
                                    key={idx}
                                    onClick={() => {toDaySummary(day)}}
                                >
                                    {new Date(day.date).toLocaleDateString("en-US", dateFormatOptionsShort)}
                                </button>
                        })}
                        </p>
                    </li>
                </ul>
            </div>
        </div>
    )
}