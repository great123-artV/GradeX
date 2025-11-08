import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { Course, calculateGPA, calculateCGPA, getCarryoverCourses } from '@/lib/grading';
import { getStoredData, saveCourses } from '@/lib/storage';

interface CourseContextType {
  courses: Course[];
  addCourse: (course: Omit<Course, 'id' | 'grade'>) => void;
  updateCourse: (id: string, updates: Partial<Course>) => void;
  deleteCourse: (id: string) => void;
  getCurrentSemesterCourses: () => Course[];
  getCurrentGPA: () => number;
  getCGPA: () => number;
  getCarryovers: () => Course[];
}

const CourseContext = createContext<CourseContextType | undefined>(undefined);

interface CourseProviderProps {
  children: ReactNode;
}

export function CourseProvider({ children }: CourseProviderProps) {
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    const data = getStoredData();
    setCourses(data.courses);
  }, []);

  const addCourse = (course: Omit<Course, 'id' | 'grade'>) => {
    const grade = calculateGrade(course.score);
    const newCourse: Course = {
      ...course,
      id: crypto.randomUUID(),
      grade,
    };
    const updated = [...courses, newCourse];
    setCourses(updated);
    saveCourses(updated);
  };

  const updateCourse = (id: string, updates: Partial<Course>) => {
    const updated = courses.map(course => {
      if (course.id === id) {
        const updatedCourse = { ...course, ...updates };
        if (updates.score !== undefined) {
          updatedCourse.grade = calculateGrade(updates.score);
        }
        return updatedCourse;
      }
      return course;
    });
    setCourses(updated);
    saveCourses(updated);
  };

  const deleteCourse = (id: string) => {
    const updated = courses.filter(course => course.id !== id);
    setCourses(updated);
    saveCourses(updated);
  };

  const getCurrentSemesterCourses = () => {
    const data = getStoredData();
    const user = data.user;
    if (!user) return [];
    return courses.filter(
      course => course.level === user.currentLevel && course.semester === user.currentSemester
    );
  };

  const getCurrentGPA = () => {
    return calculateGPA(getCurrentSemesterCourses());
  };

  const getCGPA = () => {
    return calculateCGPA(courses);
  };

  const getCarryovers = () => {
    return getCarryoverCourses(courses);
  };

  return (
    <CourseContext.Provider
      value={{
        courses,
        addCourse,
        updateCourse,
        deleteCourse,
        getCurrentSemesterCourses,
        getCurrentGPA,
        getCGPA,
        getCarryovers,
      }}
    >
      {children}
    </CourseContext.Provider>
  );
}

export function useCourses() {
  const context = useContext(CourseContext);
  if (!context) {
    throw new Error('useCourses must be used within CourseProvider');
  }
  return context;
}

function calculateGrade(score: number) {
  if (score >= 70) return 'A';
  if (score >= 60) return 'B';
  if (score >= 50) return 'C';
  if (score >= 45) return 'D';
  if (score >= 40) return 'E';
  return 'F';
}
