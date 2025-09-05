# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server on port 3000 with hot reload
- `npm run build` - Build for production (TypeScript compilation + Vite build)
- `npm run preview` - Preview production build on port 3001
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Run ESLint with auto-fix
- `npm run type-check` - Run TypeScript compiler without emitting files
- `npm run format` - Format code with Prettier
- `npm run test` - Run Jest tests
- `npm run test:watch` - Run Jest tests in watch mode
- `npm run test:coverage` - Run Jest tests with coverage report

## Architecture

This is a React + TypeScript frontend application using:

### Core Stack
- **React 18** with TypeScript and Vite for development
- **React Router DOM** for client-side routing
- **Zustand** for state management
- **TanStack Query** for server state management
- **Axios** for HTTP requests
- **Socket.io Client** for real-time communication

### Form & Validation
- **React Hook Form** with **Zod** validation via **@hookform/resolvers**

### UI & Animation
- **Framer Motion** for animations
- **React Hot Toast** for notifications
- **Tailwind CSS** for styling (configured with PostCSS and Autoprefixer)

### Testing
- **Jest** with **React Testing Library** and **jsdom** environment
- **@testing-library/user-event** for user interaction testing

### Project Structure
The project uses path aliases configured in both Vite and TypeScript:
- `@/` → `src/`
- `@components/` → `src/components/`
- `@pages/` → `src/pages/`
- `@hooks/` → `src/hooks/`
- `@utils/` → `src/utils/`
- `@types/` → `src/types/`
- `@store/` → `src/store/`
- `@api/` → `src/api/`
- `@assets/` → `src/assets/`

### Build Configuration
- **Vite** with code splitting configured for vendor chunks (React, React DOM), router (React Router), and UI libraries (Framer Motion, React Hot Toast)
- **TypeScript** with strict mode and comprehensive linting rules
- **ESLint** configured for React with hooks and refresh plugins
- Source maps enabled for production builds

## File Naming Conventions

- File names should be in **snake_case** (e.g., `project_list.tsx`)
- Function names should be in **PascalCase** starting with capital letter (e.g., `ProjectList`)
- Component files should export functions returning `JSX.Element`

Example:
```typescript
// src/pages/project_list/project_list.tsx
function ProjectList(): JSX.Element {
  return <div className="project-list">...</div>;
}

export default ProjectList;
```

## Styling Approach

- All styles should be in `public/style.css`
- Use **BEM methodology** for CSS class naming
- **No inline styles** allowed
- Use CSS custom properties (variables) for colors and dimensions
- **Responsive, mobile-first** design approach

## Git Workflow and Commit Rules

### Branch Structure
- **main** - Production branch (stable)
- **development** - Development branch (all work happens here)

### Commit Message Format
Use uppercase type with task number and description:

- **INT** - Internal tasks/setup
- **FEA** - New features  
- **FIX** - Bug fixes
- **REF** - Refactoring existing code

Format: `{TYPE} DBF-{number} {description}`

Examples:
```bash
git commit -m "INT DBF-1 Developed the design of the application"
git commit -m "FEA DBF-15 User authentication system"
git commit -m "FIX DBF-23 Document upload validation error"
git commit -m "REF DBF-8 Optimize Redux store structure"
```

### Standard Git Workflow
Direct Development Workflow:

1. Work directly in **development** branch
2. Make changes and commit: `git commit -m "INT DBF-1 Setup project structure"`
3. Push to GitHub: `git push origin development`

Example workflow:
```bash
# Make changes in development branch
git add .
git commit -m "INT DBF-4 Setup complete project folder structure"
git push origin development
```

This simplified workflow allows for faster development while maintaining clear commit history and progress tracking.

## Documentation Storage

All project documentation should be stored in the `about-project/` folder:

- **`about-project/RPD.md`** - Product Requirements Document with full project specifications
- **`about-project/PROJECT_STATUS.md`** - Current project status, progress, and development roadmap
- **Additional documentation** - Any new project documentation, technical specs, or progress reports should be placed in the `about-project/` folder

This centralized approach ensures all project documentation is easily accessible and well-organized for current and future team members.