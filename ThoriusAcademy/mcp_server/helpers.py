"""
Common helpers: course/section folder management, state tracking.
"""

import json
import os
import re
from pathlib import Path

# Root of the entire workspace (set at install time)
THORIUS_ROOT = Path.home() / "Desktop" / "ThoriusAcademy"


def get_course_dir(slug: str) -> Path:
    """Return the course directory; do NOT create it (caller's job)."""
    return THORIUS_ROOT / "courses" / slug


def get_section_dir(course_slug: str, section_id: str) -> Path:
    return get_course_dir(course_slug) / "sections" / section_id


def slugify_section(name: str, idx: int) -> str:
    """e.g. ('Course Introduction', 1) → '01_course_introduction'"""
    safe = re.sub(r'[^a-z0-9]+', '_', name.lower()).strip('_')
    return f"{idx:02d}_{safe}"


def ensure_section(course_slug: str, section_id: str) -> Path:
    """Create the section folder structure if missing."""
    sec = get_section_dir(course_slug, section_id)
    sec.mkdir(parents=True, exist_ok=True)
    (sec / "slides").mkdir(exist_ok=True)
    (sec / "audio").mkdir(exist_ok=True)
    return sec


def read_section_state(course_slug: str, section_id: str) -> dict:
    sec = get_section_dir(course_slug, section_id)
    state_file = sec / "state.json"
    if not state_file.exists():
        return {
            "course": course_slug,
            "section": section_id,
            "exists": sec.exists(),
            "steps": {
                "pptx": False,
                "jpg": False,
                "narration": False,
                "mp3": False,
                "srt": False,
                "mp4": False,
            },
            "files": {},
        }
    return json.loads(state_file.read_text(encoding="utf-8"))


def write_section_state(course_slug: str, section_id: str, state: dict):
    sec = ensure_section(course_slug, section_id)
    (sec / "state.json").write_text(
        json.dumps(state, indent=2, ensure_ascii=False), encoding="utf-8"
    )


def mark_step(course_slug: str, section_id: str, step: str, file_path: str = None):
    state = read_section_state(course_slug, section_id)
    state["steps"][step] = True
    if file_path:
        state["files"][step] = str(file_path)
    write_section_state(course_slug, section_id, state)


def init_course(
    name: str,
    slug: str,
    language: str = "en",
    audience_level: str = "Intermediate",
    subtitle_language: str = "tr",
) -> str:
    """Create the course folder + meta.json. Returns a status message."""
    course_dir = get_course_dir(slug)
    if course_dir.exists():
        return (
            f"Course '{slug}' already exists at {course_dir}. "
            f"Nothing changed. Use list_courses() to see current state."
        )
    course_dir.mkdir(parents=True)
    (course_dir / "sections").mkdir()
    meta = {
        "name": name,
        "slug": slug,
        "language": language,
        "subtitle_language": subtitle_language,
        "audience_level": audience_level,
        "brand": "thorius",
    }
    (course_dir / "meta.json").write_text(
        json.dumps(meta, indent=2, ensure_ascii=False), encoding="utf-8"
    )
    return (
        f"✓ Course '{name}' created at {course_dir}\n"
        f"  Language: {language}, Subtitles: {subtitle_language}, "
        f"Level: {audience_level}, Brand: Thorius Academy"
    )


def list_all_courses() -> str:
    courses_root = THORIUS_ROOT / "courses"
    if not courses_root.exists():
        return "No courses yet. Use create_course() to start."
    courses = sorted([d for d in courses_root.iterdir() if d.is_dir()])
    if not courses:
        return "No courses yet."
    lines = [f"Found {len(courses)} course(s):"]
    for c in courses:
        meta_file = c / "meta.json"
        meta = json.loads(meta_file.read_text()) if meta_file.exists() else {}
        sections_dir = c / "sections"
        n_sections = len(list(sections_dir.iterdir())) if sections_dir.exists() else 0
        lines.append(
            f"  • {meta.get('name', c.name)} ({c.name}): "
            f"{n_sections} section(s), level={meta.get('audience_level', '?')}"
        )
    return "\n".join(lines)
