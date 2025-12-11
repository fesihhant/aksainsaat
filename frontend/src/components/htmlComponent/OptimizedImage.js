import { useState, useEffect, useRef } from 'react';
 
const OptimizedImage = ({
    src,
    alt = '',
    className = '',
    style = {},
    priority = false, // Kritik resimler için (above-the-fold)
    placeholder = true, // Placeholder göster
    onLoad,
    onError,
    ...props
}) => {
    const [imageSrc, setImageSrc] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [isInView, setIsInView] = useState(priority); // Priority resimler hemen yüklenir
    const imgRef = useRef(null);
    const observerRef = useRef(null);

    useEffect(() => {
        // Priority resimler hemen yüklenir
        if (priority) {
            setIsInView(true);
            return;
        }

        // Intersection Observer ile görünür olduğunda yükleme
        if (!isInView && imgRef.current) {
            observerRef.current = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            setIsInView(true);
                            if (observerRef.current) {
                                observerRef.current.disconnect();
                            }
                        }
                    });
                },
                {
                    rootMargin: '50px', // 50px önceden yükleme
                    threshold: 0.01
                }
            );

            observerRef.current.observe(imgRef.current);
        }

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, [isInView, priority]);

    useEffect(() => {
        if (isInView && src) {
            setIsLoading(true);
            setHasError(false);

            // Resmi önceden yükle
            const img = new Image();
            
            img.onload = () => {
                setImageSrc(src);
                setIsLoading(false);
                if (onLoad) onLoad();
            };

            img.onerror = () => {
                setIsLoading(false);
                setHasError(true);
                if (onError) onError();
            };

            img.src = src;
        }
    }, [isInView, src, onLoad, onError]);

    // Placeholder skeleton
    const placeholderStyle = {
        backgroundColor: '#f0f0f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...style
    };

    // Error placeholder
    const errorStyle = {
        backgroundColor: '#e0e0e0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#999',
        fontSize: '14px',
        ...style
    };

    return (
        <div
            ref={imgRef}
            className={className}
            style={{
                position: 'relative',
                overflow: 'hidden',
                ...style
            }}
        >
            {isLoading && placeholder && (
                <div
                    style={placeholderStyle}
                    className="image-placeholder"
                    aria-label="Yükleniyor..."
                >
                    <div
                        style={{
                            width: '100%',
                            height: '100%',
                            background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
                            backgroundSize: '200% 100%',
                            animation: 'shimmer 1.5s infinite',
                        }}
                    />
                    <style>
                        {`
                            @keyframes shimmer {
                                0% { background-position: -200% 0; }
                                100% { background-position: 200% 0; }
                            }
                        `}
                    </style>
                </div>
            )}

            {hasError && (
                <div
                    style={errorStyle}
                    className="image-error"
                    aria-label="Resim yüklenemedi"
                >
                    <svg
                        width="48"
                        height="48"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                    >
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <path d="M21 15l-5-5L5 21" />
                    </svg>
                </div>
            )}

            {imageSrc && !hasError && (
                <img
                    src={imageSrc}
                    alt={alt}
                    loading={priority ? 'eager' : 'lazy'}
                    decoding="async"
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        opacity: isLoading ? 0 : 1,
                        transition: 'opacity 0.3s ease-in-out',
                        ...style
                    }}
                    onLoad={() => {
                        setIsLoading(false);
                        if (onLoad) onLoad();
                    }}
                    onError={() => {
                        setIsLoading(false);
                        setHasError(true);
                        if (onError) onError();
                    }}
                    {...props}
                />
            )}

            {/* Preload için hidden img (browser cache için) */}
            {isInView && src && !priority && (
                <link rel="preload" as="image" href={src} />
            )}
        </div>
    );
};

export default OptimizedImage;

