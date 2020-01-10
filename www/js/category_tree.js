var appCategoryTree = angular.module('App.categoryTree', []);

appCategoryTree.directive('categoryTree', function() {
    return {
        restrict: 'E',
        scope: {
            title: '@',
            categories: '='
        },
        replace: false,
        templateUrl: 'templates/category_tree.html',
        controller: ['$scope','$ionicSideMenuDelegate', '$state', '$stateParams', '$ionicHistory','$ionicActionSheet','$localStorage','AuthService',function($scope, $ionicSideMenuDelegate, $state, $stateParams, $ionicHistory,$ionicActionSheet, $localStorage,AuthService) {
            // Use ui-router's state to specify the active menu item
            var CATEGORY_STATE = 'App.page';

             $scope.broadcast = $localStorage.userData.data.broadcast;
             //$scope.broadcast = false;

            $scope.checkLink = function(cat) {


                if (angular.isUndefined(cat.items) || cat.items.length == 0) {

                    if (cat.type=="Settings") {
                        //$scope.toggleLeft();
                        $ionicSideMenuDelegate.toggleLeft();
                        $state.go(cat.url);
                    }
                    else if (cat.type=="page") {
                        //$scope.toggleLeft();
                        $ionicSideMenuDelegate.toggleLeft();
                        $state.go('App.wppage', {'pageid':cat.url});
                        //$state.go('App.home');
                    } 

                    else if (cat.type=="subsub") {

                    } 
                    else {
                       $scope.toggleLeft();
                     // alert("test");
                    // $state.go('App.page');
                      
                     
                     // $scope.toggleLeft();
                      //$ionicHistory.nextViewOptions({
                         // disableBack: true
                      //});
                    }
                }
              }

            $scope.isActive = function(cat) {
                if ($state.includes(CATEGORY_STATE) && $stateParams.id == cat.id) {
                    return 'active';
                }
            }

            $scope.toggleCat = function(cat) {
                $scope.checkLink(cat);

                if ($scope.isCatShown(cat)) {
                    $scope.activeCat = null;
                } else {
                    $scope.activeCat = cat;
                }
                $scope.activeSubCat = null;// Also hide all subCats
            };

            $scope.isCatShown = function(cat) {
                return $scope.activeCat === cat;
            };

            $scope.toggleSubCat = function(cat) {
                $scope.checkLink(cat);

                if ($scope.isSubCatShown(cat)) {
                    $scope.activeSubCat = null;
                } else {
                    $scope.activeSubCat = cat;
                }
            };

            $scope.isSubCatShown = function(cat) {
                return $scope.activeSubCat === cat;
            };

            $scope.toggleLeft = function() {
                $ionicSideMenuDelegate.toggleLeft();
            };
                                  // Triggered on a the logOut button click
              $scope.showLogOutMenu = function() {

                // Show the action sheet
                var hideSheet = $ionicActionSheet.show({
                  //Here you can add some more buttons
                  // buttons: [
                  // { text: '<b>Share</b> This' },
                  // { text: 'Move' }
                  // ],
                  destructiveText: 'Logout',
                  titleText: 'Are you sure you want to logout? This app is awsome so I recommend you to stay.',
                  cancelText: 'Cancel',
                  cancel: function() {
                    // add cancel code..
                  },
                  buttonClicked: function(index) {
                    //Called when one of the non-destructive buttons is clicked,
                    //with the index of the button that was clicked and the button object.
                    //Return true to close the action sheet, or false to keep it opened.
                    return true;
                  },
                  destructiveButtonClicked: function(){
                    //Called when the destructive button is clicked.
                    //Return true to close the action sheet, or false to keep it opened.

                    AuthService.logOut();
                   
                     $state.go('welcome');
                     //alert("ddd");
                  }
                });
              };
        }]
    }
});
