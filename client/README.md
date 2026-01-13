# Offline Notion

A beautiful offline-first note-taking experience.

## Getting Started

To run this application:

```bash
pnpm install
pnpm dev
```

## Building For Production

To build this application for production:

```bash
pnpm build
```

## Testing

This project uses [Vitest](https://vitest.dev/) for testing. You can run the tests with:

```bash
pnpm test
```

## Styling

This project uses [Tailwind CSS](https://tailwindcss.com/) and [MUI Joy](https://mui.com/joy-ui/) for styling.

### Using MUI Joy Components

MUI Joy components can be imported and used directly in your React components:

```tsx
import { Button, Typography, Card } from "@mui/joy";

export default function MyComponent() {
	return (
		<Card>
			<Typography level="h2">Hello World</Typography>
			<Button variant="contained">Click Me</Button>
		</Card>
	);
}
```

For more information on available components and usage, visit the [MUI Joy documentation](https://mui.com/joy-ui/).

### Theme Configuration

To customize the MUI Joy theme, you can create a theme provider in your root layout:

```tsx
import { CssVarsProvider, extendTheme } from "@mui/joy/styles";
import { getInitColorSchemeScript } from "@mui/joy/styles";

const theme = extendTheme({
	colorSchemes: {
		light: {
			palette: {
				primary: {
					primary: "#0052cc",
					primaryActive: "#003d99",
					primaryHover: "#0047b3",
				},
			},
		},
	},
});

// Then wrap your app with CssVarsProvider
```

## Linting & Formatting

This project uses [Biome](https://biomejs.dev/) for linting and formatting. The following scripts are available:

```bash
pnpm lint
pnpm format
pnpm check
```

## Tech Stack

- **React 19** - UI library
- **TanStack Router** - File-based routing
- **TanStack Query** - Data fetching
- **MUI Joy** - Component library and design system
- **Tailwind CSS** - Utility-first CSS framework
- **TypeScript** - Type safety
