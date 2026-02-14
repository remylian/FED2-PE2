# AI Usage Log

## Project

Holidaze – FED2 Project Exam 2  
Frontend Web Development, Noroff

---

## Tool Used

ChatGPT (OpenAI)

---

## 1. Booking Calendar & Date Selection Logic

**Date:** February 2026  
**Purpose:** Structure availability logic and booking date validation.

### Details

- Assisted in reasoning about booking date selection logic
- Helped structure `useBookingSelection` hook
- Discussed handling of:
  - Start/end date toggling
  - Preventing invalid ranges
  - Preventing bookings in the past
  - Resetting state after booking confirmation
- Clarified ISO date handling using `yyyy-mm-dd` comparison
- Helped structure React Query invalidation after booking mutation

### Outcome

Calendar logic and validation were implemented manually and adapted to fit the project’s architecture. All date logic was reviewed and verified before integration.

---

## 2. Amenities Feature (Create - Display Flow)

**Date:** February 2026  
**Purpose:** Implement amenities in venue creation and detail display.

### Details

- Structured the `meta` object for venue amenities (wifi, parking, breakfast, pets)
- Helped create a filtering helper to display only selected amenities
- Assisted in rendering amenity badges on the venue detail page
- Reviewed Zod schema structure to ensure API compatibility

### Outcome

Amenity selection, submission, and rendering were manually implemented and verified using the Noroff API documentation.

---

## 3. Manager Dashboard Improvements (Upcoming Bookings)

**Date:** February 2026  
**Purpose:** Improve manager feature completeness.

### Details

- Discussed architectural placement of “Upcoming bookings” feature
- Assisted in reasoning about fetching bookings per venue
- Helped structure aggregation logic across multiple venues
- Reviewed React Query usage for multiple async calls

### Outcome

The feature was implemented manually with full understanding of the API endpoints and query structure.

---

## 4. UI Layout & Styling Improvements

**Date:** February 2026  
**Purpose:** Improve layout consistency and visual polish.

### Details

- Suggested equal-height card layouts using `flex h-full flex-col`
- Helped refactor booking and manager venue cards into grid structure
- Converted “View” text links into clickable images
- Suggested hover lift effects for feature cards
- Assisted with consistent button styling (primary/secondary variants)
- Suggested responsive avatar header layout on Profile page
- Helped restructure Profile page into a more professional layout
- Implemented collapsible “Edit Avatar” section using `<details>`

### Outcome

All layout changes were implemented manually and adjusted to fit the project’s existing component structure. Code was reviewed and modified before integration.

---

## 5. TailwindCSS Architecture & Styling Decisions

**Date:** February 2026  
**Purpose:** Establish consistent design system and reusable styling patterns.

### Details

- Assisted in structuring custom Tailwind component classes:
  - `.btn-primary`
  - `.btn-secondary`
  - `.feature-card`
  - `.gradient-orange`
- Helped refine gradient styling and hover states
- Suggested consistent card structure using `flex h-full flex-col`
- Assisted in building reusable button variants without locking shape/layout
- Reviewed Tailwind v4 configuration and utility usage
- Helped implement `color-scheme: light` fix to prevent mobile dark-mode overrides
- Assisted in configuring global font (Nunito) via Tailwind theme variables
- Discussed responsive layout strategies (grid, breakpoints, flex patterns)

### Outcome

Tailwind utilities and component classes were manually implemented and adjusted to match the project’s design goals. All styling decisions were reviewed before integration.

---

## 6. Code Refactoring & Structural Improvements

**Date:** February 2026  
**Purpose:** Improve readability, consistency, and maintainability.

### Details

- Refactored components for cleaner structure
- Simplified conditional rendering logic
- Improved mutation and invalidation handling with React Query
- Adjusted button and link structure for better semantic behavior
- Removed unused code and resolved ESLint warnings
- Discussed best placement of navigation links (Header vs Dashboard)
- Reviewed Zustand state usage and role switching logic

### Outcome

Refactoring suggestions were reviewed and adapted to match the project architecture. All code changes were understood before being applied.

---

## 7. Meta Tags & SEO Hook Pattern

**Date:** February 2026  
**Purpose:** Improve per-page metadata without external libraries.

### Details

- Assisted in designing a custom `usePageMeta` hook
- Avoided installing incompatible packages (React 19 conflict with react-helmet-async)
- Structured dynamic document title and meta description handling

### Outcome

Metadata management was implemented manually using a custom hook.

---

## 8. Icon & Asset Concept Development

**Date:** February 2026  
**Purpose:** Generate and refine visual assets for feature cards.

### Details

- Brainstormed icon concepts for:
  - Browse venues
  - Login
  - Register
- Generated flat-style PNG icons
- Optimized image sizes to meet performance targets (~200KB)
- Converted hero banner to WebP format for performance optimization
- Assisted with favicon generation and optimization strategy

### Outcome

Assets were reviewed, resized, optimized, and manually integrated into the project.

---

## 9. Documentation Drafting

**Date:** February 2026  
**Purpose:** Draft README and supporting documentation.

### Details

- Suggested README structure based on Noroff template
- Assisted in drafting documentation text
- Provided structure for AI usage documentation
- Helped refine commit message conventions

### Outcome

Documentation text was reviewed and edited before final inclusion.

---

## 10. Concept Clarification & Technical Reasoning

**Date:** February 2026  
**Purpose:** Strengthen understanding of implementation decisions.

### Details

- Explained lexicographical date comparison using `yyyy-mm-dd`
- Clarified React Query query keys and invalidation patterns
- Discussed Zustand state management
- Reviewed protected routes and role-based UI behavior
- Assisted in reasoning through deployment steps and build process
- Discussed dark mode behavior and `color-scheme` handling

### Outcome

All code written was understood and adapted before being added to the project.

---

## Declaration

AI tools were used strictly within the allowed guidelines:

- For brainstorming and concept development
- For explaining technical concepts
- For generating scaffolding and refactoring suggestions
- For UI and structural refinement
- For documentation drafting

No code was submitted without understanding its implementation.  
All AI-assisted content was reviewed, edited, and integrated manually.
