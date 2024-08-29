import sys
import multiprocessing
import traceback
import math
from enums import Position, Fonts, ModelSize
import imageio
import whisper
import os
import shutil
import cv2
from moviepy.editor import ImageSequenceClip, AudioFileClip, VideoFileClip, CompositeVideoClip, vfx, ffmpeg_tools, concatenate_videoclips
from tqdm import tqdm
import ssl
from PIL import ImageFile, Image, ImageFont, ImageDraw
import numpy as np
import uuid
from yandex_gpt import YandexGPT, YandexGPTConfigManagerForAPIKey
import asyncio
import pathlib

from clipsai import ClipFinder, Transcriber, MediaEditor, AudioVideoFile, resize
from moviepy.editor import ImageSequenceClip, AudioFileClip, VideoFileClip, CompositeVideoClip, vfx, ffmpeg_tools, \
    concatenate_videoclips

ffmpeg_tools.ffmpeg_binary = "/root/ffmpeg/ffmpeg"

ImageFile.LOAD_TRUNCATED_IMAGES = True
ssl._create_default_https_context = ssl._create_unverified_context
model_path = "medium"
video_path = ""
output_video_path = ""
position = ''
font = ''

FONT = cv2.FONT_HERSHEY_COMPLEX
FONT_SCALE = 0.8
FONT_THICKNESS = 2

class VideoTranscriber:
    def __init__(self, model_path, video_path):
        self.model = whisper.load_model(model_path)
        self.video_path = video_path
        self.audio_path = ''
        self.moviepy_video = VideoFileClip(video_path)
        self.text_array = []
        self.fps = 0
        self.char_width = 0
        self.uuid = uuid.uuid4().hex

    def transcribe_video(self):
        print('Transcribing video')
        result = self.model.transcribe(self.audio_path)
        text = result["segments"][0]["text"]
        textsize = cv2.getTextSize(text, FONT, FONT_SCALE, FONT_THICKNESS)[0]
        cap = cv2.VideoCapture(self.video_path)
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        asp = calculate_aspect(width, height)
        ret, frame = cap.read()
        width = frame[:, int(int(width - 1 / asp * height) / 2):width - int((width - 1 / asp * height) / 2)].shape[1]
        width = width - (width * 0.1)
        self.fps = cap.get(cv2.CAP_PROP_FPS)
        self.char_width = int(textsize[0] / len(text))

        for j in tqdm(result["segments"]):
            lines = []
            text = j["text"]
            end = j["end"]
            start = j["start"]
            total_frames = int((end - start) * self.fps)
            start = start * self.fps
            total_chars = len(text)
            words = text.split(" ")
            i = 0

            while i < len(words):
                words[i] = words[i].strip()
                if words[i] == "":
                    i += 1
                    continue
                length_in_pixels = (len(words[i]) + 1) * self.char_width
                remaining_pixels = width - length_in_pixels
                line = words[i]

                while remaining_pixels > 0:
                    i += 1
                    if i >= len(words):
                        break
                    length_in_pixels = (len(words[i]) + 1) * self.char_width
                    remaining_pixels -= length_in_pixels
                    if remaining_pixels < 0:
                        continue
                    else:
                        line += " " + words[i]

                line_array = [line, int(start) + 15, int(len(line) / total_chars * total_frames) + int(start) + 15]
                start = int(len(line) / total_chars * total_frames) + int(start)
                lines.append(line_array)
                self.text_array.append(line_array)

        chatGpt(''.join(str(x) for x in self.text_array))
        cap.release()
        print('Transcription complete')

    def extract_audio(self):
        print('Extracting audio')
        audio_path = "audio" + self.uuid + ".mp3"
        audio = self.moviepy_video.audio
        audio.write_audiofile(audio_path)
        self.audio_path = audio_path
        print('Audio extracted')

    def extract_frames(self, output_folder):
        print('Extracting frames')
        cap = cv2.VideoCapture(self.video_path)
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        asp = calculate_aspect(width, height)
        N_frames = 0
        p = lambda x : x/100
        text = ''
        text_x = 0
        text_y = 0
        frame_idx = 0

        while True:
            ret, frame = cap.read()
            if not ret:
                print('error')
                break

            frame = frame[:, int(int(width - 1 / asp * height) / 2):width - int((width - 1 / asp * height) / 2)]

            for i in self.text_array:
                if N_frames >= i[1] and N_frames <= i[2]:
                    text = i[0]
                    text_size, _ = cv2.getTextSize(text, cv2.FONT_HERSHEY_SIMPLEX, 0.8, 2)
                    text_x = int(width / 2)

                    if position == Position.get('middle'):
                        text_y = int(height / 2)

                    if position == 'top':
                        text_y = int(height - height * p(80))

                    if position == 'bottom':
                        text_y = int(height - height * p(20))

                    # cv2.putText(frame, text, (text_x, text_y), cv2.FONT_HERSHEY_COMPLEX, 0.75, (0, 0, 255), 2)

                    break

            cv2.imwrite(os.path.join(output_folder, str(N_frames) + ".jpg"), frame)
            write_with_font(
                    text_x,
                    text_y,
                    text,
                    os.path.join(output_folder, str(N_frames) + ".jpg"),
                    os.path.join(output_folder, str(N_frames) + ".jpg")
                    )

            N_frames += 1

        cap.release()
        print('Frames extracted')

    def create_video(self, output_video_path):

        print('Creating video')
        image_folder = os.path.join(os.path.dirname(self.video_path), "frames" + self.uuid)
        if not os.path.exists(image_folder):
            os.makedirs(image_folder)

        self.extract_frames(image_folder)

        images = [img for img in os.listdir(image_folder) if img.endswith(".jpg")]
        images.sort(key=lambda x: int(x.split(".")[0]))

        frame = cv2.imread(os.path.join(image_folder, images[0]))
        height, width, layers = frame.shape

        try:
            clip = ImageSequenceClip([os.path.join(image_folder, image) for image in images], fps=self.fps)
            audio = AudioFileClip(self.audio_path)
            clip = clip.set_audio(audio)
            ThreadCount = multiprocessing.cpu_count()
            clip.write_videofile(output_video_path,
                                 codec='libx264',
                                 audio_codec='aac',
                                 remove_temp=True,
                                 threads=ThreadCount
                                 )
            shutil.rmtree(image_folder)
            os.remove("audio" + self.uuid + ".mp3")
            # setWatermark(output_video_path, self.moviepy_video)
        except Exception as e:
            print(e)

def ProcessVideo():
    global processing
    if video_path != "":
        transcriber = VideoTranscriber(model_path, video_path)

        transcriber.extract_audio()

        transcriber.transcribe_video()

        #transcriber.create_video(output_video_path)
        processing = False
        exit()

def StartVideoProcess():
    global processing
    processing = True
    ProcessVideo()


def calculate_aspect(width: int, height: int) -> int:
    r = math.gcd(width, height)
    x = int(width / r)
    y = int(height / r)
    return x / y


def write_with_font(
    x,
    y,
    text,
    inputImg,
    outupImg,
):
    # Open image with OpenCV
    im_o = cv2.imread(inputImg)

    # Make into PIL Image
    im_p = Image.fromarray(im_o)

    # Get a drawing context
    draw = ImageDraw.Draw(im_p)
    monospace = ImageFont.truetype(font, 18, encoding='utf-8')

    ascent, descent = monospace.getmetrics()
    (width, height), (offset_x, offset_y) = monospace.font.getsize(text)

    draw.text((x - width / 2, y), text, (255,255,255), font=monospace)

    # Convert back to OpenCV image and save
    result_o = np.array(im_p)
    cv2.imwrite(outupImg, result_o)

def setWatermark(output_video_path, main_video):

    # Load the overlay video
    overlay_video = VideoFileClip("/var/www/subtitr/subtitr_backend/src/generation/giff/test1.mov", has_mask=True).resize(height=main_video.h * 0.25)  # Resize overlay video to 25% of the main video's height

    overlay_video = loop_video(overlay_video, main_video.duration)

    # Set the position of the overlay video (top right corner)
    overlay_video = overlay_video.set_position(("right", "top"))

    # Composite the videos
    final_video = CompositeVideoClip([main_video, overlay_video])

    # Write the result to a file
    final_video.write_videofile(output_video_path, codec="libx264")

def loop_video(clip, duration):
    clips = []
    while sum(c.duration for c in clips) < duration:
        remaining_duration = duration - sum(c.duration for c in clips)
        clip_segment = clip.subclip(0, min(clip.duration, remaining_duration))
        clips.append(clip_segment)
    return concatenate_videoclips(clips)

def chatGpt(text):
    # Setup configuration (input fields may be empty if they are set in environment variables)
    config = YandexGPTConfigManagerForAPIKey(
        model_type="yandexgpt",
        catalog_id="b1g7pvpmavtofiurf3cv",
        api_key="AQVNwKZ10Q7gIxxJVqs2M0qqt3hZ97zB2ynDF3Ej"
    )

    # Instantiate YandexGPT
    yandex_gpt = YandexGPT(config_manager=config)

    # Async function to get completion
    async def get_completion(text):
        messages =  [
                {
                    "role": "system",
                    "text": "Ты контент мейкер, определяющий интересные моменты"
                },
                {
                    "role": "user",
                    "text": " Отсортируй текст ниже по темам, выдели главные три и придумай для них заголовок. под заголовком напиши числа начала и конца темы из текста (числа указаны после каждой фразы) . Текст:" + text
                },
        ]

        completion = await yandex_gpt.get_async_completion(messages=messages, timeout=50)
        print(completion)

    # Run the async function
    asyncio.run(get_completion(text))

def startClipsAi():
   # crops = resize(
   #    video_file_path="./clip1.mp4",
   #     pyannote_auth_token="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",
   #     aspect_ratio=(9, 16)
   # )

   # print("Crops: ", crops.segments)

    moviepy_video = VideoFileClip(video_path)
    print(np.__version__)
    audio_path = "tudio.mp3"
    audio = moviepy_video.audio
    audio.write_audiofile(audio_path)

    transcriber = Transcriber()

    transcription = transcriber.transcribe(audio_file_path='./tudio.mp3')

    clipfinder = ClipFinder(min_clip_duration=45,max_clip_duration=60)
    clips = clipfinder.find_clips(transcription=transcription)

    media_editor = MediaEditor()

    # use this if the file contains both audio and video stream
    media_file = AudioVideoFile("output_video_path")

    clip = clips[0]  # select the clip you'd like to trim

    i = 0
    for x in clips:
        i=i+1
        clip_media_file = media_editor.trim(
          media_file=media_file,
          start_time=x.start_time,
          end_time=x.end_time,
          trimmed_media_file_path="./clip" + str(i) + ".mp4",  # doesn't exist yet
      )


def main():
    global video_path, output_video_path, model_path, position, font
    video_path = sys.argv[1]
    output_video_path = sys.argv[2]
    model_path = ModelSize.get(sys.argv[3], 'tiny')
    position = Position.get(sys.argv[4], 'top')
    font = Fonts.get(sys.argv[5], 'arial')
    type = sys.argv[6]

    if(type === 'subtitles'):
        StartVideoProcess()

    if(type ==='clipsai'):
        startClipsAi()

if __name__ == "__main__":
    main()
