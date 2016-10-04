app.config(function($stateProvider)){
		   
    $stateProvider
		   .state('index', {
				url: '/index',
				data: {
					requireLogin: false
				}
			})
			.state('register', {}})
}