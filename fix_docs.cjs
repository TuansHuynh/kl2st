const fs = require('fs');
const path = require('path');
const files = [
    'Zip.tsx', 'Word.tsx', 'PDF.tsx', 'Note.tsx', 
    'Media.tsx', 'Excel.tsx', 'Different.tsx'
].map(f => path.join('src/pages/Main/Document', f));
files.push('src/layouts/Header.tsx');

files.forEach(f => {
    let content = fs.readFileSync(f, 'utf8');
    
    // Remove the rogue currentUserId prefixing \n    }, []);
    content = content.replace(/currentUserId(\n[ \t]*}, \[\]\);)/g, '$1');
    
    // We specifically want the useEffect that calls documentService.getAllDocuments to have [currentUserId]
    // Let's just find the useEffect block and replace its dependency array if it's empty.
    content = content.replace(/(useEffect\(\(\) => {[\s\S]*?fetch(?:Words|PDFs|Notes|Medias|Zips|Excels|Differents|Documents|Data)[\s\S]*?}, )\[\](\);)/, '$1[currentUserId]$2');
    
    // Make sure the useMemo for currentUserId has []
    content = content.replace(/(const currentUserId = useMemo\(\(\) => {[\s\S]*?return '';\n[ \t]*}, )\[currentUserId\](\);)/, '$1[]$2');

    fs.writeFileSync(f, content);
    console.log('Fixed ' + f);
});
