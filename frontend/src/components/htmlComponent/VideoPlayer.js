import { useState } from 'react';
import '../../css/videoPlayer.css';

const VideoPlayer = ({ videoList, serverUrl }) => {
    const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    if (!videoList || videoList.length === 0) {
        return null;
    }

    const currentVideo = videoList[currentVideoIndex];

    const handlePrevVideo = () => {
        if (currentVideoIndex > 0) {
            setCurrentVideoIndex(prev => prev - 1);
        }
    };

    const handleNextVideo = () => {
        if (currentVideoIndex < videoList.length - 1) {
            setCurrentVideoIndex(prev => prev + 1);
        }
    };

    return (
        <div className="video-player-container">
            <div className="video-player-wrapper" style={{ position: 'relative' }}>
                <video
                    width="100%"
                    height="500"
                    controls
                    autoPlay={isPlaying}
                    style={{ borderRadius: '8px', backgroundColor: '#000' }}
                >
                    <source src={`${serverUrl}${currentVideo}`} type="video/mp4" />
                    Tarayıcınız video oynatmayı desteklemiyor.
                </video>

                {/* Sol ok */}
                {currentVideoIndex > 0 && (
                    <button
                        className="video-nav-button prev-button"
                        onClick={handlePrevVideo}
                        style={{
                            position: 'absolute',
                            left: '10px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            fontSize: '30px',
                            background: 'rgba(0, 0, 0, 0.5)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '50%',
                            width: '50px',
                            height: '50px',
                            cursor: 'pointer',
                            zIndex: 10
                        }}
                    >
                        &#10094;
                    </button>
                )}

                {/* Sağ ok */}
                {currentVideoIndex < videoList.length - 1 && (
                    <button
                        className="video-nav-button next-button"
                        onClick={handleNextVideo}
                        style={{
                            position: 'absolute',
                            right: '10px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            fontSize: '30px',
                            background: 'rgba(0, 0, 0, 0.5)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '50%',
                            width: '50px',
                            height: '50px',
                            cursor: 'pointer',
                            zIndex: 10
                        }}
                    >
                        &#10095;
                    </button>
                )}
            </div>

            {/* Video sayacı */}
            <div style={{ marginTop: '12px', textAlign: 'center', color: '#666' }}>
                <span>{currentVideoIndex + 1} / {videoList.length}</span>
            </div>

            {/* Video listesi */}
            {videoList.length > 1 && (
                <div style={{ marginTop: '16px' }}>
                    <div style={{ display: 'flex', gap: '8px', overflowX: 'auto' }}>
                        {videoList.map((video, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentVideoIndex(index)}
                                style={{
                                    padding: '8px 12px',
                                    borderRadius: '4px',
                                    border: currentVideoIndex === index ? '2px solid #003da6' : '1px solid #ddd',
                                    backgroundColor: currentVideoIndex === index ? '#003da6' : '#f0f0f0',
                                    color: currentVideoIndex === index ? '#fff' : '#000',
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap',
                                    fontSize: '12px'
                                }}
                            >
                                Video {index + 1}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default VideoPlayer;