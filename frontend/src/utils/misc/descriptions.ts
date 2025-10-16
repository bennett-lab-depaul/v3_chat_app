import { BiomarkerType } from "@/api";

export interface Message {
    sender  : string,
    text    : string
}

const biomarkerDetails = {
    "anomia": {
        "name": "Anomia",
        "description": "Ability to find words",
        "definition": `Forgetting words or phrases. For example, when people go "uh" "mmm" while trying to think of what they want to say.`,
        "exemplarExample": [
            {"sender": "A", "text": "I was at the store yesterday, and I bought a jacket."},
            {"sender": "B", "text": "Oh, nice! Did you find anything else?"},
            {"sender": "A", "text": "Yeah, I also picked up some groceries while I was there."}
        ],
        "flaggedExample": [
            {"sender": "A", "text": "I was at the uh... you know, the place where they sell clothes... and I got a, um, a thing to wear."},
            {"sender": "B", "text": "Do you mean the store?"},
            {"sender": "A", "text": "Yes! That's it! The store. I was at the store, and, uh... I bought, um, the thing I needed." }
        ]
    },
    "alteredgrammar": {
        "name": "Altered Grammar",
        "description": "Sentence Complexity",
        "definition": "Reduced syntactic complexity, such as using simpler language structures instead of more complex.",
        "exemplarExample": [
            {"sender": "A", "text": "I went to the store this morning to pick up a few things, including some bread, milk, and vegetables. I also grabbed a few snacks because I was craving something."},
            {"sender": "B", "text": "Sounds like a good shopping trip! Did you find everything you needed?"},
            {"sender": "A", "text": "Yes, I did! The store had everything on my list, and I also found some new items I hadn't seen before."}
        ],
        "flaggedExample": [
            {"sender": "A", "text": "I, uh, went to, uh, store, and... uh... bought it. Uh... it was, um, good. I got, um, some, uh... it... and... I don't remember."},
            {"sender": "B", "text": "Oh, okay! Did you also get milk?"},
            {"sender": "A", "text": "Uh... yes. Milk. I, uh... bought milk."}
        ]
    },
    "pronunciation": {
        "name": "Pronunciation",
        "description": "Ability to Pronounce Clearly",
        "definition": "Slurring words, or mispronouncing things.",
        "exemplarExample": [
            {"sender": "A", "text": "I just finished reading that book you recommended. It was really interesting!"},
            {"sender": "B", "text": "Oh, I'm glad you liked it! What was your favorite part?"},
            {"sender": "A", "text": "I think the character development was really well done. I felt like I could relate to them."}
        ],
        "flaggedExample": [
            {"sender": "A", "text": "I ju... jush finis... f-finishe... r-r-reading th-tha... th-thaht... b-b-book you... recc... r-r... r-recommended..."},
            {"sender": "B", "text": "It sounds like you're having a bit of trouble. Are you okay?"},
            {"sender": "A", "text": "Y-y-yeah... jusht... jusht tired, is all."}
        ]
    },
    "pragmatic": {
        "name": "Pragmatic",
        "description": "Use of Contextual Language",
        "definition": "A lack of using the proper contextual language, such as metaphors, saracasm, politeness, or context-dependent words or phrases.",
        "exemplarExample": [
            {"sender": "A", "text": "Great weather, isn't it? It's all rainy and gloomy outside."},
            {"sender": "B", "text": "You're right, perhaps we should stay inside and read a book."},
            {"sender": "A", "text": "Yeah, do we want to read the one you recommended yesterday?"}
        ],
        "flaggedExample": [
            {"sender": "A", "text": "Give me the pen. I watched baseball yesterday."},
            {"sender": "B", "text": "Did you have a good time watching the game?"},
            {"sender": "A", "text": "What game? Which game?"}
        ]
        
    },
    "prosody": {
        "name": "Prosody",
        "description": "Tone and Inflection",
        "definition": "Using incorrect patterns of stress and intonation in spoken language, such as pitch variation, loudness, tempo, and pauses.",
        "exemplarExample": [
            {"sender": "A", "text": "I said that <em>Robert</em> liked apples, not me."},
            {"sender": "B", "text": "Oh, I'll give Robert this apple then. What do fruit do you like?"},
            {"sender": "A", "text": "Any fruit other than <em>tomatoes</em>. Gross!"}
        ],
        "flaggedExample": [
            {"sender": "A", "text": "I visited my dog yesterday. It was really fun and exciting."},
            {"sender": "B", "text": "You don't sound excited about it."},
            {"sender": "A", "text": "I don't. I wonder why. I really love my dog."}
        ]
    },
    "turntaking": {
        "name": "Turn Taking",
        "description": "Conversational Flow",
        "definition": "Speaking at the incorrect time; either interrupting or leaving long silences in a conversation.",
        "exemplarExample": [
            {"sender": "A", "text": "How many birds did you see yesterday?"},
            {"sender": "B", "text": "I think I counted twelve. I particularly liked seeing the blue jay."},
            {"sender": "A", "text": "I liked the blue jay too!"}
        ],
        "flaggedExample": [
            {"sender": "A", "text": "Dinner last nice was good. The main course was very tasty."},
            {"sender": "B", "text": "Yes, I really--"},
            {"sender": "A", "text": "But the dessert wasn't great...I wish they had ice cream."}
        ]
    },
}

export function getBiomarkerName(biomarker: BiomarkerType) : string {
    return biomarkerDetails[biomarker].name;
}

export function getBiomarkerDescription(biomarker: BiomarkerType) : string {
    return biomarkerDetails[biomarker].description;
}

export function getBiomarkerDefinition(biomarker: BiomarkerType) : string {
    return biomarkerDetails[biomarker].definition;
}

export function getBiomarkerExemplar(biomarker: BiomarkerType) : Message[] {
    return biomarkerDetails[biomarker].exemplarExample;
}

export function getBiomarkerFlagged(biomarker: BiomarkerType) : Message[] {
    return biomarkerDetails[biomarker].flaggedExample;
}