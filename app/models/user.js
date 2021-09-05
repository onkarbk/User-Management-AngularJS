var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');
var titleize = require('mongoose-title-case');
var validate = require('mongoose-validator');

var nameValidator = [
    validate({
        validator: 'matches',
        arguments: /^(([a-zA-Z]{3,20})+[ ]+([a-zA-Z]{3,20})+)+$/,
        message: 'Name must be atleast 3 charecters, max 30, no special characters or numbers, must have space in between name.'
      }),
      validate({
        validator: 'isLength',
        arguments: [3, 20],
        message: 'Name should be between {ARGS[0]} and {ARGS[1]} characters'
    })
  ];

// User E-mail Validator
var emailValidator = [
    validate({
        validator: 'isEmail',
        message: 'Not a valid Email'
    }),
    validate({
        validator: 'isLength',
        arguments: [3, 25],
        message: 'Email should be between {ARGS[0]} and {ARGS[1]} characters'
    })
];

// Username Validator
var usernameValidator = [
    validate({
        validator: 'isLength',
        arguments: [3, 25],
        message: 'Username should be between {ARGS[0]} and {ARGS[1]} characters'
    }),
    validate({
        validator: 'isAlphanumeric',
        message: 'Username must contain letters and numbers only'
    })
];

// Password Validator
var passwordValidator = [
    validate({
        validator: 'matches',
        arguments: /^(?=.*?[a-z])(?=.*?[A-Z])(?=.*?[\d])(?=.*?[\W]).{8,35}$/,
        message: 'Password needs to have at least one lower case, one uppercase, one number, one special character, and must be at least 8 characters but no more than 35.'
    }),
    validate({
        validator: 'isLength',
        arguments: [8, 35],
        message: 'Password should be between {ARGS[0]} and {ARGS[1]} characters'
    })
];

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

UserSchema.pre('save', function(next) {
    var user = this;

    if(!user.isModified('password')) return next();

    bcrypt.hash(user.password, null, null, function(err, hash){
        if(err){
            return next(err);
        }
        user.password = hash;
        next();
    })  
});

UserSchema.plugin(titleize, {
    paths: ['name'] 
  });

UserSchema.methods.comparePassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};


module.exports = mongoose.model('User', UserSchema);

