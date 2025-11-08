# Kingdom Clash Planner

A formation planner application for Kingdom Clash game, built with React, TypeScript, and modern web technologies.

## Features

- 🎯 **7x7 Formation Grid** - Drag and drop units to create formations
- 🎨 **Unit Management** - Browse, search, and sort units by level, rarity, or name
- 💾 **Multiple Formations** - Save and manage multiple formation presets
- 🎭 **Unit Rarities** - Visual distinction for Common, Rare, Epic, and Legendary units
- 🔍 **Search & Filter** - Quickly find units by name or rarity
- 📱 **Responsive Design** - Works on desktop and mobile devices
- ♿ **Accessible** - WCAG AAA compliant with proper ARIA labels

## Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Redux Toolkit + Redux Saga** - State management
- **Material-UI (MUI)** - UI components
- **TailwindCSS** - Utility-first CSS
- **React DnD** - Drag and drop functionality
- **React Router** - Navigation

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm

### Installation

```bash
# Install dependencies
pnpm install
```

### Development

```bash
# Start dev server
pnpm dev
```

The app will be available at `http://localhost:3000`

### Build

```bash
# Build for production
pnpm build
```

### Preview Production Build

```bash
pnpm preview
```

## Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm lint` - Run ESLint
- `pnpm lint:fix` - Fix ESLint errors
- `pnpm preview` - Preview production build
- `pnpm ci` - Run CI pipeline (lint + build + tests)
- `pnpm test:unit` - Run unit tests
- `pnpm test:unit:watch` - Run unit tests in watch mode
- `pnpm test:integration` - Run integration tests
- `pnpm test:e2e` - Run end-to-end tests
- `pnpm generate:image-list` - Generate image checklist
- `pnpm validate:images` - Validate unit images

## Project Structure

```
src/
├── assets/           # Static assets (images, fonts, etc.)
├── components/       # Reusable components
├── features/         # Feature-specific logic and components
├── hooks/            # Custom React hooks
├── layouts/          # Layout components
├── pages/            # Page components (routes)
├── services/         # API requests, utilities
├── store/            # State management (Redux)
│   ├── reducers/     # Redux reducers
│   └── sagas/        # Redux sagas
├── styles/           # Global styles
├── types/            # TypeScript types
├── utils/            # Utility functions
├── App.tsx           # App component
├── index.tsx         # Main entry point
└── router.tsx        # Routing configuration
```

## Unit Images

Unit images should be placed in `public/assets/units/` directory.

### Adding Unit Images

1. Extract unit card images from game screenshots
2. Crop each unit individually (recommended: 128x128px or larger)
3. Save as PNG files with the correct naming convention
4. Place images in `public/assets/units/` directory

### Image Naming Convention

- Convert unit names to lowercase
- Replace spaces with hyphens
- Remove special characters
- Example: `PALADIN` → `paladin.png`
- Example: `IRON GUARDS` → `iron-guards.png`

### Generate Image Checklist

```bash
pnpm generate:image-list
```

This will generate a checklist of all required unit images in `public/assets/units/IMAGE_CHECKLIST.md`

### Validate Images

```bash
pnpm validate:images
```

This will check which images are missing or extra.

## Unit Rarities

- **Common** (Gray) - Basic units
- **Rare** (Blue) - Uncommon units
- **Epic** (Purple) - Powerful units
- **Legendary** (Gold) - Most powerful units

## Formation Planner Usage

1. **View Formations**: Click the "Formations" icon in the header to see all saved formations
2. **Place Units**: Drag units from the unit list to the 7x7 grid
3. **Remove Units**: Drag units from the grid back to the unit list
4. **Search Units**: Use the search bar to find specific units
5. **Sort Units**: Use the dropdown to sort by level, rarity, or name
6. **Withdraw All**: Click "WITHDRAW ALL" to remove all units from the formation
7. **Manage Units**: Click "Manage Units" for unit management options

## Development Principles

This project follows:

- **Clean Code** principles
- **Design Patterns** (Component, Container, etc.)
- **OOP Principles**
- **DRY, KISS, SOLID, YAGNI**
- **WCAG AAA** accessibility standards
- **Security** best practices
- **Performance** optimization

## Testing

- **Unit Tests**: `pnpm test:unit`
- **Integration Tests**: `pnpm test:integration`
- **E2E Tests**: `pnpm test:e2e` (Playwright)

## Linting

- **ESLint** with accessibility plugin (jsx-a11y)
- **TypeScript** strict mode
- Run `pnpm lint` to check for issues
- Run `pnpm lint:fix` to auto-fix issues

## Contributing

1. Follow the coding standards
2. Write tests for new features
3. Update documentation
4. Run linter and tests before committing

## License

Private project - All rights reserved
