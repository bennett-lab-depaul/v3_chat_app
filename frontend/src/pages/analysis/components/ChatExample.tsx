import { Message } from "@/utils/misc/descriptions";

export default function ChatExample( {messages} : {messages: Message[]} ) {
    return (
        <div className="flex flex-col gap-2">
            {messages.map((message, idx) => {
                return (
                    <p key={idx}>
                        <b>{message.sender}:</b> "{message.text}"
                    </p>
                )
            })}
        </div>
    )
}