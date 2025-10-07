import { ChatWeek } from "@/utils/functions/getChatWeeks";
import { useLocation, useNavigate } from "react-router-dom";

export function WeekSummary() {
    const { state } = useLocation() as { state?: { chatWeek?: ChatWeek } };
    if (!state?.chatWeek) { useNavigate()("/chat"); };

    return (
        <div>
            TODO: Weekly summary of chats.
        </div>
    )
}