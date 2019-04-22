// Helper to find the current path of the project and not the calling file
const path = require('path');

module.exports = path.dirname(process.mainModule.filename)