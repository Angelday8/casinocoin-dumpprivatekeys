import './polyfills';
import * as commander from 'commander';
import * as os from 'os';
import * as fs  from 'fs';
import * as path from 'path';
import * as inquirer from 'inquirer'
import { PathPrompt } from 'inquirer-path';
import chalk from 'chalk'
import * as actions from './logic';

inquirer.registerPrompt('path', PathPrompt);

console.log(chalk.yellow('=========*** Private Key Dump ***=========='));
let defaultWalletLocation: string = os.homedir();
defaultWalletLocation = path.join(defaultWalletLocation, '.casinocoin');
let walletPassword: string = "";
console.log('Default Wallet Location: ' + defaultWalletLocation);

const locationQuestions = [{
  type: 'path',
  name: 'walletPath',
  message: 'Enter the wallet location',
  default: defaultWalletLocation,
  cwd: defaultWalletLocation
}];

const questions = [
    {
      type : 'input',
      name : 'firstname',
      message : 'Enter firstname ...'
    },
    {
      type : 'input',
      name : 'lastname',
      message : 'Enter lastname ...'
    }
];

inquirer.prompt(locationQuestions).then((result) => {
  console.log('Location Result: ' + JSON.stringify(result));
  // loop over all files and get the .db.5 files which contain the private keys
  let dirresult:any = result;
  var files = fs.readdirSync(dirresult['walletPath']);
  var walletFiles: Array<string> = [];
  for(var i=0; i < files.length; i++){
    let filename = path.join(dirresult['walletPath'], files[i]);
    let stat = fs.lstatSync(filename);
    if (!stat.isDirectory() && filename.indexOf('.db.5') >= 0) {
        let walletName = files[i].substr(0, files[i].indexOf('.db.5'));
        walletFiles.push(walletName);
        console.log('-- found wallet: ' + chalk.yellow(walletName));
    }
  }
  if(walletFiles.length > 0){
    inquirer.prompt([
      {
        type: 'list',
        name: 'wallet',
        message: 'Select wallet file',
        choices: walletFiles
      }
    ])
    .then(answer => {
      let choosenWallet:any = answer;
      console.log("Choosen Wallet: " + choosenWallet.wallet);
      inquirer.prompt([
        {
          type: 'password',
          name: 'pass',
          message: 'Enter Wallet Password'
        }
      ])
      .then(password => {
        let walletPassword:any = password;
        let walletFile = path.join(dirresult['walletPath'], choosenWallet.wallet + ".db.5");
        actions.getPrivateKeys(walletFile, walletPassword.pass);
      });
    });
  } else {
    console.log(chalk.red('No wallet files found that contain Private Keys'));
  }
});

// actions.getPrivateKeys(defaultWalletLocation, walletPassword);