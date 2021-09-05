# User-Management-AngularJS
  User Management System, as described above, can lead to error free, secure, reliable, and fast management system. It can assist the user to concentrate on their other activities rather than record keeping. Thus, it will help organizations in better utilization of resources. The organization can maintain computerized records without redundant entries. That means one need not be distracted by information that is not relevant, while being able to reach the information.
  
## Project Objective
  The main objective of this project is to manage the details of Users, Admins, Moderators, Register new users, view their User Profile, Update and Delete the details. The project is completely focused on the administrative end. Thus only the administrator is guaranteed the access. The purpose of building this application is to reduce the manual work for managing the User, Admin, Login and registering.
  
## Functionalities of the Application
•	Provide a sophisticated way for users to register and login into our system. 
•	Create robust mechanisms to store and retrieve data from the backend and display them in a seamless and secure manner. 
•	Provide 2-factor authentication while registering and easy method for login via social media. 
•	Create roles for users, Assign Specific roles to users for a particular project
•	Allow Admins to delete and edit all user data and to upgrade any user. 
•	Allow moderators to only edit data and upgrade user roles to “moderator”.
•	Act as a platform for companies to further build their own products on top of this while using our authentication and user roles. 

## Software Technologies Used
  ‘User Management System’ has been created using **HTML** for the structure of the web pages, **CSS** for the presentation of the webpages, **JavaScript** to handle events and other functionalities, **jQuery** for smooth animation effects, **NodeJS** for connecting with the database and as a backend API to route, retrieve and fetch pages, and **AngularJS** to create a minimalist and professional UI for the client-side display of the web application. 
	The project also uses **MongoDB** as the database to store all the details of the users. Additionally, we also use the **Mongoose** library of NodeJS to connect with the database. We have also used **PassportJS** library of NodeJS to create a seamless login experience for the user using social media like Facebook, Twitter and. Google. 
  
![image](https://user-images.githubusercontent.com/61402801/132120219-69e7b444-c597-4315-adc9-cc6857802209.png)

## Requirements

This application requires installation of NodeJS and MongoDB prior to running.

## Description

This application was created to highlight common methods used in MEAN Stack. It is meant for beginners or those interested in learning about the MEAN Stack infrastructure. MEAN Stack App is based on a RESTful API and MVC. 

## Installation

- Install all dependencies in package.json file. This can be done by navigating to the root directory in the command prompt/terminal/console (I will refer to it as command prompt) and running the following command:

```
$ npm install
```

- You must enter your own MongoDB configuration settings in the server.js file:

```
mongoose.connect('mongodb://gugui3z24:password@ds055594.mlab.com:55594/diselfuel29', function(err) {
    if (err) {
        console.log('Not connected to the database: ' + err);
    } else {
        console.log('Successfully connected to MongoDB');
    }
});
```
- You must enter your own Facebook, Twitter, and Google passport.js configuration settings in /app/passport/passport.js:

``` 
passport.use(new FacebookStrategy({
        clientID: '', // Replace with your Facebook Developer App client ID
        clientSecret: '', // Replace with your Facebook Developer client secret
        callbackURL: "", // Replace with your Facebook Developer App callback URL
        profileFields: ['id', 'displayName', 'photos', 'email']
    }
```

```
passport.use(new TwitterStrategy({
        consumerKey: '', // Replace with your Twitter Developer App consumer key
        consumerSecret: '', // Replace with your Twitter Developer App consumer secret
        callbackURL: "", // Replace with your Twitter Developer App callback URL
        userProfileURL: "https://api.twitter.com/1.1/account/verify_credentials.json?include_email=true"
    }
```

```
passport.use(new GoogleStrategy({
        clientID: '', // Replace with your Google Developer App client ID
        clientSecret: '', // Replace with your Google Developer App client ID
        callbackURL: "" // Replace with your Google Developer App callback URL
    }
```

- Installation is complete. Navigate to folder where server.js file is located and enter the following into command prompt:

```
$ npm start server.js
```

## Code Snippet showing connection with the Database

```js
  var mongoose = require('mongoose');
  var express = require('express');
  var app = express();

  mongoose.connect('mongodb://localhost:27017/users', function(err){
    if(err){
        console.log('Not connected  to the database' + err);
    } else {
        console.log('Successfully connected to MongoDB');
    }
  });

  app.listen(port, function(){
    console.log("Running the server on port "+port);
  });
```
 
## Schema for the Users Collection in the Database

```js
  var UserSchema = new Schema({
    name: { type: String, required: true, validate: nameValidator},
    username: { type: String, lowercase: true, required: true, unique: true, validate: usernameValidator}, 
    password: { type: String, required:true, unique: true, validate: passwordValidator, select: false }, 
    email: { type: String, lowercase: true, required: true, validate: emailValidator },
    active: { type: Boolean, required: true, default: false},
    temporarytoken: {type: String, required: true},
    resettoken: { type: String, required: false },
    permission: { type: String, required: true, default: 'user' }
  });
``` 


## Home Page View

![image](https://user-images.githubusercontent.com/61402801/132120169-86432500-35cb-489d-b09f-3aae259ba5f4.png)

## User Login View

![image](https://user-images.githubusercontent.com/61402801/132120195-0a4d6d8b-ff31-4b71-b3a1-b111d36605b4.png)

## User Registeration View

![image](https://user-images.githubusercontent.com/61402801/132120206-dd3d4ed1-e1c9-485d-b8fe-67b6f1d06871.png)

## Admin View

![image](https://user-images.githubusercontent.com/61402801/132120179-5fe83ae8-372b-47e3-8f27-76d2dc39c28e.png)







