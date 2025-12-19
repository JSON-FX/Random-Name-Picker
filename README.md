# Random Name Picker

A modern, interactive random name picker application built with Next.js. Perfect for raffles, giveaways, classroom activities, or any scenario where you need to randomly select names from a list.

## Features

- **Category Management**: Organize names into different categories (e.g., teams, groups, departments)
- **Fullscreen Mode**: Immersive fullscreen experience for picking winners in front of an audience
- **CSV Import**: Bulk import names from CSV files
- **Results Tracking**: Keep track of all selected winners with category information
- **CSV Export**: Export results to CSV for record keeping
- **Customizable Duration**: Adjust the shuffle animation duration (1s to 10s)
- **Responsive Design**: Works on desktop and mobile devices
- **Data Persistence**: Names and results are saved in local storage

## Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher (or yarn/pnpm)

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd roulette
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Production Build

To create a production build:

```bash
npm run build
```

To run the production server:

```bash
npm start
```

## Usage

### Adding Categories and Names

1. Navigate to the **Manage Names** page
2. Create categories by entering a category name and selecting a color
3. Add names to each category using the input field
4. Alternatively, import names in bulk using a CSV file

### CSV Import Format

The CSV file should have two columns:
- Column A: Name
- Column B: Category name

Example:
```
John Smith,Team A
Jane Doe,Team A
Bob Wilson,Team B
```

Categories will be created automatically if they don't exist.

### Picking Winners

1. On the home page, select a category or "All Categories" to pick from all names
2. Adjust the shuffle duration if desired
3. Click the **Fullscreen** button to enter fullscreen mode
4. Click **Pick a Winner** to start the random selection
5. Press **ESC** or click the X button to exit fullscreen mode

### Viewing Results

1. Navigate to the **Results** page to see all selected winners
2. Filter results by category
3. Export results to CSV for record keeping

## Tech Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **Storage**: Browser Local Storage

## Project Structure

```
src/
├── app/                  # Next.js app router pages
│   ├── page.tsx          # Home page (picker)
│   ├── manage/           # Manage names page
│   └── results/          # Results page
├── components/           # React components
│   ├── RandomNamePicker.tsx
│   └── FullscreenPicker.tsx
├── context/              # React context providers
│   └── AppContext.tsx    # Global state management
└── lib/                  # Utility functions and types
    └── types.ts          # TypeScript type definitions
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Create production build
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## License

MIT
