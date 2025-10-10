import { WordCloud } from "@isoterik/react-word-cloud";
import { ChatMessage } from "@/api";

function MyWordCloud( { messages } : { messages: ChatMessage[] }) {

    const tokenize = () => {
        // Initialize an empty object to store word frequencies
        const wordFrequency = {};
        var numWords = 0;

        // Iterate over each message in the data array
        messages.forEach(item => {
            // Split the message into words, remove punctuation, and convert to lowercase
            if (item.role === "user") {
                const words = item.content.replace(/[^\w\s]/g, '').toLowerCase().split(/\s+/);

                // Count the frequency of each word
                words.forEach(word => {
                    numWords++;
                    if (word.length > 3) {
                        if (wordFrequency[word]) {
                            wordFrequency[word]++;
                        } else {
                            wordFrequency[word] = 1;
                        }
                    }
                });
            }
        });

        // Convert the wordFrequency object into an array of objects with 'text' and 'value' properties
        const result = Object.keys(wordFrequency).map(word => ({
            text: word,
            value: wordFrequency[word]
        }));

        return {words: result, numWords: numWords};
    }

    const {words, numWords} = tokenize();

    const resolveFontSize = (word) => {
        const minFontSize = 4;
        const maxFontSize = 24;
        const size = (word.value ** 3 / numWords) * (maxFontSize - minFontSize) + minFontSize;
        return size;
    }

    if (messages.length > 0) {
        return (
            <div style={{width: "100%", height: "100%"}}>
                 <WordCloud 
                    words={words} 
                    width={250} 
                    height={250} 
                    fontSize={resolveFontSize}
                    transition="all .3s ease"
                    padding={2}
                    timeInterval={1}
                />
            </div>
        );
    } else {
        return (
            <p className="text-5xl">Not available</p>
        )
    }
}

export default MyWordCloud;