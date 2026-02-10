# Features

The AWKUM GPA Calculator is a comprehensive tool designed to assist students in calculating their SGPA and CGPA accurately according to the university's grading policy.

## Core Features

### 1. Semester GPA (SGPA) Calculation
The **Semester GPA** tab allows students to calculate their GPA for a single semester based on the marks obtained in each subject.

#### Workflow
1.  **Add Subjects**: Users start with one row and can add up to **7 subjects**.
2.  **Input Details**:
    -   **Subject Name**: Name of the course (e.g., "Programming Fundamentals").
    -   **Credits**: Credit hours for the course (Range: **2 - 6**).
    -   **Marks**: Obtained marks out of 100 (Range: **0 - 100**).
3.  **Automatic Calculation**: As soon as marks are entered, the system automatically calculates the **Grade Point (GP)** and **Grade Letter** for that subject using the official AWKUM grading table.
4.  **Course Codes (Optional)**:
    -   Users can enable the "Enable Course Codes" toggle.
    -   This adds a column for **Course Code** (e.g., `CS-101`).
    -   **Validation**: Codes must follow a valid format (uppercase letters, numbers, and a single dash).
5.  **Calculate**: Clicking "Calculate SGPA" computes the weighted average of Grade Points.

#### Export Options
-   **Export DMC**: Users can download a provisional **Detailed Marks Certificate (DMC)** in PDF format.
-   **Requirement**: This feature is only available if "Enable Course Codes" is checked and all codes are filled and verified.

---

### 2. Cumulative GPA (CGPA) Calculation
The **Cumulative GPA** tab is designed for calculating the GPA across multiple semesters. It offers two distinct modes:

#### A. Quick Mode
Ideal for students who already have their official SGPA for previous semesters and just want to check their aggregate.
-   **Input**:
    -   **Obtained SGPA**: The SGPA for a specific semester (Range: **0.00 - 4.00**).
    -   **Total Credits**: Total credit hours for that semester (Range: **12 - 21**).
-   **Functionality**:
    -   Add/Remove semesters (up to **12 semesters**).
    -   Calculates the weighted average of all entered semesters.
-   **Limitations**: Does not support PDF Transcript export.

#### B. Expert Mode
Designed for generating a detailed unofficial transcript.
-   **Detailed Entry**: Instead of just entering the SGPA, users input **every subject** for **every semester**.
-   **Structure**:
    -   User adds a Semester.
    -   Inside the Semester, user adds Subjects (Name, Code, Credits, Marks).
-   **Validation**: Ensures strictly valid data for every single field.
-   **Export Transcript**:
    -   Unlock the "Export Transcript" button.
    -   Generates a continuous PDF document listing all semesters and subjects, simulating a real transcript.
    -   Requires users to verify their data against their MIS profile.

---

### 3. Grading Logic
The application strictly follows the AWKUM grading policy.
-   **Linear Formula**: For marks between 50 and 90, the formula $GP = 2.00 + (Marks - 50) \times 0.05$ is used.
-   **Constraints**:
    -   Marks below 50 are **F (0.00)**.
    -   Marks 90 and above are **A+ (4.00)**.
-   *For the full grading table, please refer to [LOGIC.md](./LOGIC.md).*

### 4. PDF Generation
The application features a client-side PDF generator powered by `jspdf`.
-   **Header**: Includes the AWKUM logo and university name.
-   **Student Details**: Fetches user details (Name, Registration No, Photo) via a modal before export.
-   **Photo Support**: Users can upload a passport-size photo which is embedded into the PDF.
-   **Watermark**: All generated documents include a footer stating they are "Computer Generated" and "Provisional".

### 5. Data Persistence & UI
-   **Auto-Save**: The application saves your preference for "Expert Mode" and "Course Codes" in the browser's Local Storage.
-   **Themes**: Supports multiple color themes (Catppuccin, Tokyo Night, Gruvbox) and Dark/Light modes.
-   **Responsive**: Optimized for both mobile phones and desktop screens.
