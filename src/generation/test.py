import os
import pathlib
import numpy as np

from clipsai import ClipFinder, Transcriber, MediaEditor, AudioVideoFile, resize
from moviepy.editor import ImageSequenceClip, AudioFileClip, VideoFileClip, CompositeVideoClip, vfx, ffmpeg_tools, \
    concatenate_videoclips

crops = resize(
    video_file_path="./clip1.mp4",
    pyannote_auth_token="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",
    aspect_ratio=(9, 16)
)

print("Crops: ", crops.segments)

moviepy_video = VideoFileClip("./test2.mp4")
print(np.__version__)
audio_path = "tudio.mp3"
audio = moviepy_video.audio
audio.write_audiofile(audio_path)

transcriber = Transcriber()

print(os.path.isfile('tudio.mp3'))
transcription = transcriber.transcribe(audio_file_path='./tudio.mp3')

clipfinder = ClipFinder(min_clip_duration=45,max_clip_duration=60)
clips = clipfinder.find_clips(transcription=transcription)


media_editor = MediaEditor()

# use this if the file contains both audio and video stream
media_file = AudioVideoFile("./test2.mp4")

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

    StartVideoProcess()

if __name__ == "__main__":
    main()
