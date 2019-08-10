const bcrypt = require('bcryptjs');

bcrypt
  .hash('adminpassword', 12)
  .then(hash => {
    console.log(hash);
    bcrypt
      .compare('adminpassword', hash)
      .then(matched => {
        console.log(matched);
      })
  })