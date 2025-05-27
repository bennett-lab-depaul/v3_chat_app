import logging
from . import biomarker_config as BioConfig
from ...config import RESET

# Set up logger
logger = logging.getLogger(__name__)


# =======================================================================
# Import Biomarker Functions
# =======================================================================
from .core.pragmatic       import generate_pragmatic_score       as prag
from .core.altered_grammar import generate_altered_grammar_score as gram
from .core.prosody         import generate_prosody_score         as pros
from .core.pronunciation   import generate_pronunciation_score   as pron
from .core.anomia          import generate_anomia_score          as anom
from .core.turntaking      import generate_turntaking_score      as turn

# --------------------------------------------------------------------
# Try/Except Wrapper
# --------------------------------------------------------------------
# Calls the given biomarker function & defaults to 0.0 on errors
def generate_biomarker_score(biomarker: str, generate_score, args):
    try:                   score = 1.0 - generate_score(**args)
    except Exception as e: score = 0.0; logger.error(f"Error with {biomarker}{RESET}: {e}")
    return score

# --------------------------------------------------------------------
# Function for Timing/Logging each score as they are calculated
# --------------------------------------------------------------------
# Biomarker calculation functions are completely independent now
# Don't need to have logging or try/except blocks in those files

# Only time the individual calculations if specified in configuration
if BioConfig.TIME_BIOMARKERS:
    from time import time
    def gen_score(biomarker: str, generate_score, args):
        # Time how long it takes to calculate the score
        start_time = time()
        score = generate_biomarker_score(biomarker, generate_score, args)
        
        # Log & return score
        logger.info(f"{biomarker} {score:.4f} ({(time()-start_time):5.4f}s) {RESET}")
        return score

else:
    # Don't need to time the calculations
    def gen_score(biomarker: str, generate_score, args):
        score = generate_biomarker_score(biomarker, generate_score, args)
        logger.info(f"{biomarker} {score:.4f} {RESET}")
        return score

# =======================================================================
# Generate Multiple Scores
# =======================================================================
# On-utterance biomarkers
def generate_biomarker_scores(user_utt: str, LLM_response: str, conversation_start_time, prosody_features, pronunciation_features):
    biomarker_scores = {
        "pragmatic"     : gen_score(BioConfig.PRAG, prag, {"user_utt": user_utt, "llm_response"           : LLM_response           }),
        "grammar"       : gen_score(BioConfig.GRAM, gram, {"user_utt": user_utt, "conversation_start_time": conversation_start_time}),
        "prosody"       : gen_score(BioConfig.PROS, pros, {      "prosody_features":       prosody_features}),
        "pronunciation" : gen_score(BioConfig.PRON, pron, {"pronunciation_features": pronunciation_features}),
    }
    return biomarker_scores

# Periodic biomarkers
def generate_periodic_scores(user_utterances, conversation_start_time, overlapped_speech_count):
    biomarker_scores = {
        "anomia"     : gen_score(BioConfig.ANOM, anom, {"user_utterances": user_utterances, "conversation_start_time": conversation_start_time}),
        "turntaking" : gen_score(BioConfig.TURN, turn, {"overlapped_speech_count": overlapped_speech_count                                    }),
    }
    return biomarker_scores

