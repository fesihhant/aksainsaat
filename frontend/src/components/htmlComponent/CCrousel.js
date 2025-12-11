import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import "../../css/imageSlider.css";
import "../../css/Banner.css";

const CCrousel = ({ imageList }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0); // Slider için
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalImageIndex, setModalImageIndex] = useState(0); // Modal için
    const visibleImagesCount = 8;

    useEffect(() => {
        setCurrentImageIndex(0);
    }, [imageList]);

    // Modal açıkken ESC, sağ ve sol ok tuşlarını dinle
    useEffect(() => {
        if (!isModalOpen) return;
        const handleKeyDown = (e) => {
            if (e.key === "Escape") {
                setIsModalOpen(false);
            } else if (e.key === "ArrowRight") {
                handleModalNext();
            } else if (e.key === "ArrowLeft") {
                handleModalPrev();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isModalOpen, modalImageIndex, imageList]);

    const handleNextImage = () => {
        if (currentImageIndex < imageList.length - visibleImagesCount) {
            setCurrentImageIndex(prev => prev + 1);
        }
    };

    const handlePrevImage = () => {
        if (currentImageIndex > 0) {
            setCurrentImageIndex(prev => prev - 1);
        }
    };

    // Modalda bir resmi aç
    const handleImageClick = (image, index) => {
        setModalImageIndex(currentImageIndex + index); // Modalda tıklanan resmin gerçek index'i
        setIsModalOpen(true);
    };

    // Modalda bir sonraki resme geç
    const handleModalNext = () => {
        if (modalImageIndex < imageList.length - 1) {
            setModalImageIndex(prev => prev + 1);
        }
    };

    // Modalda bir önceki resme geç
    const handleModalPrev = () => {
        if (modalImageIndex > 0) {
            setModalImageIndex(prev => prev - 1);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const visibleImages = imageList.slice(
        currentImageIndex,
        Math.min(currentImageIndex + visibleImagesCount, imageList.length)
    );

    return (
        <div className="image-slider">
            {imageList && imageList.length > 0 && (
                <>
                    {currentImageIndex > 0 && (
                        <button type="button" className="prev-button" onClick={(e) =>handlePrevImage(e)}>
                            &#10094;
                        </button>
                    )}
                    <div className="image-slider-container">
                        {visibleImages.map((image, index) => (
                            <img
                                key={index}
                                src={image}
                                alt={`${currentImageIndex + index + 1}`}
                                className="slider-image"
                                onClick={() => handleImageClick(image, index)}
                            />
                        ))}
                    </div>
                    {currentImageIndex < imageList.length - visibleImagesCount && (
                        <button type="button" className="next-button" onClick={handleNextImage}>
                            &#10095;
                        </button>
                    )}
                </>
            )}

            {/* Modal */}
            {isModalOpen &&
                ReactDOM.createPortal(
                    <div className="modal-overlay" onClick={e => {
                            if (e.target.classList.contains('modal-overlay')) {
                                handleCloseModal();
                            }
                        }}>
                        <div className="modal-content" style={{ position: 'relative' }} onClick={e => e.stopPropagation()} onMouseDown={e => e.stopPropagation()}>
                            {modalImageIndex > 0 && (
                                <button
                                    className="prev-button"
                                    // style={{
                                    //     position: 'absolute',
                                    //     left: 10,
                                    //     top: '50%',
                                    //     transform: 'translateY(-50%)',
                                    //     fontSize: 40,
                                    //     background: 'none',
                                    //     border: 'none',
                                    //     color: '#fff',
                                    //     cursor: 'pointer',
                                    //     zIndex: 10
                                    // }}
                                    onClick={e => { e.stopPropagation(); handleModalPrev(); }}
                                    onMouseDown={e => e.stopPropagation()}
                                >
                                    &#10094;
                                </button>
                            )}
                            {modalImageIndex < imageList.length - 1 && (
                                <button
                                    className="next-button"
                                    // style={{
                                    //     position: 'absolute',
                                    //     right: 10,
                                    //     top: '50%',
                                    //     transform: 'translateY(-50%)',
                                    //     fontSize: 40,
                                    //     background: 'none',
                                    //     border: 'none',
                                    //     color: '#fff',
                                    //     cursor: 'pointer',
                                    //     zIndex: 10
                                    // }}
                                    onClick={e => { e.stopPropagation(); handleModalNext(); }}
                                    onMouseDown={e => e.stopPropagation()}
                                >
                                    &#10095;
                                </button>
                            )}
                            <img loading="lazy" src={imageList[modalImageIndex]} style={{ objectFit: 'cover' }} alt="Büyütülmüş Görsel" className="modal-image" onClick={e => e.stopPropagation()} onMouseDown={e => e.stopPropagation()}/>
                        </div>
                    </div>,
                    document.body
                )
            }
        </div>
    );
};

export default CCrousel;