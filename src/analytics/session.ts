const STORAGE_KEY = 'algoxpress-anonymous-id';

export function getAnonymousUserId(): string {
  let id = localStorage.getItem(STORAGE_KEY);

  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(STORAGE_KEY, id);
  }

  return id;
}