import { useState } from "react";
import { IoGridOutline, IoList } from "react-icons/io5";

import AlbumWeekGrid from "./components/AlbumWeekGrid";
import AlbumWeekList from "./components/AlbumWeekList";
import { useChatSessions } from "@/hooks/queries/useChatSessions";
import { groupSessionsByWeek } from "@/utils/functions/getChatWeeks";


export function ChatAlbum() {
    const [display, setDisplay] = useState("grid");

    const { data: sessions, isLoading } = useChatSessions();
    if (isLoading) { 
        return <p>Loading goal...</p>; 
    }
    
    const weeks = groupSessionsByWeek(sessions).reverse();

    const changeDisplay = () => {
        if (display == "grid") {
            setDisplay("list");
        } else {
            setDisplay("grid");
        }
    }
    
    // Return UI Component
    return (
        <>
        <div className="mt-[1rem] ml-[2rem]">
            <button onClick={() => {changeDisplay()}} >
                { display == "list" ?
                    <IoGridOutline size={50} /> :
                    <IoList size={50} /> }
            </button>
        </div>
        <div className="flex flex-col items-center">
            {weeks.map( (week, idx ) => {
                return (
                    <>
                        {display == "grid" ? 
                            <AlbumWeekGrid key={idx} week={week} /> :
                            <AlbumWeekList key={idx} week={week} />
                        }
                    </>
                )
            })}
        </div>
        </>
    );
}
