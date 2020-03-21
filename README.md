# SmartES

_Ingenious server for native ES projects_

**Nowhere near a beta.**

Traditional way of deploying JS websites (apps/pwa/spa) typically bundles all files together into a single JS file. This is inefficient as everything has to be downloaded again, even if only a single line of code was changed. It slows down the website and incurrs unnecessary data costs.

The SmartES approach is vastly different. Each file is versioned and servered independently. Each versioned file is immutable. This means caching optimizations can be done to eliminate fetching a file more than once.

SmartES uses Git directly to track file history, and also have support for hosting many tracking points of Git in parallel.

## Key points

- Built for production, but is encouraged to be used as a dev-server as well (use branch HEAD)
- Committed files have a 1 year client-side hard cache. Each deployed file is immutable and safe to cache forever.
- Use regex to determine what branches should be deployed
- Uncommited changes, unstaged or staged, are given an etag

## Word of advice

**Using SmartES, make sure no one ever force-pushes to Git**

Because the versions of dependencies are calculated based on the Git history, if the history were to change that could result in inconsistent states.

## Install

```
npm install -g smartes
```

## Example usage

Create a configuration file `smartes.js` in the base directory of your Git repository (can be bare), then run the command: `smartes`

### Serve everything (including git hashes, tags, branches)

```javascript
export default {
  entry: './index.js',
  branches: [/.*/],
  port: 3000,
}

// The file ./index.js will be available at http://localhost:3000/[tag/hash/branch]/index.js
```

### Change base folder

```javascript
export default {
  entry: './index.js',
  base: './src',
  port: 3000,
  branches: [/.*/],
}

// The file ./src/index.js will be available at http://localhost:3000/[tag/hash/branch]/index.js
```

### Serve the master branch, with start.js as entry point

```javascript
export default {
  entry: './start.js',
  base: './',
  port: 3000,
  branches: [/master/],
}

// http://localhost:3000/master/start.js
```

### Serve any branch starting with the word "release"

```javascript
export default {
  entry: './start.js',
  port: 3000,
  branches: [/release.*/],
}

// http://localhost:3000/releaseInitial/start.js
// http://localhost:3000/release20200202/start.js
// etc.
```

## Extracting file location information

SmartES provides an endpoint "smartes.js" which provides a manifest. This can be especially useful if you have some external projects that need to import a subpart of the JS application.

```
curl http://localhost:3000/someBranch/smartes.js
```

```
{
  "entry": "./index.js",
  "files": {
    "./index.js": {
      "version": 1,
      "githash": "8cc6a",
      "dependencies": {
        "./pages/redux-saga/effects.js": 1
      },
      "url": "./index-1.js"
    }
  }
```

## Working locally

If HEAD is specified as branch, then SmartES turns off all caching headers. This is only meant to be used for developing locally, and only works if the repository is not bare.

```
curl http://localhost:3000/:/index.js
# fetches index.js from foo branch
```

Also, detection of unstaged and staged changes is enabled. Such files will be served directly from the hard-drive as-is.

## Importing assets and having an index file as entry

If SmartES seens the phrase `smartes(...)` _anywhere_ in a file, it will replace the `...` string with the appropriate file location _everywhere_. This enables the use of assets, and also to have an HTML file as entry point:

```html
<!DOCTYPE html>
<!-- smartes(./index.js) -->
<script src="./index.js"></script>
```

Let's say the version of index.js is `9`, then SmartES will rewrite this file as:

```html
<!DOCTYPE html>
<!-- smartes(./index-9.js) -->
<script src="./index-9.js"></script>
```

## Roadmap

Planned upcoming features are:

- Enable HTTP/2 support with excellent PUSH support.
