var express = require('express');
var router = express.Router();
var db = require('../modules/database');
var globalData = require('../global');
var formidable = require('formidable');
var fs = require('fs');

router.get('/', function (req, res, next) {
    if (req.session.userType == globalData.USER_TYPE_ADMIN) {
        res.redirect('/html/mag-work.html');
    } else if (req.session.userType == globalData.USER_TYPE_COMMON) {
        res.redirect('/html/store.html');
    } else {
        res.redirect('/html/mag-log.html');
    }
});

router.get('/getGoods', function (req, res, next) {
    if (req.session.userType == globalData.USER_TYPE_ADMIN) {
        var sql = 'SELECT * FROM Goods';
        db.query(sql, [], function (err, results, fields) {
            if (err) {
                console.error(err);
                res.json({
                    errcode: globalData.ERR_ADMIN_ERROR,
                    errmsg: '获取失败'
                });
            } else {
                res.json(results);
            }
        });
    } else {
        res.json({
            errcode: globalData.ERR_ACCESS_DENIED,
            errmsg: '权限不足或未登录'
        });
    }
});

router.post('/chgGoods', function (req, res, next) {
    if (req.session.userType == globalData.USER_TYPE_ADMIN) {
        var sql = 'UPDATE Goods SET GoodsName = ?, GoodsPrice = ?, GoodsDescription = ?, GoodsPicture = ?, CategoryID = ?, GoodsSales = ? WHERE GoodsID = ?';
        var params = [req.body.GoodsName, req.body.GoodsPrice, req.body.GoodsDescription, req.body.GoodsPicture, req.body.CategoryID, req.body.GoodsSales, req.body.GoodsID];
        db.query(sql, params, function (err, results, fields) {
            if (err) {
                console.error(err);
                res.json({
                    errcode: globalData.ERR_ADMIN_ERROR,
                    errmsg: '修改失败'
                });
            } else {
                res.json({
                    errcode: globalData.ERR_OK
                });
            }
        });
    } else {
        res.json({
            errcode: globalData.ERR_ACCESS_DENIED,
            errmsg: '权限不足或未登录'
        });
    }
});

router.post('/chgPic', function (req, res, next) {
    console.log(req.body);
    if (req.session.userType == globalData.USER_TYPE_ADMIN) {
        var form = new formidable.IncomingForm();
        form.encoding = 'utf-8';
        form.uploadDir = '/webProjects/8060/dbpracticum/tmp/tmppic/';
        form.keepExtensions = true;
        form.maxFieldsSize = 2 * 1024 * 1024;
        form.parse(req, function (err, fields, files) {
            if (err) {
                console.error(err);
                res.render('register_error', {
                    what: '服务器错误'
                });
            } else {
                var extName = '';
                switch (files.File.type) {
                    case 'image/pjpeg':
                        extName = 'jpg';
                        break;
                    case 'image/jpeg':
                        extName = 'jpg';
                        break;
                    case 'image/png':
                        extName = 'png';
                        break;
                    case 'image/x-png':
                        extName = 'png';
                        break;
                }
                var avatarName = 'p' + new Date().valueOf();
                var newPath = '/webProjects/8060/dbpracticum/public/img/' + avatarName + '.' + extName;
                console.log(newPath);
                fs.renameSync(files.File.path, newPath);
                var sql = 'SELECT GoodsPicture FROM Goods WHERE GoodsID = ?';
                db.query(sql, [fields.GoodsID], function (err1, results1, fields1) {
                    if (err1) {
                        console.error(err);
                        res.render('register_error', {
                            what: '服务器错误'
                        });
                    } else {
                        console.log(results1[0]);
                        if (results1[0].GoodsPicture != '0' && results1[0].GoodsPicture != '') {
                            fs.unlink('/webProjects/8060/dbpracticum/public/img/' + results1[0].GoodsPicture + '.jpg', function (err) {
                                if (err) {
                                    console.error(err);
                                }
                            });
                        }
                        sql = 'UPDATE Goods SET GoodsPicture = ? WHERE GoodsID = ?';
                        db.query(sql, [avatarName, fields.GoodsID], function (err2, results2, fields2) {
                            if (err) {
                                console.error(err2);
                                res.render('register_error', {
                                    what: '服务器错误'
                                });
                            } else {
                                res.redirect('/html/mag-work.html');
                            }
                        });
                    }
                });
            }
        });
    } else {
        res.render('register_error', {
            what: '权限不足或未登录'
        });
    }
});

router.post('/selGoods', function (req, res, next) {
    if (req.session.userType == globalData.USER_TYPE_ADMIN) {
        var sql = 'SELECT * FROM Goods';
        var params = [];
        if (req.body.GoodsID != '') {
            sql += ' WHERE GoodsID = ?';
            params.push(req.body.GoodsID);
        }
        db.query(sql, params, function (err, results, fields) {
            if (err) {
                console.error(err);
                res.json({
                    errcode: globalData.ERR_ADMIN_ERROR,
                    errmsg: '获取失败'
                });
            } else {
                res.json(results);
            }
        });
    } else {
        res.json({
            errcode: globalData.ERR_ACCESS_DENIED,
            errmsg: '权限不足或未登录'
        });
    }
});

router.post('/delGoods', function (req, res, next) {
    if (req.session.userType == globalData.USER_TYPE_ADMIN) {
        var sql = 'SELECT GoodsPicture FROM Goods WHERE GoodsID = ?';
        db.query(sql, [req.body.GoodsID], function (err, results, fields) {
            if (err || results.length == 0) {
                res.json({
                    errcode: globalData.ERR_ADMIN_ERROR,
                    errmsg: '删除失败'
                });
            } else {
                if (results[0].GoodsPicture != '' && results[0].GoodsPicture != '0') {
                    fs.unlink('/webProjects/8060/dbpracticum/public/img/' + results[0].GoodsPicture + '.jpg', function (err) {
                        console.error(err);
                    });
                }
                sql = 'DELETE FROM Goods WHERE GoodsID = ?';
                db.query(sql, [req.body.GoodsID], function (err, results, fields) {
                    if (err) {
                        console.error(err);
                        res.json({
                            errcode: globalData.ERR_ADMIN_ERROR,
                            errmsg: '删除失败'
                        });
                    } else {
                        res.json({
                            errcode: globalData.ERR_OK
                        });
                    }
                });

            }
        });
    } else {
        res.json({
            errcode: globalData.ERR_ACCESS_DENIED,
            errmsg: '权限不足或未登录'
        });
    }
});

router.post('/addGoods', function (req, res, next) {
    if (req.session.userType == globalData.USER_TYPE_ADMIN) {
        console.log(req.body);
        var sql = 'INSERT INTO Goods(GoodsID, GoodsName, GoodsPrice, GoodsDescription, GoodsPicture, CategoryID, GoodsSales) ' +
            'VALUES (?, ?, ?, ?, \'0\', ?, 0)';
        var params = [req.body.GoodsID, req.body.GoodsName, req.body.GoodsPrice, req.body.GoodsDescription, req.body.CategoryID];
        db.query(sql, params, function (err, results, fields) {
            if (err) {
                console.error(err);
                res.json({
                    errcode: globalData.ERR_ADMIN_ERROR,
                    errmsg: '添加失败'
                });
            } else {
                res.json({
                    errcode: globalData.ERR_OK,
                });
            }
        });
    } else {
        res.json({
            errcode: globalData.ERR_ACCESS_DENIED,
            errmsg: '权限不足或未登录'
        });
    }
});

module.exports = router;