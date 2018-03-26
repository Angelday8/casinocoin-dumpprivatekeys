/** logic.ts **/
import chalk from 'chalk'
import * as ora from 'ora'
import * as fs  from 'fs';
import * as path from 'path';
import * as cscKeyAPI from 'casinocoin-libjs-keypairs';
import { LokiKey } from './types';
import { CSCCrypto } from './csc-crypto';

const currentDir: string = __dirname;

export const getPrivateKeys = (walletFile: string, walletPassword: string) => {
(async () => {
try {
    console.log(chalk.green('Searching Private Keys in wallet file: ' + walletFile));
    let decryptedKeys: Array<LokiKey> = [];
    
    let remainingText = "";
    // read file contents
    let data = fs.readFileSync(walletFile, 'utf8');
    remainingText += data;
    let index = remainingText.indexOf('\n');
    if(index > -1){
        console.log(chalk.magentaBright('Found Private Keys: '));
    }
    while (index > -1) {
        let line = remainingText.substring(0, index);
        remainingText = remainingText.substring(index + 1);
        let keyObject: LokiKey = JSON.parse(line);
        if(keyObject.encrypted){
            try{
                let decryptedKey = decryptKey(walletPassword, keyObject);
                if(decryptedKey !== undefined){
                    console.log(chalk.yellow('Address: ') + decryptedKey.accountID + chalk.green(' Secret: ') + decryptedKey.secret);
                } else {
                    console.log(chalk.yellow('Address: ') + keyObject.accountID + chalk.red(' Secret: [unknown]'));
                }
            } catch (error){
                console.log(chalk.yellow('Address: ') + keyObject.accountID + chalk.red(" Error Decrypting Key (check wallet password)"));
            }
        } else {
        console.log(chalk.yellow('Address: ') + keyObject.accountID + chalk.green(' Secret: ') + keyObject.secret);
        }
        index = remainingText.indexOf('\n');
    }
} catch (error) {
    console.log(error);
 }
 })()
}

function decryptKey(password: string, keyObject: LokiKey){
    // Create decryption object
    let cscCrypto = new CSCCrypto(password);
    // decrypt key
    let decodedSecret:string = cscCrypto.decrypt(keyObject.secret);
    let decodedKeypair = cscKeyAPI.deriveKeypair(decodedSecret);
    // check if public key is the same
    if(decodedKeypair.publicKey == keyObject.publicKey){
        // save decrypted values onto object
        let decodedKey: LokiKey = {
            accountID: keyObject.accountID,
            publicKey: decodedKeypair.publicKey,
            privateKey: decodedKeypair.privateKey,
            secret: decodedSecret,
            encrypted: false
        }
        return decodedKey;
    } else {
        return undefined;
    }
}