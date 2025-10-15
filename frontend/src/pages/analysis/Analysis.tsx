import { useChatSessions } from "@/hooks/queries/useChatSessions";
import { getCurrentWeek, getWeeklyMessages, groupSessionsByWeek } from "@/utils/functions/getChatWeeks"
import { getCognitiveScore } from "@/utils/functions/getCognitiveScore";
import CircularProgress from "./components/CircularProgress";
import { useAuth } from "@/context/AuthProvider";

import { TbArrowBigDown, TbArrowBigUp } from "react-icons/tb";
import { TopicsCard } from "../common/TopicsCard";
import { blockStyle, colStyle } from "@/utils/styling/sharedStyles";

export function Analysis() {
    const role = useAuth().profile.role.toLowerCase();
    const { data: sessions, isLoading } = useChatSessions();
    if (isLoading) { 
        return <p>Loading...</p>; 
    }
    const weeks = groupSessionsByWeek(sessions);
    const currentWeek = weeks.length ? weeks[weeks.length - 1] : null;
    const prevWeek = weeks.length > 1 ? weeks[weeks.length - 2] : null;

    const curScore = getCognitiveScore(currentWeek);
    const prevScore = getCognitiveScore(prevWeek);
    const scoreDiff = prevScore ? curScore - prevScore : 0;

    const weeklyMessages = getWeeklyMessages(currentWeek);

    return (
        <div className="m-[1rem]">
             <div className="font-bold text-2xl md:hidden">
                Analysis
            </div>
            <div className={colStyle}>
                <div className={blockStyle}>
                    <h2 className="patient-text">General Cognitive Status</h2>
                    <p className="text-lg text-gray-600 mb-[0rem]">An average score calculated by adding up all signs.</p>
                    <div className="flex flex-row gap-4">
                        <div className="flex flex-col">
                            <div className="min-h-[250px] h-full w-full">
                                <CircularProgress score={curScore} />
                            </div>
                            {prevWeek ? 
                            <span className="p-2 mt-[-2rem] border-2 border-solid border-gray-300 rounded-full flex flex-row justify-center items-center">
                                Compared to last week: 
                                {scoreDiff >= 0 ? <TbArrowBigUp color={"green"} size={"1rem"} /> : <TbArrowBigDown color={"red"} size={"1rem"} />} 
                                {scoreDiff}
                            </span> : null}
                            
                        </div>
                        <div className="flex flex-col justify-center gap-2 text-lg">
                            <b>Fairly Good</b>
                            <p>2 signs flagged</p>
                            <p>1 factor impact</p>
                            <button className={`${role}-button`}>Check Details</button>
                        </div>
                    </div>
                </div>
                <TopicsCard messages={weeklyMessages} type="Weekly" />
                <div className={blockStyle}>
                    Here would be a card detailing biomarkers that need attention.
                </div>         
            </div>
        </div>
    )
}