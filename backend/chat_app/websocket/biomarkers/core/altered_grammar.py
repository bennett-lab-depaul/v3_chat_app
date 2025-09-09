# =======================================================================
# Altered Grammar Biomarker
# =======================================================================
from time import time
from ..biomarker_models.altered_grammer import generate_grammar_score

"""
Temporarily changing this so it just gets the most recent message instead of doing all of them.
It should do all of them, but the code needs a lot of work to make it not as slow.

"""
# TODO: Make this faster, currently have this temporarily set just to use the most recent utterance beceause it is too slow

# Uses saved model on given features (score defaults to 1.0 on error)
def generate_altered_grammar_score(context_buffer):
    # Earliest message timestamp (ToDo: this isn't exact enough, but whatever for now)
    current_duration = time() - context_buffer[0][2]

    # Just get the first most recent message, it's taking too long doing all of them
    user_messages = []
    for i in range(len(context_buffer)-1, -1, -1):
        if context_buffer[i][0] == "user":
            user_messages.append(context_buffer[i][1])

            # Get the duration -> should be this timestamp minus the timestamp of the one before it
            current_duration = context_buffer[i][2] - context_buffer[i-1][2]
            break # This is whaat does it

    score = generate_grammar_score(user_messages, current_duration)
    return score



# -----------------------------------------------------------------------
# [OLD VERSION] This should be how it is setup, but is too slow right now
# -----------------------------------------------------------------------
# Uses saved model on given features (score defaults to 1.0 on error)
def generate_altered_grammar_score_OLD(context_buffer):
    # All of the users messages from the context buffer
    user_messages = [content for role, content, _ in context_buffer if role == "user"]

    # Earliest message timestamp (ToDo: this isn't exact enough, but whatever for now)
    current_duration = time() - context_buffer[0][2]

    score = generate_grammar_score(user_messages, current_duration)
    return score
