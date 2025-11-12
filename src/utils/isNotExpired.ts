/**
 * Retourne true si la date passée en paramètre est valide et n'est pas expirée
 * par rapport à la date du jour (comparaison à la journée, sans l'heure).
 *
 * Accepté : string (ISO, etc.), Date, null, undefined
 * Comportement :
 * - falsy ou invalide -> false
 * - date >= aujourd'hui (même jour ou futur) -> true
 * - date < aujourd'hui -> false
 */
export function isNotExpired(date?: string | Date | null): boolean {
  if (!date) return false;

  const parsed = date instanceof Date ? new Date(date) : new Date(date);
  if (Number.isNaN(parsed.getTime())) return false;

  // Normaliser les deux dates à minuit (heure locale) pour comparer uniquement les jours
  const d = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
  const today = new Date();
  const todayMid = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  return d.getTime() >= todayMid.getTime();
}

export default isNotExpired;
