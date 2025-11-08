#!/usr/bin/env python3
"""
Automated unit image extraction from game screenshots.
This script attempts to automatically detect and extract unit cards.

Usage:
    python scripts/extract-images-automated.py <screenshot_path> [output_dir]

Requirements:
    pip install pillow opencv-python numpy
"""

import sys
import os
from pathlib import Path
from PIL import Image
import cv2
import numpy as np

# Unit names in order (adjust based on your screenshot)
UNIT_NAMES_TROOPS = [
    "ARCHERS", "INFANTRY", "IRON GUARDS",
    "BOMBERS", "CATAPULT", "ASSASSINS",
    "NECROMANCER", "BUTCHER", "PALADIN",
    "UNDEAD MAGE", "ALCHEMIST", "LANCER"
]

UNIT_NAMES_HEROES = [
    "HUNTRESS", "IMP", "BONEBREAKER",
    "SHAMAN", "MONK", "HEADLESS",
    "BONE WARRIOR", "BONE SPEARTHROWER", "NIGHT HUNTER",
    "CURSED CATAPULT", "EXPLOSIVE SPIDER", "MAGIC ARCHER"
]

UNIT_NAMES_MORE = [
    "STONE GOLEM", "BATTLE GOLEM", "PYROTECHNICIAN",
    "STORM MISTRESSES", "SORCERER'S APPRENTICES", "LAVA GOLEM",
    "ROYAL GUARD", "GRAVEDIGGER", "IMMORTAL",
    "AIR ELEMENTAL", "GIANT TOAD", "PHOENIX"
]

def convert_name_to_filename(name):
    """Convert unit name to filename."""
    return name.lower().replace(' ', '-').replace("'", '').replace('/', '-') + '.png'

def detect_card_grid(img, expected_rows=4, expected_cols=3):
    """Detect unit card grid in image."""
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # Try to detect grid lines
    edges = cv2.Canny(gray, 50, 150)
    lines = cv2.HoughLinesP(edges, 1, np.pi/180, 100, minLineLength=100, maxLineGap=10)
    
    # Find approximate card boundaries
    height, width = img.shape[:2]
    
    # Estimate card size (accounting for header/footer)
    usable_height = height * 0.7  # Assume 70% is grid area
    card_height = usable_height / expected_rows
    card_width = width / expected_cols
    
    return int(card_width), int(card_height), int((height - usable_height) / 2)

def extract_cards_from_grid(img, unit_names, output_dir, start_y=0):
    """Extract individual cards from detected grid."""
    card_width, card_height, header_height = detect_card_grid(img)
    
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    
    extracted = []
    row = 0
    col = 0
    
    for i, unit_name in enumerate(unit_names):
        if i > 0 and i % 3 == 0:
            row += 1
            col = 0
        
        # Calculate card position
        x = col * card_width
        y = header_height + start_y + (row * card_height)
        
        # Extract card
        card = img[y:y+card_height, x:x+card_width]
        
        if card.size > 0:
            # Resize to standard size
            card_resized = cv2.resize(card, (128, 128), interpolation=cv2.INTER_LANCZOS4)
            
            # Convert to RGB for PIL
            card_rgb = cv2.cvtColor(card_resized, cv2.COLOR_BGR2RGB)
            card_pil = Image.fromarray(card_rgb)
            
            # Save
            filename = convert_name_to_filename(unit_name)
            filepath = output_dir / filename
            card_pil.save(filepath, 'PNG')
            
            extracted.append((unit_name, filename))
            print(f"✓ Extracted: {unit_name} → {filename}")
        
        col += 1
    
    return extracted

def main():
    if len(sys.argv) < 2):
        print("Usage: python extract-images-automated.py <screenshot_path> [screenshot_type] [output_dir]")
        print("\nScreenshot types:")
        print("  troops  - Troops screen (default)")
        print("  heroes  - Heroes screen")
        print("  more    - More units screen")
        print("\nExample:")
        print("  python extract-images-automated.py screenshot1.png troops")
        sys.exit(1)
    
    screenshot_path = sys.argv[1]
    screenshot_type = sys.argv[2] if len(sys.argv) > 2 else 'troops'
    output_dir = sys.argv[3] if len(sys.argv) > 3 else None
    
    if output_dir is None:
        output_dir = Path(__file__).parent.parent / 'public' / 'assets' / 'units'
    else:
        output_dir = Path(output_dir)
    
    if not os.path.exists(screenshot_path):
        print(f"Error: Screenshot not found: {screenshot_path}")
        sys.exit(1)
    
    # Load image
    img = cv2.imread(screenshot_path)
    if img is None:
        print(f"Error: Could not load image: {screenshot_path}")
        sys.exit(1)
    
    # Select unit names based on screenshot type
    if screenshot_type.lower() == 'heroes':
        unit_names = UNIT_NAMES_HEROES
    elif screenshot_type.lower() == 'more':
        unit_names = UNIT_NAMES_MORE
    else:
        unit_names = UNIT_NAMES_TROOPS
    
    print(f"\n📸 Processing: {screenshot_path}")
    print(f"📋 Type: {screenshot_type}")
    print(f"📁 Output: {output_dir}")
    print(f"🎯 Units: {len(unit_names)}\n")
    
    # Extract cards
    extracted = extract_cards_from_grid(img, unit_names, output_dir)
    
    print(f"\n✅ Extracted {len(extracted)} unit images")
    print(f"📂 Saved to: {output_dir}\n")
    
    # Validate
    print("💡 Next steps:")
    print("   1. Review extracted images")
    print("   2. Adjust crop if needed (manual fine-tuning)")
    print("   3. Run: pnpm validate:images")

if __name__ == '__main__':
    main()

