import { useEffect, useRef } from 'react'; 
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';   

const TextAreaComponent = ({ field, name, value, onChange, onBlur, fieldErrors }) => {
    const onChangeRef = useRef(onChange);
    const onBlurRef = useRef(onBlur);
 
    useEffect(() => {
        onChangeRef.current = onChange;
        onBlurRef.current = onBlur;
    }, [onChange, onBlur]);

    const handleEditorChange = (event, editor) => {
        const data = editor.getData();
        if (onChangeRef.current) {
            onChangeRef.current(data);
        }
    };

    const handleEditorBlur = (event, editor) => {
        const data = editor.getData();
        if (onBlurRef.current) {
            onBlurRef.current(data);
        }
    };

    return (
        <>
            <CKEditor
                editor={ClassicEditor}
                data={value || ''}
                onChange={onBlur ? undefined : handleEditorChange}
                onBlur={onBlur ? handleEditorBlur : undefined}
                config={{
                    licenseKey: 'GPL', // Open source license for CKEditor 5
                    placeholder: field.placeholder || '',  
                    mediaEmbed: {
                    previewsInData: true // 🔹 iframe çıktısını HTML içine ekler
                    } 
                }}
                

                name={name || field.name || 'text'}
            />
            {fieldErrors && fieldErrors[field.name] && <div className="error-message">{fieldErrors[field.name]}</div>}
        </>
    );
};

export default TextAreaComponent;
