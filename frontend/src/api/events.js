import React from 'react';
import { apiUrl } from '../utils/utils';

export const fetchEvents = async () => {
    try {   
        const response = await fetch(`${apiUrl}/events`,{
          method: 'GET',
          headers: {
              'Content-Type': 'application/json'
          }
        });
        const data = await response.json();

        if (data.success) {
            return data.events;
        }
    } catch (error) {    
        console.error('Veriler alınırken hata oluştu:', error);
    }
};