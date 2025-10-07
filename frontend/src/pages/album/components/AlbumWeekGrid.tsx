import { ChatWeek } from "@/utils/functions/getChatWeeks"
import { dateFormatOptionsShort } from "@/utils/styling/numFormatting";
import { useNavigate } from "react-router-dom";

export default function AlbumWeekGrid({ week } : { week: ChatWeek }) {
    const navigate = useNavigate();

    const toWeeklySummary = (week: ChatWeek) => navigate("/week", { state: { week } } )

    return (
        <div 
            className="flex flex-col gap-2 w-full lg:w-1/2 m-[1rem] p-[2rem] lg:p-[4rem] bg-red-50 rounded-lg hover:cursor-pointer hover:shadow-lg/30" 
            onClick={() => {toWeeklySummary(week)}}
        >
            <h2>{week.start.toLocaleDateString("en-US", dateFormatOptionsShort)} - {week.end.toLocaleDateString("en-US", dateFormatOptionsShort)} {week.end.getFullYear()}</h2>
            <div className="w-full aspect-square flex self-center">
                <div className="flex items-end bg-blue-200 size-full p-4">
                    <h1 className="text-white">
                        {week.sessions.length} Chat{week.sessions.length > 1 ? "s" : ""}
                    </h1>
                </div>
            </div>
            <div className="flex flex-row w-full gap-2 overflow-x-auto hidden-scrollbar">
                { week.sessions.map( (session, idx) => {
                    return (
                        <div key={idx} className="p-[2rem] bg-blue-100 aspect-square"> Image </div>
                    )
                })}
            </div>
        </div>
    )
}