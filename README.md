# 🏢 Organization Chart

A modern, interactive organization chart application built with React and TypeScript. Visualize your company's hierarchy, manage reporting structures, and explore team members with an intuitive drag-and-drop interface.

![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-7.2-646CFF?logo=vite)

## ✨ Features

**Interactive Org Chart**
- Hierarchical tree visualization of your organization
- Drag-and-drop to reassign reporting relationships
- Visual connector lines between employees and managers
- Subordinate count badges showing team sizes

**Employee Directory**
- Searchable list of all employees
- Filter by team/department
- Quick copy-to-clipboard for email addresses
- Avatar and team badge display

**Smart Hierarchy Management**
- Cycle detection prevents invalid reporting structures
- Server-side validation for manager assignments
- Graceful error handling with user feedback

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| Framework | React 19 |
| Language | TypeScript |
| Build Tool | Vite |
| Routing | React Router v7 |
| Drag & Drop | @dnd-kit/core |
| Mock API | MirageJS |
| Linting | ESLint |

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd happyfox-assignment

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint checks |

## 📁 Project Structure

```
src/
├── assets/              # Static assets and icons
├── components/          # React components
│   ├── AppLayout/       # Main layout wrapper
│   ├── EmployeeNodes/   # Tree node component for org chart
│   ├── ErrorPage/       # 404 and error handling
│   ├── OrgChart/        # Main organization chart component
│   └── SidebarContainer/
│       ├── EmployeeList/   # Employee directory list
│       ├── SearchBox/      # Search input component
│       ├── SideBar/        # Navigation sidebar
│       └── TeamFilter/     # Department filter dropdown
├── hooks/
│   └── useEmployees.ts  # Employee data management hook
├── pages/
│   ├── EmployeeListPage.tsx   # Team members directory
│   └── OrgChartPage.tsx       # Organization structure view
├── server/
│   ├── data.ts          # Mock employee data
│   └── mirage.ts        # MirageJS API server config
├── shared/              # Reusable UI components
│   ├── Avatar/          # Employee avatar component
│   └── TeamBadge/       # Team/department badge
├── types/
│   └── employeeTypes.ts # TypeScript interfaces
└── utils/
    └── treeUtils.ts     # Tree building and manipulation
```

## 🔌 API Endpoints

The app uses MirageJS to mock a REST API:

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/employees` | Fetch all employees |
| `GET` | `/api/employees/:id` | Fetch single employee |
| `POST` | `/api/employees` | Create new employee |
| `PATCH` | `/api/employees/:id` | Update employee (e.g., manager) |
| `DELETE` | `/api/employees/:id` | Delete employee |
| `GET` | `/api/teams` | Fetch all teams |

## 📊 Data Model

```typescript
interface Employee {
  id: string;
  name: string;
  designation: string;
  team: Team;
  managerId: string | null;  // null = CEO/top-level
  email?: string;
  avatar?: string;
}

type Team = 
  | 'Engineering' 
  | 'Product' 
  | 'Sales' 
  | 'Marketing' 
  | 'Operations' 
  | 'Finance';
```

## 🎯 Key Implementation Details

### Tree Building Algorithm

The `buildEmployeeTree` function converts a flat employee list into a hierarchical tree structure in O(n) time:

1. Creates a map for O(1) employee lookups
2. Iterates through employees, linking children to parents
3. Collects root nodes (employees with no manager)

### Cycle Prevention

Before reassigning a manager, the app checks for cycles:
- An employee cannot report to themselves
- An employee cannot report to their own subordinate
- Validation happens both client-side and server-side

### Drag and Drop

Uses `@dnd-kit/core` for accessible drag-and-drop:
- Pointer and keyboard sensor support
- Visual drag overlay during moves
- Drop target highlighting

## 🎨 Styling

The project uses vanilla CSS with a component-scoped approach:
- Each component has its own `.css` file
- BEM-style naming convention
- CSS custom properties for theming
- Responsive design considerations

## 🧪 Future Improvements

- [ ] Add unit tests with Vitest
- [ ] Add E2E tests with Playwright
- [ ] Implement dark mode
- [ ] Add employee creation/editing forms
- [ ] Export org chart as image/PDF
- [ ] Add zoom/pan controls for large orgs
- [ ] Real backend integration

## 📄 License

This project is private and intended for demonstration purposes.

---

Built with ❤️ using React and TypeScript