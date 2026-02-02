/* --- 1. Logic & Data --- */

// Generates the visual chart based on ranges
const gradeRanges = [
    { label: 'A+', min: 90, max: 100, gp: '4.00' },
    { label: 'A', min: 87, max: 89, gp: '3.85-3.95' },
    { label: 'A-', min: 82, max: 86, gp: '3.60-3.80' },
    { label: 'B+', min: 77, max: 81, gp: '3.35-3.55' },
    { label: 'B', min: 72, max: 76, gp: '3.10-3.30' },
    { label: 'B-', min: 67, max: 71, gp: '2.85-3.05' },
    { label: 'C+', min: 62, max: 66, gp: '2.60-2.80' },
    { label: 'C', min: 57, max: 61, gp: '2.35-2.55' },
    { label: 'C-', min: 52, max: 56, gp: '2.10-2.30' },
    { label: 'D', min: 50, max: 51, gp: '2.00-2.05' },
    { label: 'F', min: 0, max: 49, gp: '0.00' }
];

// The core calculation logic for a single subject
function calculateGradePoint(marks) {
    marks = Math.round(parseFloat(marks)); // Round to nearest integer as per standard practice
    if (marks >= 90) return 4.00;
    if (marks < 50) return 0.00;
    
    // Linear Formula based on AWKUM table
    return 2.00 + ((marks - 50) * 0.05);
}

function getLetterFromGP(gp) {
    gp = parseFloat(gp);
    if (gp >= 4.00) return 'A+';
    if (gp >= 3.85) return 'A';
    if (gp >= 3.60) return 'A-';
    if (gp >= 3.35) return 'B+';
    if (gp >= 3.10) return 'B';
    if (gp >= 2.85) return 'B-';
    if (gp >= 2.60) return 'C+';
    if (gp >= 2.35) return 'C';
    if (gp >= 2.10) return 'C-';
    if (gp >= 2.00) return 'D';
    return 'F';
}

/* --- 2. UI Rendering --- */

function renderGradingChart() {
    const container = document.getElementById('grading-chart');
    gradeRanges.forEach(g => {
        const div = document.createElement('div');
        div.className = 'grade-item';
        div.innerHTML = `<strong>${g.label}</strong><span>${g.min} - ${g.max}</span><br><span style="color:#005AC1; font-weight:500">${g.gp}</span>`;
        container.appendChild(div);
    });
}

function switchTab(tabId) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    
    event.target.classList.add('active');
    document.getElementById(tabId).classList.add('active');
}

/* --- 3. SGPA Logic --- */

let sgpaRowCount = 0;

function addSGPARow() {
    sgpaRowCount++;
    const tbody = document.getElementById('sgpa-body');
    const tr = document.createElement('tr');
    tr.id = `sgpa-row-${sgpaRowCount}`;
    tr.innerHTML = `
        <td><input type="text" placeholder="Subject ${sgpaRowCount}" class="sgpa-name"></td>
        <td><input type="number" placeholder="3" min="1" max="6" class="sgpa-credit" oninput="updateRowCalc(${sgpaRowCount})"></td>
        <td><input type="number" placeholder="0-100" min="0" max="100" class="sgpa-mark" oninput="updateRowCalc(${sgpaRowCount})"></td>
        <td class="sgpa-gp-display">-</td>
        <td class="sgpa-grade-display">-</td>
        <td><button class="icon-btn" onclick="removeRow('sgpa-row-${sgpaRowCount}')">✕</button></td>
    `;
    tbody.appendChild(tr);
}

function updateRowCalc(id) {
    const row = document.getElementById(`sgpa-row-${id}`);
    const markInput = row.querySelector('.sgpa-mark');
    const gpDisplay = row.querySelector('.sgpa-gp-display');
    const gradeDisplay = row.querySelector('.sgpa-grade-display');

    const marks = parseFloat(markInput.value);

    // Reset validation style
    markInput.classList.remove('error');

    if (!isNaN(marks) && marks >= 0 && marks <= 100) {
        const gp = calculateGradePoint(marks);
        const letter = getLetterFromGP(gp);
        gpDisplay.textContent = gp.toFixed(2);
        gradeDisplay.textContent = letter;
    } else {
        if(markInput.value !== "") markInput.classList.add('error');
        gpDisplay.textContent = "-";
        gradeDisplay.textContent = "-";
    }
}

function calculateSGPA() {
    const rows = document.querySelectorAll('#sgpa-body tr');
    let totalWeightedGP = 0;
    let totalCredits = 0;
    let isValid = true;
    let hasData = false;

    rows.forEach(row => {
        const creditInput = row.querySelector('.sgpa-credit');
        const markInput = row.querySelector('.sgpa-mark');

        const credit = parseFloat(creditInput.value);
        const mark = parseFloat(markInput.value);

        // Validation
        if (isNaN(credit) || credit <= 0) {
            creditInput.classList.add('error');
            isValid = false;
        }
        if (isNaN(mark) || mark < 0 || mark > 100) {
            markInput.classList.add('error');
            isValid = false;
        }

        if (isValid) {
            hasData = true;
            const gp = calculateGradePoint(mark);
            totalWeightedGP += (gp * credit);
            totalCredits += credit;
        }
    });

    if (!hasData || !isValid || totalCredits === 0) {
        alert("Please check your inputs. Ensure credits are positive and marks are 0-100.");
        return;
    }

    const sgpa = totalWeightedGP / totalCredits;
    document.getElementById('sgpa-value').textContent = sgpa.toFixed(2);
    document.getElementById('sgpa-letter').textContent = `Grade: ${getLetterFromGP(sgpa)}`;
    document.getElementById('sgpa-result').classList.add('visible');
    document.getElementById('btn-export-sgpa').disabled = false;
}

function clearSGPA() {
    document.getElementById('sgpa-body').innerHTML = '';
    document.getElementById('sgpa-result').classList.remove('visible');
    document.getElementById('btn-export-sgpa').disabled = true;
    sgpaRowCount = 0;
    addSGPARow();
}

/* --- 4. CGPA Logic --- */
let cgpaRowCount = 0;

function addCGPARow() {
    cgpaRowCount++;
    const tbody = document.getElementById('cgpa-body');
    const tr = document.createElement('tr');
    tr.id = `cgpa-row-${cgpaRowCount}`;
    tr.innerHTML = `
        <td><input type="text" placeholder="Semester ${cgpaRowCount}" value="Semester ${cgpaRowCount}" class="cgpa-name"></td>
        <td><input type="number" placeholder="0.00-4.00" min="0" max="4" step="0.01" class="cgpa-val"></td>
        <td><input type="number" placeholder="Total Credits" min="1" class="cgpa-credit"></td>
        <td><button class="icon-btn" onclick="removeRow('cgpa-row-${cgpaRowCount}')">✕</button></td>
    `;
    tbody.appendChild(tr);
}

function calculateCGPA() {
    const rows = document.querySelectorAll('#cgpa-body tr');
    let totalWeightedGPA = 0;
    let totalCredits = 0;
    let isValid = true;
    let hasData = false;

    rows.forEach(row => {
        const gpaInput = row.querySelector('.cgpa-val');
        const creditInput = row.querySelector('.cgpa-credit');

        const gpa = parseFloat(gpaInput.value);
        const credit = parseFloat(creditInput.value);

        if (isNaN(gpa) || gpa < 0 || gpa > 4.00) {
            gpaInput.classList.add('error');
            isValid = false;
        }
        if (isNaN(credit) || credit <= 0) {
            creditInput.classList.add('error');
            isValid = false;
        }

        if (isValid) {
            hasData = true;
            totalWeightedGPA += (gpa * credit);
            totalCredits += credit;
        }
    });

    if (!hasData || !isValid || totalCredits === 0) {
        alert("Please valid inputs. GPA must be 0-4.00, Credits must be positive.");
        return;
    }

    const cgpa = totalWeightedGPA / totalCredits;
    document.getElementById('cgpa-value').textContent = cgpa.toFixed(2);
    document.getElementById('cgpa-letter').textContent = `Grade: ${getLetterFromGP(cgpa)}`;
    document.getElementById('cgpa-result').classList.add('visible');
    
    const statusEl = document.getElementById('cgpa-status');
    if (cgpa < 2.0) {
        statusEl.textContent = "Status: Warning - Below Degree Requirement (2.00)";
        statusEl.style.color = "var(--md-sys-color-error)";
    } else {
        statusEl.textContent = "Status: Satisfactory";
        statusEl.style.color = "green";
    }
    document.getElementById('btn-export-cgpa').disabled = false;
}

function clearCGPA() {
    document.getElementById('cgpa-body').innerHTML = '';
    document.getElementById('cgpa-result').classList.remove('visible');
    document.getElementById('btn-export-cgpa').disabled = true;
    cgpaRowCount = 0;
    addCGPARow();
}

function removeRow(id) {
    document.getElementById(id).remove();
}

/* --- 5. Export PDF (DMC) --- */
async function exportPDF(type) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // --- LOGO INSERTION LOGIC ---
    // We use the image element from the HTML directly.
    // Wrapped in try/catch to ensure PDF generates even if CORS blocks the image.
    const logoImg = document.getElementById('awkum-logo');
    try {
        // Position: x=14, y=10, w=25, h=25 (Square Aspect)
        doc.addImage(logoImg, 'JPEG', 14, 10, 25, 25);
    } catch (error) {
        console.warn("Could not embed logo due to browser security (CORS). Exporting without logo.", error);
    }

    // -- Header --
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    // Center text on page (105 is half of A4 width 210)
    doc.text("Abdul Wali Khan University Mardan", 105, 20, null, null, "center");
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Official ${type} Report (DMC)`, 105, 28, null, null, "center");
    
    // Line separator
    doc.setLineWidth(0.5);
    doc.line(14, 38, 196, 38);

    // -- Table Data Preparation --
    let head = [];
    let body = [];
    let summary = [];

    if (type === 'SGPA') {
        head = [['Subject', 'Credits', 'Marks', 'Grade Point', 'Grade']];
        const rows = document.querySelectorAll('#sgpa-body tr');
        rows.forEach(row => {
            const name = row.querySelector('.sgpa-name').value || "Untitled Subject";
            const cr = row.querySelector('.sgpa-credit').value;
            const mk = row.querySelector('.sgpa-mark').value;
            const gp = row.querySelector('.sgpa-gp-display').textContent;
            const gr = row.querySelector('.sgpa-grade-display').textContent;
            body.push([name, cr, mk, gp, gr]);
        });
        summary = [
            [`Semester GPA: ${document.getElementById('sgpa-value').textContent}`],
            [`Letter Grade: ${document.getElementById('sgpa-letter').textContent.replace('Grade: ', '')}`]
        ];
    } else {
        head = [['Semester', 'Obtained GPA', 'Credits', 'Weighted Contribution']];
        const rows = document.querySelectorAll('#cgpa-body tr');
        rows.forEach(row => {
            const name = row.querySelector('.cgpa-name').value;
            const val = row.querySelector('.cgpa-val').value;
            const cr = row.querySelector('.cgpa-credit').value;
            const w = (parseFloat(val) * parseFloat(cr)).toFixed(2);
            body.push([name, val, cr, w]);
        });
         summary = [
            [`Cumulative GPA: ${document.getElementById('cgpa-value').textContent}`],
            [`Letter Grade: ${document.getElementById('cgpa-letter').textContent.replace('Grade: ', '')}`]
        ];
    }

    // -- Render Table --
    doc.autoTable({
        startY: 45,
        head: head,
        body: body,
        theme: 'grid',
        headStyles: { fillColor: [0, 90, 193] }, // AWKUM Blue
        styles: { fontSize: 10, cellPadding: 4 }
    });

    // -- Summary Box --
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFont("helvetica", "bold");
    doc.text("Summary:", 14, finalY);
    doc.setFont("helvetica", "normal");
    summary.forEach((line, index) => {
        doc.text(line[0], 14, finalY + 8 + (index*6));
    });

    // -- Footer --
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text("Generated via AWKUM Static Web Calculator. This document is computer-generated.", 105, 280, null, null, "center");

    // -- Save --
    doc.save(`AWKUM_${type}_Report.pdf`);
}

// Initialize
window.onload = function() {
    renderGradingChart();
    addSGPARow();
    addCGPARow();
};
