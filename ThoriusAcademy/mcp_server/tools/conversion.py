"""
Convert .pptx → .pdf → individual JPG slides.
Requires: LibreOffice (soffice) + ImageMagick (magick) + Ghostscript (gs)
"""

import shutil
import subprocess
from pathlib import Path

from helpers import ensure_section, mark_step


def find_executable(*candidates) -> str:
    """Find the first existing executable from candidates list."""
    for c in candidates:
        if shutil.which(c):
            return c
    # Check common Mac paths
    for c in candidates:
        for path in ["/opt/homebrew/bin", "/usr/local/bin", "/Applications/LibreOffice.app/Contents/MacOS"]:
            full = Path(path) / c
            if full.exists():
                return str(full)
    return ""


def convert_pptx_to_jpg_impl(course_slug: str, section_id: str) -> str:
    sec_dir = ensure_section(course_slug, section_id)
    pptx = sec_dir / "slides.pptx"
    if not pptx.exists():
        return f"ERROR: {pptx} not found. Build the presentation first."

    slides_dir = sec_dir / "slides"
    slides_dir.mkdir(exist_ok=True)
    # Clean old JPGs
    for old in slides_dir.glob("*.jpg"):
        old.unlink()

    # Locate executables
    soffice = find_executable("soffice", "libreoffice")
    magick = find_executable("magick", "convert")
    if not soffice:
        return (
            "ERROR: LibreOffice (soffice) not found. "
            "Install via: brew install --cask libreoffice"
        )
    if not magick:
        return (
            "ERROR: ImageMagick (magick) not found. "
            "Install via: brew install imagemagick ghostscript"
        )

    # Step 1: pptx → pdf via LibreOffice
    pdf_out_dir = sec_dir
    try:
        subprocess.run(
            [soffice, "--headless", "--convert-to", "pdf",
             "--outdir", str(pdf_out_dir), str(pptx)],
            check=True, capture_output=True, text=True, timeout=120
        )
    except subprocess.CalledProcessError as e:
        return f"ERROR: LibreOffice conversion failed.\nstderr: {e.stderr}"
    except subprocess.TimeoutExpired:
        return "ERROR: LibreOffice timed out after 2 minutes."

    pdf = sec_dir / "slides.pdf"
    if not pdf.exists():
        return f"ERROR: Expected {pdf} but it wasn't created."

    # Step 2: pdf → jpgs via ImageMagick
    output_pattern = slides_dir / "slide_tmp_%02d.jpg"
    try:
        subprocess.run(
            [magick, "-density", "200", str(pdf),
             "-quality", "95", str(output_pattern)],
            check=True, capture_output=True, text=True, timeout=180
        )
    except subprocess.CalledProcessError as e:
        return f"ERROR: ImageMagick conversion failed.\nstderr: {e.stderr}"

    # Step 3: Rename slide_tmp_00 → slide_01, ... (1-indexed)
    tmp_files = sorted(slides_dir.glob("slide_tmp_*.jpg"))
    for idx, tmp in enumerate(tmp_files, start=1):
        final = slides_dir / f"slide_{idx:02d}.jpg"
        tmp.rename(final)

    n = len(tmp_files)
    mark_step(course_slug, section_id, "jpg", str(slides_dir))
    return (
        f"✓ Converted {n} slide(s) to JPG in {slides_dir}\n"
        f"  Format: slide_01.jpg ... slide_{n:02d}.jpg @ 200 DPI"
    )
