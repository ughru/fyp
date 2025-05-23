// For Web versions
import React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const WebQuillEditor = ({ value, onChange }) => {
    const modules = {
        toolbar: [
            [{ 'header': [1, 2, false] }],
            ['bold', 'italic', 'underline'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            ['clean']
        ],
    };

    const formats = [
        'header', 'bold', 'italic', 'underline', 'list', 'bullet'
    ];

    return (
        <ReactQuill 
            value={value} 
            onChange={onChange}
            modules={modules}
            formats={formats}
            theme="snow"
        />
    );
};

export default WebQuillEditor;