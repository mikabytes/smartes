import App from './lib/App.js'

let config

try {
  config = import(process.cwd() + '/smartes.js')
} catch (e) {
  console.error('Could not load "smartes.js" file')
  process.exit(1)
}

App(config)
