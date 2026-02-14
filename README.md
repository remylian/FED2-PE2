# Holidaze

![Holidaze Logo](./assets/logo.png)

Holidaze is a modern venue booking platform built as part of the FED2 Project Exam 2 at Noroff.
The application allows customers to browse and book venues, and venue managers to create and manage their listings.

---

## Project Description

Holidaze is a frontend web application that interacts with the Noroff Holidaze API. The platform supports two user roles:

### Customer

- Browse venues
- Search and sort listings
- View venue details
- Create and cancel bookings
- Manage profile avatar

### Venue Manager

- Create venues
- Edit venues
- Delete venues
- View managed listings
- Switch between customer and manager mode

The application emphasizes:

- Clean component architecture
- State management with Zustand
- Data fetching and caching using React Query
- Responsive design with Tailwind CSS
- Professional UI polish and performance optimization

---

## Built With

- React 19
- TypeScript
- Vite (Rolldown)
- Tailwind CSS v4
- TanStack React Query
- Zustand
- React Hook Form
- Zod
- React Router DOM
- React Hot Toast
- ESLint + Prettier

---

## Getting Started

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd fed2-pe2
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create `.env` file

Create a `.env` file in the root of the project:

```env
VITE_API_BASE_URL=https://v2.api.noroff.dev
VITE_NOROFF_API_KEY=your_api_key_here
```

### 4. Start development server

```bash
npm run dev
```

---

## Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
npm run format     # Run Prettier
```

---

## Architecture Overview

The project follows a modular structure:

```
src/
├── api/           # API calls
├── auth/          # Zustand auth store
├── components/    # Reusable UI components
├── pages/         # Route-based pages
├── utils/         # Utility functions
```

### Key Architectural Decisions

- **React Query** handles server state, caching, and invalidation.
- **Zustand** manages authentication and role switching.
- **Protected routes** enforce access control.
- **Flex + grid patterns** ensure equal-height cards and consistent layout.
- **WebP optimized hero image** improves performance.

---

## Design & UX

- Responsive layout
- Equal-height card grids
- Clickable card images
- Role-based UI visibility
- Performance-optimized images
- Consistent primary and secondary button styling

---

## Authentication & Roles

### Customer Mode

- Browse venues
- Book venues
- Manage bookings
- Update avatar

### Manager Mode

- Create venues
- Edit venues
- Delete venues
- View managed listings

Users with manager accounts can switch between modes.

---

## Testing

Testing setup using Vitest (to be implemented / configured).

Planned testing coverage:

- Utility functions
- API layer (mocked)
- Component rendering
- Authentication store behavior

---

## Performance Optimization

- Hero image converted to WebP (~120KB)
- Feature icons optimized (~200KB target)
- Lazy-loaded images
- React Query caching strategy
- Avoided unnecessary re-renders

---

## AI Usage

AI tools were used in accordance with the assignment policy.
See `AI_LOG.md` for detailed documentation of AI assistance.

---

## 🌍 Live Demo

Add your deployed link here:

```
https://fed-2-pe-2.vercel.app/
```

---

## Repository

Add your GitHub repository link here:

```
https://github.com/remylian/FED2-PE2
```

---

## Author

Remy Lian
Frontend Web Development – Noroff
2026
