angular.module('App.user');
.controller('ChannelsCtrl', function($scope,$http) {


  // You can change this url to experiment with other endpoints
  var postsApi = 'http://v-life.co/wp-json/wp/v2/channels?_jsonp=JSON_CALLBACK';



 // This should go in a service so we can reuse it
  $http.jsonp(postsApi).
    success(function(data, status, headers, config) {
      $scope.posts = data;
      console.log( data );
    }).
    error(function(data, status, headers, config) {
      console.log( 'Post load error.' );
    });

});
.controller('ChannelCtrl', function($scope, $stateParams, $sce, $http) {

  // You can change this url to experiment with other endpoints
  var postsApi = 'http://v-life.co/wp-json/wp/v2/posts?filter[cat]='+ $stateParams.postId +'&_jsonp=JSON_CALLBACK';
  var catinfo = 'http://v-life.co/wp-json/wp/v2/categories/'+ $stateParams.postId +'/?&_jsonp=JSON_CALLBACK';
  $http.jsonp( catinfo ).
    success(function(data, status, headers, config) {
      $scope.catinfo = data;
      console.log( data );
    }).
    error(function(data, status, headers, config) {
      console.log( 'catinfo load error.' );
    });

  // This should go in a service so we can reuse it
  $http.jsonp( postsApi ).
    success(function(data, status, headers, config) {
      $scope.posts = data;
      console.log( data );
    }).
    error(function(data, status, headers, config) {
      console.log( 'Post load error.' );
    });

});



.controller('PostCtrl', function($scope, $stateParams, $sce, $http) {

  // we get the postID from $stateParams.postId, the query the api for that post
   
   var catinfo = 'http://v-life.co/wp-json/wp/v2/categories/'+ $stateParams.catId +'/?&_jsonp=JSON_CALLBACK';
  $http.jsonp( catinfo ).
    success(function(data, status, headers, config) {
      $scope.catinfo = data;
      console.log( data );
    }).
    error(function(data, status, headers, config) {
      console.log( 'catinfo load error.' );
    });


  var singlePostApi = 'http://v-life.co/wp-json/wp/v2/posts/' + $stateParams.postId + '?_jsonp=JSON_CALLBACK';
 
  $http.jsonp( singlePostApi ).
    success(function(data, status, headers, config) {
      $scope.post = data;
 
      // must use trustAsHtml to get raw HTML from WordPress
      $scope.content = $sce.trustAsHtml(data.content);
 
    }).
    error(function(data, status, headers, config) {
      console.log( 'Single post load error.' );
    });


});

//LOGIN
.controller('LoginCtrl', function($scope, $state, $ionicLoading, AuthService) {
  $scope.user = {};

  $scope.doLogin = function(){

    $ionicLoading.show({
      template: 'Logging in...'
    });

    var user = {
      userName: $scope.user.userName,
      password: $scope.user.password
    };

    AuthService.doLogin(user)
    .then(function(user){
      //success
      $state.go('.home');

      $ionicLoading.hide();
    },function(err){
      //err
      $scope.error = err;
      $ionicLoading.hide();
    });
  };
})


// FORGOT PASSWORD
.controller('ForgotPasswordCtrl', function($scope, $state, $ionicLoading, AuthService) {
  $scope.user = {};

  $scope.recoverPassword = function(){

    $ionicLoading.show({
      template: 'Recovering password...'
    });

    AuthService.doForgotPassword($scope.user.userName)
    .then(function(data){
      if(data.status == "error"){
        $scope.error = data.error;
      }else{
        $scope.message ="Link for password reset has been emailed to you. Please check your email.";
      }
      $ionicLoading.hide();
    });
  };
})


// REGISTER
.controller('RegisterCtrl', function($scope, $state, $ionicLoading, AuthService) {
  $scope.user = {};

  $scope.doRegister = function(){

    $ionicLoading.show({
      template: 'Registering user...'
    });

    var user = {
      userName: $scope.user.userName,
      password: $scope.user.password,
      email: $scope.user.email,
      displayName: $scope.user.displayName
    };

    AuthService.doRegister(user)
    .then(function(user){
      //success
      $state.go('.home');
      $ionicLoading.hide();
    },function(err){
      //err
      $scope.error = err;
      $ionicLoading.hide();
    });
  };
})

// HOME - GET RECENT POSTS
.controller('HomeCtrl', function($scope, $rootScope, $state, $ionicLoading, PostService) {
  $scope.posts = [];
  $scope.page = 1;
  $scope.totalPages = 1;

  $scope.doRefresh = function() {
    $ionicLoading.show({
      template: 'Loading...'
    });

    //Always bring me the latest posts => page=1
    PostService.getRecentPosts(1)
    .then(function(data){

      $scope.totalPages = data.pages;
      $scope.posts = PostService.shortenPosts(data.posts);

      $ionicLoading.hide();
      $scope.$broadcast('scroll.refreshComplete');
    });
  };

  $scope.loadMoreData = function(){
    $scope.page += 1;

    PostService.getRecentPosts($scope.page)
    .then(function(data){
      //We will update this value in every request because new posts can be created
      $scope.totalPages = data.pages;
      var new_posts = PostService.shortenPosts(data.posts);
      $scope.posts = $scope.posts.concat(new_posts);

      $scope.$broadcast('scroll.infiniteScrollComplete');
    });
  };

  $scope.moreDataCanBeLoaded = function(){
    return $scope.totalPages > $scope.page;
  };

  $scope.sharePost = function(link){
    PostService.sharePost(link);
  };

  $scope.bookmarkPost = function(post){
    PostService.bookmarkPost(post);
  };

  $scope.doRefresh();

})
