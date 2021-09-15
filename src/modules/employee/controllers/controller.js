'use strict';
var mongoose = require('mongoose'),
    model = require('../models/model'),
    mq = require('../../core/controllers/rabbitmq'),
    Employee = mongoose.model('Employee'),
    errorHandler = require('../../core/controllers/errors.server.controller'),
    _ = require('lodash');

exports.getList = async function (req, res) {
    var pageNo = parseInt(req.query.pageNo);
    var size = parseInt(req.query.size);

    delete req.query.pageNo;
    delete req.query.size;

    var searchText = req.query.query;
    var channel = req.query.channel ? req.query.channel : null;

    var startDate = new Date(req.query.startDate);
    var endDate = new Date(req.query.endDate);

    let query = { $and: [] };

    // Query id, customer name
    if (searchText) {
        query['$and'].push({
            $or: [
                { firstName: { $regex: `^${searchText}`, $options: "i" } },
                { lastName: { $regex: `${searchText}`, $options: "i" } },
            ]
        })
    }

    // Query channel
    if (channel) {
        query['$and'].push({
            channel: channel
        })
    }

    // Reset query when no parameter
    if (query['$and'].length === 0) {
        query = {};
    }

    // Query created in start and end date.
    if (!isNaN(startDate.valueOf()) && !isNaN(endDate.valueOf())) {
        console.log('date valid');
        if (!endDate || (startDate > endDate)) {
            return res.status(400).send({
                status: 400,
                message: "End date equal null or start date greate than end date"
            });
        }
        query['$and'].push({
            created: { $gte: startDate, $lte: endDate }
        })
    }

    console.log(query);
    var sort = { created: -1 };

    if (pageNo < 0) {
        response = { "error": true, "message": "invalid page number, should start with 1" };
        return res.json(response);
    }

    try {
        const [_result, _count] = await Promise.all([
            Employee.find(query)
                .skip(size * (pageNo - 1))
                .limit(size)
                .sort(sort)
                .exec(),
            Employee.countDocuments(query).exec()
        ]);

        //console.log(_result);

        res.jsonp({
            status: 200,
            data: _result,
            pageIndex: pageNo,
            pageSize: size,
            totalRecord: _count,
        });

    } catch (err) {
        console.log(err);
        return res.status(400).send({
            status: 400,
            message: errorHandler.getErrorMessage(err)
        });
    }
};

exports.create = function (req, res) {
    var newEmployee = new Employee(req.body);
    newEmployee.createby = req.user;
    newEmployee.save(function (err, data) {
        if (err) {
            return res.status(400).send({
                status: 400,
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp({
                status: 200,
                data: data
            });
            /**
             * Message Queue
             */
            // mq.publish('exchange', 'keymsg', JSON.stringify(newOrder));
        };
    });
};

exports.getByID = function (req, res, next, id) {

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).send({
            status: 400,
            message: 'Id is invalid'
        });
    }

    Employee.findById(id, function (err, data) {
        if (err) {
            return res.status(400).send({
                status: 400,
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            req.data = data ? data : {};
            next();
        };
    });
};

exports.read = function (req, res) {
    res.jsonp({
        status: 200,
        data: req.data ? req.data : []
    });
};

exports.update = function (req, res) {
    var updEmployee = _.extend(req.data, req.body);
    updEmployee.updated = new Date();
    updEmployee.updateby = req.user;
    updEmployee.save(function (err, data) {
        if (err) {
            return res.status(400).send({
                status: 400,
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp({
                status: 200,
                data: data
            });
        };
    });
};

exports.delete = function (req, res) {
    req.data.remove(function (err, data) {
        if (err) {
            return res.status(400).send({
                status: 400,
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp({
                status: 200,
                data: data
            });
        };
    });
};

exports.search = function (req, res) {
    let searchText = req.query.query;
    let query = {

        $or: [
            { firstName: { $regex: `^${searchText}`, $options: "i" } },
            { lastName: { $regex: `^${searchText}`, $options: "i" } }
        ]
    };
    console.log(query);

    Employee.find(query, function (err, datas) {
        if (err) {
            return res.status(400).send({
                status: 400,
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            // console.log(datas);
            res.jsonp({
                status: 200,
                data: datas
            });
        };
    });

}