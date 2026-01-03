import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface University {
  id: string;
  name: string;
  short_name: string | null;
}

interface Faculty {
  id: string;
  name: string;
  university_id: string;
}

interface Department {
  id: string;
  name: string;
  faculty_id: string;
}

export function useUniversityData() {
  const [universities, setUniversities] = useState<University[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load universities on mount
  useEffect(() => {
    const loadUniversities = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('universities')
        .select('id, name, short_name')
        .order('name');

      if (!error && data) {
        setUniversities(data);
      }
      setIsLoading(false);
    };

    loadUniversities();
  }, []);

  const loadFaculties = async (universityId: string) => {
    setIsLoading(true);
    setFaculties([]);
    setDepartments([]);

    const { data, error } = await supabase
      .from('faculties')
      .select('id, name, university_id')
      .eq('university_id', universityId)
      .order('name');

    if (!error && data) {
      setFaculties(data);
    }
    setIsLoading(false);
  };

  const loadDepartments = async (facultyId: string) => {
    setIsLoading(true);
    setDepartments([]);

    const { data, error } = await supabase
      .from('departments')
      .select('id, name, faculty_id')
      .eq('faculty_id', facultyId)
      .order('name');

    if (!error && data) {
      setDepartments(data);
    }
    setIsLoading(false);
  };

  return {
    universities,
    faculties,
    departments,
    loadFaculties,
    loadDepartments,
    isLoading,
  };
}