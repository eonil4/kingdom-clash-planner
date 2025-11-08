# Image Extraction Guide

This guide will help you extract unit images from the game screenshots.

## Method 1: Manual Extraction (Recommended)

### Tools Needed
- Image editing software (Photoshop, GIMP, Paint.NET, or online tools like Photopea)
- The game screenshots you provided

### Steps

1. **Open Screenshot in Image Editor**
   - Open one of the game screenshots in your image editor

2. **Identify Unit Cards**
   - Each unit card is a square/rectangular area with:
     - Unit illustration in the center
     - Colored border (indicating rarity)
     - Unit name at the bottom

3. **Crop Each Unit**
   - Use the crop/selection tool
   - Select the entire unit card (including border)
   - Recommended size: 128x128px or 256x256px
   - Save as PNG with transparent background (if possible)

4. **Naming Convention**
   - Convert unit name to lowercase
   - Replace spaces with hyphens
   - Remove special characters
   - Example: `PALADIN` → `paladin.png`
   - Example: `IRON GUARDS` → `iron-guards.png`

5. **Save Location**
   - Save all images to: `public/assets/units/`
   - Use exact filenames from `IMAGE_CHECKLIST.md`

## Method 2: Automated Extraction (Advanced)

If you have the screenshots as image files, you can use the Python script provided.

### Requirements
```bash
pip install pillow opencv-python numpy
```

### Usage
```bash
python scripts/extract-unit-images.py path/to/screenshot.png
```

## Unit Card Locations in Screenshots

### Screenshot 1: Troops Screen
- **Row 1**: ARCHERS, INFANTRY, IRON GUARDS
- **Row 2**: BOMBERS, CATAPULT, ASSASSINS
- **Row 3**: NECROMANCER, BUTCHER, PALADIN
- **Row 4**: UNDEAD MAGE, ALCHEMIST, LANCER

### Screenshot 2: Heroes Screen
- **Row 1**: HUNTRESS, IMP, BONEBREAKER
- **Row 2**: SHAMAN, MONK, HEADLESS
- **Row 3**: BONE WARRIOR, BONE SPEARTHROWER, NIGHT HUNTER
- **Row 4**: CURSED CATAPULT, EXPLOSIVE SPIDER, MAGIC ARCHER

### Screenshot 3: More Units
- **Row 1**: STONE GOLEM, BATTLE GOLEM, PYROTECHNICIAN
- **Row 2**: STORM MISTRESSES, SORCERER'S APPRENTICES, LAVA GOLEM
- **Row 3**: ROYAL GUARD, GRAVEDIGGER, IMMORTAL
- **Row 4**: AIR ELEMENTAL, GIANT TOAD, PHOENIX

## Tips

1. **Consistent Sizing**: Try to make all unit cards the same size
2. **Quality**: Use high resolution (at least 128x128px)
3. **Format**: PNG is preferred for transparency
4. **Background**: Transparent or match game style
5. **Batch Processing**: Extract all units from one screenshot before moving to the next

## Validation

After extracting images, run:
```bash
pnpm validate:images
```

This will show which images are still missing.

