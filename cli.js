#!/usr/bin/env node
const path = require("path");

require("./index.js");

require(path.resolve(process.cwd(), process.argv[2]));
