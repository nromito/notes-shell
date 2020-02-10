const cli = require('command-line-args')
const usage = require('command-line-usage')
const child_process = require('child_process')
const path = require('path')
const fs = require('fs');
const stream = require('stream');

const optionList = [
    { name: 'help', alias: 'h', type: Boolean, description: 'prints usage'},
    { name: 'file', alias: 'f', type: String, defaultValue: path.join(process.env['HOME'], 'git', 'notes', 'notes.txt'), description: 'the desired notes file'},
    { name: 'newDate', alias: 'n', type: Boolean, description: 'appends the current date to the end of the file' },
    { name: 'list', alias: 'l', type: Boolean, description: 'prints the contents of the note' },
]

function printUsage() {
    const usageOut = usage([
      {
        header: 'Options',
        optionList
      },
    ])
    console.log(usageOut);
}

function appendNewDate(file) {
    const date = new Date();
    const month = date.getUTCMonth() + 1;
    const day = date.getUTCDate();
    const year = date.getUTCFullYear();
    fs.appendFileSync(file, `${month}/${day}/${year}\n\n`);
}

let options;
try {
    options = cli(optionList);
} catch (e) {
    printUsage();
    return;
}

if (options.help) {
    printUsage();
    return;
}

if (options.list) {
    return new Promise(resolve => {
        stream.pipeline(fs.createReadStream(options.file), process.stdout, () => resolve());
    })
}

if (options.newDate) {
    appendNewDate(options.file);
}

const editor = process.env.EDITOR || 'vim';
const child = child_process.spawn(editor, ['+', options.file], {
    stdio: 'inherit'
});

child.on('exit', function (e, code) {
    console.log("finished");
});
