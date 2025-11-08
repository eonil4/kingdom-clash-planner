#!/usr/bin/env python3
"""
Script to help extract unit images from game screenshots.
This script provides a semi-automated way to extract unit cards.

Usage:
    python scripts/extract-unit-images.py <screenshot_path> [output_dir]

Requirements:
    pip install pillow opencv-python numpy
"""

import sys
import os
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import cv2
import numpy as np

# Unit card dimensions (approximate, adjust based on your screenshots)
CARD_WIDTH = 128
CARD_HEIGHT = 128

# Grid layout (adjust based on screenshot)
GRID_COLS = 3
GRID_ROWS = 4

# Expected unit names in order (adjust based on your screenshot)
UNIT_NAMES = [
    # Add unit names in the order they appear in your screenshot
    # Example:
    # "ARCHERS", "INFANTRY", "IRON GUARDS",
    # "BOMBERS", "CATAPULT", "ASSASSINS",
    # etc.
]

def convert_name_to_filename(name: str) -> str:
    """Convert unit name to filename."""
    return name.lower().replace(' ', '-').replace("'", '').replace('/', '-') + '.png'

def extract_unit_cards(image_path: str, output_dir: str = None):
    """Extract unit cards from screenshot."""
    if output_dir is None:
        output_dir = Path(__file__).parent.parent / 'public' / 'assets' / 'units'
    else:
        output_dir = Path(output_dir)
    
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Load image
    img = cv2.imread(image_path)
    if img is None:
        print(f"Error: Could not load image from {image_path}")
        return
    
    height, width = img.shape[:2]
    
    print(f"Image dimensions: {width}x{height}")
    print(f"Output directory: {output_dir}")
    print("\nThis script provides a helper. For best results, use manual extraction.")
    print("\nTo manually extract:")
    print("1. Open the screenshot in an image editor")
    print("2. Identify the unit card grid")
    print("3. Crop each unit card individually")
    print("4. Save with names from IMAGE_CHECKLIST.md")
    
    # Calculate approximate card size
    card_w = width // GRID_COLS
    card_h = height // (GRID_ROWS + 2)  # +2 for header/footer
    
    print(f"\nApproximate card size: {card_w}x{card_h} pixels")
    print(f"Grid layout: {GRID_COLS} columns x {GRID_ROWS} rows")
    
    # Create a helper visualization
    pil_img = Image.fromarray(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))
    draw = ImageDraw.Draw(pil_img)
    
    # Draw grid lines to help identify cards
    for i in range(GRID_COLS + 1):
        x = i * card_w
        draw.line([(x, 0), (x, height)], fill='red', width=2)
    
    for i in range(GRID_ROWS + 1):
        y = i * card_h
        draw.line([(0, y), (width, y)], fill='red', width=2)
    
    # Save visualization
    viz_path = output_dir.parent / 'extraction-guide.png'
    pil_img.save(viz_path)
    print(f"\nGrid visualization saved to: {viz_path}")
    print("Use this to identify unit card boundaries.")

def main():
    if len(sys.argv) < 2:
        print("Usage: python extract-unit-images.py <screenshot_path> [output_dir]")
        print("\nExample:")
        print("  python extract-unit-images.py screenshots/troops.png")
        sys.exit(1)
    
    image_path = sys.argv[1]
    output_dir = sys.argv[2] if len(sys.argv) > 2 else None
    
    if not os.path.exists(image_path):
        print(f"Error: Image file not found: {image_path}")
        sys.exit(1)
    
    extract_unit_cards(image_path, output_dir)

if __name__ == '__main__':
    main()

