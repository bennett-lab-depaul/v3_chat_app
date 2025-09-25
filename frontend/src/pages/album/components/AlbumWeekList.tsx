import { ChatSession } from "@/api";
import { useAuth } from "@/context/AuthProvider";
import { ChatWeek } from "@/utils/functions/getChatWeeks"

export default function AlbumWeekList({ week } : { week: ChatWeek }) {
    const options: Intl.DateTimeFormatOptions = {
        month: "short",
        day: "numeric",
    };

    return (
        <div className="flex flex-col gap-2 md:w-1/2 m-[1rem] p-[2rem] border-gray-400 border-b-2 border-solid">
            <h2>{week.start.toLocaleDateString("en-US", options)} - {week.end.toLocaleDateString("en-US", options)} {week.end.getFullYear()}</h2>
            <div className="grid grid-rows-1 w-full gap-2">
                { week.sessions.map( (session, idx) => {
                    return (
                        <SessionCard key={idx} session={session} />
                    )
                })}
            </div>
        </div>
    )
}

const SessionCard = ( {session} : {session: ChatSession } ) => {
    const { profile } = useAuth();
    const date = new Date(session.date);
    return (
        <div className="flex flex-row gap-2 border-black border-1 border-solid rounded-md">
            <div className="bg-blue-200 p-10 overflow-hidden rounded-l-md">Image</div>
            <div className="flex flex-col w-full p-[1rem]">
                <div className="flex justify-between w-full">
                    <b>{date.toLocaleDateString("en-US", {month: "short", day: "numeric"})}</b>
                    <p className="">{session.duration / 60} minutes</p>
                </div>
                <div className={profile.role.toLowerCase() + "-text font-extrabold text-xl"}>
                    {session.topics}
                </div>
            </div>
        </div>
    )
}