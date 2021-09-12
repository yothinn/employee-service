'use strict';
// use model
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var EmployeeSchema = new Schema({
    id: {
        type: String
    },
    department: {
        type: String
    },
    salary: {
        type: Number
    },
    activate: {
        type: Boolean
    },
    citizenId: {
        type: String
    },
    title: {
        type: String 
    },
    firstName: {
        type: String
    },
    lastName: {
        type: String 
    },
    tel: {
        type: String
    },
    addr01: {
        type: String
    },
    street: {
        type: String 
    },
    subDistrict: {
        type: String
    },
    district: {
        type: String 
    },
    province: {
        type: String
    },
    zip: {
        type: String 
    },
    position: {
        type: String
    },
    age:{
        type: String
    },
    imageUrl:{},
    created: {
        type: Date,
        default: Date.now
    },
    updated: {
        type: Date
    },
    createby: {
        _id: {
            type: String
        },
        username: {
            type: String
        },
        displayname: {
            type: String
        }
    },
    updateby: {
        _id: {
            type: String
        },
        username: {
            type: String
        },
        displayname: {
            type: String
        }
    }
});
EmployeeSchema.pre('save', function(next){
    let Employee = this;
    const model = mongoose.model("Employee", EmployeeSchema);
    if (Employee.isNew) {
        // create
        next();
    }else{
        // update
        Employee.updated = new Date();
        next();
    }
    
    
})
mongoose.model("Employee", EmployeeSchema);