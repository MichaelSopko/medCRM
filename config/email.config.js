const direction = __DEV__ ? 'ltr' : 'rtl';

export default {
  service: 'Mail.ru',
  auth: {
    user: 'clinic.test@mail.ru',
    pass: '123___123',
  },
  template: ({ start_date, end_date }) => `
<!doctype html>
<html>
  <head>
    <meta name="viewport" content="width=device-width" />
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <style>
      body { direction: ${direction}; }
    </style>
    </head>
    <body>
    <p>
      Treatment has been updated
    </p>
    <p> Start date: ${start_date} </p>
    <p> End date: ${end_date} </p>
    </body>
</html>
`,
  registerUserTemplate: ({ first_name, last_name }) => `
<!doctype html>
<html>
  <head>
    <meta name="viewport" content="width=device-width" />
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <style>
      body { direction: ${direction}; }
    </style>
    </head>
    <body>
    <p>
      Hello ${ first_name } ${ last_name }!
    </p>
    </body>
</html>
`,
};
