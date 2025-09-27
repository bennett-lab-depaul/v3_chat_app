import LinearProgress from '@mui/material/LinearProgress';
import { useAuth     } from "@/context/AuthProvider";

// Patient Goal Progress Bar
export default function GoalProgress () {
    const { profile } = useAuth();
    const barColor = profile.role == "Patient" ? "patient-text" : "caregiver-text";
    const current = profile.goal.current;
    const target  = profile.goal.target

    const percent = Math.round((current / target) * 100);

    return (
        <div className={barColor}>
            <LinearProgress variant={"determinate"} color={"inherit"} value={percent} sx={{ height: "3rem", borderRadius: "2rem", border: "solid black"}} />
            <h2 className="text-black w-full text-center">{current} / {target} </h2>
        </div>
    )
}
