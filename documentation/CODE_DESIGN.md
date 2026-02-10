# Code Design

This document provides an overview of the code structure and design patterns used in the AWKUM GPA Calculator.

## Component Hierarchy

The application is built using React and follows a component-based architecture.

### `CGPACalculator.tsx`
This is the main container component. It handles:
-   **State Management**: Manages the list of semesters, CGPA calculation, and UI modes (Quick vs. Expert).
-   **Routing/Logic**: Toggles between Quick Mode (direct SGPA entry) and Expert Mode (detailed subject entry).
-   **Persistence**: Uses `localStorage` to save the user's preferred mode (`awkum_cgpa_mode_expert_v1`).

### `SemesterSubjectTable.tsx`
Used primarily in **Expert Mode**.
-   **Responsibility**: Renders a table of subjects for a specific semester.
-   **Validation**: Enforces rules for Course Codes, Credit Hours (0-6), and Marks (0-100).
-   **Dynamic Calculations**: Automatically calculates Grade Points and Letters based on entered Marks.

### `UserInfoModal.tsx`
-   **Responsibility**: Collects student details (Name, Registration Number, Programme) before exporting the PDF.
-   **Validation**: Ensures all required fields are filled and consistent with the number of semesters provided.

## State Management

The application uses standard React Hooks (`useState`, `useEffect`) for state management.
-   **Semesters State**: An array of `CGPASemester` objects.
-   **Effect Hooks**: Used for recalculating totals when inputs change and for handling the "Expert Mode" toggle side effects.

## Utility Functions

Helper functions are located in `utils/`:
-   `gradingLogic.ts`: Contains the AWKUM grading table logic (converting marks to grade points).
-   `validation.ts`: Regex patterns for validating course codes.

## Services

-   `pdfService.ts`: Handles the generation of the PDF transcript using `jspdf` and `jspdf-autotable`.
