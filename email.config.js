export default {
	service: 'Mail.ru',
	auth: {
		user: 'clinic.test@mail.ru',
		pass: '123___123',
	},
	template: ({ old_date, old_time, new_date, new_time, relative_name, patient_name, therapist_name }) => `
<!doctype html>
<html>
  <head>
    <meta name="viewport" content="width=device-width" />
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <style>
      body { direction: rtl; }
    </style>
    </head>
    <body>
		    שלום ${relative_name}, <br>
		
		 המפגש המתוכנן עבור ${patient_name} עודכן 
		 מתאריך <br>  ${old_date} בשעה ${old_time} <br>
		 לתאריך  ${new_date} בשעה ${new_time} <br>
		 <br> <br>
		בברכה,
		${therapist_name}
    </body>
</html>
`,
};
