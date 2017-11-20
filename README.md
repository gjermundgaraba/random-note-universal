# RandomNote

The idea behind this app is to surface random notes from your Evernote account whenever you want.

The way the app works is to find a random note within a set of configured stacks and open it in Evernote.

The app requires you to have Evernote installed on the computer and that you are connected to the internet.

The executable uses 2 extra files:
* app_data
    * This is where user data like the auth token is saved (so you don't have to log in every time, only the first time)
* default.json
    * This is the configuration file that the user can change
    * Currently, the only configuration you can change are the stacks to search for random notes.

# Development

## Evernote API key

To develop for this app, you need an Evernote API Key:
http://dev.evernote.com/doc/

Remember to activate your API key for production as this takes some time.
Without production key you can only test on an Evernote sandbox account.

## Prerequisits
* Node and NPM

## Install app dependencies

```
$ npm install
```

## Run the development app

```
$ npm start
```

# Build

To build the app into an executable, take a look at this project:
https://github.com/pmq20/node-compiler

Once you have everything set up to use node-compiler, build using the following command:

```
nodec index.js -o random-note.exe
```
