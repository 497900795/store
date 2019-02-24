var express = require('express');
var router = express.Router();
var db = require('../modules/database');
var globalData = require('../global');

/*
  /users/*
*/

router.get('/', function (req, res, next) {
    if (req.session.userType) {
        if (req.session.userType == globalData.USER_TYPE_ADMIN) {
            db.query('SELECT UserID, UserLoginName, UserName, UserAddress FROM Users', [], function (err, results, fields) {
                if (err) {
                    console.error(err)
                    res.status(500).end();
                } else {
                    res.json({
                        errcode: globalData.ERR_OK,
                        users: results
                    });
                }
            });
        } else if (req.session.userType == globalData.USER_TYPE_COMMON) {
            res.json({
                errcode: globalData.ERR_ACCESS_DENIED,
                errmsg: '权限不足'
            });
        } else {
            res.status(500).end();
        }
    } else {
        res.json({
            errcode: globalData.ERR_NOT_LOGIN,
            errmsg: '未登录'
        });
    }
});

router.post('/register', function (req, res, next) {
    console.log(req.body);
    db.query('SELECT UserID FROM Login WHERE UserLoginName = ?', [req.body.username], function (err, results, fields) {
        if (err) {
            console.error(err)
            res.status(500).end();
        } else if (results.length > 0) {
            // res.json({
            //   errcode: globalData.ERR_USER_EXIST,
            //   errmsg: '用户已存在'
            // });
            res.render('register_error', {
                what: '用户已存在'
            }); // 失败页面url
        } else {
            db.query('INSERT INTO Users VALUES (?, ?, ?, ?, ?)',
                [null, req.body.username, req.body.realname, req.body.address, req.body.password],
                function (err, results, fields) {
                    if (err) {
                        // res.json({
                        //   errcode: globalData.ERR_REGISTER_FAILED,
                        //   errmsg: '注册失败'
                        // });
                        console.error(err);
                        res.render('register_error', {
                            what: '注册失败'
                        }); // 失败页面url
                    } else {
                        // res.json({
                        //   errcode: globalData.ERR_OK,
                        // });
                        req.session.userType = globalData.USER_TYPE_COMMON;
                        req.session.userID = results.insertId;
                        res.redirect('/html/store.html'); // 去首页
                    }
                }
            );
        }
    });
});

router.post('/login/admin', function (req, res, next) {
    db.query('SELECT AdminID FROM Admin WHERE AdminLoginName = ? AND AdminPassword = ?', [req.body.username, req.body.password],
        function (err, results, fields) {
            if (err) {
                console.error(err);
                res.status(500).end();
            } else if (results.length == 0) {
                res.render('register_error', {
                    what: '用户名或密码错误'
                }); // 失败页面url
            } else {
                req.session.userType = globalData.USER_TYPE_ADMIN;
                req.session.userID = results[0].AdminID;
                res.redirect('/html/mag-work.html');
            }
        }
    );
});

router.post('/login', function (req, res, next) {
    db.query('SELECT UserID FROM Login WHERE UserLoginName = ? AND UserPassword = ?', [req.body.username, req.body.password],
        function (err, results, fields) {
            if (err) {
                console.error(err);
                res.status(500).end();
            } else if (results.length == 0) {
                // res.json({
                //   errcode: globalData.ERR_LOGIN_FAILED,
                //   errmsg: '登录失败'
                // });
                res.render('register_error', {
                    what: '用户名或密码错误'
                }); // 失败页面url
            } else {
                req.session.userType = globalData.USER_TYPE_COMMON;
                req.session.userID = results[0].UserID;
                // res.json({
                //   errcode: globalData.ERR_OK,
                //   userid: results[0].UserID
                // });
                res.redirect('/html/store.html'); // 去首页
            }
        }
    );
});

router.get('/logout', function (req, res, next) {
    delete req.session.userType;
    delete req.session.userID;
    res.clearCookie('dbpracticum');
    res.json({
        errcode: globalData.ERR_OK
    });
});

module.exports = router;