const path = require('path');

module.exports = {
    entry: './tsc/Template/game.js',
    output: {
    path: path.resolve(__dirname, 'dist'),
        filename: 'game.js',
    },
};