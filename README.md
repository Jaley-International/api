# Setup

The PEC API requires a mysql database to connect to.

Configure dotenv file, example found in `.env.sample`.
```dotenv
PEC_API_MYSQL_URI=mysql://username:password@localhost:3306/pec-api
PEC_API_PORT=3001
PEC_API_SESSION_MAX_IDLE_TIME=1800
PEC_API_MODE=test
```

Run npm to install packages.

`npm install`

Then start the application.

`npm start`
