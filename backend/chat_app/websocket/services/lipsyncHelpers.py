import wave, logging

from ... import config as cf

logger = logging.getLogger(__name__)

def to_wav_file(audio: bytes, file_path: str, bits_per_sample: int = 32, sample_rate: int = 24_000, channels: int = 1):
    ''' Converts raw PCM audio bytes to a WAV file and saves it to the specified file path.
    Args:
        audio (bytes): Raw PCM audio data.
        file_path (str): Path to save the WAV file.
        bits_per_sample (int): Bits per sample (default is 32).
        sample_rate (int): Sample rate in Hz (default is 24_000).
        channels (int): Number of audio channels (default is 1 for mono).
    '''
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
    import subprocess, os
    
    rhubarb_path = cf.RHUBARB_PATH
    if not os.path.isfile(rhubarb_path):
        logger.error(f"{cf.RED}Rhubarb executable not found at {rhubarb_path}. Please check your configuration.")
        return
    
    command = [rhubarb_path, '-o', outfile, infile, "-r", "phonetic", "-f", "json"]
    
    try:
        subprocess.run(command, check=True)
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
    import json
    
    try:
        with open(file_path, 'r') as f:
            data = json.load(f)
        logger.info(f"{cf.YELLOW}Loaded Rhubarb JSON data from {file_path}.")
        return data
    except Exception as e:
        logger.error(f"{cf.RED}Error loading Rhubarb JSON file: {e}")
        return None