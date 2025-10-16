import { useAuth } from "@/context/AuthProvider";
import { NavLink } from "react-router-dom";
import { GiAlliedStar } from "react-icons/gi";
import { LuImage } from "react-icons/lu";
import { IoCalendarOutline } from "react-icons/io5";
import { FaChartBar, FaRegCompass } from "react-icons/fa";
import { VscRobot } from "react-icons/vsc";
import { footerLinkPatientCls, footerLinkCaregiverCls } from "@/utils/styling/colors";

export default function FooterNav() {
    const { profile } = useAuth();

    if (profile?.role == "Caregiver") {
        return (
            <div className="fixed bottom-0 left-0 right-0 shadow-inner flex flex-row justify-between items-center p-4 bg-white">
                <div className="flex flex-col items-center">
                    <NavLink to="/goal" className={footerLinkCaregiverCls}>
                        <GiAlliedStar size={"2rem"} />
                        Goal
                    </NavLink>
                </div>
                <div className="flex flex-col items-center">
                    <NavLink to="/analysis" className={footerLinkCaregiverCls}>
                        <FaChartBar size={"2rem"} />
                        Analysis
                    </NavLink>
                </div>
                <div className="flex flex-col items-center">
                    <NavLink to="/album" className={footerLinkCaregiverCls}>
                        <LuImage size={"2rem"} />
                        Album
                    </NavLink>
                </div>
                <div className="flex flex-col items-center">
                    <NavLink to="/practice" className={footerLinkCaregiverCls}>
                        <FaRegCompass size={"2rem"} />
                        Practice
                    </NavLink>
                </div>
                <div className="flex flex-col items-center">
                    <NavLink to="/schedule" className={footerLinkCaregiverCls}>
                        <IoCalendarOutline size={"2rem"} />
                        Schedule
                    </NavLink>
                </div>
            </div>
        );
    } else {
        return (
            <div className="fixed bottom-0 left-0 right-0 shadow-inner flex flex-row justify-between items-center px-5 pb-2 bg-white">
                <div className="flex flex-col items-center">
                    <NavLink to="/goal" className={footerLinkPatientCls}>
                        <GiAlliedStar size={"2rem"} />
                        Goal
                    </NavLink>
                </div>
                <div className="flex flex-col items-center">
                    <NavLink to="/album" className={footerLinkPatientCls}>
                        <LuImage size={"2rem"} />
                        Album
                    </NavLink>
                </div>
                <div className="flex flex-col items-center">
                    <NavLink to="/chat" className="flex flex-col items-center p-2 text-white no-underline rounded-full bg-gray-400 hover:bg-green-600 aspect-square translate-y-[-1.5rem]">
                        <img className="aspect-square w-[2rem] " src="/images/QT_icon.svg" />
                        Chat
                    </NavLink>
                </div>
                <div className="flex flex-col items-center">
                    <NavLink to="/schedule" className={footerLinkPatientCls}>
                        <IoCalendarOutline size={"2rem"} />
                        Schedule
                    </NavLink>
                </div>
                <div className="flex flex-col items-center">
                    <NavLink to="/analysis" className={footerLinkPatientCls}>
                        <FaChartBar size={"2rem"} />
                        Analysis
                    </NavLink>
                </div>
            </div>
        );
    }
}