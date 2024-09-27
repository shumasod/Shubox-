// app.js
const fs = require('fs');
const csv = require('csv-parser');

fs.createReadStream('account_list.csv')
  .pipe(csv())
  .on('data', (row) => {
    console.log(row); // 各行のデータを表示
  })
  .on('end', () => {
    console.log('CSV file successfully processed');
  })
  .on('error', (error) => {
    console.error('An error occurred:', error.message);
  });
