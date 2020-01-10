var appWelcome = angular.module('App.welcome', []);


appWelcome.controller('welcomeCtrl', function($scope, $ionicModal, $timeout) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  // Form data for the login modal
  $scope.loginData = {};

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modalLogin = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modalLogin.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modalLogin.show();
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };

  // Brnad new
  // Create Fucking modal
  // Signup
  $scope.signupData = {};

  $ionicModal.fromTemplateUrl('templates/signup.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modalSignup = modal;
  });

  $scope.closeSignup = function() {
    $scope.modalSignup.hide();
  };

  $scope.btnTest = function() {  
    console.log(12312)
  };

  $scope.signup = function() {  
    $scope.modalSignup.show();
  };

  $scope.doSignup = function() {
    //console.log('Doing Signup', $scope.notificationsData);
    $timeout(function() {
      $scope.closeSignup();
    }, 1000);
  };

});
