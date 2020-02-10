const cli = require('command-line-args')
const usage = require('command-line-usage')
const child_process = require('child_process')
const path = require('path')

const optionList = [
    { name: 'help', alias: 'h', type: Boolean},
    { name: 'file', alias: 'f', type: String, defaultValue: path.join(process.env['HOME'], 'git', 'notes', 'notes.txt')}
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
const editor = process.env.EDITOR || 'vim';

const child = child_process.spawn(editor, ['+', options.file], {
    stdio: 'inherit'
});

child.on('exit', function (e, code) {
    console.log("finished");
});
