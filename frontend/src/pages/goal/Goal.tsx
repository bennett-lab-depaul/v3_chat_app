import { useAuth     } from "@/context/AuthProvider";

import GoalProgress from "@/components/graphics/GoalProgress";
import WeekTrack     from "./components/WeekTrack";
import Avatar from "../common/avatar/Avatar";

export function Goal() {
    const { profile } = useAuth();

    const msg = profile.role == "Caregiver" ? 
        profile.plwd.first_name + " is making wonderful progress! Help " + profile.plwd.first_name + " to continue! Keep going!" : 
        "You're making wonderful progress! Keep going!"

    return (
        <div className="d-flex flex-col mx-[1rem] my-[1rem] h-full gap-5">  
            <br />
            <Avatar />
            <h3 className="m-[2rem] text-center"><b>{msg}</b></h3>
            <GoalProgress />
            <WeekTrack />
        </div>
    );
}
