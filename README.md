Description

The purpsoe of the project is to implement a small but scallable web application to manage a health clinic.
The development includes server side and client side.

Project specifications:
Client side:
1. The client side will be build on react+redux framework
2. Will be written in es6
3. Will support webpack
4. MUST support RTL languages (mainly Hebrew)

Server side:
1. The server side will be build on nodejs + expressjs + mySql
2. The database will include the correct tables and indexing to ensure fast response
3. Will support push messages to client using socketjs

The application will include:
1. login screen (username + password)
2. Post login screen according to the user role
3. Available role:
a. System admin: Can see/edit/create all information in the system
b. Clinic Admin: can see/edit/create all information under it's clinic
c. Therapist: Can view information for it's patient
d. Patient: Will not be able to login
4. post login screen will include top navigation:
a. Therapists: Create\edit therpaists
b. Patients: Create\edit patients
c. Treatments: create\edit treatments
d. Settings: blank for now
e. System: Create\edit clinics

The relations in the application:
1. There could be many clinics
2. Each clinic will have many users (Clinic Admin, Therapist, Patient)
3. Each Therapist will have many patients
4. Each patient will have many Therapists
4. Each patient will have many treatment series
5. Each treatment series will have many treatments

#additions

1. Clinic
a. Name - Mandatory, a valid string
b. Address - Mandatory, a valid string
c. Telephone - Not mandatory, a valid phone pattern
d. Fax - Not mandatory, a valid phone pattern
e. Email - Not mandatory, a valid email address

2. Therapist
a. First Name - Mandatory, a valid string
b. Last Name - Mandatory, a valid string
c. Phone - mandatory
d. License Number - mandatory - only numbers
e. Email - mandatory
f. Date Of Birth - mandatory - a nice but not too fancy date picker can be nice but also an option to enter the date manually
g. A list of related patients - Not mandatory when creating, will be editable later. (An option to add\remove therapists)

3. Patient
a. First Name - Mandatory
b. Last Name - Mandatory
c. Phone - Mandatory
d. Date Of Birth - Mandatory
e. Related Person: At least 1
Could be an option between: Father, Mother, Other + description
Will have a phone number and email
Each pateint can have as many related persons
f. Health Maintenance - Clalit, Maccabi, Meuhedet, Leumit, Private
g. File Upload - An option to upload files + file description
h. A list of related Therapists

4. Treatments
Note: Each treatment will be a part of a treatments series. Meaning, when a new patient is added to the system, we can define a new series of treatments and define the number
of treatments in the series. Afterwards we'll fill the series with treatments.
Each treatment will have:

- A patient: Selection between all the patients in the clinic, could be more than 1
- A therapist: Selection between all the therapists in the clinic, could be more than 1
a. Date and time
b. Treatment target - Text field
c. Treatment method - Text field
d. Treatment process - Text field
f. Parents guidance - Text field
g. Next treatment remarks - Text field