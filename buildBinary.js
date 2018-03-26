const { compile } = require('nexe')

compile({
  input: './dist/index.js',
  build: true,
  output: './release/DumpPrivateKeys',
  ico: './favicon.ico'
}).then(() => {
  console.log('success')
})