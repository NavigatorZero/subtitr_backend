import cv2
import imageio
import numpy as np

# Function to read GIF and extract frames with transparency
def read_gif(gif_path):
    gif = imageio.mimread(gif_path, memtest=False)
    frames = []
    for frame in gif:
        frame_rgba = cv2.cvtColor(frame, cv2.COLOR_RGB2RGBA)  # Ensure RGBA format
        frames.append(frame_rgba)
    return frames

# Function to overlay gif frame on a video frame with transparency
def overlay_gif_on_frame(video_frame, gif_frame, position):
    x, y = position
    h, w = gif_frame.shape[:2]

    # Ensure the gif frame fits within the video frame
    if x + w > video_frame.shape[1] or y + h > video_frame.shape[0]:
        raise ValueError("GIF frame does not fit within the video frame at the given position")

    # Extract the alpha channel from the gif frame
    alpha_mask = gif_frame[:, :, 3] / 255.0
    alpha_inv = 1.0 - alpha_mask

    # Blend the gif frame and the video frame
    for c in range(0, 3):
        video_frame[y:y+h, x:x+w, c] = (alpha_mask * gif_frame[:, :, c] +
                                        alpha_inv * video_frame[y:y+h, x:x+w, c])
    return video_frame

# Paths
gif_path = 'path_to_transparent_gif.gif'
video_path = 'path_to_video.mp4'
output_video_path = 'output_video.mp4'

# Read GIF frames
gif_frames = read_gif(gif_path)
gif_length = len(gif_frames)

# Open video
video_capture = cv2.VideoCapture(video_path)
fps = int(video_capture.get(cv2.CAP_PROP_FPS))
width = int(video_capture.get(cv2.CAP_PROP_FRAME_WIDTH))
height = int(video_capture.get(cv2.CAP_PROP_FRAME_HEIGHT))
fourcc = cv2.VideoWriter_fourcc(*'mp4v')
video_writer = cv2.VideoWriter(output_video_path, fourcc, fps, (width, height))

# Read and process video frames
frame_idx = 0
while True:
    ret, frame = video_capture.read()
    if not ret:
        break
    gif_frame = gif_frames[frame_idx % gif_length]
    position = (50, 50)  # Top-left corner of the overlay (x, y)
    frame_with_gif = overlay_gif_on_frame(frame, gif_frame, position)
    video_writer.write(frame_with_gif)
    frame_idx += 1

# Release resources
video_capture.release()
video_writer.release()
cv2.destroyAllWindows()

print("GIF has been successfully pasted into the video!")
