const info = {
  name: 'Talha',
  fatherName: 'Rashid',
  registrationNumber: '12345678',
  programme: 'Undergraduate (BS)',
  semester: '2',
  section: 'A',
  subject: 'Computing',
  minor: '',
  isCompleted: false,
  totalDuration: '',
  isVerified: true,
};

const rowCount = 1;
const isCGPA = true;

const sanitizeName = (val) => val.replace(/[^A-Za-z\s]/g, '');
const sanitizeDiscipline = (val) => val.replace(/[^A-Za-z\s-]/g, '');
const sanitizeSection = (val) =>
  val
    .replace(/[^A-Za-z]/g, '')
    .toUpperCase()
    .slice(0, 1);

const isNameValid = info.name.trim().length > 2;
const isFatherValid = info.fatherName.trim().length > 2;
const isRegValid = info.registrationNumber.length === 8;
const isSectionValid = info.section.length === 1;
const isSubjectValid = /^[A-Za-z\s]{2,}(-[A-Za-z\s]{2,})?$/.test(info.subject.trim());

let cgpaConstraintError = '';
if (isCGPA) {
  if (info.isCompleted) {
    if (info.programme === 'Undergraduate (BS)') {
      if (rowCount !== 8) cgpaConstraintError = `BS requires 8 semesters (Provided: ${rowCount})`;
    } else {
      const duration = parseInt(info.totalDuration || '0');
      if (!duration || rowCount !== duration)
        cgpaConstraintError = `${duration ? `Required: ${duration}` : 'Total duration needed'}`;
    }
  } else {
    const currentSem = parseInt(info.semester);
    if (rowCount !== currentSem - 1)
      cgpaConstraintError = `Sem ${currentSem} requires ${currentSem - 1} records (Found: ${rowCount})`;
  }
}

const isFormValid =
  isNameValid &&
  isFatherValid &&
  isRegValid &&
  isSectionValid &&
  isSubjectValid &&
  info.isVerified &&
  !cgpaConstraintError;

console.log({
  isNameValid,
  isFatherValid,
  isRegValid,
  isSectionValid,
  isSubjectValid,
  isVerified: info.isVerified,
  cgpaConstraintError,
  isFormValid
});
