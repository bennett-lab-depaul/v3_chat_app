import { ChatWeek } from "@/utils/functions/getChatWeeks"

export default function AlbumWeekGrid({ week } : { week: ChatWeek }) {
    const options: Intl.DateTimeFormatOptions = {
        month: "short",
        day: "numeric",
    };

    return (
        <div className="flex flex-col gap-2 md:w-1/2 m-[1rem] p-[2rem] border-gray-400 border-b-2 border-solid">
            <h2>{week.start.toLocaleDateString("en-US", options)} - {week.end.toLocaleDateString("en-US", options)} {week.end.getFullYear()}</h2>
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
                        <div key={idx} className="p-4 bg-blue-100 aspect-square"> Image </div>
                    )
                })}
            </div>
        </div>
    )
}