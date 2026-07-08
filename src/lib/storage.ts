const BOOKMARKS_KEY = "lelenews:bookmarks";
const READ_KEY = "lelenews:read";
const LAST_VISIT_KEY = "lelenews:lastVisit";

export function getLastVisit(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(LAST_VISIT_KEY);
}

export function updateLastVisit(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LAST_VISIT_KEY, new Date().toISOString());
}

export function getBookmarks(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(BOOKMARKS_KEY) || "[]");
  } catch {
    return [];
  }
}

export function toggleBookmark(id: string): boolean {
  const bookmarks = getBookmarks();
  const idx = bookmarks.indexOf(id);
  if (idx === -1) {
    bookmarks.push(id);
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
    return true;
  } else {
    bookmarks.splice(idx, 1);
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
    return false;
  }
}

export function isBookmarked(id: string): boolean {
  return getBookmarks().includes(id);
}

export function getReadItems(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(READ_KEY) || "[]");
  } catch {
    return [];
  }
}

export function markAsRead(id: string): void {
  const read = getReadItems();
  if (!read.includes(id)) {
    read.push(id);
    localStorage.setItem(READ_KEY, JSON.stringify(read));
  }
}

export function isRead(id: string): boolean {
  return getReadItems().includes(id);
}
