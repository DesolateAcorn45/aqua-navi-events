'use strict';
const fs=require('node:fs'),path=require('node:path');
const {validate}=require('./site/feed-validation.js');
try{const file=process.argv[2]||path.join(__dirname,'site/events.json');console.log(JSON.stringify(validate(JSON.parse(fs.readFileSync(file,'utf8'))),null,2));}
catch(e){console.error(e.message);process.exitCode=1;}
