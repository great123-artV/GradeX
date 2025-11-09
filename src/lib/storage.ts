import { Course } from './grading';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  about?: string;
  currentLevel: string;
  currentSemester: string;
  expectedCoursesThisSemester?: number;
  createdAt: string;
}

export interface AppData {
  user: UserProfile | null;
  courses: Course[];
  theme: 'light' | 'dark' | 'system';
  voiceEnabled: boolean;
  tutorialCompleted: boolean;
}

const STORAGE_KEY = 'gradex_data';

export function getStoredData(): AppData {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return {
      user: null,
      courses: [],
      theme: 'light',
      voiceEnabled: true,
      tutorialCompleted: false,
    };
  }
  return JSON.parse(stored);
}

export function saveData(data: Partial<AppData>) {
  const current = getStoredData();
  const updated = { ...current, ...data };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function saveUser(user: UserProfile) {
  saveData({ user });
}

export function saveCourses(courses: Course[]) {
  saveData({ courses });
}

export function saveTheme(theme: 'light' | 'dark' | 'system') {
  saveData({ theme });
}

export function saveVoiceEnabled(enabled: boolean) {
  saveData({ voiceEnabled: enabled });
}

export function saveTutorialCompleted(completed: boolean) {
  saveData({ tutorialCompleted: completed });
}

export function logout() {
  localStorage.removeItem(STORAGE_KEY);
}

export function isLoggedIn(): boolean {
  const data = getStoredData();
  return data.user !== null;
}
