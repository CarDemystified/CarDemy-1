import { supabase } from './supabase';
import { Car } from '../types';

export interface FetchCarsFilters {
  make?: string;
  maxPrice?: number;
}

/**
 * Fetches car listings from Supabase with selective filtering capabilities.
 * Supports filtering by manufacturer/make and maximum budget criteria.
 * 
 * @param filters Optional filtering criteria including 'make' or 'maxPrice'.
 * @returns Promise resolving to an array of Car records or error.
 */
export async function fetchCars(filters?: FetchCarsFilters): Promise<Car[]> {
  try {
    let query = supabase
      .from('cars')
      .select('*')
      .order('created_at', { ascending: false });

    // Apply optional manufacturer/make filter
    if (filters?.make && filters.make !== 'All') {
      query = query.eq('make', filters.make);
    }

    // Apply optional premium budget threshold filter
    if (filters?.maxPrice && filters.maxPrice > 0) {
      query = query.lte('price', filters.maxPrice);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return (data as Car[]) || [];
  } catch (err) {
    console.error('Error executing select query on cars relation:', err);
    throw err;
  }
}

/**
 * Fetches distinct makes from the DB to dynamically populate filter controls
 */
export async function fetchDistinctMakes(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('cars')
      .select('make');

    if (error) {
      throw error;
    }

    const makes: string[] = (data || []).map((item: any) => String(item.make || ''));
    return Array.from(new Set<string>(makes)).sort();
  } catch (err) {
    console.error('Error loading distinct car makes:', err);
    return [];
  }
}
