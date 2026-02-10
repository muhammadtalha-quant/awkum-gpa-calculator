# Architecture

This document describes the architectural decisions and technology stack of the AWKUM GPA Calculator.

## Tech Stack

-   **Frontend Framework**: React (with TypeScript)
-   **Build Tool**: Vite
-   **Styling**: Tailwind CSS
-   **State Management**: React Context / Local Component State
-   **Deployment target**: Static Hosting (Netlify/Vercel)

## Client-Side Architecture

The application is a Single Page Application (SPA) that runs entirely in the browser. It does not require a backend server for its core functionality.

### Data Persistence
-   **LocalStorage**: User preferences (like Expert Mode toggle) are saved to the browser's Local Storage.
-   **Session Data**: Current session data (Semesters, Subjects) is held in memory but can be lost on refresh (unless persistence logic is added in future iterations).

### PDF Generation
-   The application uses `jspdf` and `jspdf-autotable` to generate PDF documents directly in the browser.
-   **Workflow**:
    1.  User fills in details in `UserInfoModal`.
    2.  `pdfService.ts` gathers all semester data.
    3.  A PDF is constructed programmatically and downloaded to the user's device.

## Directory Structure

```
/
├── components/       # Reusable React components
├── utils/            # Helper functions (grading logic, validation)
├── services/         # External services (PDF generation)
├── types.ts          # TypeScript interfaces and types
├── App.tsx           # Main application entry point
└── documentation/    # Project documentation
```

## Future Considerations
-   **Backend Integration**: Could be added to save student records permanently.
-   **Authentication**: To allow users to access their saved transcripts from multiple devices.
