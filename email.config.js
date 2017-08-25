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
      body, div { direction: rtl; text-align:right, float:right, align:right }
    </style>
    </head>
    <body>
		<div>    
			<div>שלום ${relative_name},</div><br>
			<div>המפגש המתוכנן עבור ${patient_name} עודכן </div><br>
			<div>מתאריך   ${old_date} בשעה ${old_time} </div>
			<div>לתאריך  ${new_date} בשעה ${new_time} </div><br>
		 </div>
		בברכה,<br>
		${therapist_name}
    </body>
</html>
`,
};
