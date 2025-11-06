// UNN 5.0 Grading System
export const GRADING_SCALE = {
  A: { min: 70, max: 100, points: 5.0 },
  B: { min: 60, max: 69, points: 4.0 },
  C: { min: 50, max: 59, points: 3.0 },
  D: { min: 45, max: 49, points: 2.0 },
  E: { min: 40, max: 44, points: 1.0 },
  F: { min: 0, max: 39, points: 0.0 },
} as const;

export type Grade = keyof typeof GRADING_SCALE;

export function calculateGrade(score: number): Grade {
  if (score >= 70) return 'A';
  if (score >= 60) return 'B';
  if (score >= 50) return 'C';
  if (score >= 45) return 'D';
  if (score >= 40) return 'E';
  return 'F';
}

export function getGradePoints(grade: Grade): number {
  return GRADING_SCALE[grade].points;
}

export function isCarryover(score: number): boolean {
  return score < 40;
}

export interface Course {
  id: string;
  code: string;
  title: string;
  units: number;
  score: number;
  grade: Grade;
  semester: string;
  level: string;
}

export function calculateGPA(courses: Course[]): number {
  if (courses.length === 0) return 0;
  
  const totalPoints = courses.reduce((sum, course) => {
    return sum + (getGradePoints(course.grade) * course.units);
  }, 0);
  
  const totalUnits = courses.reduce((sum, course) => sum + course.units, 0);
  
  return totalUnits > 0 ? totalPoints / totalUnits : 0;
}

export function calculateCGPA(allCourses: Course[]): number {
  return calculateGPA(allCourses);
}

export function getCarryoverCourses(courses: Course[]): Course[] {
  return courses.filter(course => isCarryover(course.score));
}
