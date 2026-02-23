// src/hooks/useModuleData.js
import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';

/**
 * ✅ useModuleData Hook
 * Fetches and manages a single module's data from the backend.
 * Used by Theory, Snippets, Lecture, MCQ, and Challenges pages.
 */
export const useModuleData = (courseId, moduleId) => {
  const [module, setModule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('token');
  const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  const fetchModuleData = useCallback(async () => {
    if (!courseId || !moduleId || !token) {
      console.log('🚫 Missing required params for module data:', { courseId, moduleId, hasToken: !!token });
      return;
    }

    console.log('📡 Fetching module data:', { courseId, moduleId });
    const controller = new AbortController();
    const signal = controller.signal;

    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(
        `${BASE_URL}/courses/${courseId}/modules/${moduleId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          signal,
        }
      );

      if (response.data) {
        console.log('✅ Module data received:', response.data);
        setModule(response.data);
      } else {
        throw new Error('No module data received');
      }
    } catch (err) {
      if (axios.isCancel(err)) {
        console.warn('⏹️ Request cancelled');
      } else {
        console.error('❌ Error fetching module data:', err);
        setError(
          err.response?.data?.message || 'Module not found or server error'
        );
        setModule(null);
      }
    } finally {
      setLoading(false);
    }

    // Cleanup on unmount or param change
    return () => controller.abort();
  }, [courseId, moduleId, token, BASE_URL]);

  useEffect(() => {
    fetchModuleData();
  }, [fetchModuleData]);

  return { module, loading, error, refetch: fetchModuleData };
};
