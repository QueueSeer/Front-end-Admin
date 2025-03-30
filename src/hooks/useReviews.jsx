import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const useReviews = (initialFilters = {}) => {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    limit: 10,
    order_by: 'id',
    direction: 'desc',
    seer_id: null,
    client_id: null,
    min_score: null,
    max_score: null,
    last_id: null,
    ...initialFilters,
  });

  // Function to transform API response to component format
  const transformReviews = (apiReviews) => {
    return apiReviews.map(review => ({
      id: review.id,
      name: review.client.display_name,
      email: `Client ID: ${review.client.id}`,
      review: review.text,
      comment: "", // Add blank comment field that admins can fill in
      score: review.score,
      date_created: new Date(review.date_created).toLocaleDateString('th-TH'),
      seer_name: review.seer.display_name,
      package_name: review.package.name,
      seer_id: review.seer.id,
      client_id: review.client.id,
      package_id: review.package.id,
      // Add additional fields from API as needed
    }));
  };

  // Fetch reviews function
  const fetchReviews = useCallback(async () => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams();
      
      // Add all non-null filters to query params
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null) {
          queryParams.append(key, value);
        }
      });
      
      const response = await axios.get(`/api/review?${queryParams.toString()}`);
      setReviews(transformReviews(response.data));
      setError(null);
    } catch (err) {
      console.error("Error fetching reviews:", err);
      setError(err.response?.data?.detail || "ไม่สามารถโหลดข้อมูลรีวิว โปรดลองอีกครั้ง");
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  // Delete review function
  const deleteReview = async (reviewId) => {
    try {
      await axios.delete(`/api/review/${reviewId}`);
      
      // Update reviews state after successful delete
      setReviews(prevReviews => prevReviews.filter(review => review.id !== reviewId));
      return { success: true };
    } catch (err) {
      console.error("Error deleting review:", err);
      return { 
        success: false, 
        error: err.response?.data?.detail || "ไม่สามารถลบรีวิว โปรดลองอีกครั้ง" 
      };
    }
  };

  // Update filters
  const updateFilters = (newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }));
  };

  // Load more reviews (pagination)
  const loadMoreReviews = async () => {
    if (reviews.length === 0) return;
    
    const lastId = reviews[reviews.length - 1].id;
    setIsLoading(true);
    
    try {
      const queryParams = new URLSearchParams();
      
      // Add all non-null filters to query params
      Object.entries({
        ...filters,
        last_id: lastId,
      }).forEach(([key, value]) => {
        if (value !== null) {
          queryParams.append(key, value);
        }
      });
      
      const response = await axios.get(`/api/review?${queryParams.toString()}`);
      const newReviews = transformReviews(response.data);
      
      // Append new reviews to existing ones
      setReviews(prev => [...prev, ...newReviews]);
      setError(null);
    } catch (err) {
      console.error("Error loading more reviews:", err);
      setError(err.response?.data?.detail || "ไม่สามารถโหลดข้อมูลรีวิวเพิ่มเติม โปรดลองอีกครั้ง");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch reviews when filters change
  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  return {
    reviews,
    isLoading,
    error,
    filters,
    updateFilters,
    fetchReviews,
    deleteReview,
    loadMoreReviews,
  };
};

export default useReviews;