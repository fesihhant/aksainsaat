import React from 'react';
import { apiUrl } from '../utils/utils';

export const fetchCategories = async () => {
    try {   
        const response = await fetch(`${apiUrl}/categories`,{
          method: 'GET',
          headers: {
              'Content-Type': 'application/json'
          }
        });
        const data = await response.json();

        if (data.success) {
            return data.categories;
        }
    } catch (error) {    
        console.error('Veriler alınırken hata oluştu:', error);
    }
};    