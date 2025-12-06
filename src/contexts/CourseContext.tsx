import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { Course, Grade, calculateGPA, calculateCGPA, getCarryoverCourses, CGPACalculationResult, calculateGrade } from '@/lib/grading';

interface CourseContextType {
  courses: Course[];
  loading: boolean;
  addCourse: (course: Omit<Course, 'id' | 'grade'>) => Promise<void>;
  updateCourse: (id: string, updates: Partial<Course>) => Promise<void>;
  deleteCourse: (id: string) => Promise<void>;
  getCurrentSemesterCourses: () => Course[];
  getCurrentGPA: () => number;
  getCGPA: () => number;
  getCGPADetails: (courses: Course[], prior: { cgpa: number, units: number }) => CGPACalculationResult;
  getCarryovers: () => Course[];
  refreshCourses: () => Promise<void>;
}

const CourseContext = createContext<CourseContextType | undefined>(undefined);

interface CourseProviderProps {
  children: ReactNode;
}

function toGrade(grade: string | null): Grade {
  const validGrades: Grade[] = ['A', 'B', 'C', 'D', 'E', 'F'];
  if (grade && validGrades.includes(grade as Grade)) {
    return grade as Grade;
  }
  return 'F';
}

export function CourseProvider({ children }: CourseProviderProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const { session, user } = useAuth();

  const fetchCourses = async () => {
    if (!session?.user) {
      setCourses([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching courses:', error);
    } else {
      setCourses(data?.map(c => ({
        id: c.id,
        code: c.code,
        title: c.title,
        units: c.units,
        score: Number(c.score) || 0,
        grade: toGrade(c.grade),
        level: c.level,
        semester: c.semester,
      })) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCourses();
  }, [session?.user?.id]);

  const addCourse = async (course: Omit<Course, 'id' | 'grade'>) => {
    if (!session?.user) return;

    const grade = calculateGrade(course.score);
    
    const { data, error } = await supabase
      .from('courses')
      .insert({
        user_id: session.user.id,
        code: course.code,
        title: course.title,
        units: course.units,
        score: course.score,
        grade,
        level: course.level,
        semester: course.semester,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding course:', error);
      throw error;
    }

    if (data) {
      setCourses(prev => [{
        id: data.id,
        code: data.code,
        title: data.title,
        units: data.units,
        score: Number(data.score),
        grade: toGrade(data.grade),
        level: data.level,
        semester: data.semester,
      }, ...prev]);
    }
  };

  const updateCourse = async (id: string, updates: Partial<Course>) => {
    if (!session?.user) return;

    const updateData: Record<string, unknown> = { ...updates };
    if (updates.score !== undefined) {
      updateData.grade = calculateGrade(updates.score);
    }

    const { error } = await supabase
      .from('courses')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', session.user.id);

    if (error) {
      console.error('Error updating course:', error);
      throw error;
    }

    setCourses(prev => prev.map(course => {
      if (course.id === id) {
        const updated = { ...course, ...updates };
        if (updates.score !== undefined) {
          updated.grade = calculateGrade(updates.score);
        }
        return updated;
      }
      return course;
    }));
  };

  const deleteCourse = async (id: string) => {
    if (!session?.user) return;

    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', id)
      .eq('user_id', session.user.id);

    if (error) {
      console.error('Error deleting course:', error);
      throw error;
    }

    setCourses(prev => prev.filter(course => course.id !== id));
  };

  const getCurrentSemesterCourses = () => {
    if (!user) return [];
    return courses.filter(
      course => course.level === user.level && course.semester === user.semester
    );
  };

  const getCurrentGPA = () => {
    return calculateGPA(getCurrentSemesterCourses());
  };

  const getCGPA = () => {
    return calculateGPA(courses);
  };

  const getCGPADetails = (courseList: Course[], prior: { cgpa: number, units: number }) => {
    return calculateCGPA(courseList, prior);
  };

  const getCarryovers = () => {
    return getCarryoverCourses(courses);
  };

  const refreshCourses = async () => {
    setLoading(true);
    await fetchCourses();
  };

  return (
    <CourseContext.Provider
      value={{
        courses,
        loading,
        addCourse,
        updateCourse,
        deleteCourse,
        getCurrentSemesterCourses,
        getCurrentGPA,
        getCGPA,
        getCGPADetails,
        getCarryovers,
        refreshCourses,
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