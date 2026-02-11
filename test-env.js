require('dotenv').config();
console.log('✅ ENV TEST');
console.log('DB_HOST=' + process.env.DB_HOST);
console.log('DB_NAME=' + process.env.DB_NAME);
console.log('PORT=' + (process.env.PORT || 5000));
