import Avatar from "@/pages/common//avatar/Avatar";

// --------------------------------------------------------------------
// AvatarView
// --------------------------------------------------------------------
// Returns a view of the animated avatar and its most recent message 
const AvatarView = ({ chatbotMessage }) => {
    return (
        <>
            <div className="mt-[1em] w-1/2"> <Avatar/> </div> 
            <div className="mr-[1rem] w-1/3 h-3/4 rounded-3xl bubble bubble-bottom-left text-2xl"> {chatbotMessage} </div>
        </>
    );   
}

export default AvatarView;