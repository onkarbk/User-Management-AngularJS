var User = require('../models/user');
var jwt = require('jsonwebtoken');
var secret = 'nitte';
var nodemailer = require('nodemailer');
// var sgTransport = require('nodemailer-sendgrid-transport');

module.exports = function(router) {



    //     var options = {
    //     auth: {
    //         api_user: 'onkarbharatesh@gmail.com',
    //         api_key: '58#XoOK05googonku1234'
    //     }
    // }

    //     var client = nodemailer.createTransport(sgTransport(options));

    // Nodemailer options (use with g-mail or SMTP)
    var client = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'onkarbharatesh@gmail.com', // Your email address
            pass: 'onku1234' // Your password
        },
        tls: { rejectUnauthorized: false }
    });


    // User Registration Route
        router.post('/users', function(req,res){
            var user = new User();
            user.username = req.body.username;
            user.password = req.body.password;
            user.email = req.body.email;
            user.name = req.body.name;
            user.temporarytoken = jwt.sign( { username: user.username, email: user.email }, secret, {expiresIn: '24h'});
            if(req.body.username == null || req.body.username == '' || req.body.password == null || req.body.password == '' || req.body.email == null || req.body.email == '' || req.body.name == null || req.body.name == ''){
                res.json({ success: false, message: 'Ensure Username, Email and Password are provided.'});
        
            } else {
                user.save(function(err){
                    if(err){
                        if(err.errors !== null) {
                            if(err.errors.name){
                                res.json({ success: false, message: err.errors.name.message});
                            } else if(err.errors.email) {
                                res.json({ success: false, message: err.errors.email.message});
                            } else if(err.errors.username) {
                                res.json({ success: false, message: err.errors.username.message});
                            } else if(err.errors.password) {
                                res.json({ success: false, message: err.errors.password.message});
                            }
                        } else if(err) {
                            if(err.code == 11000) {
                                if(err.errmsg[61] == "u") {
                                    res.json({ success: false, message: 'The usernname is already taken' });
                                } else if(err.errmsg[61] == "e") {
                                    res.json({ success: false, message: 'The e-mail is already taken' });
                                }
                            } else {
                                res.json({success: false, message: err});
                            }
                        }
                    } 
                    else {
                        var email = {
                            from: 'localhost Staff, onkarbharatesh@gmail.com',
                            to: [user.email, 'onkarbk1@gmail.com'],
                            subject: 'Localhost Activation Link',
                            text: 'Hello ' + user.name + ',Thank you for registering. Please click on the link below to complete your activation. http://localhost:8080/activate/' + user.temporarytoken ,
                            html: 'Hello<strong> ' + user.name + '</strong>, <br><br> Thank you for registering. Please click on the link below to complete your activation.<br><br> <a href="http://localhost:8080/activate/' + user.temporarytoken +'">http://localhost:8080/activate/</a>'
                        }; 
                    
                        client.sendMail(email, function(err, info){
                            if (err ){
                              console.log(err);
                            }
                            else {
                              console.log('Message sent: ' + info.response);
                              console.log(user.email);
                            }
                        });

                        res.json({success: true, message: 'Account Registered! Please check email for activation link!'});
                    }
        });
    }
}); 

        // User Login Route
        router.post('/authenticate', function(req, res){
            User.findOne({ username: req.body.username }).select('email username password active').exec(function(err,user){
                if(err) throw err;

                if(!user) {
                    res.json({ success: false, message: "Could not authenticate User" });
                } else if (user) {
                    if(req.body.password) {
                        var validPassword = user.comparePassword(req.body.password);
                    } else {
                        res.json({success: false, message: "No password provided!"});
                    }
                    if (!validPassword) {
                        res.json({success: false, message: "Could not authenticate Password"});
                    } else if(!user.active){
                        res.json( { success: false, message: "Account is not activated. Please check your email.", expired: true} );
                    }
                    else {
                        var token = jwt.sign({ username: user.username, email: user.email }, secret, { expiresIn: '24h' });
                        res.json({ success: true, message: "User authenticated", token: token });
                    }
                }
            });
        });

        router.put('/activate/:token', function(req, res){
            User.findOne({temporarytoken: req.params.token}, function(err, user){
                if(err) throw err;
                var token = req.params.token;
                jwt.verify(token, secret, function(err, decoded) {
                    if(err){
                        res.json({ success: false, message: 'Activation Link has expired' });
                    } else if(!user){
                        res.json({ success: false, message: 'Activation Link has expired' });
                    } else {
                        user.temporarytoken = false;
                        user.active = true;
                        user.save(function(err){
                            if(err) {
                                console.log(err);
                            } else {
                                var email = {
                                    from: 'localhost Staff, onkarbharatesh@gmail.com',
                                    to: user.email,
                                    subject: 'Localhost Account Activated',
                                    text: 'Hello ' + user.name + ',Your Account has been successfully activated' ,
                                    html: 'Hello<strong> ' + user.name + '</strong>, <br><br> Your Account has been successfully activated'
                                };
                            
                                client.sendMail(email, function(err, info){
                                    if (err ){
                                      console.log(err);
                                    }
                                    else {
                                      console.log('Message sent: ' + info.response);
                                    }
                                });
                                res.json({ success: true, message: "Account has been activated" });

                            }
                        });                       
                    }
                });
            })
        });

        router.post('/checkusername', function(req, res){
            User.findOne({ username: req.body.username }).select('username').exec(function(err,user){
                if(err) throw err;

                if(user){
                    res.json({success: false, message: "That username is already taken"});
                }else {
                    res.json({success: true, message: "Vaild username"});
                }
            });
        });

        router.post('/checkemail', function(req, res){
            User.findOne({ email: req.body.email }).select('email').exec(function(err,user){
                if(err) throw err;

                if(user){
                    res.json({success: false, message: "That email is already taken"});
                }else {
                    res.json({success: true, message: "Vaild email"});
                }
            });
        });

        router.post('/resend', function(req, res){
            User.findOne({ username: req.body.username}).select('username password active').exec(function(err,user){
                if(err) throw err;

                if(!user) {
                    res.json({ success: false, message: "Could not authenticate User" });
                } else if (user) {
                        if(req.body.password) {
                            var validPassword = user.comparePassword(req.body.password);
                        } else {
                            res.json({success: false, message: "No password provided!"});
                        }
                        if (!validPassword) {
                            res.json({success: false, message: "Could not authenticate Password"});
                        } else if(user.active){
                            res.json( { success: false, message: "Account is already activated"} );
                        } else {
                            res.json({success: true, user: user });
                        }
                }
            });
        });

        router.put('/resend', function(req, res){
            User.findOne({ username: req.body.username }).select('username name email temporarytoken').exec(function(err, user){
                if(err) throw err;
                user.temporarytoken = jwt.sign({ username: user.username, email: user.email }, secret, {expiresIn: '24h'})
                user.save(function(err){
                    if(err) {
                        console.log(err);
                    } else {
                        var email = {
                            from: 'localhost Staff, onkarbharatesh@gmail.com',
                            to: user.email,
                            subject: 'Localhost Activation Link Request',
                            text: 'Hello ' + user.name + ',New Account Activation Link. Please click on the link below to complete your activation. http://localhost:8080/activate/' + user.temporarytoken ,
                            html: 'Hello<strong> ' + user.name + '</strong>, <br><br> New Account Activation Link. Please click on the link below to complete your activation.<br><br> <a href="http://localhost:8080/activate/' + user.temporarytoken +'">http://localhost:8080/activate/</a>'
                        };
                    
                        client.sendMail(email, function(err, info){
                            if (err ){
                              console.log(err);
                            }
                            else {
                              console.log('Message sent: ' + info.response);
                            }
                        });

                        res.json({ success:true, message: 'Activation link has  been sent to ' + user.email + '!'});
                    }
                });
            })
        });

        router.get('/resetusername/:email', function(req, res) {
            User.findOne( { email: req.params.email } ).select('email name username').exec(function(err, user){
                if(err) {
                    res.json({ success: false, message: err });
                } else {

                    if(!req.params.email) {
                        res.json({success: false, message: 'No email was provided'})
                    } else {
                        if(!user) {
                            res.json({ success: false, message: 'E-mail was not found' });
                        } else {
                            var email = {
                                from: 'localhost Staff, onkarbharatesh@gmail.com',
                                to: user.email,
                                subject: 'Localhost Username Request',
                                text: 'Hello ' + user.name + 'You recently requested your Username. Please save it.' + user.username ,
                                html: 'Hello<strong> ' + user.name + '</strong>, <br><br> You recently requested your Username. Please save it.' + user.username
                            };
                        
                            client.sendMail(email, function(err, info){
                                if (err ){
                                  console.log(err);
                                }
                                else {
                                  console.log('Message sent: ' + info.response);
                                }
                            });
    
                            res.json({ success: true, message: 'Username has been sent to E-mail!' })
                        
                    }

                    }
                }
            })
        });

        router.put('/resetpassword', function(req,res){
            User.findOne({ username: req.body.username }).select('username active email resettoken name').exec(function(err, user){
                if(err) throw err;
                if(!user){
                    res.json({ success: false, message: 'Username was not found' });
                } else if(!user.active) {
                    res.json({ success: false, message: 'Account has not been activated' });
                } else {
                    user.resettoken = jwt.sign({ username: user.username, email: user.email }, secret, {expiresIn: '24h'});
                    user.save(function(err){
                        if(err) {
                            res.json({ success:false, message: err });
                        } else {

                            var email = {
                                from: 'localhost Staff, onkarbharatesh@gmail.com',
                                to: user.email,
                                subject: 'Localhost Reset Password Request',
                                text: 'Hello ' + user.name + ',You recently requested for a change of password. Please click on the link below to change password. http://localhost:8080/reset/' + user.resettoken ,
                                html: 'Hello<strong> ' + user.name + '</strong>, <br><br> You recently requested for a change of password. Please click on the link below to change password.<br><br> <a href="http://localhost:8080/reset/' + user.resettoken +'">http://localhost:8080/reset/</a>'
                            };
                        
                            client.sendMail(email, function(err, info){
                                if (err ){
                                  console.log(err);
                                }
                                else {
                                  console.log('Message sent: ' + info.response);
                                }
                            });
                            res.json({ success: true, message: 'Please check your email for password reset link' });
                        }
                    })
                }
            })
        })

        router.get('/resetpassword/:token', function(req,res){
            User.findOne({ resettoken: req.params.token }).select().exec(function(err, user){
                if (err) throw err;
                var token = req.params.token;
                // Verify Token
                jwt.verify(token, secret, function(err, decoded) {
                    if(err){
                        res.json({ success: false, message: 'Password link has expired' });
                    } else {
                        if(!user) {
                            res.json({ success: false, message: 'Password Link has expired' });
                        } else {
                            res.json({ success: true, user: user });
                        }
                    }
                });
            });
        });

        router.put('/savepassword', function(req, res){
            User.findOne({ username: req.body.username }).select('username email name password resettoken').exec(function(err, user){
                if(err) throw err;
                if(req.body.password === null || req.body.password === '') {
                    res.json({ success: false, message: "Password not provided!" });
                } else {
                    user.password = req.body.password;
                    user.resettoken = false;
                    user.save(function(err){
                    if(err) {
                        res.json({ success: false, message: err });
                    } else {
                        var email = {
                            from: 'localhost Staff, onkarbharatesh@gmail.com',
                            to: user.email,
                            subject: 'Localhost Password Reset',
                            text: 'Hello ' + user.name + 'Your password has recently been reset' ,
                            html: 'Hello<strong> ' + user.name + '</strong>, <br><br>Your password has recently been reset '
                        };
                    
                        client.sendMail(email, function(err, info){
                            if (err ){
                              console.log(err);
                            }
                            else {
                              console.log('Message sent: ' + info.response);
                            }
                        });
                        res.json({ success: true, message: 'Password has been reset!' })
                    }
                });            
                }
            });
        });


    router.use(function(req,res,next){
            var token = req.body.token || req.body.query || req.headers['x-access-token'];
            if (token) {
                // Verify Token
                jwt.verify(token, secret, function(err, decoded) {
                    if(err){
                        res.json({ success: false, message: 'Token invalid' })
                    } else {
                        req.decoded = decoded;
                        next();
                    }
                });
            } else {
                res.json({ success: false, message: "No Token Provided!" });
            }
        });
        // Route to get the currently logged in user 
        router.post('/me', function(req, res) {
            res.send(req.decoded);
    });

    // Route to provide the user with a new token to renew session
    router.get('/renewToken/:username', function(req, res) {
        User.findOne({ username: req.params.username }).select('username email').exec(function(err, user) {
            if (err) {
                res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
            } else {
                // Check if username was found in database
                if (!user) {
                    res.json({ success: false, message: 'No user was found' }); // Return error
                } else {
                    var newToken = jwt.sign({ username: user.username, email: user.email }, secret, { expiresIn: '24h' }); // Give user a new token
                    res.json({ success: true, token: newToken }); // Return newToken in JSON object to controller
                }
            }
        });
    });

    // Route to get the current user's permission level
    router.get('/permission', function(req, res) {
        User.findOne({ username: req.decoded.username }, function(err, user) {
            if (err) {
                res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
            } else {
                // Check if username was found in database
                if (!user) {
                    res.json({ success: false, message: 'No user was found' }); // Return an error
                } else {
                    res.json({ success: true, permission: user.permission }); // Return the user's permission
                }
            }
        });
    });

    // Route to get all users for management page
    router.get('/management', function(req, res) {
        User.find({}, function(err, users){
            if(err) throw err;
            User.findOne({ username: req.decoded.username }, function(err, mainUser) {
                if(err) throw err;
                if (!mainUser) {
                    res.json({ success: false, message: 'No user found' }); // Return error
                } else {
                    if (mainUser.permission === 'admin' || mainUser.permission === 'moderator'){
                        if (!users) {
                            res.json({ success: false, message: 'Users not found' }); // Return error
                        } else {
                            res.json({ success: true, users: users, permission: mainUser.permission }); // Return users, along with current user's permission
                        }
                    } else {
                        res.json({ success: false, message: 'Insufficient Permissions' }); // Return access error
                    }

                }

            });
        });
    });

    // Route to delete a user
    router.delete('/management/:username', function(req, res) {
        var deletedUser = req.params.username; // Assign the username from request parameters to a variable
        User.findOne({ username: req.decoded.username }, function(err, mainUser){
            if(err) throw err;
            if (!mainUser) {
                res.json({ success: false, message: 'No user found' }); // Return error
            } else{
                if (mainUser.permission !== 'admin') {
                    res.json({ success: false, message: 'Insufficient Permissions' }); // Return error
                } else{
                    // Fine the user that needs to be deleted
                    User.findOneAndRemove({ username: deletedUser }, function(err, user){
                        if(err) throw err;
                        res.json({ success: true }); // Return success status
                    });

                }

            }
        });
    });

    // Route to get the user that needs to be edited
    router.get('/edit/:id', function(req, res) {
        var editUser = req.params.id; // Assign the _id from parameters to variable
        User.findOne({ username: req.decoded.username }, function(err, mainUser) {
            if (err) {
                // Create an e-mail object that contains the error. Set to automatically send it to myself for troubleshooting.
                var email = {
                    from: 'MEAN Stack Staff, cruiserweights@zoho.com',
                    to: 'gugui3z24@gmail.com',
                    subject: 'Error Logged',
                    text: 'The following error has been reported in the MEAN Stack Application: ' + err,
                    html: 'The following error has been reported in the MEAN Stack Application:<br><br>' + err
                };
                // Function to send e-mail to myself
                client.sendMail(email, function(err, info) {
                    if (err) {
                        console.log(err); // If error with sending e-mail, log to console/terminal
                    } else {
                        console.log(info); // Log success message to console if sent
                        console.log(user.email); // Display e-mail that it was sent to
                    }
                });
                res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
            } else {
                // Check if logged in user was found in database
                if (!mainUser) {
                    res.json({ success: false, message: 'No user found' }); // Return error
                } else {
                    // Check if logged in user has editing privileges
                    if (mainUser.permission === 'admin' || mainUser.permission === 'moderator') {
                        // Find the user to be editted
                        User.findOne({ _id: editUser }, function(err, user) {
                            if (err) {
                                res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
                            } else {
                                // Check if user to edit is in database
                                if (!user) {
                                    res.json({ success: false, message: 'No user found' }); // Return error
                                } else {
                                    res.json({ success: true, user: user }); // Return the user to be editted
                                }
                            }
                        });
                    } else {
                        res.json({ success: false, message: 'Insufficient Permission' }); // Return access error
                    }
                }
            }
        });
    });

    // Route to update/edit a user
    router.put('/edit', function(req, res) {
        var editUser = req.body._id; // Assign _id from user to be editted to a variable
        if (req.body.name) var newName = req.body.name; // Check if a change to name was requested
        if (req.body.username) var newUsername = req.body.username; // Check if a change to username was requested
        if (req.body.email) var newEmail = req.body.email; // Check if a change to e-mail was requested
        if (req.body.permission) var newPermission = req.body.permission; // Check if a change to permission was requested
        // Look for logged in user in database to check if have appropriate access
        User.findOne({ username: req.decoded.username }, function(err, mainUser) {
            if (err) {
                res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
            } else {
                // Check if logged in user is found in database
                if (!mainUser) {
                    res.json({ success: false, message: "no user found" }); // Return error
                } else {
                    // Check if a change to name was requested
                    if (newName) {
                        // Check if person making changes has appropriate access
                        if (mainUser.permission === 'admin' || mainUser.permission === 'moderator') {
                            // Look for user in database
                            User.findOne({ _id: editUser }, function(err, user) {
                                if (err) {
                                    res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
                                } else {
                                    // Check if user is in database
                                    if (!user) {
                                        res.json({ success: false, message: 'No user found' }); // Return error
                                    } else {
                                        user.name = newName; // Assign new name to user in database
                                        // Save changes
                                        user.save(function(err) {
                                            if (err) {
                                                console.log(err); // Log any errors to the console
                                            } else {
                                                res.json({ success: true, message: 'Name has been updated!' }); // Return success message
                                            }
                                        });
                                    }
                                }
                            });
                        } else {
                            res.json({ success: false, message: 'Insufficient Permissions' }); // Return error
                        }
                    }

                    // Check if a change to username was requested
                    if (newUsername) {
                        // Check if person making changes has appropriate access
                        if (mainUser.permission === 'admin' || mainUser.permission === 'moderator') {
                            // Look for user in database
                            User.findOne({ _id: editUser }, function(err, user) {
                                if (err) {
                                    res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
                                } else {
                                    // Check if user is in database
                                    if (!user) {
                                        res.json({ success: false, message: 'No user found' }); // Return error
                                    } else {
                                        user.username = newUsername; // Save new username to user in database
                                        // Save changes
                                        user.save(function(err) {
                                            if (err) {
                                                console.log(err); // Log error to console
                                            } else {
                                                res.json({ success: true, message: 'Username has been updated' }); // Return success
                                            }
                                        });
                                    }
                                }
                            });
                        } else {
                            res.json({ success: false, message: 'Insufficient Permissions' }); // Return error
                        }
                    }

                    // Check if change to e-mail was requested
                    if (newEmail) {
                        // Check if person making changes has appropriate access
                        if (mainUser.permission === 'admin' || mainUser.permission === 'moderator') {
                            // Look for user that needs to be editted
                            User.findOne({ _id: editUser }, function(err, user) {
                                if (err) {
                                    res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
                                } else {
                                    // Check if logged in user is in database
                                    if (!user) {
                                        res.json({ success: false, message: 'No user found' }); // Return error
                                    } else {
                                        user.email = newEmail; // Assign new e-mail to user in databse
                                        // Save changes
                                        user.save(function(err) {
                                            if (err) {
                                                console.log(err); // Log error to console
                                            } else {
                                                res.json({ success: true, message: 'E-mail has been updated' }); // Return success
                                            }
                                        });
                                    }
                                }
                            });
                        } else {
                            res.json({ success: false, message: 'Insufficient Permissions' }); // Return error
                        }
                    }

                    // Check if a change to permission was requested
                    if (newPermission) {
                        // Check if user making changes has appropriate access
                        if (mainUser.permission === 'admin' || mainUser.permission === 'moderator') {
                            // Look for user to edit in database
                            User.findOne({ _id: editUser }, function(err, user) {
                                if (err) {
                                    res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
                                } else {
                                    // Check if user is found in database
                                    if (!user) {
                                        res.json({ success: false, message: 'No user found' }); // Return error
                                    } else {
                                        // Check if attempting to set the 'user' permission
                                        if (newPermission === 'user') {
                                            // Check the current permission is an admin
                                            if (user.permission === 'admin') {
                                                // Check if user making changes has access
                                                if (mainUser.permission !== 'admin') {
                                                    res.json({ success: false, message: 'Insufficient Permissions. You must be an admin to downgrade an admin.' }); // Return error
                                                } else {
                                                    user.permission = newPermission; // Assign new permission to user
                                                    // Save changes
                                                    user.save(function(err) {
                                                        if (err) {
                                                            console.log(err); // Long error to console
                                                        } else {
                                                            res.json({ success: true, message: 'Permissions have been updated!' }); // Return success
                                                        }
                                                    });
                                                }
                                            } else {
                                                user.permission = newPermission; // Assign new permission to user
                                                // Save changes
                                                user.save(function(err) {
                                                    if (err) {
                                                        console.log(err); // Log error to console
                                                    } else {
                                                        res.json({ success: true, message: 'Permissions have been updated!' }); // Return success
                                                    }
                                                });
                                            }
                                        }
                                        // Check if attempting to set the 'moderator' permission
                                        if (newPermission === 'moderator') {
                                            // Check if the current permission is 'admin'
                                            if (user.permission === 'admin') {
                                                // Check if user making changes has access
                                                if (mainUser.permission !== 'admin') {
                                                    res.json({ success: false, message: 'Insufficient Permissions. You must be an admin to downgrade another admin' }); // Return error
                                                } else {
                                                    user.permission = newPermission; // Assign new permission
                                                    // Save changes
                                                    user.save(function(err) {
                                                        if (err) {
                                                            console.log(err); // Log error to console
                                                        } else {
                                                            res.json({ success: true, message: 'Permissions have been updated!' }); // Return success
                                                        }
                                                    });
                                                }
                                            } else {
                                                user.permission = newPermission; // Assign new permssion
                                                // Save changes
                                                user.save(function(err) {
                                                    if (err) {
                                                        console.log(err); // Log error to console
                                                    } else {
                                                        res.json({ success: true, message: 'Permissions have been updated!' }); // Return success
                                                    }
                                                });
                                            }
                                        }

                                        // Check if assigning the 'admin' permission
                                        if (newPermission === 'admin') {
                                            // Check if logged in user has access
                                            if (mainUser.permission === 'admin') {
                                                user.permission = newPermission; // Assign new permission
                                                // Save changes
                                                user.save(function(err) {
                                                    if (err) {
                                                        console.log(err); // Log error to console
                                                    } else {
                                                        res.json({ success: true, message: 'Permissions have been updated!' }); // Return success
                                                    }
                                                });
                                            } else {
                                                res.json({ success: false, message: 'Insufficient Permissions. You must be an admin to upgrade someone to the admin level' }); // Return error
                                            }
                                        }
                                    }
                                }
                            });
                        } else {
                            res.json({ success: false, message: 'Insufficient Permissions' }); // Return error
                        }
                    }
                }
            }
        });
    });

    return router; // Return the router object to server
};
