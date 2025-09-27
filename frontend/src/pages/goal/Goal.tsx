import { useAuth     } from "@/context/AuthProvider";

import GoalProgress from "@/components/graphics/GoalProgress";
import WeekTrack     from "./components/WeekTrack";
import Avatar from "../common/avatar/Avatar";
import { useChatSessions } from "@/hooks/queries/useChatSessions";
import { getCurrentWeek } from "@/utils/functions/getChatWeeks";

export function Goal() {
    const { profile } = useAuth();
    const { data: sessions, isLoading } = useChatSessions();
    if (isLoading) { 
        return <p>Loading goal...</p>; 
    }
    const week = getCurrentWeek(sessions, 1);

    const getMsg = () => {
        if (week.sessions.length == 0) {
            if (profile.role == "Caregiver") {
                return `It's time for practice, help ${profile.plwd.first_name} achieve their goal!`;
            } else {
                return `It's time for practice, you can do this!`;
            }
        } else {
            if (profile.role == "Caregiver") {
                return `${profile.plwd.first_name} is making wonderful progress! Help ${profile.plwd.first_name} continue!`;
            } else {
                return `You're making wonderful progress! Keep going!`
            }
        }
    }

    return (
        <div className="d-flex flex-col mx-[5rem] my-[1rem] h-full gap-5">  
            <br />
            <Avatar />
            <h3 className="m-[2rem] text-center"><b>{getMsg()}</b></h3>
            <GoalProgress />
            <WeekTrack week={week} />
        </div>
    );
}
