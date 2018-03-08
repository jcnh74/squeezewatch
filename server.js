'use strict';

const path = require("path");
const DIST_DIR = path.join(__dirname, "build")
const express = require('express');

// Constants
const PORT = 3000;
const HOST = '0.0.0.0';

// App
const app = express();
app.use(express.static(DIST_DIR));

app.get('/', (req, res) => {
    res.sendFile(path.join(DIST_DIR, "index.html"));
});

app.listen(PORT);

console.log(`Running on http://${HOST}:${PORT}`);