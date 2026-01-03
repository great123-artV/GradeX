import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { Course, Grade, calculateGPA, calculateCGPA, getCarryoverCourses, CGPACalculationResult, calculateGrade } from '@/lib/grading';

// Extended course type for v2 schema
interface StudentCourse {
  id: string;
  user_id: string;
  course_catalog_id: string;
  score: number | null;
  grade: string | null;
  is_carryover: boolean;
  original_semester: string | null;
  course_catalog: {
    id: string;
    course_code: string;
    title: string;
    unit_load: number;
    level: string;
    semester: string;
  } | null;
}

interface CourseContextType {
  courses: Course[];
  loading: boolean;
  addCourse: (course: Omit<Course, 'id' | 'grade'>) => Promise<void>;
  updateCourse: (id: string, updates: Partial<Course>) => Promise<void>;
  deleteCourse: (id: string) => Promise<void>;
  updateScore: (studentCourseId: string, score: number) => Promise<void>;
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

    // Try to fetch from new student_courses table first
    const { data: studentCourses, error: studentError } = await supabase
      .from('student_courses')
      .select(`
        id,
        user_id,
        course_catalog_id,
        score,
        grade,
        is_carryover,
        original_semester,
        course_catalog (
          id,
          course_code,
          title,
          unit_load,
          level,
          semester
        )
      `)
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (!studentError && studentCourses && studentCourses.length > 0) {
      // Use v2 student_courses data
      const mappedCourses: Course[] = (studentCourses as StudentCourse[])
        .filter(sc => sc.course_catalog !== null)
        .map(sc => ({
          id: sc.id,
          code: sc.course_catalog!.course_code,
          title: sc.course_catalog!.title,
          units: sc.course_catalog!.unit_load,
          score: Number(sc.score) || 0,
          grade: toGrade(sc.grade),
          level: sc.course_catalog!.level,
          semester: sc.course_catalog!.semester,
        }));
      setCourses(mappedCourses);
      setLoading(false);
      return;
    }

    // Fallback to legacy courses table
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

  // Update score in student_courses table
  const updateScore = async (studentCourseId: string, score: number) => {
    if (!session?.user) return;

    const grade = calculateGrade(score);
    const isCarryover = score < 40;

    const { error } = await supabase
      .from('student_courses')
      .update({
        score,
        grade,
        is_carryover: isCarryover,
      })
      .eq('id', studentCourseId)
      .eq('user_id', session.user.id);

    if (error) {
      console.error('Error updating score:', error);
      throw error;
    }

    setCourses(prev => prev.map(course => {
      if (course.id === studentCourseId) {
        return { ...course, score, grade: toGrade(grade) };
      }
      return course;
    }));
  };

  // Legacy addCourse - adds to old courses table
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

    // Check if this is a student_course or legacy course
    const course = courses.find(c => c.id === id);
    if (!course) return;

    // Try student_courses first
    if (updates.score !== undefined) {
      try {
        await updateScore(id, updates.score);
        return;
      } catch {
        // Fall through to legacy update
      }
    }

    // Legacy update
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

    // Try deleting from student_courses first
    const { error: studentError } = await supabase
      .from('student_courses')
      .delete()
      .eq('id', id)
      .eq('user_id', session.user.id);

    if (studentError) {
      // Try legacy courses table
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', id)
        .eq('user_id', session.user.id);

      if (error) {
        console.error('Error deleting course:', error);
        throw error;
      }
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
        updateScore,
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