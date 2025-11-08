# Image Extraction Instructions

Since I cannot directly access your image files, here are the best methods to extract unit images:

## Method 1: Web-Based Tool (Easiest)

1. **Open the HTML tool**:
   ```bash
   # Open in browser
   start scripts/extract-images-simple.html
   # Or double-click the file
   ```

2. **Upload your screenshot**:
   - Drag and drop or click to upload
   - The tool will display your image with a grid overlay

3. **Adjust grid settings**:
   - Set columns (usually 3)
   - Set rows (usually 4)
   - Set card size (128px recommended)

4. **Extract cards**:
   - Click "Extract All Cards"
   - Rename each card with the correct filename from `IMAGE_CHECKLIST.md`
   - Click "Download All as ZIP"

5. **Place images**:
   - Extract the ZIP file
   - Copy all PNG files to `public/assets/units/`
   - Ensure filenames match the checklist exactly

## Method 2: Python Script (Semi-Automated)

1. **Install dependencies**:
   ```bash
   pip install pillow opencv-python numpy
   ```

2. **Run extraction**:
   ```bash
   # For Troops screenshot
   python scripts/extract-images-automated.py screenshot1.png troops
   
   # For Heroes screenshot
   python scripts/extract-images-automated.py screenshot2.png heroes
   
   # For More Units screenshot
   python scripts/extract-images-automated.py screenshot3.png more
   ```

3. **Review and adjust**:
   - Check extracted images
   - Manually fine-tune if needed
   - Run `pnpm validate:images`

## Method 3: Manual Extraction (Most Control)

1. **Use image editor** (Photopea.com, GIMP, Photoshop):
   - Open screenshot
   - For each unit card:
     - Select entire card (including border)
     - Crop to square (128x128px)
     - Save as PNG
     - Name according to `IMAGE_CHECKLIST.md`

2. **Save to**:
   ```
   public/assets/units/
   ```

## Quick Reference: Unit Names → Filenames

| Unit Name | Filename |
|-----------|----------|
| PALADIN | `paladin.png` |
| HUNTRESS | `huntress.png` |
| ARCHERS | `archers.png` |
| IRON GUARDS | `iron-guards.png` |
| NECROMANCER | `necromancer.png` |
| STONE GOLEM | `stone-golem.png` |
| SORCERER'S APPRENTICES | `sorcerers-apprentices.png` |

**Full list**: See `public/assets/units/IMAGE_CHECKLIST.md`

## After Extraction

```bash
# Validate what you have
pnpm validate:images

# Get rename suggestions if needed
pnpm rename:images
```

## Tips

1. **Consistent sizing**: All cards should be the same size (128x128px)
2. **Include borders**: Crop the full card including the colored border
3. **Exact naming**: Filenames must match checklist exactly (case-sensitive)
4. **PNG format**: Use PNG for best quality
5. **Batch process**: Extract all from one screenshot before moving to next

## Troubleshooting

**Images not showing?**
- Check filenames match checklist exactly
- Verify files are in `public/assets/units/`
- Check browser console for errors

**Wrong crop?**
- Include full card including border
- Maintain square aspect ratio
- Use consistent size for all cards

