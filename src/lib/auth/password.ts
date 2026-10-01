import bcrypt from 'bcryptjs';

/**
 * Parse day (DD) and month (MM) from string, Excel serial date number, or Date object
 */
export function parseDayAndMonth(dob?: string | number | Date | null): { day: string; month: string; ddmm: string } {
  if (dob === undefined || dob === null || dob === '') {
    return { day: '01', month: '01', ddmm: '0101' };
  }

  // 1. Handle JS Date object
  if (dob instanceof Date && !isNaN(dob.getTime())) {
    const day = String(dob.getDate()).padStart(2, '0');
    const month = String(dob.getMonth() + 1).padStart(2, '0');
    return { day, month, ddmm: `${day}${month}` };
  }

  // 2. Handle Excel Serial Date Number (e.g., 38750, 38122, 39500)
  const isNumber = typeof dob === 'number' || (!isNaN(Number(dob)) && !String(dob).includes('-') && !String(dob).includes('/') && !String(dob).includes('.'));
  if (isNumber) {
    const num = Number(dob);
    if (num > 1000 && num < 100000) {
      // Excel epoch begins 1899-12-30
      const excelEpoch = new Date(Date.UTC(1899, 11, 30));
      const date = new Date(excelEpoch.getTime() + num * 86400000);
      if (!isNaN(date.getTime())) {
        const day = String(date.getUTCDate()).padStart(2, '0');
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        return { day, month, ddmm: `${day}${month}` };
      }
    }
  }

  // 3. Handle String formats (e.g., "03/02/2006", "15-05-2004", "2006-02-03", "03.02.2006")
  const rawStr = String(dob).split('T')[0].trim();
  const clean = rawStr.replace(/[\/\\\._\s]+/g, '-').trim();
  const parts = clean.split('-').filter(Boolean);

  if (parts.length === 3) {
    let day = '01';
    let month = '01';

    if (parts[0].length === 4) {
      // YYYY-MM-DD (e.g. 2006-02-03)
      month = parts[1].padStart(2, '0');
      day = parts[2].padStart(2, '0');
    } else {
      // DD-MM-YYYY (e.g. 03-02-2006 or 15-05-2004)
      day = parts[0].padStart(2, '0');
      month = parts[1].padStart(2, '0');
    }

    const dNum = Math.min(31, Math.max(1, parseInt(day, 10) || 1));
    const mNum = Math.min(12, Math.max(1, parseInt(month, 10) || 1));
    const validDay = String(dNum).padStart(2, '0');
    const validMonth = String(mNum).padStart(2, '0');

    return { day: validDay, month: validMonth, ddmm: `${validDay}${validMonth}` };
  }

  return { day: '01', month: '01', ddmm: '0101' };
}

/**
 * Generate default password in format Name@dob (e.g. Manager@0302 or Aarav@1505)
 * User ID = Email
 * Password = Name@dob
 */
export function generateDefaultPassword(email: string, dob?: string | number | Date | null, fullName?: string): string {
  // 1. Extract Name Part
  let namePart = '';

  if (fullName && fullName.trim()) {
    // Strip honorific titles (Dr., Prof., Mr., Ms., Mrs.)
    const cleanName = fullName.replace(/^(Dr\.|Prof\.|Mr\.|Mrs\.|Ms\.)\s+/i, '').trim();
    const firstWord = cleanName.split(/\s+/)[0];
    if (firstWord && firstWord.toLowerCase() !== 'dr' && firstWord.toLowerCase() !== 'prof') {
      namePart = firstWord;
    }
  }

  if (!namePart && email && email.includes('@')) {
    const username = email.split('@')[0];
    const firstSegment = username.split('.')[0].split('_')[0].split('-')[0];
    if (firstSegment) {
      namePart = firstSegment;
    }
  }

  if (!namePart) {
    namePart = 'User';
  }

  // Capitalize first letter, lowercase the rest (e.g. "aarav" -> "Aarav")
  namePart = namePart.charAt(0).toUpperCase() + namePart.slice(1).toLowerCase();

  // 2. Extract DDMM from DOB using resilient parser
  const { ddmm } = parseDayAndMonth(dob);

  return `${namePart}@${ddmm}`;
}

/**
 * Hash a plain text password with salt
 */
export async function hashPassword(plainText: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plainText, salt);
}

/**
 * Verify a plain text password against a bcrypt hash
 */
export async function verifyPassword(plainText: string, hash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(plainText, hash);
  } catch {
    return false;
  }
}
