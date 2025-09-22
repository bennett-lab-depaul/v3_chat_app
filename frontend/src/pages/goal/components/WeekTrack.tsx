import { useAuth } from "@/context/AuthProvider";
import { useChatSessions } from "@/hooks/queries/useChatSessions";
import { ChatWeek, groupSessionsByWeek } from "@/utils/functions/getChatWeeks";


export default function WeekTrack() {
    const { profile } = useAuth();
    const { data: sessions, isLoading } = useChatSessions();
    if (isLoading) { 
        return <p>Loading goal...</p>; 
    }

    const role = profile.role.toLowerCase();
    const weeks: ChatWeek[] = groupSessionsByWeek(sessions);
    const week = weeks[weeks.length - 1];
    if (week.end < new Date()) {
        week.start = new Date();
    }

    const sameDay = (d1: Date, d2: Date) => {
        return d1.getFullYear() === d2.getFullYear() &&
            d1.getMonth()    === d2.getMonth() &&
            d1.getDate()     === d2.getDate();
    }

    const getChatsForDay = (day: Date) => {
        return week.sessions.filter(s => {
            const d = new Date(s.date);
            return sameDay(d, day);
        }).length;
    }

    const dayTracks = [];
    for (let i = 0; i < 7; i++) {
        const day = new Date(week.start);
        day.setDate(day.getDate() + i);
        const chats = getChatsForDay(day);
        if (sameDay(day, new Date())) {
            dayTracks.push({ day: "Today", chats: chats });
        } else {
            const weekday = day.toLocaleString('en-us', {  weekday: 'short' });
            dayTracks.push({ day: weekday, chats: chats });
        }
    }

    return (
        <div className="flex flex-row gap-5 justify-center">
            {dayTracks.map((d, idx) => (
                <DayTrack key={idx} day={d.day} chats={d.chats} role={role}/>
            ))}
        </div>
    )
}

const DayTrack = ({ day, chats, role }) => {
    return (
        <div className="flex flex-col items-center gap-2"> 
            {day === "Today" ? 
                <b className="text-orange-500 align-middle">{day}</b> : 
                chats > 0 ?
                    <b className={role + "-text align-middle"}>{day}</b> : 
                    <b className="text-gray-400 align-middle">{day}</b>
            }
            {chats > 0 ? 
                <p className={role + "-bg size-[2rem] leading-[2rem] text-white rounded-full text-center"}>
                    {chats == 1 ? "✓" : chats}
                </p> :
                day === "Today" ? 
                    <div className="size-[2rem] text-white rounded-full bg-white border-dashed border-2 border-black" /> :
                    <div className="size-[2rem] text-white rounded-full bg-white border-dashed border-1 border-gray-400" />
            }
        </div>
    )
}