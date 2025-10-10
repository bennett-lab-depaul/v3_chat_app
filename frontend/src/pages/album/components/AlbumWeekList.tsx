import { ChatSession } from "@/api";
import { useAuth } from "@/context/AuthProvider";
import { ChatWeek } from "@/utils/functions/getChatWeeks"
import { dateFormatOptionsShort } from "@/utils/styling/numFormatting";
import { useNavigate } from "react-router-dom";

export default function AlbumWeekList({ week } : { week: ChatWeek }) {
    const role = useAuth().profile.role.toLowerCase();
    const navigate = useNavigate();
    const toWeeklySummary = (week: ChatWeek) => navigate("/week", { state: { chatWeek: week, albumDisplay: "list" } } )
    const toDaySummary = (session: ChatSession) => navigate("/day", { state: { chatSession: session, albumDisplay: "list" } } )

    const SessionCard = ( {session} : {session: ChatSession } ) => {
        const date = new Date(session.date);
        return (
            <div className="flex flex-row gap-2 rounded-md bg-red-50 shadow-md hover:cursor-pointer hover:shadow-lg/30"
            onClick={() => {toDaySummary(session)}}>
                <div className="bg-blue-200 p-10 overflow-hidden rounded-l-md">Image</div>
                <div className="flex flex-col w-full p-[1rem]">
                    <div className="flex justify-between w-full">
                        <b>{date.toLocaleDateString("en-US", {month: "short", day: "numeric"})}</b>
                        <p className="">{session.duration / 60} minutes</p>
                    </div>
                    <div className={`${role}-text font-bold text-xl`}>
                        {session.topics}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-4 w-full sm:w-3/4 lg:w-1/2 m-[1rem] p-[2rem] border-gray-400">
            <a className="underline hover:cursor-pointer text-3xl text-black font-bold" onClick={() => {toWeeklySummary(week)}}>
                {week.start.toLocaleDateString("en-US", dateFormatOptionsShort)} - {week.end.toLocaleDateString("en-US", dateFormatOptionsShort)} {week.end.getFullYear()}
            </a>
            <div className="grid grid-rows-1 w-full gap-4">
                { week.sessions.map( (session, idx) => {
                    return (
                        <SessionCard key={idx} session={session} />
                    )
                })}
            </div>
        </div>
    )
}