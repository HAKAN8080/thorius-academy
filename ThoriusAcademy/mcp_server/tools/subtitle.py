"""
Save SRT subtitle content to the section folder.
"""

from helpers import ensure_section, mark_step


def generate_subtitle_impl(
    course_slug: str,
    section_id: str,
    srt_content: str,
) -> str:
    sec_dir = ensure_section(course_slug, section_id)
    srt_path = sec_dir / "subtitles.srt"
    srt_path.write_text(srt_content, encoding="utf-8")
    mark_step(course_slug, section_id, "srt", str(srt_path))
    n_blocks = srt_content.count("\n\n") + 1
    return (
        f"✓ Saved SRT to {srt_path}\n"
        f"  Approximate subtitle blocks: {n_blocks}"
    )
