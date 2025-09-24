import { ChatWeek, groupSessionsByWeek } from "@/utils/functions/getChatWeeks"

export default function AlbumWeek({ week } : { week: ChatWeek }) {
    return (
        <div className="flex flex-col gap-4">
            <h2>{week.start.toISOString()}</h2>
            <div>Image here</div>
            <div>
                { week.sessions.map( (session, idx) => {
                    return (
                        <div> Image </div>
                    )
                })}
            </div>
        </div>
    )
}