angular.module('betgrade', ['ui.bootstrap'])

.controller('ModalCtrl', function ($scope, $uibModal) {
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

})
.controller('ModalInstanceCtrl', function ($scope, $uibModalInstance) {

    $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
    };

})