import { useState, useEffect } from 'react';
import { apiUrl } from './utils';

export const useApiCall = (url, method, body, isToken = false) => {
    const [apiData, setData] = useState(null);
    const [apiError, setError] = useState(null);
    const [apiLoading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("token");
                if (isToken && !token) {
                    throw new Error("Token not found");
                }

                const headers = {"Content-Type": "application/json"};
                if (isToken && token) {
                    headers['Authorization'] = `Bearer ${token}`;
                }
               const fullUrl = `${apiUrl}${url}`;
               
                const response = await fetch(fullUrl, {
                    method: method,
                    headers: {
                        ...headers,
                    },
                    // body: body ? JSON.stringify({value: encripted}) : null
                    body:body ? JSON.stringify(body): null
                });

                if (response.status === 401) {
                    // oturum yok/expired → login'e yönlendir
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    window.location.href = '/login';
                    throw new Error("Unauthorized");
                }
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }

                const result = await response.json();
                setData(result);
            } catch (error) {
                setError(error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [url, method, body]);

    return { apiData, apiError, apiLoading };
}

export const useDeleteApiCall = () => {
    const [apiSuccess, setSuccess] = useState(false);
    const [apiError, setError] = useState(null);
    const [apiLoading, setLoading] = useState(false);

    const deleteData = async (url) => {
        setLoading(true);
        setError(null);
        setSuccess(false);
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                throw new Error("Token bulunamadı");
            }
            const fullUrl = `${apiUrl}${url}`;
            const response = await fetch(fullUrl, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
                throw new Error("Unauthorized");
            }
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            const result = await response.json();
            setSuccess(result.success);
            return result.success;
        } catch (error) {
            setError(error.message || "Silme işlemi sırasında bir hata oluştu");
            return false;
        } finally {
            setLoading(false);
        }
    };
 
    return { apiSuccess, apiError, apiLoading, deleteData };
};