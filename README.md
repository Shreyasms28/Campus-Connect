
# CampusConnect Events

This project is a full-stack web application designed for a college campus. It allows administrators to create and manage campus events and provides a student portal for event registration.

The application is built aiming a RESTful API and a front-end client, showcasing a complete full-stack solution with user authentication and event management features


## Acknowledgements

I would like to extend my sincere gratitude to Webknot Technologies Pvt Ltd for providing this opportunity and the invaluable learning experience. This assignment has not only sharpened my technical skills but also provided a deeper understanding of full-stack development. I am grateful for the chance to showcase my abilities and contribute to a real-world project.


## Dependencies/ Pre-requisites

"ejs"
"express"
"method-override":
"mysql2": 

```
npm i express
   
npm i ejs

npm i method-override

npm i mysql2

npm i -g nodemon
```
It is run on Node.js server or Nodemon server (Mainly used because there is no restarting issues)

```
nodemon app.js
```

## Tech Stack
Backend
Node.js: The JavaScript runtime environment.

Express.js: A minimal and flexible Node.js web application framework to build the REST API.

MySQL: A relational database used for storing all application data, including users, events, and registrations.

mysql2: A powerful and efficient MySQL client for Node.js.

Frontend
HTML, CSS, JavaScript: The core languages for building the user interface.

EJS: A simple templating language to embed JavaScript into HTML and render dynamic pages.

Tailwind CSS: A utility-first CSS framework used for rapid and responsive UI development.

## API Reference

Front-end Routes redenring different pages for different users

```http
  GET /
```
```http
  GET /login
```

```http
  GET /admin
```

```http
  GET /student
```

#### Authentication API Route

```http
  POST /api/login
```

#### Get all events

```http
  GET /api/events
```

#### Create new events

```http
  POST /api/events 
```

#### Generates a report on the popularity of events based on registrations

```http
  GET /api/admin/reports/popularity
```
#### Generates a report on student participation in events.

```http
  GET /api/admin/reports/participation
```

#### Generates a report on the average feedback score per event.

```http
  GET /api/admin/reports/feedback
```

####  Retrieves a list of all events for the student portal.

```http
  GET /api/student/events
```
####  Registers a student for a specific event.

```http
  GET /api/student/register
```

####   Records student attendance for an event.

```http
  POST /api/student/attendance
```
####   Records student feedback for an event.

```http
  POST /api/student/feedback
```
















## Appendix

REST API Routes like CRUD opertions is yet to be implemented 
It is just some core functionalities only.



## Usage

#### Login as Admin:

 ```
 URL: http://localhost:8080
 Username: admin@webknot.com
 Password: password@123
 ```
#### Login as Student: 

```
URL: http://localhost:8080
Username: john.doe@email.com
Password: student123
```



## Features

### Admin Portal

User Authentication: Secure login for administrators.

Event Management: Create events.

Reporting: View reports on event popularity, student participation, and feedback.

### Student Portal

User Authentication: Secure login for students.

Event Browsing: View a list of all available events.

Event Registration: Register for events, record attendance, and submit feedback.

