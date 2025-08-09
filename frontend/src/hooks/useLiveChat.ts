import { useEffect, useState } from "react";
import { useQueryClient      } from "@tanstack/react-query";
import { useChatSocket, useAudioStreamer, useASR, useTTS } from "@/hooks/live-chat";

import   useLatencyLogger      from "@/hooks/useLatencyLogger";
import { logText, logOverlap } from '@/utils/loggingHelpers';

// --------------------------------------------------------------------
// Hook that handles everything involved with the chat
// --------------------------------------------------------------------
// Could expose useState flags for: connected, recording, userSpeaking, systemSpeaking.
// ToDo: Some of these logging utilities are outdated
export default function useLiveChat({
    onUserUtterance,
    onSystemUtterance = (_: string) => {},
    onScores          = (         ) => {},
    onAudio           = () => {}
} : {
    onUserUtterance   : (text: string) => void;
    onSystemUtterance : (text: string) => void;
    onScores          : (            ) => void;
    onAudio           : (data: string) => void;
}) {
    // Misc. setup
    const qc = useQueryClient();
    const { asrStart, asrEnd, llmEnd, ttsStart, ttsEnd } = useLatencyLogger();
    const onLLMres = (text: string) => { llmEnd(); logText(`[LLM] Response:   ${text}`); onSystemUtterance(text); };
    const [recording, setRecording] = useState(false);

    // Setup hooks: TTS, ChatSocket, AudioStreamer, ASR (order must be: TTS, ChatSocket, others)
    const { speak, systemSpeakingRef } = useTTS({ onStart: ttsStart, onDone: ttsEnd });
    const { send } = useChatSocket({ recording, onLLMResponse: (text: string) => { onLLMres(text); speak(text); }, onScores, onUserUtt: onUserUtterance, onAudio });
    const { start: startAud, stop: stopAud                  } = useAudioStreamer({ chunkMs: 64,                              sendToServer: send });
    const { start: startASR, stop: stopASR, userSpeakingRef } = useASR({ onStart: asrStart, onDone: asrEnd, onUserUtterance, sendToServer: send });
 
    // Speech overlap detection
    useEffect(() => {if (systemSpeakingRef.current && userSpeakingRef.current) { 
        logOverlap(); send({ type: "overlapped_speech", data: Date.now() }); 
    }}, [systemSpeakingRef.current, userSpeakingRef.current]); 

    // Start, Stop, & Save
    const start = () => {
		setRecording(true);
		startAud();
        send({ type: "toggle_stream", data: "start" });
	};
	const stop = () => {
		stopAud();
        send({ type: "toggle_stream", data: "stop" });
	};
    const  save = () => {
        setRecording(false); 
        send({ type: "end_chat", data: Date.now() }); 
        qc.invalidateQueries({ queryKey: ["chatSessions"] });
    };

    // Exposes start, stop & save
    return { start, stop, save }; 
}
