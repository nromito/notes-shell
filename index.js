const cli = require('command-line-args')
const usage = require('command-line-usage')
const child_process = require('child_process')
const path = require('path')
const fs = require('fs');
const stream = require('stream');

function appendNewDate(file) {
    const date = new Date();
    const month = date.getUTCMonth() + 1;
    const day = date.getUTCDate();
    const year = date.getUTCFullYear();
    fs.appendFileSync(file, `${month}/${day}/${year}\n\n`);
}

const optionList = [
    { name: 'help', alias: 'h', type: Boolean},
    { name: 'file', alias: 'f', type: String, defaultValue: path.join(process.env['HOME'], 'git', 'notes', 'notes.txt')},
    { name: 'newDate', alias: 'n', type: Boolean },
    { name: 'out', alias: 'o', type: Boolean },
]

const options = cli(optionList);
if (options.help) {
    const usageOut = usage([
      {
        header: 'Options',
        optionList
      },
    ])
    console.log(usageOut)
    return;
}

if (options.out) {
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
