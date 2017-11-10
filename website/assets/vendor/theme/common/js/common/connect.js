(function(Y){
	/**
	 * 登录接口
	 * @type {Object}
	 */
	Y.cgiLoginAccount = {
		list: function(data, callback, opts) {
			data = data || {};
			data.page_size = 10000;
			return P.rest.GET('http://'+ P.config.API_HOST +'/account/user-accounts', data, callback, opts);
		},

		bind: function(data, callback, opts) {
			return P.rest.PUT('http://'+ P.config.API_HOST +'/account/user-accounts/' + data.account_id, data, callback, opts);
		}
	};

	Y.cgiCommonAuth = {
		logout: function(data, callback, opts) {
			return P.rest.POST('http://'+ P.config.API_HOST +'/auth/logout', data, callback, opts);
		},

		refresh: function(data, callback, opts) {
			return P.rest.POST('http://'+ P.config.API_HOST +'/auth/refresh', data, callback, opts);
		}
	};

	/**
	 * 用户信息接口
	 * @type {Object}
	 */
	Y.cgiCommonUser = {
		info: function(data, callback, opts) {
			data = data || {};
			return P.rest.GET('http://'+ P.config.API_HOST +'/user/users/'+ data.user_id, data, callback, {
				ignoreError: true
			});
		}
	};

})(Y);

/**
 *  * Y.modModule.xxx
 *   * @param  {[type]} Y [description]
 *    * @return {[type]}   [description]
 *     */
(function(Login, Y) {
	function initMessages() {
	}

	function initLoginInfo() {
		var userId, accountId, name, local;

		accountId = Y.vars.account_id||Y.vars.advertiser_id;
		userId = (P.storage.get('auth', 'local')||{}).id;
		local = (P.storage.get('userAccount|'+userId+'|'+accountId, 'local') || {});

		if (userId) {
			$('#labelAccountName').text(local['accountName'] || '');
			$('#btnLogout').closest('li').parent().closest('li').removeClass('invisible');

			$('#linkSwitchAccount').attr('href', '/connect/account?user_id='+ userId);
		} else {
			location.href = '//'+ location.host;
		}
	}

	function initDropdownMenu() {
		$('#labelMoreMenu').click(switchGlyph);
		$('#labelAccountName').click(switchGlyph);

		$('.navbar-dropdown-menu li').click(hideNavbarDropdownMenu);
		$('.navbar-dropdown-menu').on('mouseleave', hideNavbarDropdownMenu);
	}

	function initPageEvents() {
		$('#btnLogout').click(function() {
			P.confirm('确认退出系统吗？', function(rt){
				if(rt){
					Y.cgiCommonAuth.logout({}, function(d){
						if (d.code === 0) {
							var accountId = Y.vars.account_id||Y.vars.advertiser_id,
								userId = (P.storage.get('auth', 'local')||{}).id;

							P.storage.del('userAccount|'+userId+'|'+accountId, 'local');
							P.storage.del('auth', 'local');

							location.href = d.data.login_url;
						} else {
							P.alert(d.message);
						}
					});
				}
			});

			return false;
		});
	}
		
	function switchGlyph() {
		if ($('#labelMoreMenu')) {
			$('#labelMoreMenu').hasClass('glyphicon-chevron-down') ? 
				$('#labelMoreMenu').removeClass('glyphicon-chevron-down').addClass('glyphicon-chevron-up') :
				$('#labelMoreMenu').removeClass('glyphicon-chevron-up').addClass('glyphicon-chevron-down');
			$('#labelMoreMenu').next().toggleClass('hide');
		}
	}

	function hideNavbarDropdownMenu() {
		$('#labelMoreMenu').removeClass('glyphicon-chevron-up').addClass('glyphicon-chevron-down');
		$('.navbar-dropdown-menu').addClass('hide');
	}

	function showUserProfile() {
		var wrap = $('#labelAccountName'), userId;

		userId = (P.storage.get('auth', 'local')||{}).id;
		if (userId && wrap.size() > 0) {
			Y.cgiCommonUser.info({user_id: userId}, function(d){
				if (d.code === 0) {
					d.data.email && wrap.append(' <small>('+ d.data.email +')</small>');
				} else {
					// 非关键路径，忽略
				}
			});
		}
	}

	function tokenRefresh() {
		var currentTime = Y.vars ? (Y.vars.current_time) : '',
			expireTime = (P.storage.get('auth', 'local')||{}).expire;

		// 有效期小于9分钟则自动续期
		/*if (currentTime>0 && expireTime>0 && (expireTime - currentTime)>0 && (expireTime - currentTime)<540000) {
			Y.cgiCommonAuth.refresh({}, function(d){
				if (d.code===0 && d.data.refresh===1) {
					P.storage.set('auth', {
						id: d.data.user_id,
						token: d.data.access_token,
						expire: d.data.expires_at*1000
					}, {media: 'local', expire: 4*60*60*1000});	// 4h expire
				}
			});
		}*/
	}

	Login.init = function() {
		var accountId = Y.vars.account_id || Y.vars.advertiser_id;
		// url不包含accountId的，则不获取账户信息
		if (accountId && location.pathname.indexOf(accountId) >= 0) {
			initLoginInfo();
			initDropdownMenu();
			showUserProfile();
			initMessages();
			setTimeout(function(){
				tokenRefresh();
			}, 3000);
		}

		initPageEvents();
	};

	Login.init();

})(Y.modLogin = {}, Y);


(function(LoginAccount, Y) {
	function bindAccount(userId, accountId, accountName, sign) {
		Y.cgiLoginAccount.bind({
			user_id: userId,
			account_id: accountId,
			sign: sign||''
		}, function(d){
			var result;
			if (d.code === 0) {
				result = d.data;

				P.storage.set('userAccount|'+userId+'|'+accountId, {
					accountName: accountName,
					sign: result.sign
				}, {media: 'local', expire: 4*60*60*1000});	// 4h expire
				// 选择账户完成
				var homepage = Y.vars.homepage||'http://{HOST}/{ACCOUNT_ID}/';

				homepage = homepage.replace(/\{HOST\}/g, location.host)
									.replace(/\{ACCOUNT_ID\}/g, accountId);
				location.href = homepage;
			} else {
				P.alert(d.message);
			}
		});
	}

	LoginAccount.init = function() {
		var userId = $.cookie.get('user_id'),	// 此处为加密的id，其他地方不应该读这个值
			accessToken = $.cookie.get('access_token'),  // 其余地方不应该读cookie
			expireTime = $.cookie.get('expires_at'),
			accountNameMapping = {};

		P.storage.set('auth', {
			id: userId,
			token: accessToken,
			expire: expireTime ? expireTime*1000 : 0
		}, {media: 'local', expire: 4*60*60*1000});	// 4h expire

		// 存在id则不强制刷新，否则获取一次
		if (userId) {
			Y.cgiLoginAccount.list({user_id: userId}, function(d, context){
				var wrap = $('#wrapAccountList');
				if (d.code === 0) {
					d.data.list = d.data.list || [];
					$.each(d.data.list, function(i, v){
						accountNameMapping[v.account_id] = v.account_name;
					});

					// 如果取url的account_id，则要取sign，确保不被篡改
					var preferAccountId = P.util.getUrlParams('account_id'),
						sign = P.util.getUrlParams('sign');

					if (preferAccountId && sign) {
						bindAccount(userId, preferAccountId, accountNameMapping[preferAccountId], sign);
					} else if (d.data.list.length === 1 && !Y.vars.dev) {
						// 只有一个account，内部逻辑可以直接跳走
						preferAccountId = d.data.list[0].account_id,
						bindAccount(userId, preferAccountId, accountNameMapping[preferAccountId]);
					} else {
						// 去掉重复的account
						var list = [],
							mapping = {};
						$.each(d.data.list, function(i, v){
							if (! mapping[v.account_id]) {
								mapping[v.account_id] = true;
								list.push(v);
							}
						});
						if(!list.length ){
							wrap.html('<div class="list-group"><a href="javascript:;" class="list-group-item">暂无此系统对应账户</a></div>')
						}else{
							wrap.html(P.util.tmpl('tplAccountList', {list:list}));

							wrap.delegate('a', 'click', function(){
								var data = $(this).data();
								bindAccount(userId, data.account_id, accountNameMapping[data.account_id]);
							});
						}
						$('#wrapBox').show();
					}
				} else {
					wrap.html(d.message +' <a href="javascript:;" id="'+ context.retryId +'">点击重试</a>');
				}
			});
		} else {
			P.alert('请先登录', function(){
				Y.util.goBack();
			});
		}
	};
})(Y.modConnectAccount = {}, Y);
