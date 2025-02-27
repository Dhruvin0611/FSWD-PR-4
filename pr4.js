const fs = require('fs');
const path = require('path');

const categories = {
    Images: ['.jpg', '.jpeg', '.png', '.gif', '.bmp'],
    Documents: ['.pdf', '.doc', '.docx', '.txt', '.xls', '.xlsx'],
    Videos: ['.mp4', '.mkv', '.avi', '.mov'],
    Others: [] // Default category
};

function getCategory(extension) {
    for (let category in categories) {
        if (categories[category].includes(extension)) {
            return category;
        }
    }
    return 'Others';
}

function organizeFiles(directory) {
    if (!fs.existsSync(directory)) {
        console.log('Directory does not exist.');
        return;
    }

    fs.readdir(directory, (err, files) => {
        if (err) {
            console.error('Error reading directory:', err);
            return;
        }

        let logData = '';

        files.forEach(file => {
            const filePath = path.join(directory, file);
            fs.stat(filePath, (err, stats) => {
                if (err || !stats.isFile()) return;

                const extension = path.extname(file).toLowerCase();
                const category = getCategory(extension);
                const categoryPath = path.join(directory, category);

                if (!fs.existsSync(categoryPath)) {
                    fs.mkdirSync(categoryPath);
                }

                const newFilePath = path.join(categoryPath, file);
                fs.rename(filePath, newFilePath, err => {
                    if (err) {
                        console.error(`Failed to move ${file}:`, err);
                    } else {
                        const logEntry = `Moved: ${file} -> ${category}/\n`;
                        logData += logEntry;
                        console.log(logEntry.trim());
                        fs.appendFileSync(path.join(directory, 'summary.txt'), logEntry);
                    }
                });
            });
        });
    });
}

// Accept directory path from CLI
const dirPath = process.argv[2];
if (dirPath) {
    organizeFiles(dirPath);
} else {
    console.log('Usage: node file-organizer.js <directory_path>');
}
