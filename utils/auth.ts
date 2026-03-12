export function getUser() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('zavlo_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
