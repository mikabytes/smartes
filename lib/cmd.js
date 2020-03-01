import {exec} from 'child_process'

export default function cmd(str) {
  const opts = {}

  if (cmd.cwd) {
    opts.cwd = cmd.cwd
  }

  return new Promise((res, reject) => {
    exec(str, opts, (error, stdout, stderr) => {
      if (error) {
        reject(beautify(str) + ': [' + error.code + '] ' + stderr.trim())
      } else {
        res(stdout.trim())
      }
    })
  })
}

function beautify(str) {
  let printstr = str.trim()
  while (printstr.indexOf('  ') !== -1) {
    printstr = printstr.replace(/  /g, ' ')
  }
  return printstr
}
