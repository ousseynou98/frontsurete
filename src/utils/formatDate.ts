/**
 * Retourne une date au format DD/MM/YYYY ou '-' si la date est invalide/falsy.
 *
 * Accepté : string (ISO, etc.), Date, null, undefined
 */
export function formatDateOrDash(date?: string | Date | null): string {
  if (!date) return '-';

  const d = date instanceof Date ? date : new Date(date);

  if (Number.isNaN(d.getTime())) return '-';

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();

  return `${day}/${month}/${year}`;
}

export default formatDateOrDash;
