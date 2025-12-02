from google import genai
from google.genai.types import GenerateContentConfig, Modality
from PIL import Image
from io import BytesIO
import requests
import os

def generate_image(topic: str) -> Image.Image:
    client = genai.Client()

    response = client.models.generate_images(
        model='gemini-2.5-flash-image',
        prompt=f'Generate a semi-realistic image of {topic}.',
        config=GenerateContentConfig(
            response_modalities=[Modality.IMAGE],
            candidate_count=1,
            safety_settings=[
                {"method": "PROBABILITY"},
                {"category": "HARM_CATEGORY_DANGEROUS_CONTENT"},
                {"threshold": "BLOCK_MEDIUM_AND_ABOVE"},
            ],
        ),
    )
    for part in response.candidates[0].content.parts:
        if part.inline_data:
            image = Image.open(BytesIO((part.inline_data.data)))
            image.save("output_folder/example-image-eiffel-tower.png")
            
def get_image(topic: str):
    key = os.environ['PIXABAY_KEY']
    url = f'https://pixabay.com/api/?key={key}&q={topic}&image_type=all'
    try:
        response = requests.get(url)
        if response.status_code == 200:
            result = response.json()
            hits = result.hits
            if hits and len(hits) > 0:
                image_url = hits[0].webformatURL
                image_response = requests.get(image_url)
                if image_response.status_code == 200:
                    image = Image.open(BytesIO(image_response.content))
                    return image
        else:
            print('Error:', response.status_code)
            return None
    except requests.exceptions.RequestException as e:
        print('Error:', e)
        return None
    except Exception as e:
        print('Something went wrong:', e)
        return None