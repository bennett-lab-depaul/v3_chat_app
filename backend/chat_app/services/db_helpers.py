import nltk
nltk.download('vader_lexicon')
nltk.download('stopwords')
nltk.download('punkt_tab')
import pandas as pd
import json

from nltk.sentiment.vader import SentimentIntensityAnalyzer
from nltk.tokenize        import word_tokenize
from nltk.corpus          import stopwords

from collections import Counter

def get_message_text(messages, sender="You"):
    return " ".join([message["message"] for message in messages if (message["sender"] == sender)])


def sentiment_scores(sentence): # From Geeks for Geeks
    # Create a SentimentIntensityAnalyzer object.
    sentiment_analyzer = SentimentIntensityAnalyzer()
    # polarity_scores method of SentimentIntensityAnalyzer object gives a sentiment dictionary.
    # which contains pos, neg, neu, and compound scores.
    sentiment_dict = sentiment_analyzer.polarity_scores(sentence)
    
    if   sentiment_dict['compound'] >=  0.05: return "Positive"
    elif sentiment_dict['compound'] <= -0.05: return "Negative"
    else:                                     return "Neutral"
    
def get_topics(text): # From freeCodeCamp
    eng_stopwords = stopwords.words("english")
    #convert article to tokens
    tokens = word_tokenize(text)
    
    #extract alpha words and convert to lowercase
    alpha_lower_tokens = [word.lower() for word in tokens if word.isalpha()]

    #remove stopwords
    alpha_no_stopwords = [word for word in alpha_lower_tokens if word not in eng_stopwords]

    #Count word
    BoW = Counter(alpha_no_stopwords)

    #3 Most common words
    most_common = BoW.most_common(3)
    
    topics = []
    
    for token in most_common:
        topics.append(token[0])
        
    return str(topics)[1:-1].replace("'", "")

def get_sentiment_topics(messages):
    text = get_message_text(messages)
    sentiment = sentiment_scores(text)
    topics = get_topics(text)
    return sentiment, topics

vad_scores = pd.read_csv("chat_app/services/nrc-vad.csv", index_col="term")
def get_vad_scores(messages):
    text = get_message_text(messages)
    # Clean text up (maybe use re here too?)
    words = text.lower().split()
    
    # Filter for words that exist in the lexicon
    vad_scores_list = [vad_scores.loc[word] for word in words if word in vad_scores.index]
    
    # Return zero/neutral scores if no words are found
    if not vad_scores_list: return 0.0, 0.0, 0.0
    
    # Calculate the average VAD scores
    vad_scores_df  = pd.DataFrame(vad_scores_list)
    average_scores = vad_scores_df.mean()
    
    valence, arousal, dominance = average_scores["valence"], average_scores["arousal"], average_scores["dominance"]
    
    return json.dumps({'valence': valence, 'arousal': arousal, 'dominance': dominance})