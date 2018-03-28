const { compile } = require('nexe')

compile({
  input: './dist/index.js',
  build: false,
  output: './release/dump-private-keys-win-ia32',
  ico: './favicon.ico',
  target: 'win32-ia32-8.9.3'
}).then(() => {
  console.log('Build for Windows ia32 Successful.');
  return compile({
    input: './dist/index.js',
    build: false,
    output: './release/dump-private-keys-win-x64',
    ico: './favicon.ico',
    target: 'win32-x64-8.9.3'
  });
}).then(() => {
  console.log('Build for Windows x64 Successful.');
  return compile({
    input: './dist/index.js',
    build: false,
    output: './release/dump-private-keys-linux-x64',
    ico: './favicon.ico',
    target: 'linux-x86-8.9.3'
  });
}).then(() => {
  console.log('Build for Linux x64 Successful.');
  return compile({
    input: './dist/index.js',
    build: false,
    output: './release/dump-private-keys-osx-x64',
    ico: './favicon.ico',
    target: 'darwin-x64-8.9.3'
  });
}).then(() => {
  console.log('Build for OSX x64 Successful.');
});