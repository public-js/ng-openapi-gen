const fs = require('fs');
const path = require('path');

const expandPath = (dirPath) => {
    let dirContents = [];
    if (!fs.existsSync(dirPath)) {
        return dirContents;
    }
    try {
        dirContents = fs.readdirSync(dirPath, { withFileTypes: true });
    } catch (e) {
        return dirContents;
    }
    return dirContents
        .filter((entry) => entry.isDirectory())
        .map((entry) => path.join(dirPath, entry.name, 'package.json'))
        .filter((pjPath) => fs.existsSync(pjPath))
        .map((pjPath) => pjPath.replace(__dirname, '.'));
};

const [packagesPath] = [path.join(__dirname, 'packages')];
const [packages] = [expandPath(packagesPath)];

module.exports = {
    packageFiles: ['./package.json'],
    bumpFiles: ['./package.json', './package-lock.json', ...packages],
    tagPrefix: '',
    skip: { commit: true, tag: true },
};
