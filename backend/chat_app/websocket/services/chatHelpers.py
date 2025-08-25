""" 
=======================================================================
        Process the users message & reply with the LLM ASAP 
======================================================================= 
"""
import json, logging, base64
from math import ceil
logger = logging.getLogger(__name__)

from time        import time
from ...         import config        as cf
from ...services import logging_utils as lu 

ERROR_UTTERANCE = "I'm sorry, I encountered an error while processing your request."
test = "\033[42m"

# ======================================================================= ===================================
# Generate LLM Response
# ======================================================================= ===================================
async def generate_LLM_response(context_buffer):
    """
    Original stop characters included punctuation (but not all? '!')...
        stop=["<|end|>", ".", "?"]

    Wrap the response logic in a try-except block. If the model throws an error, return a default response.
    """
    # 1) Prepare a prompt for the LLM
    full_prompt = prepare_LLM_input(context_buffer)

    # 2) Get a response from the LLM (hosted on a webserver)
    try:
        output = await cf.llm(full_prompt, max_tokens=cf.MAX_LENGTH, stop=["<|end|>", "\n"], echo=True) 
        system_utt = (output["choices"][0]["text"].split("<|assistant|>")[-1]).strip()

    except Exception as e: 
        logger.error(f"Error in get_LLM_response: {e}"); system_utt = ERROR_UTTERANCE

    return system_utt

# -----------------------------------------------------------------------
# Helpers for preparing the input message
# -----------------------------------------------------------------------
# Formats a turn from the chat history for LLM input
def format_turn(turn): return f"\n<|{turn[0]}|>\n{turn[1]}<|end|>"

# Use a set number of turns from the chat history to give context to the LLM
def prepare_LLM_input(context_buffer):
    """
    1) Start the LLM input string with the specified prompt defined during configuration
    2) Format the each turn in the history (context_buffer) for LLM input & add them to the LLM input string
    3) Finally, complete the LLM input; add a tag for the LLM to respond & return the completed prompt
    """
    LLM_input  = f"<|system|>\n{cf.PROMPT}<|end|>"
    LLM_input += "".join([format_turn(turn) for turn in context_buffer])
    LLM_input += f"\n<|assistant|>\n"
    return LLM_input