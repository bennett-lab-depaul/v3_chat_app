import nltk
nltk.download('vader_lexicon')
nltk.download('stopwords')
nltk.download('punkt_tab')
import pandas as pd

from nltk.sentiment.vader import SentimentIntensityAnalyzer
from nltk.tokenize        import word_tokenize
from nltk.corpus          import stopwords

from collections import Counter

class TextAnalyzer:
    def __init__(self):
        self.vad_scores = pd.read_csv("nrc-vad.csv", index_col="Word")
        self.sentiment_analyzer = SentimentIntensityAnalyzer()
        # Initialize english stopwords
        self.stopwords = stopwords.words("english")

    def get_message_text(self, messages):
        return " ".join([message["message"] for message in messages if (message["sender"] == "You")])


    def sentiment_scores(self, sentence): # From Geeks for Geeks
        # Create a SentimentIntensityAnalyzer object.

        # polarity_scores method of SentimentIntensityAnalyzer object gives a sentiment dictionary.
        # which contains pos, neg, neu, and compound scores.
        sentiment_dict = self.sentiment_analyzer.polarity_scores(sentence)
        
        if   sentiment_dict['compound'] >=  0.05: return "Positive"
        elif sentiment_dict['compound'] <= -0.05: return "Negative"
        else:                                     return "Neutral"
        
    def get_topics(self, text): # From freeCodeCamp
        
        #convert article to tokens
        tokens = word_tokenize(text)
        
        #extract alpha words and convert to lowercase
        alpha_lower_tokens = [word.lower() for word in tokens if word.isalpha()]

        #remove stopwords
        alpha_no_stopwords = [word for word in alpha_lower_tokens if word not in self.stopwords]

        #Count word
        BoW = Counter(alpha_no_stopwords)

        #3 Most common words
        most_common = BoW.most_common(3)
        
        topics = []
        
        for token in most_common:
            topics.append(token[0])
            
        return str(topics)[1:-1].replace("'", "")


    def get_vad_scores(self, text):
        # Clean text up (maybe use re here too?)
        words = text.lower().split()
        
        # Filter for words that exist in the lexicon
        vad_scores_list = [self.vad_lexicon.loc[word] for word in words if word in self.vad_lexicon.index]
        
        # Return zero/neutral scores if no words are found
        if not vad_scores_list: return 0.0, 0.0, 0.0
        
        # Calculate the average VAD scores
        vad_scores_df  = pd.DataFrame(vad_scores_list)
        average_scores = vad_scores_df.mean()
        
        return average_scores["valence"], average_scores["arousal"], average_scores["dominance"]