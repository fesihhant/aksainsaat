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
                    toolbar_Full:
                    [
                        { name: 'document', items : [ 'Source','-','Save','NewPage','DocProps','Preview','Print','-','Templates' ] },
                        { name: 'clipboard', items : [ 'Cut','Copy','Paste','PasteText','PasteFromWord','-','Undo','Redo' ] },
                        { name: 'editing', items : [ 'Find','Replace','-','SelectAll','-','SpellChecker', 'Scayt' ] },
                        { name: 'forms', items : [ 'Form', 'Checkbox', 'Radio', 'TextField', 'Textarea', 'Select', 'Button', 'ImageButton',
                            'HiddenField' ] },
                        '/',
                        { name: 'basicstyles', items : [ 'Bold','Italic','Underline','Strike','Subscript','Superscript','-','RemoveFormat' ] },
                        { name: 'paragraph', items : [ 'NumberedList','BulletedList','-','Outdent','Indent','-','Blockquote','CreateDiv',
                            '-','JustifyLeft','JustifyCenter','JustifyRight','JustifyBlock','-','BidiLtr','BidiRtl' ] },
                        { name: 'links', items : [ 'Link','Unlink','Anchor' ] },
                        { name: 'insert', items : [ 'Image','Flash','Table','HorizontalRule','Smiley','SpecialChar','PageBreak','Iframe' ] },
                        '/',
                        { name: 'styles', items : [ 'Styles','Format','Font','FontSize' ] },
                        { name: 'colors', items : [ 'TextColor','BGColor' ] },
                        { name: 'tools', items : [ 'Maximize', 'ShowBlocks','-','About' ] }
                    ],
                    toolbar: [
                        'heading',
                        '|',
                        'bold',
                        'italic',
                        'link',
                        'bulletedList',
                        'numberedList',
                        '|',
                        'fontSize',
                        'fontColor',
                        'fontBackgroundColor',
                        '|',
                        'undo',
                        'redo'
                    ],
                    fontSize: {
                        options: [9, 11, 13, 'default', 17, 19, 21],
                        supportAllValues: true
                    }, 
                    fontColor: {
                        colors: [
                            { color: '#000000', label: 'Black' },
                            { color: '#FF0000', label: 'Red' },
                            { color: '#00FF00', label: 'Green' },
                            { color: '#0000FF', label: 'Blue' }
                        ],
                        columns: 5,
                        documentColors: 10
                    }
                }}
                

                name={name || field.name || 'text'}
            />
            {fieldErrors && fieldErrors[field.name] && <div className="error-message">{fieldErrors[field.name]}</div>}
        </>
    );
};

export default TextAreaComponent;
