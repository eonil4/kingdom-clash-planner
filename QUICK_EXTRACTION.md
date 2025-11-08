# Quick Image Extraction Guide

## Fastest Method: Manual Extraction

### Tools
- **Online**: [Photopea.com](https://www.photopea.com) (free, works in browser)
- **Desktop**: GIMP, Paint.NET, or Photoshop

### Steps

1. **Open Screenshot** in your image editor

2. **For Each Unit Card**:
   - Select the entire card (use rectangular selection tool)
   - Include the colored border
   - Crop to square (128x128px minimum)
   - Save as PNG

3. **Naming**:
   - Use the exact filename from `public/assets/units/IMAGE_CHECKLIST.md`
   - Example: `PALADIN` → save as `paladin.png`

4. **Save Location**:
   - Save directly to: `public/assets/units/`

### Quick Reference - Unit Names to Filenames

| Unit Name | Filename |
|-----------|----------|
| PALADIN | `paladin.png` |
| HUNTRESS | `huntress.png` |
| ARCHERS | `archers.png` |
| INFANTRY | `infantry.png` |
| IRON GUARDS | `iron-guards.png` |
| NECROMANCER | `necromancer.png` |
| BUTCHER | `butcher.png` |
| ALCHEMIST | `alchemist.png` |
| STONE GOLEM | `stone-golem.png` |
| PHOENIX | `phoenix.png` |

**Full list**: See `public/assets/units/IMAGE_CHECKLIST.md`

### After Extraction

```bash
# Check what you have
pnpm validate:images

# Get rename suggestions if needed
pnpm rename:images
```

## Batch Processing Tips

1. Extract all units from **Screenshot 1** (Troops) first
2. Then **Screenshot 2** (Heroes)
3. Finally **Screenshot 3** (More Units)
4. Validate after each batch

## Common Issues

**Problem**: Image not showing in app
- **Solution**: Check filename matches checklist exactly (case-sensitive)

**Problem**: Wrong unit name
- **Solution**: Run `pnpm rename:images` for suggestions

**Problem**: Image looks cropped wrong
- **Solution**: Include the full card including border, maintain square aspect ratio

