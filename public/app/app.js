;(function(){
function authInterceptor(API, auth) {
  return {
    // automatically attach Authorization header
    request: function(config) {
      return config;
    },

    // If a token was sent back, save it
    response: function(res) {
      return res;
    },
	  
	response: function(res) {
	  if(res.config.url.indexOf(API) === 0 && res.data.token) {
		auth.saveToken(res.data.token);
	  }

	  return res;
	},
	request: function(config) {
	  var token = auth.getToken();
	  if(config.url.indexOf(API) === 0 && token) {
		config.headers.Authorization = 'Bearer ' + token;
	  }

	  return config;
	},
  }
}

function authService($window) {
  var self = this;

  // Add JWT methods here
  self.parseJwt = function(token) {
	  var base64Url = token.split('.')[1];
	  var base64 = base64Url.replace('-', '+').replace('_', '/');
	  return JSON.parse($window.atob(base64));
  }
  self.saveToken = function(token) {
    $window.localStorage['jwtToken'] = token;
  }
  
  self.getToken = function() {
    return $window.localStorage['jwtToken'];
  }
  self.isAuthed = function() {
  var token = self.getToken();
	  if(token) {
		var params = self.parseJwt(token);
		return Math.round(new Date().getTime() / 1000) <= params.exp;
	  } else {
		return false;
	  }
  }
  self.logout = function() {
  	$window.localStorage.removeItem('jwtToken');
  }
  
  
}

function userService($http, API, auth) {
  var self = this;
  self.getQuote = function() {
    return $http.get(API + '/auth/quote')
  }

  // add authentication methods here
  self.register = function(username, password) {
	  return $http.post(API + '/auth/register', {
		  username: username,
		  password: password
		})
  }

  self.login = function(username, password) {
	  return $http.post(API + '/auth/login', {
		  username: username,
		  password: password
		})
  };
}

function MainCtrl(user, auth) {
  var self = this;

  function handleRequest(res) {
    var token = res.data ? res.data.token : null;
    if(token) { console.log('JWT:', token); }
    self.message = res.data.message;
  }

  self.login = function() {
    user.login(self.username, self.password)
      .then(handleRequest, handleRequest)
  }
  self.register = function() {
    user.register(self.username, self.password)
      .then(handleRequest, handleRequest)
  }
  self.getQuote = function() {
    user.getQuote()
      .then(handleRequest, handleRequest)
  }
  self.logout = function() {
    auth.logout && auth.logout()
  }
  self.isAuthed = function() {
    return auth.isAuthed ? auth.isAuthed() : false
  }
}

angular.module('betgrade', ['ui.bootstrap'])
.factory('authInterceptor', authInterceptor)
.service('user', userService)
.service('auth', authService)
.constant('API', 'http://test-routes.herokuapp.com')
.config(function($httpProvider) {
  $httpProvider.interceptors.push('authInterceptor');
})
.directive('modalDirective', function(){
    return{
        controller: function($scope, $uibModal){
            $scope.animationsEnabled = true;
            $scope.open = function (size) {
            var modalInstance = $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: 'betslip.html',
            controller: 'ModalInstanceCtrl',
            size: size,
            });
	       };

	  $scope.toggleAnimation = function () {
	    $scope.animationsEnabled = !$scope.animationsEnabled;
	  };
      }
    }
})
.directive('listDirective', function(){
    return{
        controller: function($scope){
            $scope.csseShow = true;
            $scope.csShow = false;
            $scope.ctShow = false;
            
            $scope.csse = function(){
                if($scope.csShow || $scope.ctShow){
                    $scope.csShow = false;
                    $scope.ctShow = false;
                    $scope.csseShow = true;
                }
            }
            $scope.cs = function(){
                if($scope.csseShow || $scope.ctShow){
                    $scope.csShow = true;
                    $scope.ctShow = false;
                    $scope.csseShow = false;
                }
            }
            $scope.ct = function(){
                if($scope.csseShow || $scope.csShow){
                    $scope.csShow = false;
                    $scope.csseShow = false;
                    $scope.ctShow = true;
                }
            }
        }
    }
})
.controller('ModalInstanceCtrl', function ($scope, $uibModalInstance) {

    $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
    };

})
.controller('Main', MainCtrl)
})();