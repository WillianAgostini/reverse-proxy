const path = require('path');
const fs = require('fs');
const dirName = path.join(__dirname, '..', 'requests');
const xmlFormat = require('xml-formatter');

const createDirIfNotExists = () => {
    if (!fs.existsSync(dirName)) fs.mkdirSync(dirName);
}

const generateFilePath = (url, isError) => {
    const textError = isError ? "_error" : "";
    const endpoint = url.replace(/\//g, "_");
    let fileName = `${textError}${endpoint}.txt`;
    const fileExists = fs.existsSync(path.join(dirName, fileName));
    if (fileExists) {
        const random = Math.floor(Math.random() * 100);
        fileName = `${textError}${url.replace(/\//g, "_")}.txt_${random}`;
    }
    return path.join(dirName, fileName);
}

const saveInFile = (req, res) => {
    if (req.method !== 'POST') return;
    const filePath = generateFilePath(req.url, res.statusCode !== 200);
    const endpoint = `Endpoint: ${req.url}`;
    const request = `Request:\n${xmlFormat(req.body)}`;
    const response = `Response:\n${xmlFormat(res.body)}`;

    const text = `${endpoint}\n\n${request}\n\n=============================================================\n\n${response}`;
    fs.writeFileSync(filePath, text);
}

const removeOldFiles = () => {
    const files = fs.readdirSync(dirName).sort(function (a, b) {
        return fs.statSync(`${dirName}/${a}`).mtime.getTime() - fs.statSync(`${dirName}/${b}`).mtime.getTime();
    });
    const limitFiles = 15;
    if (files.length > limitFiles) {
        const file = files[0];
        fs.unlinkSync(`${dirName}/${file}`);
    }
}

exports.process = (req, res) => {
    createDirIfNotExists();
    saveInFile(req, res);
    removeOldFiles();
}

exports.listFiles = () => {
    createDirIfNotExists();
    const files = fs.readdirSync(dirName);
    return files.map(file => {
        const index = file.indexOf(".txt");
        const fileName = file.substring(0, index).replace(/_/g, "/");
        return {
            fullPath: path.join(dirName, file),
            fileName: fileName,
            time: fs.statSync(`${dirName}/${file}`).mtime.getTime()
        }
    }).sort((a, b) => b.time - a.time);
}

exports.clearFiles = () => {
    createDirIfNotExists();
    const files = fs.readdirSync(dirName);
    files.forEach(file => {
        fs.unlinkSync(`${dirName}/${file}`);
    });
}
