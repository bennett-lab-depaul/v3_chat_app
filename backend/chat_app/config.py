# ======================================================================= 
# Setup
# =======================================================================
# Load Packages
import os, warnings, logging
from functools import lru_cache

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

# --------------------------------------------------------------------
# Global Variables
# --------------------------------------------------------------------
USE_CLOUD     = False  # (return default values instead of using the cloud APIs while testing)
USE_LLM       = os.getenv("APP_ENVIRONMENT", "production") != "sandbox" # (don't actually need to load the LLM to test)
THIS_LANGUAGE = "en-US"
ZERO_SHOT_CLASSIFIER_PIPELINE = None
ZEROSHOT_MODEL_PATH =  "/app/chat_app/websocket/services/emotion_model/deberta-v3-base-nli/"

# LLM Parameters
MAX_LENGTH = 256
PROMPT = "You are an assistant for dementia patients. Provide any response as short as possible."

# TODO: Find all imports using these and make them use the new logging_utils.py file instead
# Colors for logging
RED     = "\033[0;31m"
GREEN   = "\033[0;32m"
YELLOW  = "\033[0;33m"
BLUE    = "\033[0;34m"
CYAN    = "\033[0;96m"
MAGENTA = "\033[35m"
RESET   = "\033[0m"

# Horizontal line breaks
HLINE   = "-----------------------------------------------------------------------"
RLINE_1 = f"\n{RED}{HLINE}{RESET}\n"
RLINE_2 = f"\n{RED}{HLINE}{RESET}"


# =======================================================================
# Logging Setup
# =======================================================================
# Ignore warnings
warnings.filterwarnings(action='ignore')

# Making the log folders if they do not exist
if not os.path.exists("./logs/"  ): os.mkdir("./logs/"  )
if not os.path.exists("./script/"): os.mkdir("./script/")

# Set up log file written format (ex: 01:39:09)
logging.basicConfig(
    format="%(asctime)s %(levelname)s: %(name)s: %(message)s",
    level=logging.DEBUG,
    filename='./logs/dm.log',
    # encoding='utf-8',
    datefmt="%H:%M:%S",
    #stream=sys.stderr,
)

logging.getLogger("chardet.charsetprober").disabled = True
logger = logging.getLogger(__name__)


# =======================================================================
# Testing Utilities
# =======================================================================
# Check for model files individually
def check_for_model_files(pronunciation_model_path, prosody_model_path):
    missing_files = []
    if not os.path.exists(pronunciation_model_path): missing_files.append(f"pronunciation_model_path: {pronunciation_model_path}")
    if not os.path.exists(      prosody_model_path): missing_files.append(f"prosody_model_path: {            prosody_model_path}")

    if len(missing_files) > 0:
        missing_str = f"Missing required file(s): {'; '.join(missing_files)}"
        logger.error           (missing_str)
        raise FileNotFoundError(missing_str)

def get_zero_shot_classifier():
    """
    Accessor for the globally loaded zero-shot classifier pipeline.
    If the model fails to load, this will return None.
    """
    return ZERO_SHOT_CLASSIFIER_PIPELINE
    

# =======================================================================
# LLM & Other Models' Settings
# =======================================================================
# For checking the model files are there
current_path = os.path.dirname(os.path.abspath(__file__))

try:
    # Get paths to the saved models
    rf_model_path = "/websocket/biomarkers/rf_models"
    pronunciation_model_path = current_path + f"{rf_model_path}/pronunciation_rf_v4.pkl"
    prosody_model_path       = current_path + f"{rf_model_path}/prosody_rf_v1.pkl"

    # Make sure the saved models exist
    check_for_model_files(pronunciation_model_path, prosody_model_path)

    # Load the saved LLM model OR use a testing object that just returns sample data
    if USE_LLM:  from .services.llm.llama_api import LlamaAPI as LLMClass
    else:        from .services.llm.dummy_LLM import DummyLLM as LLMClass
       
    # Setup the LLM
    llm = LLMClass()
    logger.info("LLM initialized successfully")

    # Load the zero-shot classifier model globally once
    from transformers import pipeline

    logger.info(f"[EMO] Starting zero-shot classifier pipeline load in PID={os.getpid()}...") 
    ZERO_SHOT_CLASSIFIER_PIPELINE = pipeline(
        "zero-shot-classification",
        model=ZEROSHOT_MODEL_PATH,
        device=-1 #  `device=0` for GPU or `device=-1` for CPU.
    )

     # --- LOG ADDED: Finished loading and show the PID and device ---
    logger.info(
        f"[EMO] Zero-shot classifier INITIALIZED successfully in PID={os.getpid()} using device={ZERO_SHOT_CLASSIFIER_PIPELINE.device}"
    )


    """ 
    if USE_LLM:   
        llm = Llama(model_path   = LLM_model_path, 
                n_ctx        = max_length, 
                n_threads    = 8,    # was 16 before 
                n_gpu_layers = -1,   # 0 for CPU
                verbose      = True,
            )
    """

except Exception as e:
    logger.error(f"Failed to initialize LLM: {e}")
    raise
