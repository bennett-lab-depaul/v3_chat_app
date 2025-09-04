import wave, logging, subprocess, os, json

from ... import config as cf

logger = logging.getLogger(__name__)

def to_wav_file(audio: bytes, file_path: str, bits_per_sample: int = 16, sample_rate: int = 24_000, channels: int = 1):
    ''' Converts raw PCM audio bytes to a WAV file and saves it to the specified file path.
    Args:
        audio (bytes): Raw PCM audio data.
        file_path (str): Path to save the WAV file.
        bits_per_sample (int): Bits per sample (default is 16).
        sample_rate (int): Sample rate in Hz (default is 24_000).
        channels (int): Number of audio channels (default is 1 for mono).
    '''
    file_path = f"{os.getcwd()}/chat_app/rhubarb/outputs/{file_path}"
    with wave.open(file_path, 'wb') as wf:
        wf.setnchannels(channels)
        wf.setsampwidth(bits_per_sample // 8)  # Convert bits to bytes
        wf.setframerate(sample_rate)
        wf.writeframes(audio)
        
    logger.info(f"{cf.RED}Wrote audio to wav file.")
        
def run_rhubarb(infile: str, outfile: str):
    ''' Runs Rhubarb lip-syncing tool on the specified input audio file and outputs
    the resulting mouth shape data to the specified output file.
    Args:
        infile (str): Path to the input audio file (WAV format recommended).
        outfile (str): Path to save the output mouth shape data (JSON format).
    '''    
    rhubarb_path = os.getcwd() + "/chat_app/rhubarb/rhubarb"
    infile = f"{os.getcwd()}/chat_app/rhubarb/outputs/{infile}"
    outfile = f"{os.getcwd()}/chat_app/rhubarb/outputs/{outfile}"
    
    command = ["./rhubarb", '-o', outfile, infile, "-r", "phonetic", "-f", "json"]
    
    try:
        logger.info(f"{cf.RED}Running rhubarb executable at {rhubarb_path}.")
        p = subprocess.run(command, check=True, cwd=os.path.dirname(rhubarb_path), capture_output=True, text=True)
        logger.info(f"{cf.YELLOW}Rhubarb processing complete. Output saved to {outfile}.")
    except subprocess.CalledProcessError as e:
        logger.error(f"{cf.RED}Error running Rhubarb: {e}")

def load_rhubarb_json(file_path: str):
    ''' Loads Rhubarb output JSON file and returns the parsed data.
    Args:
        file_path (str): Path to the Rhubarb output JSON file.
    Returns:
        dict: Parsed JSON data from the Rhubarb output file.
    '''
    file_path = f"{os.getcwd()}/chat_app/rhubarb/outputs/{file_path}"
    
    try:
        with open(file_path, 'r') as f:
            data = json.dumps(json.load(f))
        logger.info(f"{cf.YELLOW}Loaded Rhubarb JSON data from {file_path}.")
        return data
    except Exception as e:
        logger.error(f"{cf.RED}Error loading Rhubarb JSON file: {e}")
        return None