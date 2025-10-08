import { useAuth } from "@/context/AuthProvider";
import { ChatWeek } from "@/utils/functions/getChatWeeks";
import { dateFormatOptionsShort } from "@/utils/styling/numFormatting";
import { useLocation, useNavigate } from "react-router-dom";
import MyWordCloud from "../common/WordCloud";
import { ChatMessage, ChatSession } from "@/api";

export function WeekSummary() {
    const { state } = useLocation() as { state?: { week?: ChatWeek } };
    const navigate = useNavigate();
    if (!state?.week) { navigate("/chat"); };

    const { profile } = useAuth();
    const role = profile.role.toLowerCase();
    const chatWeek = state.week;
    const weeklyMessages = getWeeklyMessages(chatWeek);

    const toAlbum = () => navigate("/album");

    return (
        <div className="m-[1rem]">
            <div className="font-bold text-2xl justify-between hover:cursor-pointer" onClick={() => {toAlbum()}}>
                ← {chatWeek.start.toLocaleDateString("en-US", dateFormatOptionsShort)} - {chatWeek.end.toLocaleDateString("en-US", dateFormatOptionsShort)}
            </div>
            <div className="flex flex-col gap-[2rem] items-center mt-[2rem]">
                <TopicsCard messages={weeklyMessages} />
                <ChatSummaryCard />
                <button className="md:w-1/2 w-full px-[1rem] py-[0.5rem] bg-red-50 rounded-sm hover:bg-blue-200 hover:shadow-md items-center">
                    <span className="flex flex-row justify-between items-center">
                        <h4>Weekly Analysis</h4>
                        <h4>→</h4>
                    </span>
                </button>
            </div>
        </div>
    )
}

function TopicsCard( { messages } : { messages: ChatMessage[] } ) {
    return (
        <div className="rounded-lg w-full p-[2rem] md:w-1/2 bg-red-50 shadow-md shadow-gray-300">
            <h2 className="patient-text">Weekly Topics</h2>
            <p className="text-lg">The larger the font size, the more frequently you talked about it during chats.</p>
            <div className="h-fit w-4/5 place-self-center rounded-lg">
                <MyWordCloud messages={messages} />
            </div>
        </div>
    )
}

function ChatSummaryCard() {
    return (
        <div className="rounded-lg w-full p-[2rem] md:w-1/2 bg-red-50 shadow-md shadow-gray-300">
            <h2 className="patient-text">Weekly Chat Summary</h2>
            <p className="text-lg">To do: Add a summary of the weekly chats.</p>
        </div>
    )
}

/**
 * Gets the ChatMessages of every session in a ChatWeek
 * @param week The ChatWeek to get the messages of
 * @returns A 1-d array of all the chat messages for the week
 */
function getWeeklyMessages(week: ChatWeek) {
    var messages: ChatMessage[] = [];
    for (var i = 0; i < week.sessions.length; i++) {
        var session: ChatSession = week.sessions[i];
        for (var j = 0; j < session.messages.length; j++) {
            messages.push(session.messages[j]);
        }
    }
    return messages;
}