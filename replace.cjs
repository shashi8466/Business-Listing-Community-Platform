const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
    const ext = path.extname(filePath);
    if (!['.ts', '.tsx', '.json', '.md', '.html', '.css'].includes(ext)) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    let newContent = content.replace(/d4desi/g, 'BusinessHub');
    newContent = newContent.replace(/d4 desi/gi, 'BusinessHub');
    newContent = newContent.replace(/D4-DESI/g, 'BusinessHub');
    
    if (content !== newContent) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log('Updated: ' + filePath);
    }
}

function traverseDir(dir) {
    fs.readdirSync(dir).forEach(file => {
        let fullPath = path.join(dir, file);
        if (fs.lstatSync(fullPath).isDirectory()) {
            if (!['node_modules', 'dist', '.git', '.firebase'].includes(file)) {
                traverseDir(fullPath);
            }
        } else {
            replaceInFile(fullPath);
        }
    });
}

traverseDir('./src');
replaceInFile('./package.json');
