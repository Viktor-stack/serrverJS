const dotenv = require("dotenv");
const path = require("path");

const root = path.join.bind(this, __dirname);

dotenv.config({ path: root(".env") });

module.exports = {
    DESTINATION: 'uploads',
    HOSTNAME: 'http://176.107.176.126/',
    PORT: '80'
};
