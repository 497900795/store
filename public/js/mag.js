jQuery.ajaxSettings.traditional = true;
var vm = new Vue({
	el: '#app',
	data: {
		selID:'',
		nowIndex:0,
		goData: [
			
		],
		addData: {
			GoodsID:'',
			GoodsName:'',
			GoodsPrice:'',
			GoodsDescription:'',
			CategoryID:''
		}
	},
	methods: {
		selGoods() {
			var vm = this;
			$.ajax({
				url:'/admin/selGoods',
				type: 'post',
				data: {
					GoodsID:vm.selID
				},
				success: function(res) {
					if (res.errcode) {
						if (res.errcode != 0) {
							alert(res.errmsg);
							window.open('/admin', '_top');
						}
					}
					vm.goData = res;
					for(var item of vm.goData) {
						item.GoodsPictureUrl = '/img/' + item.GoodsPicture + '.jpg';
					}
				}
			});
		},
		sbChg() {
			var vm = this;
			$.ajax({
				url:'/admin/chgGoods',
				type: 'post',
				data: {
						CategoryID: vm.goData[vm.nowIndex]['CategoryID'],
						GoodsDescription:vm.goData[vm.nowIndex]['GoodsDescription'],
						GoodsID: vm.goData[vm.nowIndex]['GoodsID'],
						GoodsName: vm.goData[vm.nowIndex]['GoodsName'], 
						GoodsPicture: vm.goData[vm.nowIndex]['GoodsPicture'],
						GoodsPrice: vm.goData[vm.nowIndex]['GoodsPrice'],
						GoodsSales: vm.goData[vm.nowIndex]['GoodsSales']
				},
				success: function(res) {
					//vue因defineProperty不能动态监听数组内部变化
					//下方法为hack解决方式
					var temp = vm.goData;
					temp[vm.nowIndex] = res;
					vm.goData = temp;

					alert('修改成功');
				}
			});
		},
		sbDel() {
			var vm = this;
			if(confirm('确认删除')) {
				//删除则发送ajax
				$.ajax({
					url:'/admin/delGoods',
					type: 'post',
					data: {			
						GoodsID: vm.goData[vm.nowIndex]['GoodsID'],
					},
					success: function(res) {
						//vue因defineProperty不能动态监听数组内部变化
						//下方法为hack解决方式
						vm.goData.splice(vm.nowIndex,1);

						alert('删除成功');
					}
				});
			}
			else {

			}
		},
		sbAdd() {
			var vm = this;
			$.ajax({
				url: '/admin/addGoods',
				data: {
					GoodsID:vm.addData.GoodsID,
					GoodsName:vm.addData.GoodsName,
					GoodsPrice:vm.addData.GoodsPrice,
					GoodsDescription:vm.addData.GoodsDescription,
					CategoryID:vm.addData.CategoryID
				},
				type: 'post',
				success: function(res) {
					if(res.errcode == 0) {
						//再次请求数据以刷新
						$.ajax({
							url: '/admin/getGoods',
							type: 'get',
							success: function (res) {
								if (res.errcode) {
									if (res.errcode != 0) {
										alert(res.errmsg);
										window.open('/admin', '_top');
									}
								}
								vm.goData = res;
								for(var item of vm.goData) {
									item.GoodsPictureUrl = '/img/' + item.GoodsPicture + '.jpg';
								}
							}
						});
					}
					else {
						if(errcode == 1) {
							//权限不足
							alert('权限不足或没有登录');
						}
						else {
							//添加失败
							alert('添加失败');
						}
					}
				},
			});
		},
		logout() {
			$.ajax({
				url: '/users/logout',
				type: 'get',
				success: function (res) {
					alert('登出成功');
					window.open('/admin', '_top');
				}
			});
		}
	},
	created: function() {
		var vm = this;
		$.ajax({
			url: '/admin/getGoods',
			type: 'get',
			success: function (res) {
				if (res.errcode) {
					if (res.errcode != 0) {
						alert(res.errmsg);
						window.open('/admin', '_top');
					}
				}
				vm.goData = res;
				for(var item of vm.goData) {
					item.GoodsPictureUrl = '/img/' + item.GoodsPicture + '.jpg';
				}
			}
		});
	}
});
