import { useChatSessions } from "@/hooks/queries/useChatSessions";
import { getCurrentWeek, getWeeklyMessages, groupSessionsByWeek } from "@/utils/functions/getChatWeeks"
import { getCognitiveScore } from "@/utils/functions/getCognitiveScore";
import CircularProgress from "./components/CircularProgress";
import { useAuth } from "@/context/AuthProvider";

import { TbArrowBigDown, TbArrowBigUp } from "react-icons/tb";
import { TopicsCard } from "../common/TopicsCard";
import { blockStyle, colStyle } from "@/utils/styling/sharedStyles";
import BiomarkerCard from "./components/BiomarkerCard";
import { averageScore, getExemplarDays, getFlaggedDays } from "@/utils/misc/scores";

export function Analysis() {
    const role = useAuth().profile.role.toLowerCase();
    const { data: sessions, isLoading } = useChatSessions();
    if (isLoading) { 
        return <p>Loading...</p>; 
    }
    const weeks = groupSessionsByWeek(sessions);
    const currentWeek = weeks.length ? weeks[weeks.length - 1] : null;
    const prevWeek = weeks.length > 1 ? weeks[weeks.length - 2] : null;
    const avg = averageScore(currentWeek.sessions);

    const curScore = getCognitiveScore(currentWeek);
    const prevScore = getCognitiveScore(prevWeek);
    const scoreDiff = prevScore ? curScore - prevScore : 0;

    const weeklyMessages = getWeeklyMessages(currentWeek);

    const getPerformance = (score: number) : string => {
        if (score <= 0.30) {
            return "Poor";
        } else if (score <= 0.5) {
            return "Fair";
        } else if (score <= 0.75) {
            return "Good";
        } else {
            return "Excellent";
        }
    }

    return (
        <div className={colStyle}>
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
            <TopicsCard messages={weeklyMessages} type="Weekly" role={role} />
            <p id="factors" className="h-0 w-0"/>
            {Object.entries(avg).map((entry, idx) => {
                if (entry[1] <= 0.5 || entry[1] > 0.75) {
                    const flagged = getFlaggedDays(currentWeek.sessions, entry[0])
                    const exemplar = getExemplarDays(currentWeek.sessions, entry[0])
                    const performance = getPerformance(entry[1]);
                    return (
                        <BiomarkerCard key={idx} biomarker={entry[0]} week={currentWeek} flaggedDays={flagged} exemplarDays={exemplar} performance={performance} />
                    )
                } else {
                    return null;
                }
            })}
        </div>
    )
}