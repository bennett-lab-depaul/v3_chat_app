import logging

# Set up logger
logger = logging.getLogger(__name__)

# =======================================================================
# Pragmatic Biomarker
# =======================================================================
import pandas as pd
import math
import os

from ..biomarker_models.coherence_function import coherence
from ..biomarker_models.coherence_v2 import pragmatic_gc_mean

# -----------------------------------------------------------------------
# Features for the Pragmatic Score
# -----------------------------------------------------------------------
current_path = os.path.dirname(os.path.abspath(__file__))
parent_path  = os.path.dirname(current_path) # (one level up)
bm_path      = f"{parent_path}/biomarker_models"

# ---- TODO: As soon as these get used in the function, they have some formatting done to them. Just do it here... ----
bm_vectors   = pd.read_csv  (f"{bm_path}/new_LSA.csv", index_col=0 )
bm_entropy   = pd.read_csv  (f"{bm_path}/Hoffman_entropy_53758.csv")
bm_stop_list = pd.read_table(f"{bm_path}/stoplist.txt", header=None)


# -----------------------------------------------------------------------
# Pragmatic Score
# -----------------------------------------------------------------------
# Uses saved models on given features (score defaults to 1.0 on error)
# TODO: Utterances are too short, just gives 1
def generate_pragmatic_score(context_buffer):
    # Get a DataFrame for the given speech
    try:                   speech_df = get_speech_df(context_buffer)
    except Exception as e: logger.error(f"Error preparing speech data for coherence calculation: {e}"); return 1
    
    # Calculate the pragmatic score
    try:
        #pragmatic_score = coherence(speech_df, vectors=bm_vectors, entropy=bm_entropy, stop_list=bm_stop_list)
        pragmatic_score = pragmatic_gc_mean(speech_df, vectors=bm_vectors, entropy=bm_entropy, stop_list=bm_stop_list)
        
        # Assuming pragmatic_score is a float
        if math.isnan(pragmatic_score):
            print("is nan condition pragmatic_score", pragmatic_score)
            pragmatic_score = 0

        # Adjusted pragmatic score
        adjusted_pragmatic_score = 0 if (pragmatic_score == 0) else (1.0 - pragmatic_score)
        return adjusted_pragmatic_score
    
    except Exception as e: logger.error(f"Error calculating pragmatic score: {e}"); return 1.0



# -----------------------------------------------------------------------
# Creates a DataFrame for the given speech
# -----------------------------------------------------------------------
# TODO: DataFrames are slow, we should just either give it the context buffer or pre convert it into an array or something...
def get_speech_df(context_buffer):
    """
    Roles are: "user" "assistant"
    The function expects user and robot, but robot isn't used anymore so...
    """
    word_vector, role_vector = [], []
    for utterance in context_buffer:
        words =  utterance[1].split()
        roles = [utterance[0]] * len(words)

        word_vector += words
        role_vector += roles
 
    speech_df = pd.DataFrame({"V1": role_vector, "V2": word_vector})
    return speech_df
