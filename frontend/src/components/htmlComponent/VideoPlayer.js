import {serverUrl} from '../../utils/utils';
export const VideoPlayer = ({ videoList, setVideoFiles }) => {

    if (!videoList || videoList.length === 0) {
        return null;
    }
    return (
        <div>
            <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {videoList.map((preview, index) => {
                    const isExistingVideo = typeof preview === 'string' && preview.startsWith('http') && videoList.includes(preview);
                    const isNewVideo = preview instanceof File;
                    const previewUrl = isExistingVideo ? preview : (isNewVideo ? URL.createObjectURL(preview) : null);
                    const videoIndex = isNewVideo ? preview.name + preview.lastModified : preview;
                    return (
                        <div key={videoIndex} style={{ position: 'relative', display: 'inline-block' }}>
                            <video
                                width="640"
                                height="360"
                                controls 
                                style={{ borderRadius: '8px', backgroundColor: '#000', height: '360px' }}
                            >
                                <source src={previewUrl} type="video/mp4" />
                                Tarayıcınız video etiketini desteklemiyor.
                            </video>
                            
                            <button
                                type="button"
                                onClick={() => {
                                    setVideoFiles(prev => prev.filter((_, i) => i !== index)); 
                                }}
                                style={{
                                    position: 'absolute',
                                    top: '-5px',
                                    right: '-5px',
                                    background: 'red',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: '24px',
                                    height: '24px',
                                    cursor: 'pointer',
                                    fontSize: '16px',
                                    lineHeight: '1',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                                title={`${videoIndex} Videoyu Sil`}
                            >
                                ×
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}


export const VideoViewer = ({ videoList }) => {


    if (!videoList || videoList.length === 0) {
        return null;
    }
    return (
        <div>
            <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {videoList.map((preview, index) => {
                    return (
                        <div key={index} style={{ position: 'relative', display: 'inline-block' }}>
                            <video
                                width="640"
                                height="360"
                                controls 
                                style={{ borderRadius: '8px', backgroundColor: '#000', height: '360px' }}
                            >
                                <source src={serverUrl + preview} type="video/mp4" />
                                Tarayıcınız video etiketini desteklemiyor.
                            </video> 
                        </div>
                    );
                })}
            </div>
        </div>
    );
}