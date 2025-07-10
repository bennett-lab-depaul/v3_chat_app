import { NavLink, useLocation } from "react-router-dom";
import { useState             } from "react";
import { GoGear               } from "react-icons/go";

import { useAuth } from "@/context/AuthProvider";
import   GoalModal from "@/components/modals/GoalModal";
import   UserCard  from "@/components/user-info/UserCard";
import { navLinkCls } from "@/utils/styling/colors";

import CaregiverSettingsModal from "@/components/modals/CaregiverSettingsModal";


// Page title
const TITLES: Record<string, string> = {
    "/"             : "Dashboard",
    "/dashboard"    : "Dashboard",
    "/progress"     : "Progress Summary",
    "/chatDetails"  : "Single Chat Analysis",
    "/chat"         : "Chat",
    "/history"      : "Chat History",
    "/schedule"     : "Schedule",
    default         : "Cognibot",
};

// --------------------------------------------------------------------
// Header
// --------------------------------------------------------------------
export default function Header() {
    const { user, profile, logout } = useAuth();
    const { pathname } = useLocation();
    const [showModal, setShowModal] = useState(false);

    const title  = TITLES[pathname] ?? TITLES.default;
    const isCare = user.id == profile.caregiver.id;


    const logOutStyle = "flex items-center gap-2 rounded bg-violet-600 px-3 py-1 text-white hover:bg-violet-700";
    return (
        <>
        <header className="flex items-center gap-6 px-[2rem] pt-[1rem]">
            <h1 className="text-4xl whitespace-nowrap"><b> {title} </b></h1>
            <div className="ml-auto flex items-center gap-3">

                {/* Navigation Links */}
                <nav className="flex gap-4 text-xl">
                    <NavLink to="/dashboard" className={navLinkCls}> Dashboard </NavLink>
                    <NavLink to="/progress"  className={navLinkCls}> Progress  </NavLink>
                    <NavLink to="/chat"      className={navLinkCls}> Chat      </NavLink> {/* This is PLwD only (usually) */}
                    <NavLink to="/schedule"  className={navLinkCls}> Schedule  </NavLink>
                </nav>

                {/* Right Side Icons */}
                <div className="vr"></div>
                <UserCard user={user}/>
                <button onClick={() => setShowModal(true)}> <GoGear size={22}/> </button>
                <button onClick={() => logout()} className={logOutStyle}> Log out </button>
            </div>
        </header>

        {/* Modal */}
        {isCare ? 
            <CaregiverSettingsModal show={showModal} onHide={() => setShowModal(false)} /> : 
            <GoalModal              show={showModal} onHide={() => setShowModal(false)} />
        }
        
        </>
    );
}
