jQuery.ajaxSettings.traditional = true;
var vm = new Vue({
	el:'#app',
	data: {
		ordArry: [
			
		]
	},
	created: function() {
		var vm = this;
		$.ajax({
			url:'/store/getOrder',
			type:'get',
			success: function (res) {
				if (res.errcode) {
					if (res.errcode != 0) {
						alert(res.errmsg);
						window.open('/', '_top');
					}
				}
				if(res.length != 0) {
					vm.ordArry = [];
					for (var item in res) {
						vm.ordArry.unshift(res[item]);
					}
				}
			}
		})
	}
});