# Unit Image Extraction Workflow

This document provides a step-by-step workflow for extracting unit images from game screenshots.

## Quick Start

1. **Prepare Screenshots**
   - Ensure you have the game screenshots saved as image files
   - Recommended formats: PNG, JPG

2. **Choose Extraction Method**
   - **Manual** (Recommended): Most accurate, full control
   - **Semi-Automated**: Use Python script for grid visualization

3. **Extract Images**
   - Follow the guide in `scripts/extract-images-guide.md`
   - Or use the Python helper script

4. **Validate & Rename**
   - Run `pnpm validate:images` to check what's missing
   - Run `pnpm rename:images` to get suggestions for renaming

## Detailed Workflow

### Step 1: Review Expected Images

```bash
# Generate/check the image checklist
pnpm generate:image-list

# View the checklist
cat public/assets/units/IMAGE_CHECKLIST.md
```

### Step 2: Extract Images

#### Option A: Manual Extraction (Best Quality)

1. Open screenshot in image editor (Photoshop, GIMP, Photopea)
2. For each unit card:
   - Select the entire card (including border)
   - Crop to square (128x128px or larger)
   - Save as PNG
   - Name according to checklist

#### Option B: Python Helper

```bash
# Install dependencies (if using Python)
pip install pillow opencv-python numpy

# Run helper script
python scripts/extract-unit-images.py path/to/screenshot.png
```

This creates a grid visualization to help identify card boundaries.

### Step 3: Place Images

```bash
# Copy extracted images to the units directory
cp extracted-images/*.png public/assets/units/
```

### Step 4: Validate

```bash
# Check which images are present/missing
pnpm validate:images
```

### Step 5: Rename if Needed

```bash
# Get suggestions for renaming unmatched files
pnpm rename:images
```

Manually rename files based on suggestions.

### Step 6: Final Validation

```bash
# Verify all images are present
pnpm validate:images
```

Should show: `✅ All images are present and accounted for!`

## Unit Card Locations

### Screenshot 1: Troops (3 columns, 4 rows)

```
Row 1: ARCHERS      | INFANTRY      | IRON GUARDS
Row 2: BOMBERS      | CATAPULT      | ASSASSINS
Row 3: NECROMANCER  | BUTCHER       | PALADIN
Row 4: UNDEAD MAGE  | ALCHEMIST     | LANCER
```

### Screenshot 2: Heroes (3 columns, 4 rows)

```
Row 1: HUNTRESS         | IMP            | BONEBREAKER
Row 2: SHAMAN           | MONK          | HEADLESS
Row 3: BONE WARRIOR     | BONE SPEARTHROWER | NIGHT HUNTER
Row 4: CURSED CATAPULT  | EXPLOSIVE SPIDER  | MAGIC ARCHER
```

### Screenshot 3: More Units (3 columns, 4 rows)

```
Row 1: STONE GOLEM      | BATTLE GOLEM   | PYROTECHNICIAN
Row 2: STORM MISTRESSES | SORCERER'S APPRENTICES | LAVA GOLEM
Row 3: ROYAL GUARD      | GRAVEDIGGER    | IMMORTAL
Row 4: AIR ELEMENTAL    | GIANT TOAD     | PHOENIX
```

## Tips for Best Results

1. **Consistency**: Keep all cards the same size (128x128px recommended)
2. **Quality**: Use high resolution source images
3. **Format**: PNG with transparency preferred
4. **Naming**: Use exact names from checklist
5. **Batch Process**: Extract all from one screenshot before moving to next

## Troubleshooting

### Images not showing in app
- Check file names match checklist exactly
- Verify images are in `public/assets/units/`
- Check browser console for 404 errors
- Ensure file extensions are `.png` (lowercase)

### Validation shows missing images
- Check spelling of filenames
- Verify special characters are handled correctly
- Run `pnpm rename:images` for suggestions

### Images look wrong
- Ensure you're cropping the full unit card
- Include the colored border
- Maintain aspect ratio (square)

## Tools Reference

- `pnpm generate:image-list` - Generate checklist
- `pnpm validate:images` - Check image status
- `pnpm rename:images` - Get rename suggestions
- `python scripts/extract-unit-images.py` - Grid visualization helper

