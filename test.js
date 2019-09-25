const glob = require("glob")

const paths = glob.sync('../*');
console.log('paths:', paths.length);
