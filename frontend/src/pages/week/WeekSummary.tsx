import { useAuth } from "@/context/AuthProvider";
import { ChatWeek, getWeeklyMessages } from "@/utils/functions/getChatWeeks";
import { dateFormatOptionsShort } from "@/utils/styling/numFormatting";
import { useLocation, useNavigate } from "react-router-dom";
import { TopicsCard } from "../common/TopicsCard";
import { blockStyle } from "@/utils/styling/sharedStyles";

export function WeekSummary() {
    const { state } = useLocation() as { state?: { chatWeek?: ChatWeek, albumDisplay: string } };
    const navigate = useNavigate();
    if (!state?.chatWeek) { navigate("/chat"); };

    const { profile } = useAuth();
    const role = profile.role.toLowerCase();
    const chatWeek = state.chatWeek;
    const weeklyMessages = getWeeklyMessages(chatWeek);

    const toAlbum = () => navigate("/album", {state: state?.albumDisplay});

    return (
        <div className="m-[1rem]">
            <div className="font-bold text-2xl justify-between hover:cursor-pointer" onClick={() => {toAlbum()}}>
                ← {chatWeek.start.toLocaleDateString("en-US", dateFormatOptionsShort)} - {chatWeek.end.toLocaleDateString("en-US", dateFormatOptionsShort)}
            </div>
            <div className="flex flex-col gap-[2rem] items-center mt-[2rem]">
                <TopicsCard messages={weeklyMessages} type="Weekly" />
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

function ChatSummaryCard() {
    return (
        <div className={blockStyle}>
            <h2 className="patient-text">Weekly Chat Summary</h2>
            <p className="text-lg">To do: Add a summary of the weekly chats.</p>
        </div>
    )
}