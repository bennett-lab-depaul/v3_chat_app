import { ChatMessage, ChatSession } from "@/api";
import { useLocation, useNavigate } from "react-router-dom";
import MyWordCloud from "../common/WordCloud";
import { dateFormatOptions } from "@/utils/styling/numFormatting";
import { useAuth } from "@/context/AuthProvider";
import { TopicsCard } from "../common/TopicsCard";
import { colStyle } from "@/utils/styling/sharedStyles";

export function DaySummary() {
    const { state } = useLocation() as { state?: { chatSession?: ChatSession, albumDisplay: string } };
    const navigate = useNavigate();
    if (!state?.chatSession) { navigate("/chat"); };
    const chatDate = new Date(state.chatSession.date)
    const role = useAuth().profile.role.toLowerCase();
    const toAlbum = () => navigate("/album", {state: state?.albumDisplay});
    const toTranscript = () => navigate("/transcript", {state: {chatSession: state.chatSession, albumDisplay: state.albumDisplay}});

    function ChatSummaryCard() {
        return (
            <div className="rounded-lg w-full p-[2rem] sm:w-3/4 lg:w-1/2 bg-red-50 shadow-md shadow-gray-300">
                <h2 className={`${role}-text`}>Chat Summary</h2>
                <p className="text-lg">To do: Add a summary of the chat.</p>
                <button className={`${role}-button-outline w-full`} onClick={() => {toTranscript()}}> View Full Transcript </button>
            </div>
        )
    }

    function getSessionMessages(session: ChatSession) : ChatMessage[] {
        var messages: ChatMessage[] = [];
        for (var j = 0; j < session.messages.length; j++) {
            messages.push(session.messages[j]);
        }
        return messages;
    }

    
    return (
        <div className="m-[1rem]">
            <div className="font-bold text-2xl justify-between hover:cursor-pointer" onClick={() => {toAlbum()}}>
                ← {chatDate.toLocaleDateString("en-US", dateFormatOptions)}
            </div>
            <div className={colStyle}>
                <TopicsCard messages={getSessionMessages(state?.chatSession)} type="Daily" />
                <ChatSummaryCard />
                <button className="sm:w-3/4 lg:w-1/2 w-full px-[1rem] py-[0.5rem] bg-red-50 rounded-sm hover:bg-blue-200 hover:shadow-md items-center">
                    <span className="flex flex-row justify-between items-center">
                        <h4>Speech Analysis</h4>
                        <h4>→</h4>
                    </span>
                </button>
                <button className={`${role}-button sm:w-3/4 lg:w-1/2`}>
                    Download as PDF
                </button>
            </div>
        </div>
    )
}