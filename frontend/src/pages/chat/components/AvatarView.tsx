import Avatar from "@/pages/common//avatar/Avatar";

// --------------------------------------------------------------------
// AvatarView
// --------------------------------------------------------------------
// Returns a view of the animated avatar and its most recent message 
const AvatarView = ({ chatbotMessage, animation }) => {
    return (
        <> <div className="my-[1rem] flex justify-center bg-blue-200 p-[1em] rounded-lg mx-[25%]"> {chatbotMessage} </div>
           <div className="h-full mt-[1em] w-full"> <Avatar animation={animation} /> </div> </>
    );   
}

export default AvatarView;