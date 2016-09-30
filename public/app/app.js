var app = angular.module('betgrade', ['ui.bootstrap']);

app.controller('MyCtrl', function($scope) {
    $scope.name = 'Cieran';
};

app.controller('ModalCtrl', function ($scope, $uibModal) {
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

});

app.controller('ModalInstanceCtrl', function ($scope, $uibModalInstance) {

    $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
    };

});