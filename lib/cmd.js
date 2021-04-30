import { exec } from "child_process"

export default function cmd(literals, ...args) {
  const opts = {}

  if (cmd.cwd) {
    opts.cwd = cmd.cwd
  }

  // create it here so that stacktrace is correct
  const savedErr = new Error()

  let str = literals[0]
  try {
    args.forEach((arg, i) => {
      str += `"${arg.replace(/"/g, `\\"`)}"${literals[i + 1]}`
    })
  } catch (e) {
    throw e
  }

  return new Promise((res, reject) => {
    exec(str, opts, (error, stdout, stderr) => {
      if (error) {
        savedErr.message =
          beautify(str) + ": [" + error.code + "] " + stderr.trim()
        reject(savedErr)
      } else {
        res(stdout.trim())
      }
    })
  })
}

function beautify(str) {
  let printstr = str.trim()
  while (printstr.indexOf("  ") !== -1) {
    printstr = printstr.replace(/  /g, " ")
  }
  return printstr
}
