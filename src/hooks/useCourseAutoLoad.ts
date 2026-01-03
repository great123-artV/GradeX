import { supabase } from '@/integrations/supabase/client';

interface AutoLoadParams {
  userId: string;
  departmentId: string;
  level: string;
  semester: string;
}

export async function autoLoadCourses({ userId, departmentId, level, semester }: AutoLoadParams): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    // Fetch courses from catalog matching department, level, and semester
    const { data: catalogCourses, error: catalogError } = await supabase
      .from('course_catalog')
      .select('id')
      .eq('department_id', departmentId)
      .eq('level', level)
      .eq('semester', semester);

    if (catalogError) {
      console.error('Error fetching course catalog:', catalogError);
      return { success: false, count: 0, error: catalogError.message };
    }

    if (!catalogCourses || catalogCourses.length === 0) {
      console.log('No courses found in catalog for this department/level/semester');
      return { success: true, count: 0 };
    }

    // Check which courses the student already has
    const { data: existingCourses, error: existingError } = await supabase
      .from('student_courses')
      .select('course_catalog_id')
      .eq('user_id', userId);

    if (existingError) {
      console.error('Error checking existing courses:', existingError);
      return { success: false, count: 0, error: existingError.message };
    }

    const existingIds = new Set(existingCourses?.map(c => c.course_catalog_id) || []);
    
    // Filter out courses the student already has
    const newCourses = catalogCourses.filter(c => !existingIds.has(c.id));

    if (newCourses.length === 0) {
      console.log('Student already has all courses for this semester');
      return { success: true, count: 0 };
    }

    // Insert new courses for the student
    const coursesToInsert = newCourses.map(course => ({
      user_id: userId,
      course_catalog_id: course.id,
      score: null,
      grade: null,
      is_carryover: false,
    }));

    const { error: insertError } = await supabase
      .from('student_courses')
      .insert(coursesToInsert);

    if (insertError) {
      console.error('Error inserting student courses:', insertError);
      return { success: false, count: 0, error: insertError.message };
    }

    console.log(`Successfully loaded ${newCourses.length} courses for student`);
    return { success: true, count: newCourses.length };
  } catch (error) {
    console.error('Auto-load courses error:', error);
    return { success: false, count: 0, error: 'An unexpected error occurred' };
  }
}

// Hook to check and auto-load courses when user logs in
export function useAutoLoadOnLogin() {
  const checkAndLoadCourses = async (userId: string, departmentId: string | null, level: string, semester: string) => {
    if (!departmentId) {
      console.log('No department ID, skipping auto-load');
      return;
    }

    const result = await autoLoadCourses({
      userId,
      departmentId,
      level,
      semester,
    });

    if (result.success && result.count > 0) {
      console.log(`Auto-loaded ${result.count} courses`);
    }

    return result;
  };

  return { checkAndLoadCourses };
}