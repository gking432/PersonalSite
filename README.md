# Gunnar Neuman Portfolio Website

A modern, responsive portfolio website built with React and Vite.

## Features

- **Home Page**: Hero section, proof points, featured projects, and recent content
- **About Page**: Professional story, skills, and timeline
- **Projects Page**: Showcase of built applications and marketing work
- **Speaking Page**: AI lecture series information and booking
- **Writing Page**: Substack integration and article listings
- **Videos Page**: YouTube integration and video grid
- **Contact Page**: Contact form and availability information

## Tech Stack

- React 18
- React Router DOM
- Vite
- CSS (Custom properties for theming)

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory, ready to deploy to Vercel, Netlify, or any static hosting service.

## Deployment

### Vercel

1. Push your code to GitHub
2. Import your repository on [Vercel](https://vercel.com)
3. Vercel will automatically detect Vite and configure the build settings

### Netlify

1. Push your code to GitHub
2. Import your repository on [Netlify](https://netlify.com)
3. Set build command: `npm run build`
4. Set publish directory: `dist`

## Customization

### Colors

Edit the CSS variables in `src/index.css`:

```css
:root {
  --primary-color: #1a365d;
  --accent-color: #2c5282;
  /* ... */
}
```

### Content

- Update page content in `src/pages/`
- Modify navigation in `src/components/Layout.jsx`
- Update social links in the footer

## Next Steps

- [ ] Add real project screenshots/demos
- [ ] Integrate Substack API for writing page
- [ ] Integrate YouTube API for videos page
- [ ] Set up contact form backend (EmailJS, Formspree, etc.)
- [ ] Add Stripe integration for speaking events
- [ ] Add Google Analytics
- [ ] Optimize images and assets
- [ ] Add SEO meta tags

## License

MIT
