#!/usr/bin/env python3
"""
Thorius Academy MCP Server
==========================

Provides tools for the end-to-end Udemy course production pipeline:
PowerPoint → JPG → narration → MP3 → SRT → MP4 with transitions.

Tools exposed to Claude:
  - create_course(name, language, audience_level)
  - list_courses()
  - get_section_status(course_name, section_id)
  - build_presentation(course_name, section_id, slides_spec)
  - convert_pptx_to_jpg(course_name, section_id)
  - generate_audio(course_name, section_id, narration_text)
  - generate_subtitle(course_name, section_id, srt_content)
  - build_video(course_name, section_id)

Architecture:
  ~/Desktop/ThoriusAcademy/
    mcp_server/           ← this code
    courses/<name>/
      meta.json
      sections/<NN>_<slug>/
        spec.json         ← slide spec (in / out / status)
        slides.pptx
        slides.pdf
        slides/*.jpg
        audio/*.mp3
        narration.txt
        subtitles.srt
        final.mp4
        state.json        ← per-section progress flags
"""

import asyncio
import json
import os
import sys
from pathlib import Path

from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp.types import Tool, TextContent

# Import our tool implementations
THIS_DIR = Path(__file__).parent.resolve()
sys.path.insert(0, str(THIS_DIR))

from tools.presentation import build_presentation_impl
from tools.audio import generate_audio_impl
from tools.video import build_video_impl
from tools.subtitle import generate_subtitle_impl
from tools.conversion import convert_pptx_to_jpg_impl
from helpers import (
    THORIUS_ROOT,
    get_course_dir,
    get_section_dir,
    init_course,
    list_all_courses,
    read_section_state,
    write_section_state,
)


server = Server("thorius-academy")


# ============================================================
# TOOL REGISTRATION
# ============================================================
@server.list_tools()
async def list_tools() -> list[Tool]:
    return [
        Tool(
            name="create_course",
            description=(
                "Initialize a new Udemy course workspace. "
                "Creates ~/Desktop/ThoriusAcademy/courses/<slug>/ with meta.json. "
                "Use this BEFORE any other course-related tool."
            ),
            inputSchema={
                "type": "object",
                "properties": {
                    "name": {
                        "type": "string",
                        "description": "Human-readable course title (e.g. 'Retail Stock Management')"
                    },
                    "slug": {
                        "type": "string",
                        "description": "Short folder-safe name (e.g. 'retail_stock_mgmt')"
                    },
                    "language": {
                        "type": "string",
                        "description": "Narration language code: 'en' or 'tr'",
                        "default": "en"
                    },
                    "audience_level": {
                        "type": "string",
                        "description": "Beginner / Intermediate / Advanced / Mixed",
                        "default": "Intermediate"
                    },
                    "subtitle_language": {
                        "type": "string",
                        "description": "Subtitle language code (default 'tr')",
                        "default": "tr"
                    }
                },
                "required": ["name", "slug"]
            }
        ),
        Tool(
            name="list_courses",
            description="List all existing course workspaces with their progress summary.",
            inputSchema={"type": "object", "properties": {}}
        ),
        Tool(
            name="get_section_status",
            description=(
                "Inspect a section's progress: which production steps "
                "(pptx, jpg, mp3, srt, mp4) are complete."
            ),
            inputSchema={
                "type": "object",
                "properties": {
                    "course_slug": {"type": "string"},
                    "section_id": {
                        "type": "string",
                        "description": "Section folder name e.g. '01_introduction'"
                    }
                },
                "required": ["course_slug", "section_id"]
            }
        ),
        Tool(
            name="build_presentation",
            description=(
                "Generate a Thorius Academy-branded .pptx from a slide spec. "
                "The spec is a list of slide dictionaries; each slide has a "
                "'layout' (cover, content_typography, numbered_grid, "
                "three_columns, timeline, section_divider, closing) and "
                "layout-specific fields. See SLIDE LAYOUTS in the server "
                "documentation for available fields per layout type."
            ),
            inputSchema={
                "type": "object",
                "properties": {
                    "course_slug": {"type": "string"},
                    "section_id": {"type": "string"},
                    "total_slides_in_course": {
                        "type": "integer",
                        "description": "Total slide count across all sections (for footer Page X / Y)",
                        "default": 67
                    },
                    "starting_page_no": {
                        "type": "integer",
                        "description": "What page number this section starts at",
                        "default": 1
                    },
                    "slides": {
                        "type": "array",
                        "description": "Ordered list of slide specs",
                        "items": {"type": "object"}
                    }
                },
                "required": ["course_slug", "section_id", "slides"]
            }
        ),
        Tool(
            name="convert_pptx_to_jpg",
            description=(
                "Convert the section's .pptx into JPG files (one per slide) "
                "using LibreOffice + Ghostscript. Output: slides/slide_NN.jpg"
            ),
            inputSchema={
                "type": "object",
                "properties": {
                    "course_slug": {"type": "string"},
                    "section_id": {"type": "string"}
                },
                "required": ["course_slug", "section_id"]
            }
        ),
        Tool(
            name="generate_audio",
            description=(
                "Generate per-slide MP3 narration via Microsoft Edge TTS. "
                "Input: narration text with '## Slide N: Title' headers. "
                "Output: audio/slide_NN.mp3 files. Auto-normalizes "
                "abbreviations (KPI → K P I) for natural TTS reading. "
                "Voice: en-US-AndrewNeural by default."
            ),
            inputSchema={
                "type": "object",
                "properties": {
                    "course_slug": {"type": "string"},
                    "section_id": {"type": "string"},
                    "narration_text": {
                        "type": "string",
                        "description": "Full narration with ## Slide N: headers"
                    },
                    "voice": {
                        "type": "string",
                        "default": "en-US-AndrewNeural"
                    },
                    "rate": {
                        "type": "string",
                        "default": "-6%"
                    }
                },
                "required": ["course_slug", "section_id", "narration_text"]
            }
        ),
        Tool(
            name="generate_subtitle",
            description=(
                "Save SRT subtitle content for the section. "
                "Input: full SRT-format text with timestamps."
            ),
            inputSchema={
                "type": "object",
                "properties": {
                    "course_slug": {"type": "string"},
                    "section_id": {"type": "string"},
                    "srt_content": {"type": "string"}
                },
                "required": ["course_slug", "section_id", "srt_content"]
            }
        ),
        Tool(
            name="build_video",
            description=(
                "Combine the section's JPGs and MP3s into a final MP4 with "
                "slide transitions (slideleft wipe ~0.5s) and subtle Ken Burns "
                "zoom inside each slide. Requires JPGs and MP3s to exist already."
            ),
            inputSchema={
                "type": "object",
                "properties": {
                    "course_slug": {"type": "string"},
                    "section_id": {"type": "string"},
                    "transition_duration": {
                        "type": "number",
                        "default": 0.5
                    },
                    "tail_buffer": {
                        "type": "number",
                        "default": 0.5
                    }
                },
                "required": ["course_slug", "section_id"]
            }
        ),
    ]


# ============================================================
# TOOL DISPATCH
# ============================================================
@server.call_tool()
async def call_tool(name: str, arguments: dict) -> list[TextContent]:
    try:
        if name == "create_course":
            result = init_course(
                name=arguments["name"],
                slug=arguments["slug"],
                language=arguments.get("language", "en"),
                audience_level=arguments.get("audience_level", "Intermediate"),
                subtitle_language=arguments.get("subtitle_language", "tr"),
            )
            return [TextContent(type="text", text=result)]

        elif name == "list_courses":
            result = list_all_courses()
            return [TextContent(type="text", text=result)]

        elif name == "get_section_status":
            state = read_section_state(
                arguments["course_slug"],
                arguments["section_id"]
            )
            return [TextContent(type="text", text=json.dumps(state, indent=2))]

        elif name == "build_presentation":
            result = build_presentation_impl(
                course_slug=arguments["course_slug"],
                section_id=arguments["section_id"],
                slides=arguments["slides"],
                total_slides_in_course=arguments.get("total_slides_in_course", 67),
                starting_page_no=arguments.get("starting_page_no", 1),
            )
            return [TextContent(type="text", text=result)]

        elif name == "convert_pptx_to_jpg":
            result = convert_pptx_to_jpg_impl(
                course_slug=arguments["course_slug"],
                section_id=arguments["section_id"],
            )
            return [TextContent(type="text", text=result)]

        elif name == "generate_audio":
            result = await generate_audio_impl(
                course_slug=arguments["course_slug"],
                section_id=arguments["section_id"],
                narration_text=arguments["narration_text"],
                voice=arguments.get("voice", "en-US-AndrewNeural"),
                rate=arguments.get("rate", "-6%"),
            )
            return [TextContent(type="text", text=result)]

        elif name == "generate_subtitle":
            result = generate_subtitle_impl(
                course_slug=arguments["course_slug"],
                section_id=arguments["section_id"],
                srt_content=arguments["srt_content"],
            )
            return [TextContent(type="text", text=result)]

        elif name == "build_video":
            result = build_video_impl(
                course_slug=arguments["course_slug"],
                section_id=arguments["section_id"],
                transition_duration=arguments.get("transition_duration", 0.5),
                tail_buffer=arguments.get("tail_buffer", 0.5),
            )
            return [TextContent(type="text", text=result)]

        else:
            return [TextContent(type="text", text=f"Unknown tool: {name}")]

    except Exception as e:
        import traceback
        tb = traceback.format_exc()
        return [TextContent(
            type="text",
            text=f"ERROR in tool '{name}':\n{str(e)}\n\nTraceback:\n{tb}"
        )]


# ============================================================
# MAIN
# ============================================================
async def main():
    # Ensure Thorius root exists
    THORIUS_ROOT.mkdir(parents=True, exist_ok=True)
    (THORIUS_ROOT / "courses").mkdir(exist_ok=True)

    async with stdio_server() as (read_stream, write_stream):
        await server.run(
            read_stream,
            write_stream,
            server.create_initialization_options()
        )


if __name__ == "__main__":
    asyncio.run(main())
