import { useAuth } from "@/context/AuthProvider";
import { ChatWeek, getChatsInWeek } from "@/utils/functions/getChatWeeks";
import { blockStyle } from "@/utils/styling/sharedStyles";
import { Icon } from "@iconify/react/dist/iconify.js";

export default function MoodCard( { week } : { week: ChatWeek}) {
    const role = useAuth().profile.role.toLowerCase();
    const sessions = getChatsInWeek(week);

    const unflaggedStyle = "text-gray-400 align-middle";
    const flaggedStyle = "text-violet-600 align-middle";
    const emptyStyle = "size-[3rem] text-white rounded-full bg-white border-dashed border-2 border-gray-400"
    const emoteStyle = "size-[3rem] rounded-full"

    return (
        <div className={`${blockStyle}`}>
            <h2 className={`${role}-text mb-0`}>Mood Analysis</h2>
            <p className="text-lg mt-[1rem]">Here would be an analysis of {useAuth().profile.plwd.first_name}'s mood along with advice. </p>
            <div className="flex flex-row justify-between w-full">
                {sessions.map((day, idx) => {
                    return (
                        <div className="flex flex-col items-center" key={idx}>
                            <p className={day.sessions[0]?.sentiment == "Negative" ? flaggedStyle : unflaggedStyle}>{day.day}</p>
                            <div className={day.sessions.length > 0 ? emoteStyle : emptyStyle}>
                                {day.sessions.length > 0 ? getEmote(day.sessions[0]?.sentiment) : null}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

function getEmote(sentiment : string) {
    const icon = sentiment == "Positive" ? 
        "fluent-emoji:beaming-face-with-smiling-eyes" : sentiment == "Negative" ? 
            "fluent-emoji:confused-face" : sentiment == "Neutral" ? "fluent-emoji:face-with-diagonal-mouth"
            : "fluent-color:question-circle-48"
    
    return (
        <Icon icon={icon} width={"100%"} height={"100%"} />
    )
}