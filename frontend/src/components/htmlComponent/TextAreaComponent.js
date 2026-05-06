import { useEffect, useRef } from 'react'; 
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';  
// import { ClassicEditor, Heading, BlockQuote, Bold, Italic, Font, Link, List } from 'ckeditor5';

 

const TextAreaComponent = ({ field, name, value, onChange, onBlur, fieldErrors }) => {
    const onChangeRef = useRef(onChange);
    const onBlurRef = useRef(onBlur);


    // ClassicEditor
	// .create( {
	// 	licenseKey: 'GPL', // Or 'GPL'.        
	// 	toolbar: [
	// 		'heading',
	// 		'|',
	// 		'bold',
	// 		'italic',
	// 		'fontSize',
	// 		'fontFamily',
	// 		'fontColor',
	// 		'|',
	// 		'link',
	// 		'bulletedList',
	// 		'numberedList',
	// 		'blockQuote'
	// 		],
	// 	heading: {
	// 		options: [
	// 			{ model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
	// 			{ model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
	// 			{ model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' }
	// 		]
	// 	},
	// 	fontFamily: {
	// 		options: [
	// 			'default',
	// 			'Ubuntu, Arial, sans-serif',
	// 			'Ubuntu Mono, Courier New, Courier, monospace'
	// 		]
	// 	},
	// 	fontColor: {
	// 		colorPicker: {
	// 			// Use 'hex' format for output instead of 'hsl'.
	// 			format: 'hex'
	// 		}
	// 	},
	// } )
	// .catch( error => {
	// 	console.log( error );
	// });

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
                    // toolbar: {
                    //     items: [
                    //         'undo', 'redo',
                    //         '|',
                    //         'heading',
                    //         '|',
                    //         'TextColor','FontSize','BGColor',
                    //         '|',
                    //         'bold', 'italic', 'strikethrough', 'subscript', 'superscript', 'code',
                    //         '|',
                    //         'link', 'uploadImage', 'blockQuote', 'codeBlock',
                    //         '|',
                    //         'alignment',
                    //         '|',
                    //         'bulletedList', 'numberedList', 'todoList', 'outdent', 'indent'
                    //     ],
                    //     shouldNotGroupWhenFull: true
                    // },
                    // toolbar: [
                    //     // { name: 'styles', items: ['Font','FontSize' ] },
                    //     { name: 'colors', items: [ 'BGColor','TextColor' ] },
                    //     { name: 'basicstyles', items: [ 'Bold', 'Italic', 'Underline', 'Strike','-', 'RemoveFormat' ] },
                    //     { name: 'undo', items: [ 'Undo', 'Redo', 'Cut', 'Copy', 'Paste'] }
                    // ],
                    // shouldNotGroupWhenFull: true
                }}
                

                name={name || field.name || 'text'}
            />
            {fieldErrors && fieldErrors[field.name] && <div className="error-message">{fieldErrors[field.name]}</div>}
        </>
    );
};

export default TextAreaComponent;
