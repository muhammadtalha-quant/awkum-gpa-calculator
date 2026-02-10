# Architecture

This document describes the architectural decisions, technology stack, and data flow of the AWKUM GPA Calculator.

## Tech Stack

-   **Frontend Framework**: React 19 (Hooks-based functional components)
-   **Language**: TypeScript (Strict mode enabled)
-   **Build Tool**: Vite 6 (Fast HMR and optimized production builds)
-   **Styling**: Tailwind CSS (Utility-first CSS framework)
-   **PDF Generation**: `jspdf` + `jspdf-autotable`
-   **Icons**: Heroicons (SVG)

## Client-Side Architecture

The application is a pure **Single Page Application (SPA)** that runs entirely in the browser. It does not require a backend server for its core functionality.

### 1. Data Flow
-   **Input**: User enters marks/credits in the UI components (`SGPACalculator`, `CGPACalculator`).
-   **State**: React strict local state holds the transient data.
-   **Computation**: Grading logic (`utils/gradingLogic.ts`) transforms raw input into derived state (Grade Points, Letters) in real-time.
-   **Output**: Data is either displayed in the UI or passed to the `pdfService` for document generation.

### 2. PDF Generation Pipeline
The PDF generation is handled by `services/pdfService.ts`. The pipeline is as follows:

1.  **Data Collection**:
    -   The active component (`SGPACalculator`) gathers the current state (subjects list).
    -   `UserInfoModal` collects the student's personal details (Name, Reg No, Photo).
2.  **Document Initialization**: A new `jsPDF` instance is created.
3.  **Header Generation (`drawHeader`)**:
    -   Loads the AWKUM logo (bundled asset).
    -   Embeds the user's uploaded photo (if any).
    -   Draws the University Name and provisional title.
    -   Lays out the student details in a grid.
4.  **Table Generation (`autoTable`)**:
    -   `jspdf-autotable` is used to render the dynamic list of subjects.
    -   Custom styling (Blue headers, alternating rows) is applied to match the university's color scheme.
5.  **Footer & Watermark**:
    -   A summary block (Total GPA) is drawn below the table.
    -   A disclaimer note ("Computer Generated") is added to the footer.
6.  **Download**: The file is saved to the client's device using `doc.save('RegNo_SGPA.pdf')`.

### 3. Asset Handling
-   **Logo**: The AWKUM logo is imported as a static asset URL via Vite.
-   **User Photos**: Handled as Base64 strings. When a user uploads a photo, `FileReader` converts it to a data URL, which is then passed to `jspdf`'s `addImage` method.

## Directory Structure

```
/
├── components/       # React Components
│   ├── SGPACalculator.tsx    # SGPA Logic & UI
│   ├── CGPACalculator.tsx    # CGPA Logic & UI
│   ├── SemesterSubjectTable.tsx # Helper for Expert Mode
│   └── UserInfoModal.tsx     # Student Details Form
├── utils/            # Pure Functions
│   ├── gradingLogic.ts       # AWKUM Grading Formulas
│   └── validation.ts         # Regex Helpers
├── services/         # Side-Effects & External Libs
│   └── pdfService.ts         # PDF Generation Logic
├── types.ts          # Shared TypeScript Interfaces
├── App.tsx           # Global State & Tab Switching
└── documentation/    # Detailed Project Documentation
```

## Future Considerations
-   **Backend Integration**: Could be added to save student records permanently using a database like Supabase or Firebase.
-   **Authentication**: To allow users to access their saved transcripts from multiple devices.
-   **PWA Support**: Adding a Service Worker to make the app installable and workable offline.
