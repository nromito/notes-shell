import { spawn } from "child_process";
import { pipeline } from "stream";
import { createReadStream, appendFileSync } from "fs";
import commandLineArgs = require("command-line-args");
import commandLineUsage = require("command-line-usage");


const optionList: commandLineArgs.OptionDefinition[] & commandLineUsage.OptionDefinition[] = [
    { name: 'help', alias: 'h', type: Boolean, description: 'prints usage'} as commandLineArgs.OptionDefinition,
    { name: 'file', alias: 'f', type: String, defaultValue: process.env['NOTE'], description: 'the desired notes file'} as commandLineArgs.OptionDefinition,
    { name: 'newDate', alias: 'n', type: String, description: 'appends the specified day to the end of the file (ex. today, tomorrow)' } as commandLineArgs.OptionDefinition,
    { name: 'list', alias: 'l', type: Boolean, description: 'prints the contents of the note' } as commandLineArgs.OptionDefinition,
]

function printUsage() {
    const usageOut = commandLineUsage([
      {
        header: 'Options',
        optionList
      },
    ])
    console.log(usageOut);
}

function addDays(date: Date, days: number) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

function appendNewDate(specifiedDay: string, file: string): void {
    const date = addDays(new Date(), specifiedDay === 'tomorrow' ? 1 : 0);
    const month = date.getUTCMonth() + 1;
    const day = date.getUTCDate();
    const year = date.getUTCFullYear();
    
    appendFileSync(file, `\n# ${month}/${day}/${year}\n\n`);
}

function main(): unknown {
  let options: commandLineArgs.CommandLineOptions;
  try {
      options = commandLineArgs(optionList);
  } catch (e) {
      printUsage();
      return;
  }
  
  if (options.help) {
      printUsage();
      return;
  }
  
  if (options.file == null) {
      console.error('No valid file provided');
      console.error('Please provide $NOTE or -f');
      return;
  }
  
  if (options.list) {
      return new Promise(resolve => {
          pipeline(createReadStream(options.file), process.stdout, () => resolve());
      }).then(() => {process.exit(0)})
  }
  
  if (options.newDate !== undefined) {
      // TODO search for #remind and add those to new date if reminder is for the new date
      appendNewDate(options.newDate || 'tomorrow', options.file);
  }
  
  const editor = process.env.EDITOR || 'vim';
  const child = spawn(editor, ['+', options.file], {
      stdio: 'inherit'
  });
  
  child.on('exit', function (e, code) {
      console.log("finished");
  });
}

main();