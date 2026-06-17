"""
Build final MP4 from JPGs + MP3s with transitions.

Pipeline:
  1. For each (slide_NN.jpg, slide_NN.mp3) pair: build a clip_NN.mp4
     with Ken Burns zoom and audio padded by tail_buffer seconds.
  2. xfade-chain all clips with slideleft transition + acrossfade audio.
"""

import os
import shutil
import subprocess
from pathlib import Path

from helpers import ensure_section, mark_step

FPS = 30
W = 1920
H = 1080


def find_ffmpeg():
    if shutil.which("ffmpeg"):
        return "ffmpeg"
    for path in ["/opt/homebrew/bin/ffmpeg", "/usr/local/bin/ffmpeg"]:
        if Path(path).exists():
            return path
    return ""


def find_ffprobe():
    if shutil.which("ffprobe"):
        return "ffprobe"
    for path in ["/opt/homebrew/bin/ffprobe", "/usr/local/bin/ffprobe"]:
        if Path(path).exists():
            return path
    return ""


def get_duration(ffprobe, path: Path) -> float:
    r = subprocess.run(
        [ffprobe, "-v", "error",
         "-show_entries", "format=duration",
         "-of", "default=noprint_wrappers=1:nokey=1",
         str(path)],
        capture_output=True, text=True, check=True
    )
    return float(r.stdout.strip())


def build_video_impl(
    course_slug: str,
    section_id: str,
    transition_duration: float = 0.5,
    tail_buffer: float = 0.5,
) -> str:
    sec_dir = ensure_section(course_slug, section_id)
    slides_dir = sec_dir / "slides"
    audio_dir = sec_dir / "audio"
    clips_dir = sec_dir / "clips"
    output = sec_dir / "final.mp4"

    ffmpeg = find_ffmpeg()
    ffprobe = find_ffprobe()
    if not ffmpeg or not ffprobe:
        return (
            "ERROR: ffmpeg/ffprobe not found. "
            "Install via: brew install ffmpeg"
        )

    # Clean & prepare clips dir
    if clips_dir.exists():
        shutil.rmtree(clips_dir)
    clips_dir.mkdir()

    # Pair up MP3s with JPGs (drive by MP3 list)
    mp3_files = sorted(audio_dir.glob("slide_*.mp3"))
    if not mp3_files:
        return "ERROR: No MP3 files found. Run generate_audio first."

    pairs = []
    for mp3 in mp3_files:
        num = mp3.stem.replace("slide_", "")
        jpg = slides_dir / f"slide_{num}.jpg"
        if not jpg.exists():
            return f"ERROR: Missing image for {mp3.name} (expected {jpg.name})"
        pairs.append((num, jpg, mp3))

    # ============================================================
    # STEP 1: Per-slide clips
    # ============================================================
    clip_paths = []
    durations = []
    for num, jpg, mp3 in pairs:
        a_dur = get_duration(ffprobe, mp3)
        v_dur = a_dur + tail_buffer
        frames = int(v_dur * FPS)
        clip = clips_dir / f"clip_{num}.mp4"

        filter_complex = (
            f"[0:v]scale={W}:{H}:force_original_aspect_ratio=decrease,"
            f"pad={W}:{H}:(ow-iw)/2:(oh-ih)/2:color=white,setsar=1,"
            f"scale={W*2}:{H*2},"
            f"zoompan=z='min(1.0+(on/{frames})*0.06,1.06)':"
            f"x='iw/2-(iw/zoom)/2':y='ih/2-(ih/zoom)/2':"
            f"d={frames}:s={W}x{H}:fps={FPS},"
            f"format=yuv420p,trim=duration={v_dur}[v];"
            f"[1:a]apad=pad_dur={tail_buffer},atrim=duration={v_dur}[a]"
        )

        cmd = [
            ffmpeg, "-y", "-loglevel", "error",
            "-loop", "1", "-i", str(jpg),
            "-i", str(mp3),
            "-filter_complex", filter_complex,
            "-map", "[v]", "-map", "[a]",
            "-c:v", "libx264", "-preset", "medium", "-crf", "20",
            "-pix_fmt", "yuv420p",
            "-c:a", "aac", "-b:a", "192k", "-ar", "44100",
            "-movflags", "+faststart",
            str(clip)
        ]
        try:
            subprocess.run(cmd, check=True, capture_output=True,
                           text=True, timeout=300)
        except subprocess.CalledProcessError as e:
            return f"ERROR building clip_{num}.mp4:\n{e.stderr}"

        clip_paths.append(clip)
        durations.append(v_dur)

    # ============================================================
    # STEP 2: Concatenate with xfade transitions
    # ============================================================
    if len(clip_paths) == 1:
        shutil.copy(clip_paths[0], output)
        mark_step(course_slug, section_id, "mp4", str(output))
        return f"✓ Single clip — saved as {output}"

    # Build xfade cascade
    inputs_args = []
    for clip in clip_paths:
        inputs_args.extend(["-i", str(clip)])

    filter_parts = []
    current_v = "[0:v]"
    current_a = "[0:a]"
    current_end = durations[0]
    for i in range(1, len(clip_paths)):
        offset = current_end - transition_duration
        out_v = f"[v{i}]"
        out_a = f"[a{i}]"
        filter_parts.append(
            f"{current_v}[{i}:v]xfade=transition=slideleft:"
            f"duration={transition_duration}:offset={offset}{out_v}"
        )
        filter_parts.append(
            f"{current_a}[{i}:a]acrossfade=d={transition_duration}{out_a}"
        )
        current_v = out_v
        current_a = out_a
        current_end = current_end + durations[i] - transition_duration

    filter_complex = ";".join(filter_parts)

    cmd = [
        ffmpeg, "-y", "-loglevel", "error",
        *inputs_args,
        "-filter_complex", filter_complex,
        "-map", current_v, "-map", current_a,
        "-c:v", "libx264", "-preset", "medium", "-crf", "20",
        "-pix_fmt", "yuv420p",
        "-c:a", "aac", "-b:a", "192k", "-ar", "44100",
        "-movflags", "+faststart",
        str(output)
    ]
    try:
        subprocess.run(cmd, check=True, capture_output=True,
                       text=True, timeout=600)
    except subprocess.CalledProcessError as e:
        return f"ERROR in final composition:\n{e.stderr}"

    # Clean up clips
    shutil.rmtree(clips_dir)

    total = get_duration(ffprobe, output)
    size_mb = output.stat().st_size / (1024 * 1024)
    mark_step(course_slug, section_id, "mp4", str(output))
    return (
        f"✓ Built final MP4: {output}\n"
        f"  Duration: {total:.1f}s ({total/60:.1f} min)\n"
        f"  Size: {size_mb:.1f} MB\n"
        f"  Slides: {len(clip_paths)} with slideleft transitions"
    )
