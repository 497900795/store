var express = require('express');
var router = express.Router();
var db = require('../modules/database');
var globalData = require('../global');

router.get('/items', function (req, res, next) {
    var hotItem = req.query.hot || 0;
    var priceRange = req.query.priceIndex || 0;
    var keyword = req.query.keyword || '';
    var type = req.query.typeIndex || 0;

    var range = [
        [0, 999999],
        [0, 20],
        [20, 50],
        [50, 100],
        [100, 200],
        [200, 999999]
    ];

    var values = [];
    var sql = 'SELECT * FROM Goods WHERE 1=1 ';
    if (keyword != '') {
        sql += ' AND GoodsName LIKE ? ';
        values.push('%' + keyword + '%');
    }
    if (type != 0) {
        sql += ' AND CategoryID = ? ';
        values.push(type);
    }
    if (priceRange != 0) {
        sql += ' AND GoodsPrice >= ? AND GoodsPrice <= ? ';
        values.push(range[priceRange][0]);
        values.push(range[priceRange][1]);
    }
    if (hotItem == 1) {
        sql += ' ORDER BY GoodsSales DESC LIMIT 6';
    }

    db.query(sql, values, function (err, results, fields) {
        if (err) {
            console.error(err);
            res.status(500).end();
        } else
            res.json(results);
    });
});

router.get('/getCategory', function (req, res, next) {
    var sql = 'SELECT * FROM GoodsCategory';
    db.query(sql, [], function (err, results, fields) {
        if (err) {
            console.error(err);
            res.json({
                errcode: -1,
                errmsg: '获取分类列表失败'
            });
        } else {
            res.json(results);
        }
    });
});

router.post('/addCart', function (req, res, next) {
    if (req.session.userID) {
        var itemID = req.body.id;
        var itemNum = req.body.num;
        var sql = 'INSERT INTO Carts VALUES (?, ?, ?)';
        var params = [req.session.userID, itemID, itemNum];
        db.query(sql, params, function (err, results, fields) {
            if (err) {
                console.error(err);
                res.json({
                    errcode: globalData.ERR_ADD_CART_FAILED,
                    errmsg: '加入购物车失败'
                });
            } else {
                res.json({
                    errcode: globalData.ERR_OK /* = 0 */
                });
            }
        });
    } else {
        res.json({
            errcode: globalData.ERR_NOT_LOGIN,
            errmsg: '需要登录'
        });
    }
});

router.post('/payCart', function (req, res, next) {
    if (req.session.userID) {
        db.query('CALL CreateOrder(?)', [req.session.userID], function (err, results, fields) {
            if (err) {
                console.error(err);
                res.json({
                    errcode: globalData.ERR_PAY_CART_FAILED,
                    errmsg: '支付失败'
                });
            } else {
                res.json({
                    errcode: globalData.ERR_OK
                });
            }
        });
    } else {
        res.json({
            errcode: globalData.ERR_NOT_LOGIN,
            errmsg: '需要登录'
        });
    }
});

router.get('/getCart', function (req, res, next) {
    if (req.session.userID) {
        var sql = 'SELECT GoodsID, GoodsName, GoodsPrice, GoodsPicture, GoodsCount FROM ViewCart WHERE UserID = ?';
        var params = [req.session.userID];
        db.query(sql, params, function (err, results, fields) {
            if (err) {
                console.error(err);
                res.json({
                    errcode: globalData.ERR_GET_CART_FAILED,
                    errmsg: '获取购物车信息失败'
                });
            } else {
                console.log(results);
                res.json(results); // [{GoodsID, GoodsName, GoodsPrice, GoodsPicture, GoodsCount}]
            }
        });
    } else {
        res.json({
            errcode: globalData.ERR_NOT_LOGIN,
            errmsg: '需要登录'
        });
    }
});

router.get('/getOrder', function (req, res, next) {
    if (req.session.userID) {
        var sql = 'SELECT * FROM ViewOrder WHERE UserID = ? ORDER BY OrderID DESC';
        db.query(sql, [req.session.userID], function (err, results, fields) {
            if (err) {
                console.error(err);
                res.json({
                    errcode: globalData.ERR_GET_ORDER_FAILED,
                    errmsg: '获取订单失败'
                });
            } else {
                var r = {};
                for (var i of results) {
                    if (!(i.OrderID in r)) {
                        r[i.OrderID] = {
                            OrderID: i.OrderID,
                            OrderDate: i.OrderDate,
                            OrderPrice: i.OrderPrice,
                            Goods: []
                        };
                    }
                    r[i.OrderID].Goods.push({
                        GoodsID: i.GoodsID,
                        GoodsName: i.GoodsName,
                        GoodsPrice: i.GoodsPrice,
                        GoodsCount: i.GoodsCount
                    });
                }
                res.json(r);
            }
        });
    } else {
        res.json({
            errcode: globalData.ERR_NOT_LOGIN,
            errmsg: '需要登录'
        });
    }
});

router.post('/remGoods', function (req, res, next) {
    if (req.session.userID) {
        var sql = 'DELETE FROM Carts WHERE UserID = ? AND GoodsID = ?';
        db.query(sql, [req.session.userID, req.body.delID], function (err, results, fields) {
            if (err) {
                console.error(err);
                res.json({
                    errcode: globalData.ERR_DEL_CART_FAILED,
                    errmsg: '删除失败'
                });
            } else {
                res.json({
                    errcode: globalData.ERR_OK
                });
            }
        });
    } else {
        res.json({
            errcode: globalData.ERR_NOT_LOGIN,
            errmsg: '需要登录'
        });
    }
});

module.exports = router;