const fs = require('fs');
const path = require('path');
const files = [
    'Zip.tsx', 'Word.tsx', 'PDF.tsx', 'Note.tsx', 
    'Media.tsx', 'Excel.tsx', 'Different.tsx'
].map(f => path.join('src/pages/Main/Document', f));
files.push('src/layouts/Header.tsx');

files.forEach(f => {
    let content = fs.readFileSync(f, 'utf8');
    if (!content.includes('const currentUserId = useMemo')) {
        const useMemoMatch = content.match(/import.*useMemo.*from 'react';/);
        if (!useMemoMatch && content.includes('import React')) {
            content = content.replace(/import React(?:, {([^}]*)})? from 'react';/, (m, p1) => {
                const imports = p1 ? p1.split(',').map(s=>s.trim()) : [];
                if (!imports.includes('useMemo')) imports.push('useMemo');
                return `import React, { ${imports.join(', ')} } from 'react';`;
            });
        } else if (!useMemoMatch) {
            content = content.replace(/import {([^}]*)} from 'react';/, (m, p1) => {
                const imports = p1.split(',').map(s=>s.trim());
                if (!imports.includes('useMemo')) imports.push('useMemo');
                return `import { ${imports.join(', ')} } from 'react';`;
            });
        }
        const currentUserCode = `\n    const currentUserId = useMemo(() => {\n        const stored = localStorage.getItem('currentUser');\n        if (stored) {\n            try {\n                return JSON.parse(stored)?.id || '';\n            } catch { return ''; }\n        }\n        return '';\n    }, []);\n`;
        
        if(f.includes('Header.tsx')) {
            content = content.replace(/(export default function Header[^{]*{[^a-zA-Z]*)/, `$1${currentUserCode}`);
            content = content.replace(/documentService\.getAllDocuments\(\)/g, `documentService.getAllDocuments('all', currentUserId)`);
            content = content.replace(/useEffect\(\(\) => {/g, `useEffect(() => {`); // just a placeholder to trigger re-eval if needed
            // need to add currentUserId to dependency arrays of useEffect
            content = content.replace(/(\n[ \t]*}, \[([^\]]*)\]\);)/g, (m, p1, p2) => {
                if(p2.includes('currentUserId')) return m;
                const newDeps = p2.trim() ? p2 + ', currentUserId' : 'currentUserId';
                return m.replace(p2, newDeps);
            });
        } else {
            content = content.replace(/(export default function [a-zA-Z0-9_]+[^{]*{[^a-zA-Z]*)/, `$1${currentUserCode}`);
            content = content.replace(/documentService\.getAllDocuments\('([^']+)'\)/g, `documentService.getAllDocuments('$1', currentUserId)`);
            content = content.replace(/(\n[ \t]*}, \[([^\]]*)\]\);)/g, (m, p1, p2) => {
                if(p2.includes('currentUserId')) return m;
                const newDeps = p2.trim() ? p2 + ', currentUserId' : 'currentUserId';
                return m.replace(p2, newDeps);
            });
        }
        fs.writeFileSync(f, content);
        console.log('Updated ' + f);
    }
});
