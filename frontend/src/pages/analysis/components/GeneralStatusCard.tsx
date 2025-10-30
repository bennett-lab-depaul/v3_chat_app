import { ChatWeek } from "@/utils/functions/getChatWeeks";
import { blockStyle } from "@/utils/styling/sharedStyles";
import CircularProgress from "./CircularProgress";
import { TbArrowBigDown, TbArrowBigUp } from "react-icons/tb";
import { useAuth } from "@/context/AuthProvider";
import { getCognitiveScore } from "@/utils/functions/getCognitiveScore";

export default function GeneralStatusCard( {currentWeek, prevWeek} : {currentWeek: ChatWeek, prevWeek: ChatWeek} ) {
    const role = useAuth().profile.role.toLowerCase();

    const curScore = getCognitiveScore(currentWeek);
    const prevScore = getCognitiveScore(prevWeek);
    const scoreDiff = prevScore ? curScore - prevScore : 0;
    
    return (
         <div className={blockStyle}>
            <h2 className={`${role}-text`}>General Cognitive Status</h2>
            <p className="text-lg text-gray-600 mb-[0rem]">An average score calculated by adding up all signs.</p>
            <div className="flex flex-row ml-[-1rem]">
                <div className="flex flex-col">
                    <div className="min-h-[250px] h-full w-full">
                        <CircularProgress score={curScore} role={role} />
                    </div>
                    {prevWeek ? 
                    <span className="p-2 mt-[-2rem] gap-2 border-2 border-solid border-gray-300 rounded-full flex flex-row justify-center items-center mx-[1rem]">
                        Compared to last week: 
                        {scoreDiff >= 0 ? 
                            <TbArrowBigUp color={"green"} size={"1rem"} /> : 
                            <TbArrowBigDown color={"red"} size={"1rem"} />} 
                        {scoreDiff}
                    </span> : null}
                    
                </div>
                <div className="flex flex-col justify-center gap-2 text-lg w-full">
                    <b>Fairly Good</b>
                    <p>2 signs flagged</p>
                    <p>1 factor impact</p>
                    <button className={`${role}-button p-2 text-lg rounded-md`}
                    onClick={() => document.getElementById('factors')?.scrollIntoView()}>Check Details</button>
                </div>
            </div>
        </div>
    )
}