// app.js

const fs = require('fs');
const csv = require('csv-parser');

fs.createReadStream('account_list.csv')
  .pipe(csv())
  .on('data', (row) => {
    // ここで各行のデータを表示する処理を実装
  })
  .on('end', () => {
    console.log('CSV file successfully processed');
  });
