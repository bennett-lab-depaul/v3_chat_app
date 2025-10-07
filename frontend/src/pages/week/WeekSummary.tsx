import { useAuth } from "@/context/AuthProvider";
import { ChatWeek } from "@/utils/functions/getChatWeeks";
import { dateFormatOptionsShort } from "@/utils/styling/numFormatting";
import { useLocation, useNavigate } from "react-router-dom";

export function WeekSummary() {
    const { state } = useLocation() as { state?: { week?: ChatWeek } };
    const navigate = useNavigate();
    if (!state?.week) { navigate("/chat"); };

    const { profile } = useAuth();
    const role = profile.role.toLowerCase();
    const chatWeek = state.week;

    const toAlbum = () => navigate("/album");

    return (
        <div className="m-[1rem]">
            <div className="font-bold text-2xl justify-between hover:cursor-pointer" onClick={() => {toAlbum()}}>
                ← {chatWeek.start.toLocaleDateString("en-US", dateFormatOptionsShort)} - {chatWeek.end.toLocaleDateString("en-US", dateFormatOptionsShort)}
            </div>
            <div className="flex flex-col gap-[2rem] items-center mt-[2rem]">
                <div className="rounded-lg p-[2rem] md:w-1/2 bg-red-50 shadow-md shadow-gray-300">
                    <h2 className={role + "-text"}>Weekly Topics</h2>
                    <p className="text-lg">The larger the font size, the more frequently you talked about it during chats.</p>
                    <div className="bg-blue-400 h-[10vh] w-4/5 place-self-center rounded-lg">
                        To do: Word cloud here.
                    </div>
                </div>
                <div className="rounded-lg p-[2rem] md:w-1/2 bg-red-50 shadow-md shadow-gray-300">
                    <h2 className={role + "-text"}>Weekly Chat Summary</h2>
                    <p className="text-lg">To do: Add a summary of the weekly chats.</p>
                </div>
                <button className="md:w-1/2 p-[1rem] bg-red-50 rounded-md hover:bg-blue-200 hover:shadow-md items-center">
                    <span className="flex flex-row justify-between items-center">
                        <h4>Weekly Analysis</h4>
                        <h4>→</h4>
                    </span>
                </button>
            </div>
        </div>
    )
}