"""
TTS audio generation using Microsoft Edge TTS.
"""

import os
import re
from pathlib import Path

import edge_tts

from helpers import ensure_section, mark_step


# ============================================================
# TEXT NORMALIZATION (TTS-friendly)
# ============================================================
ABBREVIATIONS = [
    # Compound terms that TTS reads wrong
    ("AI-Powered",      "A I powered"),
    ("AI-powered",      "A I powered"),
    ("year-over-year",  "year over year"),
    ("Year-over-Year",  "year over year"),
    ("YoY",             "year over year"),
    ("ninety-five",     "ninety five"),
    ("Open-to-Buy",     "Open to Buy"),
    ("open-to-buy",     "open to buy"),
    ("sell-through",    "sell through"),
    ("Sell-Through",    "Sell through"),
    ("four-tier",       "four tier"),
    ("slow-movers",     "slow movers"),
    ("slow-mover",      "slow mover"),
    ("cover-based",     "cover based"),
    ("low-return",      "low return"),
    ("top-down",        "top down"),
    ("bottom-up",       "bottom up"),
    ("field-tested",    "field tested"),
    ("single-pool",     "single pool"),
    ("four-quadrant",   "four quadrant"),

    # Acronyms — letter-by-letter
    ("P&L",   "P and L"),
    ("GMROI", "G M R O I"),
    ("KPIs",  "K P Is"),
    ("KPI",   "K P I"),
    ("SKUs",  "S K Us"),
    ("SKU",   "S K U"),
    ("OTB",   "O T B"),
    ("DSI",   "D S I"),
    ("BOM",   "B O M"),
    ("EOM",   "E O M"),
    ("MAPE",  "M A P E"),
    ("WAPE",  "W A P E"),
]


def normalize_abbreviations(text: str) -> str:
    for src, dst in ABBREVIATIONS:
        text = text.replace(src, dst)
    # Standalone "AI" (word boundary)
    text = re.sub(r'\bAI\b', 'A I', text)
    return text


def clean_em_dashes(text: str) -> str:
    """Replace em/en dashes with commas — natural pause without 'slash' artifact."""
    text = text.replace(" — ", ", ")
    text = text.replace(" – ", ", ")
    text = text.replace("—", ",")
    text = text.replace("–", ",")
    return text


def parse_narration(content: str):
    """Returns list of (slide_no, title, narration_text)."""
    pattern = re.compile(r"^##\s*Slide\s*(\d+)\s*:\s*(.+?)\s*$", re.MULTILINE)
    matches = list(pattern.finditer(content))
    slides = []
    for i, m in enumerate(matches):
        slide_no = int(m.group(1))
        title = m.group(2).strip()
        start = m.end()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(content)
        body = content[start:end].strip()
        slides.append((slide_no, title, body))
    return slides


# ============================================================
# MAIN ENTRY
# ============================================================
async def generate_audio_impl(
    course_slug: str,
    section_id: str,
    narration_text: str,
    voice: str = "en-US-AndrewNeural",
    rate: str = "-6%",
    pitch: str = "+0Hz",
) -> str:
    sec_dir = ensure_section(course_slug, section_id)
    audio_dir = sec_dir / "audio"
    audio_dir.mkdir(exist_ok=True)

    # Save the narration source file
    narration_file = sec_dir / "narration.txt"
    narration_file.write_text(narration_text, encoding="utf-8")
    mark_step(course_slug, section_id, "narration", str(narration_file))

    slides = parse_narration(narration_text)
    if not slides:
        return (
            "ERROR: Could not parse any slides from narration. "
            "Expected '## Slide N: Title' headers."
        )

    results = []
    for slide_no, title, text in slides:
        # Two-pass cleanup
        cleaned = normalize_abbreviations(text)
        cleaned = clean_em_dashes(cleaned)

        out_path = audio_dir / f"slide_{slide_no:02d}.mp3"
        try:
            communicate = edge_tts.Communicate(
                text=cleaned,
                voice=voice,
                rate=rate,
                pitch=pitch,
            )
            await communicate.save(str(out_path))
            size_kb = out_path.stat().st_size / 1024
            results.append(
                f"  ✓ Slide {slide_no:02d}: {title[:40]} → {size_kb:.0f} KB"
            )
        except Exception as e:
            results.append(f"  ✗ Slide {slide_no:02d}: FAIL — {e}")

    mark_step(course_slug, section_id, "mp3", str(audio_dir))
    return (
        f"Generated {len(slides)} MP3 file(s) in {audio_dir}\n"
        f"Voice: {voice}, Rate: {rate}\n\n" + "\n".join(results)
    )
