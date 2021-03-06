'use strict'

var chalk       = require('chalk');
var clear       = require('clear');
var CLI         = require('clui');
var figlet      = require('figlet');
var inquirer    = require('inquirer');
var Preferences = require('preferences');
var Spinner     = CLI.Spinner;
var GitHubApi   = require('github');
var _           = require('lodash');
var git         = require('simple-git')();
var touch       = require('touch');
var fs          = require('fs');


var files = require('./lib/files');




clear();
console.log(
  chalk.yellow(
    figlet.textSync('Zadu-Cli', { horizontalLayout: 'full' })
  )
);


if (files.directoryExists('.git')) {
  console.log(chalk.red('Already a git repository!'));
  process.exit();
}


function getGithubCredentials(callback) {
  var questions = [
    {
      name: 'username',
      type: 'input',
      message: 'Enter your Github username or e-mail address:',
      validate: function( value ) {
        if (value.length) {
          return true;
        } else {
          return 'Please enter your username or e-mail address';
        }
      }
    },
    {
      name: 'password',
      type: 'password',
      message: 'Enter your password:',
      validate: function(value) {
        if (value.length) {
          return true;
        } else {
          return 'Please enter your password';
        }
      }
    }
  ];

  inquirer.prompt(questions).then(callback);
}

// getGithubCredentials(function(){
//   console.log(arguments);
// });


var github = new GitHubApi({
  version: '3.0.0'
});



function getGithubToken(callback) {
  var prefs = new Preferences('zadu');

  if (prefs.github && prefs.github.token) {
    return callback(null, prefs.github.token);
  }

  // Fetch token
  getGithubCredentials(function(credentials) {
    
  });
}

getGithubCredentials(function(credentials) {
  var status = new Spinner('Authenticating you, please wait...');
  status.start();

  github.authenticate(
    _.extend(
      {
        type: 'basic',
      },
      credentials
    )
  );

  github.authorization.create({
    scopes: ['user', 'public_repo', 'repo', 'repo:status'],
    note: 'ginit, the command-line tool for initalizing Git repos'
  }, function(err, res) {
    status.stop();
    if ( err ) {
      return callback( err );
    }
    if (res.token) {
      prefs.github = {
        token : res.token
      };
      return callback(null, res.token);
    }
    return callback();
  });
});

