import * as crypto  from 'crypto';

export class CSCCrypto {

  private static PASSPHRASE_WORD_COUNT = 8;
  private IV_LENGTH = 16; // For AES, this is always 16
  private SALT_LENGTH = 64;

  private algorithm = "aes-256-gcm";
  private pbkdf2KeyLength = 32;
  private pbkdf2Digest = "sha512";
  private pbkdf2Rounds = 10000;
  private passwordKey:string = "";

  // accept a password or mnemonic array as input
  constructor(password: string);
  constructor(password: Array<string>);
  constructor(password?: string | Array<string>) {
    if(Array.isArray(password)){
      // use mnemonic array
      let mnemonicString = password.join();
      let mnemonicHash = crypto.createHash("sha512");
      mnemonicHash.update(mnemonicString);
      this.passwordKey = mnemonicHash.digest("base64");
    } else if(password !== undefined) {
      this.passwordKey = crypto.createHash('sha256').update(password).digest('hex');
    }
    
  }

  encrypt(inputValue:string) {
    // Generates cryptographically strong pseudo-random data. The size argument is a number indicating the number of bytes to generate.
    let iv:Buffer = new Buffer(crypto.randomBytes(this.IV_LENGTH));
    let salt:Buffer = new Buffer(crypto.randomBytes(this.SALT_LENGTH));
    // encrypt password
    let key:Buffer = new Buffer(crypto.pbkdf2Sync(this.passwordKey, salt, this.pbkdf2Rounds, this.pbkdf2KeyLength, this.pbkdf2Digest));
    let cipher = crypto.createCipheriv(this.algorithm, key, iv);
    let encryptedData = Buffer.concat([new Buffer(cipher.update(inputValue, 'utf8')), new Buffer(cipher.final('utf8'))]);
    let authTag:Buffer = new Buffer(cipher.getAuthTag());
    return this.urlsafe_escape(Buffer.concat([salt, iv, authTag, encryptedData]).toString('base64'));
   }
   
  decrypt(encryptedInput:string) {
    var rawData = new Buffer(this.urlsafe_unescape(encryptedInput), 'base64');
    if (rawData.length < 92) {
        return "";
    }

    // convert data to buffers
    let salt = rawData.slice(0, this.SALT_LENGTH);
    let iv = rawData.slice(this.SALT_LENGTH, this.SALT_LENGTH + this.IV_LENGTH);
    let authTag = rawData.slice(this.SALT_LENGTH + this.IV_LENGTH, this.SALT_LENGTH + this.IV_LENGTH + 16);
    let data = rawData.slice(this.SALT_LENGTH + this.IV_LENGTH + 16);

    // decrypt password
    let key = crypto.pbkdf2Sync(this.passwordKey, salt, this.pbkdf2Rounds, this.pbkdf2KeyLength, this.pbkdf2Digest);
    let decipher = crypto.createDecipheriv(this.algorithm, key, iv);
    decipher.setAuthTag(authTag);

    var plainText = decipher.update(data, 'binary', 'utf8');
    plainText += decipher.final('utf8');

    return plainText;
  }

  static randomIntFromInterval(min: number, max: number) {
    return Math.floor(Math.random()*(max-min+1)+min);
  }

  urlsafe_escape(data: string) {
    // / => _
    // + -> .
    // = => -
      return data.replace(/\//g, '_').replace(/\+/g, '.').replace(/=/g, '-');
  }

  urlsafe_unescape(data: string) {
      return data.replace(/_/g, '/').replace(/\./g, '+').replace(/-/g, '=');
  }

}
