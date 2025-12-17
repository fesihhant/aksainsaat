import { useEffect, useMemo, useRef, useState } from 'react';
import { apiUrl } from './utils';

const memoryCache = new Map(); // key -> { value, expiresAt }
const inflightRequests = new Map(); // key -> Promise<json>

function nowMs() {
    return Date.now();
}

function safeJsonStringify(value) {
    try {
        return JSON.stringify(value);
    } catch {
        return '';
    }
}

function getStorageKey(key) {
    return `apiCache:${key}`;
}

function readLocalStorageCache(key) {
    try {
        const raw = localStorage.getItem(getStorageKey(key));
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== 'object') return null;
        return parsed; // { value, expiresAt }
    } catch {
        return null;
    }
}

function writeLocalStorageCache(key, entry) {
    try {
        localStorage.setItem(getStorageKey(key), JSON.stringify(entry));
    } catch {
        // ignore quota / private mode errors
    }
}

async function fetchJsonWithTimeout(fullUrl, fetchOptions, timeoutMs) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const response = await fetch(fullUrl, { ...fetchOptions, signal: controller.signal });
        return response;
    } finally {
        clearTimeout(timeoutId);
    }
}

async function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
}

async function fetchJsonWithRetry({ fullUrl, fetchOptions, timeoutMs, retry, retryDelayMs }) {
    let lastError = null;
    for (let attempt = 0; attempt <= retry; attempt++) {
        try {
            const response = await fetchJsonWithTimeout(fullUrl, fetchOptions, timeoutMs);
            return response;
        } catch (err) {
            lastError = err;
            if (attempt < retry) {
                await sleep(typeof retryDelayMs === 'number' ? retryDelayMs : 400);
            }
        }
    }
    throw lastError;
}

export const useApiCall = (url, method, body, isToken = false, options = {}) => {
    const [apiData, setData] = useState(null);
    const [apiError, setError] = useState(null);
    const [apiLoading, setLoading] = useState(true);
    const [requestSeq, setRequestSeq] = useState(0);
    const isMountedRef = useRef(true);

    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    const resolvedOptions = useMemo(() => {
        const {
            enabled = true,
            timeoutMs = 45000,
            retry = 0,
            retryDelayMs = 400,
            dedupe = true,
            cache = false,
            staleTimeMs = 0,
            cacheStorage = 'memory', // 'memory' | 'localStorage' | 'both'
        } = options || {};

        return { enabled, timeoutMs, retry, retryDelayMs, dedupe, cache, staleTimeMs, cacheStorage };
    }, [safeJsonStringify(options)]);

    const bodyKey = useMemo(() => (body ? safeJsonStringify(body) : ''), [body]);
    const optionsKey = useMemo(() => safeJsonStringify(resolvedOptions), [resolvedOptions]);

    useEffect(() => {
        const fetchData = async () => {
            if (!resolvedOptions.enabled) {
                setLoading(false);
                return;
            }

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

                const isGetLike = `${method}`.toUpperCase() === 'GET';
                const cacheKey = `${method}:${fullUrl}:${bodyKey}:${isToken ? 'token' : 'public'}`;

                // 1) Serve from cache immediately if available
                if (resolvedOptions.cache && isGetLike && resolvedOptions.staleTimeMs > 0) {
                    const current = nowMs();

                    const memEntry = memoryCache.get(cacheKey);
                    if (memEntry && memEntry.expiresAt > current) {
                        setData(memEntry.value);
                        setLoading(false);
                        return;
                    }

                    if (resolvedOptions.cacheStorage === 'localStorage' || resolvedOptions.cacheStorage === 'both') {
                        const lsEntry = readLocalStorageCache(cacheKey);
                        if (lsEntry && lsEntry.expiresAt > current) {
                            memoryCache.set(cacheKey, lsEntry);
                            setData(lsEntry.value);
                            setLoading(false);
                            return;
                        }
                    }
                }

                // 2) Dedupe inflight requests
                if (resolvedOptions.dedupe && inflightRequests.has(cacheKey)) {
                    const shared = inflightRequests.get(cacheKey);
                    const result = await shared;
                    if (!isMountedRef.current) return;
                    setData(result);
                    return;
                }

                const fetchOptions = {
                    method: method,
                    headers: {
                        ...headers,
                    },
                    body: body ? bodyKey : null
                };

                const requestPromise = (async () => {
                    const response = await fetchJsonWithRetry({
                        fullUrl,
                        fetchOptions,
                        timeoutMs: resolvedOptions.timeoutMs,
                        retry: resolvedOptions.retry,
                        retryDelayMs: resolvedOptions.retryDelayMs
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
                    return await response.json();
                })();

                if (resolvedOptions.dedupe) {
                    inflightRequests.set(cacheKey, requestPromise);
                }
               
                const result = await requestPromise;
                if (!isMountedRef.current) return;

                setData(result);

                if (resolvedOptions.cache && isGetLike && resolvedOptions.staleTimeMs > 0) {
                    const entry = { value: result, expiresAt: nowMs() + resolvedOptions.staleTimeMs };
                    memoryCache.set(cacheKey, entry);
                    if (resolvedOptions.cacheStorage === 'localStorage' || resolvedOptions.cacheStorage === 'both') {
                        writeLocalStorageCache(cacheKey, entry);
                    }
                }
            } catch (error) {
                if (!isMountedRef.current) return;
                setError(error);
            } finally {
                if (resolvedOptions.dedupe) {
                    // best-effort cleanup: key includes fullUrl + method, so remove all inflight for this url
                    // (we don't keep a handle to exact key in this scope if something threw before computed)
                    // Note: inflight removal happens below in a safer block as well.
                }
                // ensure any inflight promise for this key is cleared
                try {
                    const fullUrl = `${apiUrl}${url}`;
                    const cacheKey = `${method}:${fullUrl}:${bodyKey}:${isToken ? 'token' : 'public'}`;
                    inflightRequests.delete(cacheKey);
                } catch {
                    // ignore
                }

                if (!isMountedRef.current) return;
                setLoading(false);
            }
        };

        fetchData();
    }, [url, method, bodyKey, isToken, requestSeq, optionsKey, resolvedOptions.enabled]);

    const refetch = () => {
        setLoading(true);
        setError(null);
        setRequestSeq((x) => x + 1);
    };

    return { apiData, apiError, apiLoading, refetch };
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