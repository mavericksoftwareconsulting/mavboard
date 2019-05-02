# mavboard

## Installation

1. Clone project from GitHub 

Note: if installing on a RaspberryPi or other debian based OS, will need to run with `sudo` command, if not acting as the root user.

```sh
$ git clone git@github.com:mavericksoftwareconsulting/mavboard.git
```

2. Enter the new mavboard directory

```sh
$ cd mavboard/
```

3. Install all dependencies

```sh
$ npm install
```


## Running mavboard

```sh
$ npm start
```

Mavboard will run on http://localhost:3000

## Developing code

This is a student based project at Maverick Software Consulting to display and control office music and office information at a central hub.  All additional developments and forks should be in the spirit of this, and focus on extending the Mavboard as a learning and teaching project for dynamic web design.

### View Engine

*PUG -> HBS*

The Mavboard transitioned from a pug to an hbs view engine, and all views added to the client should be written in hbs.

### Compiling

Core Javascript logic lives in the `src/` directory, and this is where you should write all Javascript. However, to actually run the code, you need to compile it using [Babel](https://babeljs.io). The easiest way to do this is with the built-in script:

```sh
npm run compile
```

### Using Flow

Mavboard code is capable of running [Flow](https://flow.org), a static type-checker which makes Javascript strongly-typed. Flow will only run on pages which begin with the opt-in comment:

```js
// @flow
```

Once it's enabled, use the built-in script to check all Flow-enabled code:

```sh
npm run flow
```

This script will report any type errors and warnings for you to fix. 

*_remember to compile with `npm run compile` in order to see your changes when mavboard is running_*
