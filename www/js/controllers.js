var app = angular.module('App.controllers', ['ngSanitize', 'ionic-datepicker', 'ionic.closePopup']);

// app.controller('welcomeCtrl', function($scope) {});
app.controller('welcomeCtrl', function($scope, $state, $http, $cordovaGeolocation, $cordovaDatePicker, $ionicActionSheet, ionicDatePicker, $cordovaCamera, $cordovaFile, $rootScope, $ionicModal, $timeout, $ionicLoading, AuthService, UserService, $ionicPopup, $ionicNavBarDelegate, $ionicSlideBoxDelegate, $localStorage, $location, User, $ionicScrollDelegate) {
    

    $scope.loginData = {};
    $scope.signupData = {};
    $scope.selectedOptions = {};
    // Create the login modal that we will use later
    $ionicModal.fromTemplateUrl('templates/login.html', {
        scope: $scope
    }).then(function(modal) {
        $scope.modalLogin = modal;
    });

    $scope.calender = function() {
        ionicDatePicker.openDatePicker(ipObj1);
    };
    $scope.openmapModal = function() {
        $scope.modal4.show();
        setTimeout(function() { //here!

            if (WelcomeData.data.country_name == 'China') {
                getPositionAndShowOnMapBaidu();
            } else {
                getPositionAndShowOnMap();
            }
        }, 500);
    };


    $scope.$on('modal4.shown', function() {

    });

    $scope.closemapModal = function() {
        $scope.modal4.hide();
    };
    // Triggered in the login modal to close it
    $scope.closeLogin = function() {
        $scope.modalLogin.hide();
    };
    // Open the login modal
    $scope.login = function() {
        console.log("click login page");
        
        $scope.modalLogin.show();
    };
    // Perform the login action when the user submits the login form

    $scope.doLogin = function() {

        $ionicLoading.show({
            template: 'Logging in...'
        });
        var user = {
            userName: $scope.loginData.username,
            password: $scope.loginData.password
        };
               
        AuthService.doLogin(user).then(function(user) {
            console.log("response login access", user);
            //success
            $ionicLoading.hide();
            $scope.modalLogin.hide();
            $state.go('App.home');
        }, function(err) {
            //err
            $scope.error = err;
            $ionicLoading.hide();
            $scope.modalLogin.hide();
            var alertPopup = $ionicPopup.alert({
                title: 'Something went wrong!',
                template: 'Please check your user name & password again'
            });
        });
        // Simulate a login delay. Remove this and replace with your login
        // code if using a login system
        $timeout(function() {
            //$scope.closeLogin();
        }, 1000);
        $timeout(function() {
            // $state.go('App.home');
        }, 2000);
    };
    // Brnad new
    // Create Fucking modal
    // Signup
    //commented 02-10-2019
   // $scope.signupData = {};
    $ionicModal.fromTemplateUrl('templates/signup.html', {
        scope: $scope
    }).then(function(modal) {
        $scope.modalSignup = modal;
    });
    $scope.closeSignup = function() {
        $scope.modalSignup.hide();
    };
    $scope.signup = function() {
        $scope.modalSignup.show();
    };
    $scope.doSignup = function() {
        // $state.go('intro');
                
        $ionicLoading.show({
            template: 'Checking user.....'
        });
        AuthService.checkUser($scope.signupData.username).then(function(data) {
            //success
            if (data.status == 'error') {
                $scope.signupData.notification = "Username already exists";
                $ionicLoading.hide();
            } else {
                $ionicLoading.hide();
                $rootScope.username = $scope.signupData.username;
                $rootScope.password = $scope.signupData.password;                
                $scope.closeSignup();
                $scope.signupData.notification = false;
                $state.go('intro');
            }
        }, function(err) {
            //console.log(err);
            $scope.error = err;
            $ionicLoading.hide();
            var alertPopup = $ionicPopup.alert({
                title: 'Something went wrong!',
                template: err
            });
        });
    };
    $scope.lockSlide = function() {
        $ionicSlideBoxDelegate.enableSlide(true);
    }

    // hide back butto
    $ionicNavBarDelegate.showBackButton(false);
    // Called to navigate to the main appaddComment
    $scope.startApp = function() {
        $state.go('App.home');
    };
    $scope.goback = function() {
        $state.go('welcome');
    };

    $scope.check = function(current) {
        $rootScope.refer = current;
        angular.forEach($scope.userlist.userlist, function(subscription, index) {
            if (current != subscription.affid) {
                $scope.selectedOptions[subscription.affid] = false;
            } else {
                $scope.selectedOptions[subscription.affid] = true;
            }
        });
    };
    $scope.next = function() {
        $ionicSlideBoxDelegate.next();
    };
    $scope.previous = function() {
        $ionicSlideBoxDelegate.previous();
    };
    // Called each time the slide changes
    $scope.slideChanged = function(index) {
        $scope.slideIndex = index;
       // console.log(index);
    };

    $scope.getavatar = function(id) {

        var user = User(id).getAvatar();
        return user;
    };

    $scope.gotoSlide = function(number) {
        $scope.$broadcast('slideBox.setSlide', number);
    }
    $scope.moreuserdata = false;


    // Controller
    $scope.onChatScroll = ionic.debounce(function(top) {

        var currentTop = $ionicScrollDelegate.$getByHandle('handler').getScrollPosition().top;
        var maxScrollableDistanceFromTop = $ionicScrollDelegate.$getByHandle('handler').getScrollView().__maxScrollTop;

        if (currentTop >= maxScrollableDistanceFromTop && !$scope.moreuserdata) {
            $ionicLoading.show();
            $scope.loadmoreuser();
        }

    }, 500);


    $scope.scrollTop = function() {
        $ionicLoading.show({
            template: 'Please wait..'
        });
        $scope.serachmoreuser();
        $ionicScrollDelegate.resize();
    };

    $scope.search = {};

    $scope.serachmoreuser = function() {
        //console.log("loading more");
        UserService.searchuser($scope.search.string).then(function(data) {
            //alert($scope.search.string);
            $scope.userlist = data;
            $ionicLoading.hide();
        });
    };
    $scope.loadmoreuser = function() {
        $scope.page += 1;
        UserService.getuser($scope.page).then(function(data) {
            if (data.userlist == null) {
                $scope.moreuserdata = true;
            } else {
                angular.forEach(data.userlist, function(child) {
                    $scope.userlist.userlist[child.id] = child;
                });
            }
            $ionicLoading.hide();
        });
    };
    $scope.addMedia = function() {

        $scope.hideSheet = $ionicActionSheet.show({
            buttons: [{
                text: 'Take photo'
            }, {
                text: 'Photo from library'
            }],
            buttons: [{
                text: 'Photo from library'
            }],            
            titleText: 'Add images',
            cancelText: 'Cancel',
            buttonClicked: function(index) {
                $scope.addImage(index);
            }
        });
    };
    $scope.addImage = function(type) {
       
        switch (type) {
            case 0:
                $scope.takePhoto();
                break;
            case 1:
                $scope.getPhoto();
                break;
        }        
        $scope.hideSheet();
        var source;

    };
    $scope.inputPicture = {
        "type": "picture"
    };
    $scope.takePicture = function() {
        $ionicTabsDelegate.select(1);
        var options = {
            quality: 75,
            allowEdit: true,
            targetWidth: 160,
            targetHeight: 160,
            destinationType: 0
        };
        Camera.getPicture(options).then(function(imageData) {
            $scope.inputPicture.content = "data:image/jpeg;base64," + imageData;
        }, function(err) {
          //  console.log(err);
        });
    };
    $scope.takePhoto = function() {
        
        var options = {
            quality: 75,
            destinationType: 0,
            sourceType: Camera.PictureSourceType.CAMERA,            
            allowEdit: true,
            encodingType: Camera.EncodingType.JPEG,
            targetWidth: 160,
            targetHeight: 160,
            popoverOptions: CameraPopoverOptions,
            saveToPhotoAlbum: false,
            correctOrientation: true                      
        };
        uploadPicture(options);
    };
    $scope.getPhoto = function() {
        var options = {
            quality: 50,
            destinationType: 0,
            sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
            allowEdit: true,
            encodingType: Camera.EncodingType.JPEG,
            targetWidth: 1024,
            targetHeight: 768,
            popoverOptions: CameraPopoverOptions,
            saveToPhotoAlbum: false,
            correctOrientation: true
        };
        uploadPicture(options);
    };

    function uploadPicture(options) {
        $cordovaCamera.getPicture(options).then(function(sourcePath) {
            $scope.uploadedImage = "data:image/jpeg;base64," + sourcePath;
        }, function(err) {
            console.log(err);
        });
    };
    $scope.updateSelection = function(position, entities) {
        angular.forEach(entities, function(subscription, index) {
            if (position != index) subscription.checked = false;
        });
    }
});


//welcome2
app.controller('welcomeCtrl2', function($scope, $state, $http, $cordovaGeolocation, $cordovaDatePicker, $ionicActionSheet, ionicDatePicker, $cordovaCamera, $cordovaFile, $rootScope, $ionicModal, $timeout, $ionicLoading, AuthService, UserService, $ionicPopup, $ionicNavBarDelegate, $ionicSlideBoxDelegate, $localStorage, $location, User, $ionicScrollDelegate, WelcomeData) {

    $scope.loginData = {};
    $scope.signupData = {};
    $scope.selectedOptions = {};

    $ionicModal.fromTemplateUrl('templates/map.html', {
        scope: $scope,
        controller: 'welcomeCtrl2',
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.modal4 = modal;
    });
    var ipObj1 = {
        callback: function(val) { //Mandatory
            $scope.signupData.bday = moment(val).format("DD/MM/YYYY");;
        }
    };
    $scope.calender = function() {
        ionicDatePicker.openDatePicker(ipObj1);
    };
    $scope.openmapModal = function() {
        $scope.modal4.show();
        setTimeout(function() { //here!
            if (WelcomeData.data.country_name == 'China') {
                getPositionAndShowOnMapBaidu();
            } else {
                getPositionAndShowOnMap();
            }
        }, 500);
    };


    $scope.$on('modal4.shown', function() {
        //$scope.signupData.address="ddd";
    });

    $scope.closemapModal = function() {
        $scope.modal4.hide();
    };
    // Triggered in the login modal to close it
    $scope.closeLogin = function() {
        $scope.modalLogin.hide();
    };

    $scope.lockSlide = function() {
        $ionicSlideBoxDelegate.enableSlide(false);
    }

    // hide back butto
    $ionicNavBarDelegate.showBackButton(false);
    // Called to navigate to the main appaddComment
    $scope.startApp = function() {
        $state.go('App.home');
    };
    $scope.goback = function() {
        $state.go('welcome');
    };

    $scope.doRegister = function() {
    $ionicLoading.show({
        template: 'Registering user...'
    });
    var user = {
        userName: $rootScope.fname,
        password: $rootScope.password,
        email: $rootScope.username,
        displayName: $rootScope.fname,
        address: $rootScope.address,
        first_name: $rootScope.fname,
        last_name: $rootScope.lname,
        //avatar:$scope.uploadedImage,
        country: $rootScope.country,
        gender: $rootScope.gender,
        bday: $rootScope.bday,
        phone: $rootScope.tel,
        refer: $rootScope.refer
    };
    AuthService.doRegister(user).then(function(data) {
        //success
        //console.log("xx"+user.use.id);
        User($localStorage.userLogin.id).editAvatar($scope.uploadedImage);
        $ionicLoading.hide();
        $state.go('App.home');
    }, function(err) {
        $ionicLoading.hide();
        //  console.log(err);
        $scope.error = err;
        $ionicLoading.hide();
        //  $ionicLoading.hide();
        var alertPopup = $ionicPopup.alert({
            title: 'Something went wrong!',
            template: err
        });
    });
    }; 

    $scope.next = function() {
        this.slides.slideNext();
    }

    $scope.prev= function() {
        this.slides.slidePrev();
    }    

    $scope.step1 = function() {

        if (window.cordova) {
            cordova.plugins.diagnostic.isLocationAvailable(
                function(e) {
                    if (e) {
                        $ionicSlideBoxDelegate.next();
                    } else {

                        var confirm = $ionicPopup.confirm({
                          title: 'Location',
                          template: 'Enable locationservices?',
                          cancelText: 'No',
                          okText: 'Yes'
                        });

                        confirm.then(function (confirmed) {
                          if (confirmed) {
                            try {
                              if (ionic.Platform.isIOS()) {
                                cordova.plugins.diagnostic.switchToSettings();
                              } else {
                                cordova.plugins.diagnostic.switchToLocationSettings();
                              }
                            } catch (err) {}
                          }
                        });
                                            
                    }
                },
                function(e) {
                    alert('Error ' + e);
                }
            );
        } else {
            $ionicSlideBoxDelegate.next(); //this for browser bcas_aff_subtabased
        }
        setTimeout(function() { //here!

            $scope.signupData.country = WelcomeData.data.country_name;
            if (WelcomeData.data.country_name == 'China') {
                defaultmapChina();
            } else {
                defaultmap();
            }
            //
        }, 500);

    };
    $scope.step2 = function() {

        if (!$scope.signupData.address) {
            $scope.signupData.notification = "Please enter data to continue";
            $ionicSlideBoxDelegate.next();
        } else {
            $scope.signupData.notification = false;
            $rootScope.address = $scope.signupData.address;
            $rootScope.country = $scope.signupData.country;
            $ionicSlideBoxDelegate.next();
        }
    };
    $scope.step3 = function() {
        if (!$scope.signupData.fname || !$scope.signupData.lname) {
            $scope.signupData.notification = "Please enter data to continue";
            alert("error");
        } else {
            $scope.signupData.notification = false;
            $rootScope.fname = $scope.signupData.fname;
            $rootScope.lname = $scope.signupData.lname;
            $ionicSlideBoxDelegate.next();
        }
    };
    $scope.step4 = function() {
        if (!$scope.signupData.bday) {
            $scope.signupData.notification = "Please enter data to continue";
            alert("error4");
        } else {
            $scope.signupData.notification = false;
            $rootScope.bday = $scope.signupData.bday;
            $rootScope.gender = $scope.signupData.gender;
            $ionicSlideBoxDelegate.next();
        }
    };
    $scope.step5 = function() {
        $ionicSlideBoxDelegate.next();
    };
    $scope.step6 = function() {
        $scope.signupData.notification = false;
        $rootScope.number = $scope.signupData.number;
        $rootScope.countrycode = $scope.signupData.countrycode;
        $rootScope.tel = $scope.signupData.countrycode + $scope.signupData.number;
        $ionicSlideBoxDelegate.next();
    };
    $scope.step7 = function() {
        $scope.page = 1;

        $ionicLoading.show({
            template: 'Please wait..'
        });
        UserService.getuser($scope.page).then(function(data) {
            $scope.userlist = data;
            $ionicLoading.hide();

        });
      
        $ionicSlideBoxDelegate.next();

    };
    $scope.step8 = function() {
        $ionicSlideBoxDelegate.next();
    };
    $scope.check = function(current) {
        $rootScope.refer = current;
        angular.forEach($scope.userlist.userlist, function(subscription, index) {

           // console.log(subscription.affid);
            if (current != subscription.affid) {
                $scope.selectedOptions[subscription.affid] = false;
            } else {
                $scope.selectedOptions[subscription.affid] = true;
                $scope.gotid = true;
            }
        });
    };
    $scope.next = function() {
        $ionicSlideBoxDelegate.next();
    };
    $scope.previous = function() {
        $ionicSlideBoxDelegate.previous();
    };
    // Called each time the slide changes
    $scope.slideChanged = function(index) {
        $scope.slideIndex = index;
       // console.log(index);
    };

    $scope.getavatar = function(id) {

        var user = User(id).getAvatar();
        return user;
    };


    function getPositionAndShowOnMap() {

        $scope.disableTap = function() {
            container = document.getElementsByClassName('pac-container');
            // disable ionic data tab
            angular.element(container).attr('data-tap-disabled', 'true');
            // leave input field if google-address-entry is selected
            angular.element(container).on("click", function() {
                document.getElementById('autocomplete').blur();
            });
        };

        $scope.initMap = function() {
            //alert("insode initmape");
            var posOptions = {
                enableHighAccuracy: true,
                timeout: 20000,
                maximumAge: 0
            };
            $cordovaGeolocation.getCurrentPosition(posOptions).then(function(position) {

                var center = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                var geocoder = new google.maps.Geocoder();
                var circle = new google.maps.Circle({
                    center: center,
                    radius: 50
                });
                var map = new google.maps.Map(document.getElementById('map'), {
                    center: center,
                    zoom: 13
                });
                var options = {
                    types: ['geocode']
                }
                var input = document.getElementById('autocomplete');
                //  map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
                var autocomplete = new google.maps.places.Autocomplete(input, options);
                autocomplete.setBounds(circle.getBounds());


                var infowindow = new google.maps.InfoWindow();



                var marker = new google.maps.Marker({
                    draggable: true,
                    position: center,
                    map: map,
                    title: "Your location"
                });
                autocomplete.addListener('place_changed', function() {
                    infowindow.close();
                    marker.setVisible(false);

                    var place = autocomplete.getPlace();
                    if (!place.geometry) {
                        window.alert("Autocomplete's returned place contains no geometry");
                        return;
                    }

                    // If the place has a geometry, then present it on a map.
                    if (place.geometry.viewport) {
                        map.fitBounds(place.geometry.viewport);
                    } else {
                        map.setCenter(place.geometry.location);
                        map.setZoom(17); // Why 17? Because it looks good.
                    }
                    marker.setIcon( /** @type {google.maps.Icon} */ ({
                        url: place.icon,
                        size: new google.maps.Size(71, 71),
                        origin: new google.maps.Point(0, 0),
                        anchor: new google.maps.Point(17, 34),
                        scaledSize: new google.maps.Size(35, 35)
                    }));
                    marker.setPosition(place.geometry.location);
                    marker.setVisible(true);

                    var address = '';
                    if (place.address_components) {
                        address = [
                            (place.address_components[0] && place.address_components[0].short_name || ''),
                            (place.address_components[1] && place.address_components[1].short_name || ''),
                            (place.address_components[2] && place.address_components[2].short_name || '')
                        ].join(' ');
                    }
                    $scope.$apply(function() {
                        $scope.signupData.address = place.name + address;
                    });
                    infowindow.setContent('<div><strong>' + place.name + '</strong><br>' + address);
                    infowindow.open(map, marker);
                });
                geocoder.geocode({
                    'latLng': center
                }, function(results, status) {
                    if (status == google.maps.GeocoderStatus.OK) {
                        if (results[0]) {
                            $scope.signupData.address = results[0].formatted_address;
                            $rootScope.add = results[0].formatted_address;
                            infowindow.setContent(results[0].formatted_address);
                            infowindow.open(map, marker);
                        }
                    }
                });
                google.maps.event.addListener(marker, 'dragend', function(event) {
                    geocoder.geocode({
                        'latLng': marker.getPosition()
                    }, function(results, status) {
                        if (status == google.maps.GeocoderStatus.OK) {
                            if (results[0]) {
                                $scope.signupData.address = results[0].formatted_address;
                                var components = {};
                                for (var i = 0; i < results[0].address_components.length; i++) {
                                    components[results[0].address_components[i].types[0]] = results[0].address_components[i].long_name;
                                }
                                if (!components['country']) {
                                    console.warn('Couldn\'t extract country');
                                } else {
                                    $scope.signupData.country = components['country'];
                                }

                                $scope.$apply(function() {
                                    $scope.signupData.address = results[0].formatted_address;
                                });
                                infowindow.setContent(results[0].formatted_address);
                                infowindow.open(map, marker);
                            }
                        }
                    });
                });

            });

        }
        google.maps.event.addDomListener(window, 'load', $scope.initMap);
        $scope.initMap();

    };

    function defaultmap() {
        var posOptions = {
            enableHighAccuracy: true,
            timeout: 20000,
            maximumAge: 0
        };

        $cordovaGeolocation.getCurrentPosition(posOptions).then(function(position) {
            $scope.curlat = position.coords.latitude;
            $scope.curlong = position.coords.longitude;
            $scope.initMap();
        }, function(err) {
            $scope.curlat = WelcomeData.data.latitude;
            $scope.curlong = WelcomeData.data.longitude;
            console.log(WelcomeData.data);
            $scope.initMap();
        });
        $scope.initMap = function() {

            var myLatlng = new google.maps.LatLng($scope.curlat, $scope.curlong);
            var geocoder = new google.maps.Geocoder();
            var infowindow = new google.maps.InfoWindow();
           // console.log('entered map');
            var myOptions = {
                zoom: 16,
                center: myLatlng,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            };

            geocoder.geocode({
                'latLng': myLatlng
            }, function(results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    if (results[0]) {
                        $scope.$apply(function() {
                            $scope.signupData.address = results[0].formatted_address;
                        });
                        var components = {};
                        for (var i = 0; i < results[0].address_components.length; i++) {
                            components[results[0].address_components[i].types[0]] = results[0].address_components[i].long_name;
                        }
                        if (!components['country']) {
                            console.warn('Couldn\'t extract country');
                            $scope.signupData.country = WelcomeData.data.country_name;
                        } else {
                            $scope.signupData.country = components['country'];
                        }

                    }
                }
            });
        };

        // });
    };


    function defaultmapChina() {

        var posOptions = {
            enableHighAccuracy: true,
            timeout: 20000,
            maximumAge: 0
        };

        $cordovaGeolocation.getCurrentPosition(posOptions).then(function(position) {
            $scope.curlat = position.coords.latitude;
            $scope.curlong = position.coords.longitude;
            $scope.initMap();
        }, function(err) {
            $scope.curlat = WelcomeData.data.latitude;
            $scope.curlong = WelcomeData.data.longitude;
            $scope.initMap();
        });
        $scope.initMap = function() {
            $http.jsonp('http://api.map.baidu.com/geocoder/v2/?callback=JSON_CALLBACK&location=' + $scope.curlat + ',' + $scope.curlong + '&output=json&ak=qHBO25Q4jOXGEReNbRytqsADr6AafshG')
                .success(function(data) {
                    $timeout(function() {
                        $scope.signupData.address = data.result.formatted_address;
                    });
                })
                .error(function(data) {
                    // deferred.reject(data);
                });
        };

    };




    function getPositionAndShowOnMapBaidu() {


        $scope.initMapChina = function() {

            //$scope.$watch('$viewContentLoaded', function(){

            $scope.map = new BMap.Map("map");
            var point = new BMap.Point($scope.curlat, $scope.curlong);
            $scope.map.centerAndZoom(point, 16);
            $scope.map.enableScrollWheelZoom();

            $a = document.getElementById("address").value;
            setPlace($a + " ");

            var marker = new BMap.Marker(point);
            marker.enableDragging(); //Marker drag
            marker.addEventListener('dragstart', function() {
                $scope.map.closeInfoWindow();
            });

            marker.addEventListener('dragend', function(e) {
                $http.jsonp('http://api.map.baidu.com/geocoder/v2/?callback=JSON_CALLBACK&location=' + e.point.lat + ',' + e.point.lng + '&output=json&ak=qHBO25Q4jOXGEReNbRytqsADr6AafshG')
                    .success(function(data) {
                        setPlace(data.result.formatted_address);
                    })
                    .error(function(data) {
                        // deferred.reject(data);
                    });

            });
            $scope.map.addOverlay(marker);

            $scope.address = [];
            $scope.ac = new BMap.Autocomplete( //建立一个自动完成的对象
                {
                    "input": "autocomplete",
                    "location": $scope.map
                });
            iptTrigger = document.getElementById("autocomplete");

            //删除多余的元素，但百度地图自动生成的js报错 报错并不影响提示功能  暂设置为隐藏多余元素
            function hideRestAcBox() {
                var elm = Array.prototype.slice.call(document.getElementsByClassName('tangram-suggestion-main'));
                if (elm.length) {
                    elm.forEach(function(v, i) {
                        //        v.parentNode.removeChild(v);
                        v.style.zIndex = -1;
                        v.style.visibility = 'hidden';
                    });
                    elm[elm.length - 1].style.zIndex = 999;
                    elm[elm.length - 1].style.visibility = 'visible';
                }
            }

            function hideAcBox() {
                var elm = Array.prototype.slice.call(document.getElementsByClassName('tangram-suggestion-main'));
                elm.forEach(function(v, i) {
                    v.style.zIndex = -1;
                    v.style.visibility = 'hidden';
                });
            }

            //输入框的值控制 提示信息列表容器显示隐藏
            function boxHide() {
                //console.log(this.value);
                if (this.value) {
                    if (keywords) { //发起某个关键字的提示请求，会引起onSearchComplete的回调
                        //ac.search.apply(ac, keywords);
                    }
                    hideRestAcBox();
                } else {
                    hideRestAcBox();
                }
            }

            iptTrigger.oninput = boxHide; //非ie
            iptTrigger.onpropertychange = boxHide; //ie


            var myValue;
            $scope.ac.addEventListener("onconfirm", function(e) { //鼠标点击下拉列表后的事件
                hideAcBox();
                var _value = e.item.value;
                myValue = _value.province + _value.city + _value.district + _value.street + _value.business;

                setPlace(myValue);
            });
            //http://www.cnblogs.com/puyongsong/p/6803463.html
            function setPlace(myValue) { // 创建地址解析器实例

                //$scope.map.clearOverlays(); 

                var myGeo = new BMap.Geocoder(); // 将地址解析结果显示在地图上,并调整地图视野
                myGeo.getPoint(myValue, function(point) {
                    if (point) {
                        //console.log(point.lat);
                        $scope.curlat = point.lat;
                        $scope.curlong = point.lng;
                        $scope.map.centerAndZoom(point, 16);
                        marker.setPosition(point);

                    }
                }, "北京");

                $timeout(function() {
                    $scope.signupData.address = myValue;
                    document.getElementById('autocomplete').blur();

                });

            };

        };

        var posOptions = {
            enableHighAccuracy: true,
            timeout: 20000,
            maximumAge: 0
        };

        if (typeof $scope.curlat === 'undefined') {
            $cordovaGeolocation.getCurrentPosition(posOptions).then(function(position) {
                $scope.curlat = position.coords.latitude;
                $scope.curlong = position.coords.longitude;
                $scope.initMapChina();
            }, function(err) {
                $scope.curlat = WelcomeData.data.latitude;
                $scope.curlong = WelcomeData.data.longitude;
                $scope.initMapChina();
            });
        } else {
            $scope.initMapChina();

        }



    };



    //tangram-suggestion-main

    $scope.disableTap = function() {

        var backdrop = document.getElementsByClassName('tangram-suggestion-main');
        angular.element(backdrop).attr('data-tap-disabled', 'true');

        var backdrop2 = document.getElementsByClassName('pac-container');
        angular.element(backdrop).attr('data-tap-disabled', 'true');

        angular.element(backdrop2).on("click", function() {
            document.getElementById('autocomplete').blur();
        });


        angular.element(backdrop).on("click", function() {
            document.getElementById('autocomplete').blur();
        });
    };




    $scope.gotoSlide = function(number) {
        $scope.$broadcast('slideBox.setSlide', number);
    }
    $scope.moreuserdata = false;


    // Controller


    $scope.onChatScroll = ionic.debounce(function(top) {

        var currentTop = $ionicScrollDelegate.$getByHandle('handler').getScrollPosition().top;
        var maxScrollableDistanceFromTop = $ionicScrollDelegate.$getByHandle('handler').getScrollView().__maxScrollTop;

        if (currentTop >= maxScrollableDistanceFromTop && !$scope.moreuserdata) {
            $ionicLoading.show();
            $scope.loadmoreuser();
        }

    }, 500);


    $scope.scrollTop = function() {
        $ionicLoading.show({
            template: 'Please wait..'
        });
        $scope.serachmoreuser();
        $ionicScrollDelegate.resize();
    };

    $scope.search = {};

    $scope.serachmoreuser = function() {
       // console.log("loading more");
        UserService.searchuser($scope.search.string).then(function(data) {
            //alert($scope.search.string);
            $scope.userlist = data;
            $ionicLoading.hide();
        });
    };
    $scope.loadmoreuser = function() {
        // alert("fff");
       // console.log("loading more");
        $scope.page += 1;
        UserService.getuser($scope.page).then(function(data) {
            if (data.userlist == null) {
                $scope.moreuserdata = true;
              //  console.log("NO !");
            } else {
                angular.forEach(data.userlist, function(child) {
                    $scope.userlist.userlist[child.id] = child;
                });
               // console.log("post" + JSON.stringify($scope.userlist));
            }
            $ionicLoading.hide();
            // $scope.$broadcast('scroll.refreshComplete');
            //$scope.$broadcast('scroll.infiniteScrollComplete');
        });
    };
    $scope.addMedia = function() {

        $scope.hideSheet = $ionicActionSheet.show({
            buttons: [{
                text: 'Photo from library'
            }],
            // buttons: [{
            //     text: 'Take photo'
            // }, {
            //     text: 'Photo from library'
            // }],            
            titleText: 'Add images',
            cancelText: 'Cancel',
            buttonClicked: function(index) {
                $scope.addImage(index);
            }
        });
    };
    $scope.addImage = function(type) {
        $scope.hideSheet();
        var source;
        switch (type) {
            // case 0:
            //     $scope.takePhoto();
            //     break;
            // case 1:
            //     $scope.getPhoto();
            //     break;
            // case 0:
            //     $scope.takePhoto();
            //     break;
            case 0:
                $scope.getPhoto();
                break;            

        }
    };
    $scope.inputPicture = {
        "type": "picture"
    };
    $scope.takePicture = function() {
        $ionicTabsDelegate.select(1);
        var options = {
            quality: 75,
            allowEdit: true,
            targetWidth: 160,
            targetHeight: 160,
            destinationType: 0
        };
        Camera.getPicture(options).then(function(imageData) {
            $scope.inputPicture.content = "data:image/jpeg;base64," + imageData;
        }, function(err) {
            //console.log(err);
        });
    };
    $scope.takePhoto = function() {
        var options = {
            quality: 75,
            destinationType: Camera.DestinationType.FILE_URI,                        
            mediaType: Camera.MediaType.PICTURE,                        
            sourceType: Camera.PictureSourceType.CAMERA,
            allowEdit: true,
            encodingType: Camera.EncodingType.JPEG,
            targetWidth: 160,
            targetHeight: 160,
            popoverOptions: CameraPopoverOptions,
            saveToPhotoAlbum: false,
            correctOrientation: true
        };
        uploadPicture(options);
    };
    $scope.getPhoto = function() {
        //alert("sss");
        var options = {
            quality: 50,
            destinationType: 0,
            sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
            allowEdit: true,
            encodingType: Camera.EncodingType.JPEG,
            targetWidth: 1024,
            targetHeight: 768,
            popoverOptions: CameraPopoverOptions,
            saveToPhotoAlbum: false,
            correctOrientation: true
        };
        uploadPicture(options);
    };

    function uploadPicture(options) {
        $cordovaCamera.getPicture(options).then(function(sourcePath) {
            $scope.uploadedImage = "data:image/jpeg;base64," + sourcePath;
        }, function(err) {
           // console.log(err);
        });
    };
    $scope.updateSelection = function(position, entities) {
        angular.forEach(entities, function(subscription, index) {
            if (position != index) subscription.checked = false;
        });
    }
});




app.controller('IntroCtrl', function($scope, $state, $ionicNavBarDelegate, $ionicSlideBoxDelegate) {
    // hide back button
    $ionicNavBarDelegate.showBackButton(false);
    // Called to navigate to the main appaddComment
    $scope.startApp = function() {
        $state.go('App.home');
    };
    $scope.next = function() {
        $ionicSlidewelcomeCtrlBoxDelegate.next();
    };
    $scope.previous = function() {
        $ionicSlideBoxDelegate.previous();
    };
    // Called each time the slide changes
    $scope.slideChanged = function(index) {
        $scope.slideIndex = index;
        //console.log(index);
    };
});


app.controller('AppCtrl', function($scope, $rootScope, $state, $ionicModal, $timeout, $ionicActionSheet, $ionicLoading, AuthService, Category, User, $localStorage, NoNotification, Channelslib,CategoryData, AccountData) {

    $scope.calShipping = {};
    $scope.categories = CategoryData.menu;
    $scope.data = AccountData.data;

     //alert(CategoryData);

    $scope.profile = User($localStorage.userLogin.id).get();

    $scope.broadcast = $localStorage.userData.data.broadcast;
    //$scope.notifyicon=false;

    $scope.getuser = function(id) {
        $scope.cuser = {};
        $scope.cuser.avatar = User(id).getAvatar();
      //  console.log("user id " + id);
        return $scope.cuser;

    };

    $scope.isEmpty = function (obj) {
        for (var i in obj) if (obj.hasOwnProperty(i)) return true;
        return false;
    };

    // $rootScope.page = 1;
    // Brnad new
    // //Create Fucking modal
    // Notifications
    $scope.notificationsData = {};
    $ionicModal.fromTemplateUrl('templates/notifications.html', {
        scope: $scope
    }).then(function(modal) {
        $scope.modalNotifications = modal;
    });
    $scope.closeNotifications = function() {
        $scope.modalNotifications.hide();
    };
    $scope.notifications = function() {
        //alert("test");

        $ionicLoading.show({
            template: 'Please wait..'
        });
        Channelslib.getnotification().then(function(page_data) {
            $scope.data = page_data.activity;
            //$scope.page = 1;
            //$scope.totalPages = page_data.posts.totalpage;
            $ionicLoading.hide();
            $scope.$broadcast('scroll.refreshComplete');

            $scope.modalNotifications.show();
        });


    };
    // Triggered on a the logOut button click
    $scope.showLogOutMenu = function() {
        // Show the action sheet
        var hideSheet = $ionicActionSheet.show({
            destructiveText: 'Logout',
            titleText: 'Are you sure you want to logout? This app is awsome so I recommend you to stay.',
            cancelText: 'Cancel',
            cancel: function() {
                // add cancel code..
            },
            buttonClicked: function(index) {
                return true;
            },
            destructiveButtonClicked: function() {
                AuthService.logOut();
                $state.go('welcome');
                //alert("ddd");
            }
        });
    };
    //woocmrce
    $scope.$on('$ionicView.enter', function(e) {
        if ($localStorage.userData) {
            $rootScope.userData = $localStorage.userData
        }
    });
    $scope.logout = function() {
        $localStorage.userData = undefined;
        $rootScope.userData = undefined;
    };
    // $localStorage.cart = [];
    if ($localStorage.cart) $rootScope.cartCount = $localStorage.cart.length;
    else $rootScope.cartCount = 0;


    $scope.showInitData = function() {
       $scope.calShipping.shippingCountry = $scope.data.country_key_value; 
    }

    $scope.showCartModal = function() {

        $scope.cartItems = $localStorage.cart;
        if (!$scope.cartItems || $scope.cartItems.length == 0) {
            alert("No items!");
            return;
        }

        $scope.costSum = 0;
        $scope.charge  = 0;
        $scope.total_shipping_cost = 0;
        $scope.easyship_charge = 0;
        $scope.shipping_id ='' ;
        $scope.shipping_label ='';  
        $scope.shipping_cost ='' ; 
        $scope.shippingList = '';
        $scope.easyShippingList = '';
        $scope.dollar_rate = '';
             
        $scope.cartItems.forEach(function(element, index) {
            if( element.sale !=''){
                var actual_price =  element.sale;               
            } else {
                var actual_price =  element.regular;  
            }
            $scope.costSum += Number(actual_price*element.count);

        });
        $scope.costSum = $scope.costSum.toFixed(2);
        $scope.modal = {};
        console.log("all items==>", $scope.cartItems, "amount==>", $scope.costSum);
        
        $ionicModal.fromTemplateUrl('templates/shop/cartModal.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $scope.modal = modal;
            $scope.modal.show();
            $scope.showInitData();
        });

    }

    $scope.handleCheckout = function() {
        if( $scope.cartItems.length > 0){
            $scope.modal.hide();
            if ($localStorage.userData) 
                $state.go("App.checkout")
            else $state.go("welcome")
        } else {
            $scope.modal.hide();
        } 
    }


    $scope.cartclear = function() {

        $localStorage.cart = [];
        $rootScope.cartCount = 0;
        $scope.modal.hide();
    }

    $scope.removeCart = function(i, product) {

        console.log("cartItems===>",cartItems);
        console.log("before cost sum===>", $scope.costSum); 
        
        if($scope.cartItems.length == 1){
            $localStorage.cart.splice(0, 1);
            $scope.costSum = 0;    
            $rootScope.cartCount = 0;
        } else {

            console.log("i", i);
            console.log("cartItems", cartItems);
            // console.log("cartItem", cartItems[i]);
            console.log("cart", $localStorage.cart);

            // var j = i - 1; 
            var cartItems = $localStorage.cart;
            var j = i; 
            
            // if( -1 === j ){
            //     console.log("format ==", j);
                
            //     j = 0;
            // }   
        
            if( cartItems[j].sale !='' || cartItems.sale[j] != undefined || cartItems[j].sale != null ){
                $scope.costSum -= Number(cartItems[j].sale);   
                console.log("after cost sum===>", $scope.costSum);                 
            } else {
                $scope.costSum -= Number(cartItems[j].regular);                                    
            }
            $rootScope.cartCount = $localStorage.cart.length;

            $localStorage.cart.splice(j, 1);
        }

    } 

    $scope.increaseItem = function(i, cartItems) {        

        if( $scope.cartItems[i].count > 0 ){
            $scope.cartItems[i].count +=1; 
            if( $scope.cartItems[i].sale !=''){
                $scope.costSum =  parseFloat($scope.costSum) + parseFloat($scope.cartItems[i].sale);            
            } else {
                $scope.costSum =  parseFloat($scope.costSum) + parseFloat($scope.cartItems[i].regular);             
            }
              $scope.costSum = $scope.costSum.toFixed(2); 
        }
    }


    $scope.decreaseItem = function(i, cartItems) {

        if( $scope.cartItems[i].count > 0 ){
            if( $scope.cartItems[i].count != 1 ){
                $scope.cartItems[i].count -=1; 
                if( $scope.cartItems[i].sale !=''){
                    $scope.costSum =  parseFloat($scope.costSum) - parseFloat($scope.cartItems[i].sale);             
                } else {
                    $scope.costSum =  parseFloat($scope.costSum) - parseFloat($scope.cartItems[i].regular);   
                } 
               $scope.costSum = $scope.costSum.toFixed(2);                              
            } 
        }
    }

    $scope.custom = true;
    $scope.showShipping = function() {
        $scope.custom = $scope.custom === false ? true: false;
    }

    var unreadmsg = firebase.database().ref('unread').child($localStorage.userLogin.id);
    unreadmsg.on('value', function(snapshot){
      var data = snapshot.val();
      if(data){
        if(data.total > 0){
           $rootScope.msgicon=true;
        } else {
            alert("no msg");
            $rootScope.msgicon=false;
        }
      }
    });

});


app.controller('HomeCtrl', function($scope, $ionicModal, $ionicLoading, $localStorage, $timeout, $ionicActionSheet, Wall, Walldata, WallService, User, $firebaseObject) {

    $scope.data = Walldata.data;
    $scope.wallpost = Walldata.data.activity.activity;
    $scope.user = Walldata.data.user.user;
    $scope.currentuserid = $localStorage.userLogin.id;
    $scope.page = 1;
    $scope.totalPages = $scope.data.activity.totalpage;
    $scope.profile = User($localStorage.userLogin.id).get();
        console.log($localStorage.userData['cookie']);

    $scope.doRefresh = function() {
        location.reload(true);
    };
    $scope.loadMoreData = function() {
        $scope.page += 1;
        WallService.get_activity($scope.page).then(function(data) {
            angular.forEach(data.activity, function(child) {
                $scope.wallpost[child.id] = child;
            });
            $scope.$broadcast('scroll.infiniteScrollComplete');
        });
    };

    $scope.moreDataCanBeLoaded = function() {
        return $scope.totalPages > $scope.page;
    };
    $scope.getuser = function(id) {
        $scope.cuser = {};
        $scope.cuser.avatar = User(id).getAvatar();
        return $scope.cuser;

    };

    $scope.natrionData = {};
    $ionicModal.fromTemplateUrl('templates/natrion.html', {
        scope: $scope
    }).then(function(modal) {
        $scope.modalNatrion = modal;
    });
    $scope.closeNatrion = function() {
        $scope.modalNatrion.hide();
    };
    $scope.natrion = function() {
        $scope.modalNatrion.show();
    };

    $scope.checkItems = {};
    $scope.submitActivity = function() {
        var array = [];
        for (i in $scope.checkItems) {
            if ($scope.checkItems[i] == true) {
                array.push(i);
            }
        }

        var jsonData = JSON.stringify(array);
        $ionicLoading.show({
            template: 'Working...'
        });
        WallService.submitActivity(jsonData).then(function(data) {
            if (data.status == "ok") {
                $ionicLoading.hide();
                $scope.btnText = data.btntext;
                $scope.subscriber = data.subscriber;
                $scope.modalNatrion.hide();
                $scope.doRefresh();
            }
        });
    };

});

app.controller('ChannelsCtrl', function($scope, $ionicModal, $ionicLoading, $localStorage, $timeout, Channeldata, $ionicActionSheet, Channelslib, ChannelService, User, $stateParams) {


    $scope.data = Channeldata.data;
    $scope.posts = Channeldata.data.category;
    $scope.done = Channeldata.data.completedcategory;
    $scope.follows = Channeldata.data.follow;

    $scope.doRefresh = function() {
        $ionicLoading.show({
            template: 'Please wait..'
        });
        Channelslib.getChannels().then(function(page_data) {
            $scope.data = page_data.data;
            $scope.posts = page_data.data.category;
            $scope.follows = page_data.data.follow;
            $scope.completedposts = page_data.data.completedcategory;
            $ionicLoading.hide();
        })
        $scope.$broadcast('scroll.refreshComplete');
    };


    $scope.updatepostcount = function(id, count) {
        var key = 'channel' + id;
        var postcount = localStorage.getItem(key);
        if (postcount == count) {
            return false;
        } else {
            return true;
        }
    };

});

app.controller('ChannelCtrl', function($scope,$ionicTabsDelegate, $rootScope, $state, $stateParams, $sce, $http, $ionicLoading, $ionicScrollDelegate, AuthService, Channeldata, Channelslib, ChannelService) {

    $scope.data = Channeldata;
    $scope.posts = Channeldata.posts.activity;
    $scope.btnText = Channeldata.btn;
    $scope.subscriber = Channeldata.total;
    $scope.page = 1;
    $scope.totalPages = Channeldata.posts.totalpage;

    $scope.doRefresh = function() {
        $ionicLoading.show({
            temuploadPictureplate: 'Please wait..'
        });
        Channelslib.getsingleChannel($stateParams.postId).then(function(page_data) {
            $scope.data = page_data;
            $scope.posts = page_data.posts.activity;
            $scope.btnText = page_data.btn;
            $scope.subscriber = page_data.total;
            $scope.page = 1;
            $scope.totalPages = page_data.posts.totalpage;
            $ionicLoading.hide();
            $scope.$broadcast('scroll.refreshComplete');
        })

    };

    $scope.loadMoreData = function() {
        $scope.page += 1;
        ChannelService.get_channelpost($scope.page).then(function(data) {
            angular.forEach(data.activity, function(child) {
                $scope.posts[child.id] = child;
            });
            $scope.$broadcast('scroll.infiniteScrollComplete');
        });
    };

    $scope.moreDataCanBeLoaded = function() {
        return $scope.totalPages > $scope.page;
    };

    $scope.markchannelasseen = function(id, count) {
        var key = 'channel' + id;
        var postcount = localStorage.getItem(key);
        localStorage.removeItem(key);
        localStorage.setItem(key, count);
        return false;
    };
    $scope.showdot = function(id) {

        var key = 'postidshow' + id;
        var postcount = localStorage.getItem(key);
        if (postcount == "seen") {
            return false;
        } else {
            return true;
        }
    };
    $scope.follow = function() {
        $ionicLoading.show({
            template: 'Working...'
        });
        ChannelService.submitFollow($stateParams.postId).then(function(data) {
            if (data.status == "ok") {
                $ionicLoading.hide();
                $scope.btnText = data.btntext;
                $scope.subscriber = data.subscriber;
            }
        });
    };
   
});


app.controller('PostCtrl', function($scope, $rootScope, $state, $stateParams, $sce, $http, $ionicLoading, $ionicScrollDelegate, AuthService, Channeldata, Channelslib, PostService, $ionicHistory) {

    $scope.data = Channeldata;
    $scope.totallike = Channeldata.post.like;
    $scope.catid = $stateParams.catId;


    $scope.follow = function() {
        $ionicLoading.show({
            template: 'Working...'
        });
        PostService.submitFollow($stateParams.postId).then(function(data) {
            if (data.status == "ok") {
                $ionicLoading.hide();
                $scope.totallike = data.like;
            }
        });
    };

    $scope.markasseen = function(id) {
        var key = 'postidshow' + id;
        var postcount = localStorage.getItem(key);
        if (postcount == "seen") {
            return false;
        } else {
            PostService.markasseen($scope.catid, 0, $stateParams.postId, 2).then(function(data) {
                if (data.status == "ok") {
                    localStorage.setItem(key, "seen");
                    return true;
                }
            });
        }
    };

    $scope.doRefresh = function() {

        $ionicLoading.show({
            template: 'Please wait..'
        });

        Channelslib.getchannelpost($stateParams.postId, $stateParams.catId).then(function(page_data) {

            $scope.data = page_data;
            $scope.totallike = page_data.post.like;
            $scope.catid = $stateParams.catId;
            $ionicLoading.hide();
        })
        $scope.$broadcast('scroll.refreshComplete');


    };

    $scope.sharePost = function(link) {
        PostService.sharePost(link);
    };

    $scope.myGoBack = function() {
        $ionicHistory.goBack();
    };     
});

app.controller('LearncatCtrl', function($scope, $ionicModal, $ionicLoading, $localStorage, $timeout, Learndata, $ionicActionSheet, Learn, User, $stateParams) {

    $scope.data = Learndata.data;
    $scope.posts = Learndata.data.category;
    $scope.doRefresh = function() {
        $ionicLoading.show({
            template: 'Please wait..'
        });
        Learn.learncategories().then(function(page_data) {
            $scope.data = page_data.data;
            $scope.posts = page_data.data.category;
            $ionicLoading.hide();
        })
        $scope.$broadcast('scroll.refreshComplete');
    };

});

app.controller('LearnsubcatCtrl', function($scope, $ionicModal, $ionicLoading, $localStorage, $timeout, $ionicActionSheet, Learn, Learndata, User, $stateParams) {

    $scope.data = Learndata;
    $scope.catid = $stateParams.postID;
   // console.log($scope.data);

    $scope.doRefresh = function() {
        $ionicLoading.show({
            template: 'Please wait..'
        });
        Learn.learnsubcategories($scope.catid).then(function(page_data) {
            $scope.data = page_data;
            $ionicLoading.hide();
        })
        $scope.$broadcast('scroll.refreshComplete');
    };


});


app.controller('LearnlessonCtrl', function($scope, $ionicModal, $ionicLoading, $localStorage, $timeout, $ionicActionSheet, Learn, Learndata, User, $stateParams) {

    $scope.data = Learndata;
    $scope.catid = $stateParams.catid;
    $scope.lessonid = $stateParams.postID;


    $scope.doRefresh = function() {
        $ionicLoading.show({
            template: 'Please wait..'
        });
        Learn.learnalllesson($scope.lessonid).then(function(page_data) {
            $scope.data = page_data;
            $ionicLoading.hide();
        })
        $scope.$broadcast('scroll.refreshComplete');
    };


});

app.controller('LearnsinglelessonCtrl', function($scope, $sce, $ionicModal, $ionicLoading, $localStorage, $timeout, $ionicActionSheet, Learn, Learndata, User, $stateParams, PostService) {

    $scope.data = Learndata;
    $scope.catid = $stateParams.catid;
    $scope.lessonid = $stateParams.lessonid;
    $scope.postid = $stateParams.postID;
    $scope.audio = $sce.trustAsResourceUrl(Learndata.post.audio);
    $scope.video = $sce.trustAsResourceUrl(Learndata.post.video);
    $scope.spvideo = Learndata.post.spvideo;
    $scope.text = Learndata.post.text;

    $scope.doRefresh = function() {
        $ionicLoading.show({
            template: 'Please wait..'
        });
        Learn.learnsinglelesson($scope.postid).then(function(page_data) {
            $scope.data = page_data;
            $scope.audio = $sce.trustAsResourceUrl(Learndata.post.audio);
            $scope.video = $sce.trustAsResourceUrl(Learndata.post.video);
            $scope.spvideo = Learndata.post.spvideo;
            $scope.text = Learndata.textvideo;
            $ionicLoading.hide();
        })
        $scope.$broadcast('scroll.refreshComplete');
    };

    $scope.markasseen = function(id) {
        var key = 'postidshow' + id;
        var postcount = localStorage.getItem(key);
        if (postcount == "seen") {
            //alert(key+"=="+postcount);
            return false;
        } else {
            PostService.markasseen($scope.catid, $scope.lessonid, $scope.postid, 1).then(function(data) {
                //alert("sent http request"+data.status);
                if (data.status == "ok") {
                    localStorage.setItem(key, "seen");
                    return true;
                }
            });
        }
    };
});


// POST
app.controller('SingleHomeCtrl', function($scope, Wall, post_data, $ionicLoading, PostService, AuthService, $ionicScrollDelegate, User, $localStorage, $stateParams) {
    $scope.profile = User($localStorage.userLogin.id).get();
    $scope.userid = post_data.post.post_author;
    $scope.post = post_data.post;
    $scope.data = post_data;
    $scope.totalcomment = post_data.post.comment_count;
    $scope.totallike = post_data.like;
    $scope.comments = post_data.comment;
    $scope.author = {};
    $scope.author.name = User(post_data.author).getName();
    $scope.author.avatar = User(post_data.author).getAvatar();
    // console.log($scope.post);
    $ionicLoading.hide();
    $scope.doRefresh = function() {
        $ionicLoading.show({
            template: 'Please wait..'
        });
        Wall.get_single_activity($stateParams.postId).then(function(page_data) {
            $scope.post = page_data.post;
            $scope.totalcomment = page_data.post.comment_count;
            $scope.totallike = page_data.like;
            $scope.comments = page_data.comment;
            $scope.author = {};
            $scope.author.name = User(page_data.author).getName();
            $scope.author.avatar = User(page_data.author).getAvatar();

            $ionicLoading.hide();
        })

        $scope.$broadcast('scroll.refreshComplete');
    };

    $scope.sharePost = function(link) {
        window.plugins.socialsharing.share('Check this post here: ', null, null, link);
    };

    $scope.getuser = function(id) {
        $scope.cuser = {};
        $scope.cuser.name = User(id).getName();
        $scope.cuser.avatar = User(id).getAvatar();
       // console.log($scope.cuser.avatar);
        return $scope.cuser;
    };

    $scope.follow = function() {
       // console.log("follow button clicked");
        $ionicLoading.show({
            template: 'Working...'
        });
        PostService.submitFollow($stateParams.postId).then(function(data) {
            if (data.status == "ok") {
                $ionicLoading.hide();
                $scope.totallike = data.like;
            }
        });
    };

    $scope.addComment = function() {

        $ionicLoading.show({
            template: 'Submiting comment...'
        });

        PostService.submitComment($scope.post.ID, $scope.new_comment)
            .then(function(data) {
                if (data.status == "ok") {
                    var comment = {
                        user_id: $localStorage.userLogin.id,
                        comment_content: $scope.new_comment,
                        timeago: "Just Now",
                        id: data.comment_id
                    };
                    $scope.comments.push(comment);
                    $scope.new_comment = "";
                    $scope.new_comment_id = data.comment_id;
                    $scope.totalcomment = parseInt($scope.totalcomment) + 1;
                    $ionicLoading.hide();
                    // Scroll to new post
                    $ionicScrollDelegate.scrollBottom(true);
                }
            });
    };
});


app.controller('UserProfileCtrl', function($scope,$sce, $ionicModal, $ionicLoading, $localStorage, $timeout, $ionicActionSheet, Wall, Walldata, WallService, User, $stateParams,ContactsRecommended,$rootScope,Contacts) {

    $scope.data = Walldata;
    $scope.wallpost = Walldata.activity;
    $scope.page = 1;
    $scope.totalPages = Walldata.totalpage;
    $scope.profile = User($stateParams.postId).get();
    $scope.currentuserid = $localStorage.userLogin.id;
    $scope.currentprofileid = $stateParams.postId;

    $scope.doRefresh = function() {
        $ionicLoading.show({
            template: 'Please wait..'
        });
        Wall.get_single_user_activity($stateParams.postId).then(function(page_data) {
            $scope.currentuserid = $localStorage.userLogin.id;
            $scope.currentprofileid = $stateParams.postId;
            $scope.data = page_data;
            $scope.wallpost = page_data.activity;
            //$scope.user =page_data.data.user.user;
            $ionicLoading.hide();
        })
        $scope.$broadcast('scroll.refreshComplete');

    };
   $scope.addcontact = function() {
     $scope.addbtn=false;
    setTimeout(function() {ContactsRecommended($localStorage.userLogin.id).post($stateParams.postId);}, 50);
       // $scope.goBack();
    }


    var unreadmsg = firebase.database().ref('contacts/'+$localStorage.userLogin.id).child($stateParams.postId);
    unreadmsg.on('value', function(snapshot){
          $scope.dynamicbutton();
    });

    var pending = firebase.database().ref('contactsRecommended/'+$stateParams.postId).child(+$localStorage.userLogin.id);
    pending.on('value', function(pen){
        $scope.dynamicbutton();
    });




    $scope.dynamicbutton = function() {
        $rootScope.add=false;
        $rootScope.sent=false;
        $rootScope.received=false;
        $rootScope.frnd=false;
        ContactsRecommended($localStorage.userLogin.id).iffrnd($stateParams.postId);       
    };

    $scope.accept = function(id) {
        Contacts($localStorage.userLogin.id).post(id);
        ContactsRecommended($localStorage.userLogin.id).remove(id);
    };




    $scope.loadMoreData = function() {
        $scope.page += 1;
        WallService.get_single_user_activity($scope.page, $stateParams.postId).then(function(data) {

            angular.forEach(data.activity, function(child) {
                $scope.wallpost[child.id] = child;
            });
            console.log($scope.wallpost);
            $scope.$broadcast('scroll.infiniteScrollComplete');
        });
    };

    $scope.moreDataCanBeLoaded = function() {
        return $scope.totalPages > $scope.page;
    };

});


//user like
app.controller('SingleLikeCtrl', function($scope, post_data, $ionicLoading, PostService, AuthService, $ionicScrollDelegate, User, $localStorage, $stateParams) {
    $scope.profile = User($localStorage.userLogin.id).get();
    $scope.data = post_data.user;
    $scope.postId = $stateParams.postId;
    $scope.catId = $stateParams.catId;
   // console.log($scope.post);
    $ionicLoading.hide();
    $scope.getuser = function(id) {
        $scope.cuser = {};
        $scope.cuser.name = User(id).getName();
        $scope.cuser.avatar = User(id).getAvatar();
      //  console.log($scope.cuser.avatar);
        return $scope.cuser;
    };

});


app.controller('UserHomeCtrl', function($scope, $ionicModal, $ionicLoading, $timeout, $ionicActionSheet, Wall, WallService, User, user_data) {

    $scope.data = user_data.data;

    $scope.doRefresh = function() {
        $ionicLoading.show({
            template: 'Please wait..'
        });
        Wall.get_user().then(function(page_data) {
            $scope.data = page_data.data;
            $ionicLoading.hide();
        })
        $scope.$broadcast('scroll.refreshComplete');

    };


    $scope.getuser = function(id) {
        $scope.cuser = {};
        $scope.cuser.name = User(id).getName();
        $scope.cuser.avatar = User(id).getAvatar();
        return $scope.cuser;
    };

});


app.controller('GameCtrl', function($scope, $sce,$stateParams) {
    $scope.gameid = $stateParams.gameID;
    //console.log($scope.gameid);
    var user = JSON.parse(window.localStorage.ionWordpress_user || null);
    //console.log(user);
    $scope.url = "https://v-life.com/games/"+$scope.gameid+"/?cookie=" + user.cookie;
    //console.log($scope.url);
    $scope.iframe_url = $sce.trustAsResourceUrl(decodeURIComponent($scope.url));
    //console.log($scope.iframe_url);
});

app.controller('HealthCtrl', function($scope, $sce,Gamedata,Game,$ionicLoading) {

    var user = JSON.parse(window.localStorage.ionWordpress_user || null);
    $scope.score = Gamedata.data;

    if( $scope.score == null || $scope.score == '' ){
        $scope.score = {}
        $ionicLoading.hide();
    }

    $scope.doRefresh = function() {
        $ionicLoading.show({
            template: 'Please wait..'
        });
        Game.get_score().then(function(page_data) {
           $scope.score = page_data.data;
           $ionicLoading.hide();
        })
        $scope.$broadcast('scroll.refreshComplete');

    };
});


app.controller('ChatsCtrl', function($scope, $ionicNavBarDelegate, Chats) {
    // With the new view caching in Ionic, Controllers are only called
    // when they are recreated or on app start, instead of every page change.
    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:
    //
    //$scope.$on('$ionicView.enter', function(e) {
    //});
    // hide back button
    // $ionicNavBarDelegate.showBackButton(true);
    $scope.chats = Chats.all();
    $scope.remove = function(chat) {
        Chats.remove(chat);
    };
});

app.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
    $scope.chat = Chats.get($stateParams.chatId);
});

app.controller('AccountCtrl', function($scope) {
    $scope.settings = {
        enableFriends: true
    };
});

app.controller('CategoryCtrl', function($scope, Category, $stateParams) {
    $scope.category = Category.get($stateParams.id);
});

app.controller('AffiliateDemoCtrl', function($scope) {

});

app.controller('AffiliateBannerCtrl', function($scope, $stateParams, $sce, $http, $ionicLoading, Affiliate, AffiliateData) {
    $scope.data = AffiliateData.data;
    $scope.myHTML = "ss";
   // console.log(AffiliateData.data);

    $scope.doRefresh = function() {
        $ionicLoading.show({
            template: 'Please wait..'
        });
        Affiliate.banners("banners").then(function(page_data) {
            $scope.data = page_data;
           // console.log($scope.data);
            $ionicLoading.hide();
        })
        $scope.$broadcast('scroll.refreshComplete');

    };

});

app.controller('AffiliateCtrl', function($scope, $stateParams, $sce, $http, $ionicLoading, Affiliate, AffiliateData, ionicDatePicker) {
    $scope.data = AffiliateData.data;

    $scope.doRefresh = function() {
        $ionicLoading.show({
            template: 'Please wait..'
        });
        Affiliate.campaign_reports("campaign_reports").then(function(page_data) {
            $scope.data = page_data.data;
            console.log($scope.data);
            $ionicLoading.hide();
        })
        $scope.$broadcast('scroll.refreshComplete');

    };

    $scope.getFilter = function() {
        $ionicLoading.show({
            template: 'Please wait..'
        });
        Affiliate.campaign_reports("campaign_reports", $scope.FilterData.start, $scope.FilterData.end, $scope.FilterData.status).then(function(page_data) {
            $scope.data = page_data.data;
            //console.log($scope.data);
            $ionicLoading.hide();
        })
        $scope.$broadcast('scroll.refreshComplete');

    };

    $scope.FilterData = {};
    var ipObj1 = {
        callback: function(val) { //Mandatory
          //  console.log('Return value from the datepicker popup is : ' + val, new Date(val));
            $scope.FilterData.start = moment(val).format("YYYY-MM-DD");;
        }
    };
    var ipObj2 = {
        callback: function(val) { //Mandatory
           // console.log('Return value from the datepicker popup is : ' + val, new Date(val));
            $scope.FilterData.end = moment(val).format("YYYY-MM-DD");;
        }
    };
    $scope.filterstart = function() {
        ionicDatePicker.openDatePicker(ipObj1);
    };
    $scope.filterend = function() {
        ionicDatePicker.openDatePicker(ipObj2);
    };

});

app.controller('AffiliateOverAllCtrl', function($scope, $stateParams, $sce, $http, $ionicLoading, Affiliate, AffiliateData, ionicDatePicker) {
    $scope.data = AffiliateData.data;
   // console.log(AffiliateData.data);

    $scope.doRefresh = function() {
        $ionicLoading.show({
            template: 'Please wait..'
        });
        Affiliate.reports("reports", false, false, -1, 1).then(function(page_data) {
            $scope.data = page_data.data;
           // console.log($scope.data);
            $ionicLoading.hide();
        })
        $scope.$broadcast('scroll.refreshComplete');

    };

});


app.controller('AffiliateOverviewCtrl', function($scope, $stateParams, $sce, $http, $ionicLoading, Affiliate, AffiliateData, ionicDatePicker) {
    $scope.data = AffiliateData.data;
    console.log(AffiliateData.data);

    $scope.doRefresh = function() {
        $ionicLoading.show({
            template: 'Please wait..'
        });
        Affiliate.affiliate("overview").then(function(page_data) {
            $scope.data = page_data.data;
          //  console.log(page_data.data);
            $ionicLoading.hide();
        })
        $scope.$broadcast('scroll.refreshComplete');

    };
});

app.controller('EditAccountCtrl', function($scope, $stateParams, $sce, $http, $ionicLoading, Affiliate, AffiliateData, ionicDatePicker) {
    $scope.data = AffiliateData.data;
    //console.log(AffiliateData.data);

    $scope.doRefresh = function() {
        $ionicLoading.show({
            template: 'Please wait..'
        });
        Affiliate.edit_account("edit_account").then(function(page_data) {
            $scope.data = page_data.data;
            
            $ionicLoading.hide();
        })
        $scope.$broadcast('scroll.refreshComplete');
    };

});

app.controller('AffiliateWithdrawCtrl', function($scope, $stateParams, $sce, $http, $ionicLoading, $ionicPopup, Affiliate, AffiliateData, ionicDatePicker) {
    $scope.data = AffiliateData.data;
    $scope.showSubmit = true;
    $scope.doRefresh = function() {
        $ionicLoading.show({
            template: 'Please wait..'
        });
        Affiliate.affiliate_withdraw("withdraw").then(function(page_data) {
            $scope.data = page_data.data;          
            $ionicLoading.hide();
        })
        $scope.$broadcast('scroll.refreshComplete');
    };

    $scope.FilterData = {};
    $scope.add = function(wallet) {
        if($scope.FilterData.withdraw_amount > wallet){
            $ionicPopup.alert({
                title: 'Withdraw',
                template: 'You don\'t have sufficient balance!'
            });
            return;
        } else {

            $ionicLoading.show({
                template: 'Please wait..'
            });
            Affiliate.add_withdraw("withdraw", $scope.FilterData.withdraw_amount).then(function(page_data) {
                $scope.data = page_data.data;
                $scope.FilterData.withdraw_amount = '';
                $ionicLoading.hide();
            })
            $scope.$broadcast('scroll.refreshComplete');
        }
    };

    $scope.checkMinValue = function() {
;
        if( this.FilterData.withdraw_amount < 100 ){
        $scope.showSubmit = false;
        } else {
        $scope.showSubmit = true;
        }
        $scope.$broadcast('scroll.refreshComplete');
    };        

});



app.controller('AffiliateCustomSlug', function($scope, $stateParams, $sce, $http, $ionicLoading, Affiliate, AffiliateData, ionicDatePicker) {
    $scope.FilterData = {};
    $scope.data = AffiliateData.data;
    //console.log(AffiliateData.data);
    $scope.FilterData.name = AffiliateData.data.cas_affiliate_custom_slug;

    $scope.doRefresh = function() {
        $ionicLoading.show({
            template: 'Please wait..'
        });
        Affiliate.affiliate("custom_affiliate_slug").then(function(page_data) {
            $scope.data = page_data.data;
            $scope.FilterData.name = page_data.data.cas_affiliate_custom_slug;
            //console.log($scope.data);
            $ionicLoading.hide();
        })
        $scope.$broadcast('scroll.refreshComplete');

    };


    $scope.add = function() {
        $ionicLoading.show({
            template: 'Please wait..'
        });
        Affiliate.affiliateslugadd("custom_affiliate_slug", $scope.FilterData.name).then(function(page_data) {
            $scope.data = page_data.data;
            $scope.FilterData.name = page_data.data.cas_affiliate_custom_slug;
            $ionicLoading.hide();

        })
        $scope.$broadcast('scroll.refreshComplete');
    };

});

app.controller('AffiliatePaymentSetting', function($scope, $stateParams, $sce, $http, $ionicLoading, Affiliate, AffiliateData, ionicDatePicker) {
    $scope.FilterData = {};
    $scope.data = AffiliateData.data;
    $scope.FilterData.type = AffiliateData.data.metas.cas_affiliate_payment_type;
    //Bank
    $scope.FilterData.accnumber = AffiliateData.data.metas.cas_affiliate_bank_transfer_ac;
    $scope.FilterData.bank = AffiliateData.data.metas.cas_affiliate_bank_transfer_bank_name;
    $scope.FilterData.bankaddress = AffiliateData.data.metas.cas_affiliate_bank_transfer_bank_address;    
    $scope.FilterData.bankswift = AffiliateData.data.metas.cas_affiliate_bank_transfer_bank_swift; 
    // Alipay
    $scope.FilterData.alipay = AffiliateData.data.metas.cas_affiliate_alipay;
    // Wechat Pay
    $scope.FilterData.wechat_pay = AffiliateData.data.metas.cas_affiliate_wechat_pay;    
    // Paypal   
    $scope.FilterData.paypal = AffiliateData.data.metas.cas_affiliate_paypal_email;

   //console.log(AffiliateData.data);

    $scope.doRefresh = function() {
        $ionicLoading.show({
            template: 'Please wait..'
        });
        Affiliate.payments_settings("payments_settings").then(function(page_data) {
            $scope.data = page_data.data;
            $scope.FilterData.type = page_data.data.metas.cas_affiliate_payment_type;
            //Bank
            $scope.FilterData.accnumber = page_data.data.metas.cas_affiliate_bank_transfer_ac;
            $scope.FilterData.bank = page_data.data.metas.cas_affiliate_bank_transfer_bank_name;
            $scope.FilterData.bankaddress = page_data.data.metas.cas_affiliate_bank_transfer_bank_address;
            $scope.FilterData.bankswift = page_data.data.metas.cas_affiliate_bank_transfer_bank_swift;
            // Alipay
            $scope.FilterData.alipay = page_data.data.metas.cas_affiliate_alipay;
            // Wechat Pay
            $scope.FilterData.wechat_pay = page_data.data.metas.cas_affiliate_wechat_pay;            
            // Paypal 
            $scope.FilterData.paypal = page_data.data.metas.cas_affiliate_paypal_email;
           // console.log($scope.data);
            $ionicLoading.hide();
        })
        $scope.$broadcast('scroll.refreshComplete');

    };
    $scope.add = function() {
        $ionicLoading.show({
            template: 'Please wait..'
        });
        Affiliate.affiliatepaymentadd("payments_settings", 
            $scope.FilterData.type, $scope.FilterData.paypal, $scope.FilterData.accnumber, 
            $scope.FilterData.bank, $scope.FilterData.bankaddress, $scope.FilterData.bankswift,
            $scope.FilterData.alipay,$scope.FilterData.wechat_pay).then(function(page_data) {

            $scope.data = page_data.data;
            $scope.FilterData.type = page_data.data.metas.cas_affiliate_payment_type;
            //Bank            
            $scope.FilterData.accnumber = page_data.data.metas.cas_affiliate_bank_transfer_ac;
            $scope.FilterData.bank = page_data.data.metas.cas_affiliate_bank_transfer_bank_name;
            $scope.FilterData.bankaddress = page_data.data.metas.cas_affiliate_bank_transfer_bank_address;
            $scope.FilterData.bankswift = page_data.data.metas.cas_affiliate_bank_transfer_bank_swift;
            // Alipay  
            $scope.FilterData.alipay = page_data.data.metas.cas_affiliate_alipay;
            // Wechat Pay
            $scope.FilterData.wechat_pay = page_data.data.metas.cas_affiliate_wechat_pay;            
            // Paypal                       
            $scope.FilterData.paypal = page_data.data.metas.cas_affiliate_paypal_email;

            $ionicLoading.hide();
        })
        $scope.$broadcast('scroll.refreshComplete');

    };

});

app.controller('AffiliateLink', function($scope, $stateParams, $sce, $http, $ionicLoading, Affiliate, AffiliateData, ionicDatePicker) {
    $scope.FilterData = {};
    $scope.data = AffiliateData.data;
    //console.log(AffiliateData.data);

    $scope.doRefresh = function() {
        $ionicLoading.show({
            template: 'Please wait..'
        });
        Affiliate.affiliate_link("affiliate_link").then(function(page_data) {
            $scope.data = page_data.data;
            //console.log($scope.data);
            $ionicLoading.hide();
        })
        $scope.$broadcast('scroll.refreshComplete');

    };
    $scope.add = function() {
        $ionicLoading.show({
            template: 'Please wait..'
        });
        Affiliate.generatelink($scope.FilterData.camp, $scope.FilterData.reference, $scope.FilterData.friendly, $scope.FilterData.url).then(function(page_data) {
            $scope.camplink = page_data.data;          
            $ionicLoading.hide();
        })
        $scope.$broadcast('scroll.refreshComplete');

    };

});


app.controller('AffiliateMlmCtrl', function($scope, $stateParams, $sce, $http, $ionicLoading, Affiliate, AffiliateData, ionicDatePicker) {
    $scope.data = AffiliateData.data;

    $scope.doRefresh = function() {
        $ionicLoading.show({
            template: 'Please wait..'
        });
        Affiliate.mlm("mlm").then(function(page_data) {
            $scope.data = page_data.data;
           // console.log($scope.data);
            $ionicLoading.hide();
        })
        $scope.$broadcast('scroll.refreshComplete');

    };
});

app.controller('AffiliateRefferalsCtrl', function($scope, $stateParams, $sce, $http, $ionicLoading, Affiliate, AffiliateData, ionicDatePicker) {
    $scope.data = AffiliateData.data;

    $scope.page = 1;
    $scope.totalPages = $scope.data.totalpage;
    $scope.loadMoreData = function() {
        $scope.page += 1;

        $ionicLoading.show({
            template: 'Please wait..'
        });
        Affiliate.referrals("referrals", $scope.FilterData.start, $scope.FilterData.end, $scope.FilterData.status, $scope.page).then(function(page_data) {

            angular.forEach(page_data.data.items, function(child) {
                $scope.data.items.push(child);
              //$scope.wallpost[child.id] =child;
              //console.log(child);
                $scope.$broadcast('scroll.infiniteScrollComplete');
            });
            $ionicLoading.hide();
        })

    };
    $scope.moreDataCanBeLoaded = function() {
        return $scope.totalPages > $scope.page;
    };
    $scope.doRefresh = function() {
        $ionicLoading.show({
            template: 'Please wait..'
        });
        Affiliate.referrals("referrals").then(function(page_data) {
            $scope.data = page_data.data;
            console.log($scope.data);
            $scope.page = 1;
            $scope.totalPages = page_data.data.totalpage;
            $ionicLoading.hide();
        })
        $scope.$broadcast('scroll.refreshComplete');

    };

    $scope.getFilter = function() {
        $ionicLoading.show({
            template: 'Please wait..'
        });
        Affiliate.referrals("referrals", $scope.FilterData.start, $scope.FilterData.end, $scope.FilterData.status, 1).then(function(page_data) {
            $scope.data = page_data.data;
            $scope.page = 1;
            $scope.totalPages = page_data.data.totalpage;
            $ionicLoading.hide();
        })
        $scope.$broadcast('scroll.refreshComplete');

    };

    $scope.FilterData = {};
    var ipObj1 = {
        callback: function(val) { //Mandatory
           // console.log('Return value from the datepicker popup is : ' + val, new Date(val));
            $scope.FilterData.start = moment(val).format("YYYY-MM-DD");
        }
    };
    var ipObj2 = {
        callback: function(val) { //Mandatory
           // console.log('Return value from the datepicker popup is : ' + val, new Date(val));
            $scope.FilterData.end = moment(val).format("YYYY-MM-DD");
        }
    };
    $scope.filterstart = function() {
        ionicDatePicker.openDatePicker(ipObj1);
    };
    $scope.filterend = function() {
        ionicDatePicker.openDatePicker(ipObj2);
    };
});

app.controller('AffiliatePaymentsCtrl', function($scope, $stateParams, $sce, $http, $ionicLoading, Affiliate, AffiliateData, ionicDatePicker) {
    $scope.data = AffiliateData.data;
    $scope.page = 1;
    $scope.totalPages = $scope.data.totalpage;
    $scope.loadMoreData = function() {
        $scope.page += 1;

        $ionicLoading.show({
            template: 'Please wait..'
        });
        Affiliate.payments("payments", $scope.FilterData.start, $scope.FilterData.end, $scope.FilterData.status, $scope.page).then(function(page_data) {

            angular.forEach(page_data.data.items, function(child) {
                $scope.data.items.push(child);
                $scope.$broadcast('scroll.infiniteScrollComplete');
            });
            $ionicLoading.hide();
        })

    };
    $scope.moreDataCanBeLoaded = function() {
        return $scope.totalPages > $scope.page;
    };
    $scope.doRefresh = function() {
        $ionicLoading.show({
            template: 'Please wait..'
        });
        Affiliate.payments("payments").then(function(page_data) {
            $scope.page = 1;
            $scope.totalPages = page_data.data.totalpage;
            $ionicLoading.hide();
        })
        $scope.$broadcast('scroll.refreshComplete');

    };

    $scope.getFilter = function() {
        $ionicLoading.show({
            template: 'Please wait..'
        });
        Affiliate.payments("payments", $scope.FilterData.start, $scope.FilterData.end, $scope.FilterData.status, 1).then(function(page_data) {
            $scope.data = page_data.data;
            $scope.page = 1;
            $scope.totalPages = page_data.data.totalpage;
            $ionicLoading.hide();
        })
        $scope.$broadcast('scroll.refreshComplete');

    };

    $scope.FilterData = {};
    var ipObj1 = {
        callback: function(val) { //Mandatory
            console.log('Return value from the datepicker popup is : ' + val, new Date(val));
            $scope.FilterData.start = moment(val).format("YYYY-MM-DD");;
        }
    };
    var ipObj2 = {
        callback: function(val) { //Mandatory
          //  console.log('Return value from the datepicker popup is : ' + val, new Date(val));
            $scope.FilterData.end = moment(val).format("YYYY-MM-DD");;
        }
    };
    $scope.filterstart = function() {
        ionicDatePicker.openDatePicker(ipObj1);
    };
    $scope.filterend = function() {
        ionicDatePicker.openDatePicker(ipObj2);
    };

});

app.controller('AffiliateWalletCtrl', function($scope, $stateParams, $sce, $http, $ionicLoading, Affiliate, AffiliateData, ionicDatePicker) {
    
    $scope.data = AffiliateData.data;
    $scope.page = 1;
    $scope.totalPages = $scope.data.totalpage;
    $scope.loadMoreData = function() {
        $scope.page += 1;

        $ionicLoading.show({
            template: 'Please wait..'
        });
        Affiliate.wallet("wallet", $scope.FilterData.start, $scope.FilterData.end, $scope.FilterData.status, $scope.page).then(function(page_data) {

            angular.forEach(page_data.data.items, function(child) {
                $scope.data.items.push(child);
                $scope.$broadcast('scroll.infiniteScrollComplete');
            });
            $ionicLoading.hide();
        })

    };
    $scope.moreDataCanBeLoaded = function() {
        return $scope.totalPages > $scope.page;
    };
    $scope.doRefresh = function() {
        $ionicLoading.show({
            template: 'Please wait..'
        });
        Affiliate.wallet("wallet").then(function(page_data) {
            $scope.page = 1;
            $scope.totalPages = page_data.data.totalpage;
            $ionicLoading.hide();
        })
        $scope.$broadcast('scroll.refreshComplete');

    };

    $scope.FilterData = {};
    $scope.add = function(){
        $ionicLoading.show({
            template: 'Please wait..'
        });
        Affiliate.addwallet($scope.FilterData.amount).then(function(page_data) {
            // $scope.page = 1;
            // $scope.totalPages = page_data.data.totalpage;
            $scope.data                 = page_data.data;
            console.log($scope.data);
            $scope.FilterData.amount    = '';
            $ionicLoading.hide();
        });
        $scope.$broadcast('scroll.refreshComplete');        
    }
});

app.controller('AffiliateCampaignCtrl', function($scope, $stateParams, $sce, $http, $ionicLoading, Affiliate, AffiliateData, ionicDatePicker) {
    $scope.data = AffiliateData.data;
    $scope.FilterData = {};
    $scope.doRefresh = function() {
        $ionicLoading.show({
            template: 'Please wait..'
        });
        Affiliate.campaigns("campaigns").then(function(page_data) {
            $scope.page = 1;
            $scope.totalPages = page_data.data.totalpage;
            $ionicLoading.hide();
        })
        $scope.$broadcast('scroll.refreshComplete');
    };

    $scope.add = function() {
        $ionicLoading.show({
            template: 'Please wait..'
        });
        Affiliate.affiliatecampadd("campaigns", $scope.FilterData.name).then(function(page_data) {
            $scope.data = page_data.data;
            $scope.FilterData.name = "";
            $ionicLoading.hide();

        })
        $scope.$broadcast('scroll.refreshComplete');
    };
    $scope.remove = function(name) {
        $ionicLoading.show({
            template: 'Please wait..'
        });
        Affiliate.affiliatecampremove("campaigns", name).then(function(page_data) {
            $scope.data = page_data.data;
            $ionicLoading.hide();
        })
        $scope.$broadcast('scroll.refreshComplete');

    };

});

app.controller('AffiliateTrafficCtrl', function($scope, $stateParams, $sce, $http, $ionicLoading, Affiliate, AffiliateData, ionicDatePicker) {
    $scope.data = AffiliateData.data;

    $scope.doRefresh = function() {
        $ionicLoading.show({
            template: 'Please wait..'
        });
        Affiliate.visits("visits").then(function(page_data) {
            $scope.data = page_data.data;
            $ionicLoading.hide();
        })
        $scope.$broadcast('scroll.refreshComplete');

    };

    $scope.getFilter = function() {
        $ionicLoading.show({
            template: 'Please wait..'
        });
        Affiliate.affiliate("visits", $scope.FilterData.start, $scope.FilterData.end, $scope.FilterData.status, 1).then(function(page_data) {
            $scope.data = page_data.data;
            $ionicLoading.hide();
        })
        $scope.$broadcast('scroll.refreshComplete');

    };

    $scope.FilterData = {};
    var ipObj1 = {
        callback: function(val) { //Mandatory
          //  console.log('Return value from the datepicker popup is : ' + val, new Date(val));
            $scope.FilterData.start = moment(val).format("YYYY-MM-DD");;
        }
    };
    var ipObj2 = {
        callback: function(val) { //Mandatory
           // console.log('Return value from the datepicker popup is : ' + val, new Date(val));
            $scope.FilterData.end = moment(val).format("YYYY-MM-DD");;
        }
    };
    $scope.filterstart = function() {
        ionicDatePicker.openDatePicker(ipObj1);
    };
    $scope.filterend = function() {
        ionicDatePicker.openDatePicker(ipObj2);
    };

});

app.controller('AffiliateReferralsHistoryCtrl', function($scope, $stateParams, $sce, $http, $ionicLoading, Affiliate, AffiliateData, ionicDatePicker) {
    $scope.data = AffiliateData.data;

    $scope.doRefresh = function() {
        $ionicLoading.show({
            template: 'Please wait..'
        });
        Affiliate.referrals_history("referrals_history").then(function(page_data) {
            $scope.data = page_data.data;
            $scope.page = 1;
            $scope.totalPages = page_data.data.totalpage;            
            $ionicLoading.hide();
        })
        $scope.$broadcast('scroll.refreshComplete');

    };

    $scope.getFilter = function() {
        $ionicLoading.show({
            template: 'Please wait..'
        });
        Affiliate.referrals_history("referrals_history", $scope.FilterData.start, $scope.FilterData.end).then(function(page_data) {
            $scope.data = page_data.data;
            $ionicLoading.hide();
        })
        $scope.$broadcast('scroll.refreshComplete');

    };

    $scope.FilterData = {};
    var ipObj1 = {
        callback: function(val) { //Mandatory
          //  console.log('Return value from the datepicker popup is : ' + val, new Date(val));
            $scope.FilterData.start = moment(val).format("YYYY-MM-DD");;
        }
    };
    var ipObj2 = {
        callback: function(val) { //Mandatory
           // console.log('Return value from the datepicker popup is : ' + val, new Date(val));
            $scope.FilterData.end = moment(val).format("YYYY-MM-DD");;
        }
    };
    $scope.filterstart = function() {
        ionicDatePicker.openDatePicker(ipObj1);
    };
    $scope.filterend = function() {
        ionicDatePicker.openDatePicker(ipObj2);
    };

});

//menu my account controler
app.controller('AccountProfile', function($scope, $stateParams, $state, $sce, $http, $ionicLoading, $localStorage, $ionicModal, $ionicPopup, IonicClosePopupService, Account, User, AccountData, Settings, Camera) {
    $scope.data = AccountData.data;
    $scope.profiledata = $localStorage.userData.data;
    $scope.profile = User($localStorage.userLogin.id).get();
    $scope.profile.gender = $scope.data.billing.gendar;
    $scope.profile.country = $scope.data.billing.country;

    $scope.doRefresh = function() {
        $ionicLoading.show({
            template: 'Please wait..'
        });
        Account.profile().then(function(page_data) {

            $scope.data = page_data.data;
            $scope.profiledata = $localStorage.userData.data;
            $scope.profile = User($localStorage.userLogin.id).get();
            $ionicLoading.hide();
        })
        $scope.$broadcast('scroll.refreshComplete');

    };
    $scope.default = {};
    $scope.default.lang = window.localStorage.lang;
    $scope.changeAvatar = function() {
        var options = {
            sourceType: 0,
            allowEdit: true,
            targetWidth: 160,
            targetHeight: 160,
            destinationType: 0
        };
        Camera.getPicture(options).then(function(imageData) {
            $scope.avatar = "data:image/jpeg;base64," + imageData;
            User($localStorage.userLogin.id).editAvatar($scope.avatar);
        }, function(err) {
          //  console.log(err);
        });
    };
    //nickname
    $ionicModal.fromTemplateUrl('templates/settings/name.html', {
        scope: $scope
    }).then(function(modal) {
        $scope.modalChangeName = modal;
    });
    $scope.showChangeName = function() {
        $scope.modalChangeName.show();
    };
    $scope.closeChangeName = function() {
        $scope.modalChangeName.hide();
    };
    $scope.changeName = function() {
        if ($scope.profile.name.length <= 20) {
            User($localStorage.userLogin.id).editName($scope.profile.name);
            $scope.closeChangeName();
        }
    };

    //fname
    $ionicModal.fromTemplateUrl('templates/settings/fname.html', {
        scope: $scope
    }).then(function(modal) {
        $scope.modalChangefName = modal;
    });
    $scope.showChangefName = function() {
        $scope.modalChangefName.show();
    };
    $scope.closeChangefName = function() {
        $scope.modalChangefName.hide();
    };
    $scope.changefName = function() {
        $ionicLoading.show({
            template: 'Please wait..'
        });
        Account.changefname($scope.profiledata.firstname).then(function(page_data) {
            $ionicLoading.hide();
        })
        $scope.$broadcast('scroll.refreshComplete');
        $scope.closeChangefName();

    };
    //lname
    $ionicModal.fromTemplateUrl('templates/settings/lname.html', {
        scope: $scope
    }).then(function(modal) {
        $scope.modalChangelName = modal;
    });
    $scope.showChangelName = function() {
        $scope.modalChangelName.show();
    };
    $scope.closeChangelName = function() {
        $scope.modalChangelName.hide();
    };

    $scope.changelName = function() {
        $ionicLoading.show({
            template: 'Please wait..'
        });
        Account.changelname($scope.profiledata.lastname).then(function(page_data) {
            //alert($scope.profiledata.lastname);
            $ionicLoading.hide();
        })
        $scope.$broadcast('scroll.refreshComplete');
        $scope.closeChangelName();
    };


    $ionicModal.fromTemplateUrl('templates/settings/country.html', {
        scope: $scope
    }).then(function(modal) {
        $scope.modalChangeCountry = modal;
    });
    $scope.showChangeCountry = function() {
        $scope.modalChangeCountry.show();
    };
    $scope.closeChangeCountry = function() {
        $scope.modalChangeCountry.hide();
    };
    $scope.changeCountry = function() {
        User($localStorage.userLogin.id).editCountry($scope.profile.country);
    };
    $scope.changeLang = function() {
        User($localStorage.userLogin.id).editLang($scope.default.lang);
        //alert("hhh");
    };

    

    $scope.changeGender = function() {
        User($localStorage.userLogin.id).editGender($scope.profile.gender);
    };



    $ionicModal.fromTemplateUrl('templates/settings/phone.html', {
        scope: $scope
    }).then(function(modal) {
        $scope.modalChangePhone = modal;
    });
    $scope.showChangePhone = function() {
        $scope.modalChangePhone.show();
    };
    $scope.closeChangePhone = function() {
        $scope.modalChangePhone.hide();
    };
    $scope.dataPhone = {};
    $scope.dataPhone.areacode = $localStorage.userLogin.areacode;
    $scope.alertPhone = function() {
        var confirmPopup = $ionicPopup.confirm({
            template: 'Your phone number is too short in the country enter<br/><br/>Enter the country code if you have not entered',
            cssClass: 'popup-confirm-delete',
            buttons: [{
                text: 'OK',
                type: 'button-clear button-no-delete col-50 col-offset-50'
            }]
        });
    };
    $scope.changePhone = function() {
        if ($scope.dataPhone.areacode && $scope.dataPhone.phone) {
            $scope.phoneFull = $scope.dataPhone.areacode.toString() + $scope.dataPhone.phone;
            //alert($scope.phoneFull.length);
            if ($scope.phoneFull.length >= 10) {
                User($localStorage.userLogin.id).editPhone($scope.phoneFull);
                $scope.closeChangePhone();
            } else $scope.alertPhone();
        } else $scope.alertPhone();
    };

    $scope.settings = {};
    $scope.settings.messages = Settings($localStorage.userLogin.id).get('messages');
    $scope.changeMessages = function(child) {
        var data = $scope.settings.messages[child];
        child = 'messages/' + child;
        Settings($localStorage.userLogin.id).change(child, data);
    };
    $scope.lastUpdate = $localStorage.lastUpdate;
    $scope.settings.contacts = Settings($localStorage.userLogin.id).get('contacts');
    $scope.changeContacts = function(child) {
        var data = $scope.settings.contacts[child];
        child = 'contacts/' + child;
        Settings($localStorage.userLogin.id).change(child, data);
    };
    $scope.showPopupSettingsListFriends = function() {
        var popupSettingsListFriends = $ionicPopup.show({
            title: 'Friends list show in contacts',
            cssClass: 'popup-select-radio',
            scope: $scope,
            template: '<ion-radio ng-model="settings.contacts.show_friend" ng-value="true" ng-click="changeContacts(\'show_friend\'); closePopupSettingsListFriends()">All friends</ion-radio><ion-radio ng-model="settings.contacts.show_friend" ng-value="false" ng-click="changeContacts(\'show_friend\'); closePopupSettingsListFriends()">Friends who use Cognisance</ion-radio>'
        });
        $scope.closePopupSettingsListFriends = function() {
            popupSettingsListFriends.close();
        };
        IonicClosePopupService.register(popupSettingsListFriends);
    };
    $scope.settings.languages = Settings($localStorage.userLogin.id).get('languages');
    $scope.showPopupSettingsLanguages = function() {
        var popupSettingsLanguages = $ionicPopup.show({
            title: 'Language',
            cssClass: 'popup-select-radio',
            scope: $scope,
            templateUrl: 'templates/settings/language.html'
        });
        $scope.closePopupSettingsLanguages = function() {
            popupSettingsLanguages.close();
        };
        IonicClosePopupService.register(popupSettingsLanguages);
    };
    $scope.changeLanguage = function() {
        Settings($localStorage.userLogin.id).change('languages/language', $scope.settings.languages.language);
    }
    $scope.showPopupSettingsFonts = function() {
        var popupSettingsFonts = $ionicPopup.show({
            title: 'Select font',
            cssClass: 'popup-select-radio',
            scope: $scope,
            template: '<ion-radio ng-model="settings.languages.font" ng-value="true" ng-click="changeFont(); closePopupSettingsFonts()">V-Life font</ion-radio><ion-radio ng-model="settings.languages.font" ng-value="false" ng-click="changeFont(); closePopupSettingsFonts()">System font</ion-radio>'
        });
        $scope.closePopupSettingsFonts = function() {
            popupSettingsFonts.close();
        };
        IonicClosePopupService.register(popupSettingsFonts);
    };
    $scope.changeFont = function() {
        Settings($localStorage.userLogin.id).change('languages/font', $scope.settings.languages.font);
    };
    $scope.showPopupLogout = function() {
        var confirmPopup = $ionicPopup.confirm({
            template: 'Log out?',
            cssClass: 'popup-confirm-logout',
            buttons: [{
                text: 'NO',
                type: 'button-clear button-no-logout'
            }, {
                text: 'YES',
                type: 'button-clear',
                onTap: function(e) {
                    delete $localStorage.userLogin;
                    $state.go('walkthrough');
                }
            }, ]
        });
    };

});

app.controller('AccountOrder', function($scope, $stateParams, $sce, $http, $ionicLoading, Account, AccountData) {
    $scope.data = AccountData.data;

    $scope.doRefresh = function() {
        $ionicLoading.show({
            template: 'Please wait..'
        });
        Account.order().then(function(page_data) {
            $scope.data = page_data.data;
            $ionicLoading.hide();
        })
        $scope.$broadcast('scroll.refreshComplete');

    };

});

app.controller('Accountsubscription', function($scope, $stateParams, $sce, $http, $ionicLoading, Account, AccountData) {
    $scope.data = AccountData.data;

    $scope.doRefresh = function() {
        $ionicLoading.show({
            template: 'Please wait..'
        });
        Account.subscription().then(function(page_data) {
            $scope.data = page_data.data;
            $ionicLoading.hide();
        })
        $scope.$broadcast('scroll.refreshComplete');

    };

});


app.controller('Accountadrs', function($scope, $stateParams, $sce, $http, $ionicLoading, $localStorage, Account, AccountService, AccountData) {
    $scope.data = AccountData.data;
    $scope.profiledata = $localStorage.userData.data;

    console.log($scope.data);
    $scope.doRefresh = function() {
        $ionicLoading.show({
            template: 'Please wait..'
        });
        Account.adrs().then(function(page_data) {

            $scope.data = page_data.data;
            $scope.profiledata = $localStorage.userData.data;
            $scope.init();
            $ionicLoading.hide();
        })
        $scope.$broadcast('scroll.refreshComplete');


    };

    $scope.saveadrs = function(newOrder) {
        var adrs = {

            billing_address: {
                first_name: newOrder.billing.first_name,
                last_name: newOrder.billing.last_name,
                address_1: newOrder.billing.address_1,
                address_2: newOrder.billing.address_2,
                city: newOrder.billing.city,
                state: newOrder.billing.state,
                postcode: newOrder.billing.postcode,
                country: newOrder.billing.country,
                phone: newOrder.billing.phone,                
                email: $localStorage.userData.data.email,
            },
            shipping_address: {
                first_name: newOrder.shipping.first_name,
                last_name: newOrder.shipping.last_name,
                address_1: newOrder.shipping.address_1,
                address_2: newOrder.shipping.address_2,
                city: newOrder.shipping.city,
                state: newOrder.shipping.state,
                postcode: newOrder.shipping.postcode,
                country: newOrder.shipping.country
            }
        };

        var orderData = {};
        var paramJSON = JSON.stringify(adrs);

        $ionicLoading.show({
            template: 'Processing...'
        });
        AccountService.saveadrs(paramJSON).then(function(data) {
            if (data.status == "ok") {
                $ionicLoading.hide();
            }
        });



    }

    $scope.init = function() {

        $scope.newOrder = {};
        $scope.newOrder.billing = {};
        $scope.newOrder.shipping = {};
        $scope.newOrder.stripe = {};
        $scope.custom = true;
        $scope.newOrder.billing.first_name = $scope.data.billing.first_name;
        $scope.newOrder.billing.last_name = $scope.data.billing.last_name;
        $scope.newOrder.billing.address_1 = $scope.data.billing.address_1;
        $scope.newOrder.billing.address_2 = $scope.data.billing.address_2;
        $scope.newOrder.billing.city = $scope.data.billing.city;
        $scope.newOrder.billing.state = $scope.data.billing.state;
        $scope.newOrder.billing.postcode = $scope.data.billing.postcode;
        $scope.newOrder.billing.phone = $scope.data.billing.phone;
        $scope.newOrder.billing.country = $scope.data.billing.country;    

        //shiping
        $scope.newOrder.shipping.first_name = $scope.data.shipping.first_name;
        $scope.newOrder.shipping.last_name = $scope.data.shipping.last_name;
        $scope.newOrder.shipping.address_1 = $scope.data.shipping.address_1;
        $scope.newOrder.shipping.address_2 = $scope.data.shipping.address_2;
        $scope.newOrder.shipping.city = $scope.data.shipping.city;
        $scope.newOrder.shipping.state = $scope.data.shipping.state;
        $scope.newOrder.shipping.postcode = $scope.data.shipping.postcode;
        $scope.newOrder.shipping.country = $scope.data.shipping.country;
        $scope.newOrder.shipping.method = '';           

    };

    $scope.init();

});


app.controller('PageCtrl', function($scope, $sce, $ionicHistory, $location, WpPageService, $stateParams, $ionicLoading, myFactory, WpPage, page_data) {
    $scope.post = page_data.page;
    $scope.content = $sce.trustAsHtml(page_data.page.content);

    $scope.doRefresh = function() {
        $ionicLoading.show({
            template: 'Please wait..'
        });
        WpPage.getpage($stateParams.pageid).then(function(page_data) {
            $scope.post = page_data.page;
            $scope.content = $sce.trustAsHtml(page_data.page.content);
            $ionicLoading.hide();
        })

        $scope.$broadcast('scroll.refreshComplete');

    }
    $ionicHistory.nextViewOptions({
        historyRoot: true
    });

});


//EMAIL SENDER
app.controller('EmailSenderCtrl', function($scope) {
    $scope.mail = {};
    $scope.sendEmail = function() {
        if (window.plugins && window.plugins.emailComposer) {
            window.plugins.emailComposer.showEmailComposerWithCallback(function(result) {
                   $scope.mail = {};
                }, $scope.mail.sub, // Subject
                $scope.mail.msg, // Body
                ["cs@cognisance.life"], // To
                null, // CC
                null, // BCC
                false, // isHTML
                null, // Attachments
                null); // Attachment Data
        }
    }
});

app.controller('CategoryCtrl', function($scope) {});

//messaging 
app.controller('areacodeCtrl', function($scope, $ionicModal, Areacode) {
    $scope.areacodes = Areacode;
    $ionicModal.fromTemplateUrl('templates/sign/areacode.html', {
        scope: $scope
    }).then(function(modal) {
        $scope.areaCode = modal;
    });
    $scope.closeareaCode = function() {
        $scope.areaCode.hide();
    };
    $scope.showareaCode = function() {
        $scope.areaCode.show();
    };
    $scope.choseAreaCode = function(name, areacode) {
        $scope.choseArea.name = name;
        $scope.choseArea.areacode = areacode;
        $scope.closeareaCode();
    };
});

app.controller('signCtrl', function($scope, $state, $http, $ionicPopup, Login, User, Camera, $filter, $localStorage) {
    $scope.data = {};
    $scope.choseArea = {
        name: "United States",
        "areacode": "1"
    };
    $scope.showValue = {
        "type": "password",
        "text": "Show"
    };
    $scope.login = function() {
        if (!angular.isDefined($scope.data.phone)) {
            $scope.data.notification = "Plese enter your phone number to continue";
        } else {
            $scope.showLoading("Loading...");
            $scope.data.notification = false;
            $scope.data.fullPhone = $scope.choseArea.areacode + $scope.data.phone;
            $scope.userLogin = Login().get($scope.data.fullPhone);
            $scope.userLogin.$loaded(function() {
                $scope.hideLoading();
                if (angular.isDefined($scope.userLogin.active)) {
                    $scope.data.notification = "Your account is inactive, please active mail for register";
                } else {
                    if ($scope.userLogin.password == $scope.data.password) {
                        $localStorage.userLogin = {};
                        $localStorage.userLogin.isLogin = true;
                        $localStorage.userLogin.id = $scope.userLogin.id;
                        $localStorage.userLogin.phone = $scope.userLogin.$id;
                        $localStorage.userLogin.password = $scope.data.password;
                        $localStorage.userLogin.areacode = Number($scope.choseArea.areacode);
                        $state.go("tab.messages");
                    } else {
                        $scope.data.notification = "The password you entered is incorrect";
                    }
                }
            });
        }
    };
    $scope.register = function() {
        if (!$scope.data.phone || !$scope.data.password) {
            $scope.data.notification = "Plese enter data to continue";
        } else if ($scope.data.password != $scope.data.repassword) {
            $scope.data.notification = "Confirmation password do not match";
        } else {
            $scope.showLoading("Loading...");
            $scope.data.notification = false;
            $scope.data.fullPhone = $scope.choseArea.areacode + $scope.data.phone;
            $scope.userLogin = Login().get($scope.data.fullPhone);
            $scope.userLogin.$loaded(function() {
                if (angular.isUndefined($scope.userLogin.$value)) {
                    $scope.data.notification = "Phone number is already registered";
                    $scope.hideLoading();
                } else {
                    $scope.checkEmail = Login().getEmail($scope.data.email);
                    $scope.checkEmail.$loaded(function() {
                        if (angular.isDefined($scope.checkEmail.$value)) {
                            Login().set($scope.data.fullPhone);
                            Login().changePass($scope.data.fullPhone, $scope.data.password);
                            $http.head($scope.hostMail + '?email=' + $scope.data.email + '&phone=' + $scope.data.fullPhone).then(function() {
                                $scope.hideLoading();
                                $state.go('login');
                            });
                        } else {
                            $scope.hideLoading();
                            $scope.data.notification = "Email is already registered";
                        }
                    });
                }
            });
        }
    };
    $scope.showForgot = function() {
        if (!$scope.data.phone) {
            $scope.data.notification = "Please enter your phone number to continue";
        } else {
            $scope.showLoading("Loading...");
            $scope.data.notification = false;
            $scope.data.fullPhone = $scope.choseArea.areacode + $scope.data.phone;
            $scope.userForgot = Login().get($scope.data.fullPhone);
            $scope.userForgot.$loaded(function() {
                if (angular.isDefined($scope.userForgot.$value)) {
                    $scope.hideLoading();
                    $scope.data.notification = "Phone number is not registered";
                } else {
                    $scope.hideLoading();
                    var confirmPopup = $ionicPopup.confirm({
                        scope: $scope,
                        title: 'Confirm number',
                        cssClass: 'popup-forgot text-center',
                        templateUrl: 'templates/sign/forgot.html',
                        buttons: [{
                            text: 'Change'
                        }, {
                            text: 'Confirm',
                            onTap: function(e) {
                                $scope.showLoading("Loading...");
                                $http.head($scope.hostMail + '?action=forgot&phone=' + $scope.data.fullPhone).then(function() {
                                    $scope.hideLoading();
                                });
                            }
                        }]
                    });
                }
            });
        }
    };
    $scope.showPassword = function() {
        if ($scope.showValue.type == "password") {
            $scope.showValue = {
                "type": "text",
                "text": "Hide"
            }
        } else {
            $scope.showValue = {
                "type": "password",
                "text": "Show"
            }
        }
    };
    $scope.takeAvatar = function() {
        var options = {
            sourceType: 0,
            allowEdit: true,
            targetWidth: 160,
            targetHeight: 160,
            destinationType: 0
        };
        Camera.getPicture(options).then(function(imageData) {
            $scope.data.avatar = "data:image/jpeg;base64," + imageData;
        }, function(err) {
           // console.log(err);
        });
    };
    $scope.editInfomation = function() {
        delete $scope.data.notification;
        if (angular.isUndefined($scope.data.name) || angular.isUndefined($scope.data.birthday)) {
            $scope.data.notification = "Plese enter Name and Birthday to continue";
        } else {
            $scope.data.birthday = $filter('date')($scope.data.birthday, 'dd/MM/yyyy');
            $scope.data.phone = $localStorage.userLogin.phone;
            User($localStorage.userLogin.id).set($scope.data);
            $state.go('App.messages');
        }
    };
});

app.controller('tabCtrl', function($scope, $localStorage, Notification) {
    $scope.notification = Notification($localStorage.userLogin.id).get();
});

app.controller('messagesCtrl', function($scope, $ionicPopup, $rootScope, Messages, User, $state, $localStorage,ContactsRecommended) {
    $scope.checkProfiles = User($localStorage.userLogin.id).get();
    $scope.admin = $localStorage.userData.data.capabilities.administrator;
    $scope.broadcast = $localStorage.userData.data.broadcast;

    //remove msgicon
    $scope.contactRecommended = ContactsRecommended($localStorage.userLogin.id).get();
    // $scope.checkProfiles.$loaded(function() {
    //     if (angular.isDefined($scope.checkProfiles.$value)) $state.go("editInfomation");
    //     else User($localStorage.userLogin.id).update();
    // });
    $scope.showLoading('Loading...');
    $scope.messages = Messages($localStorage.userLogin.id).get();
    $scope.removeicon = Messages($localStorage.userLogin.id).removemsgicon($localStorage.userLogin.id);


    $scope.messages.$loaded(function() {
        $scope.loadMessage = function() {
            angular.forEach($scope.messages, function(value) {
                value.name = User(value.$id).getName();
                value.avatar = User(value.$id).getAvatar();
            });
        };
        $scope.loadMessage();
        var watch = firebase.database().ref('messages').child($localStorage.userLogin.id);
        watch.on('value', function() {
            $scope.loadMessage();
        });
        $scope.hideLoading();
        $scope.$watch('messages.length', function(newVal, oldVal) {
            if (oldVal != newVal) $state.reload();
        });
    });
    $scope.message = {};
    $scope.choseMessagesCount = 0;
    $scope.choseMessage = function(message) {
        if (message.selected) {
            $scope.choseMessagesCount++
        } else {
            $scope.choseMessagesCount--
        }
        if ($scope.choseMessagesCount == 0) $rootScope.hideTabs = false;
        else $rootScope.hideTabs = true;
    };
    $scope.cancelChoseMessages = function() {
        angular.forEach($scope.messages, function(value) {
            delete value.selected;
        });
        $scope.choseMessagesCount = 0;
        $rootScope.hideTabs = false;
    };
    $scope.deleteMessages = function() {
        var confirmPopup = $ionicPopup.confirm({
            template: 'Delete all selected messages?',
            cssClass: 'popup-confirm-delete',
            buttons: [{
                text: 'NO',
                type: 'button-clear button-no-delete'
            }, {
                text: 'DELETE',
                type: 'button-clear',
                onTap: function(e) {
                    angular.forEach($scope.messages, function(value) {
                        if (value.selected) {
                            Messages($localStorage.userLogin.id).delete(value.$id, value.unread)
                        }
                    });
                    location.reload();
                }
            }]
        });
    };
});

app.controller('messagesDetail', function($scope, $ionicScrollDelegate, $ionicTabsDelegate, $ionicSideMenuDelegate, $timeout, $ionicPopup, IonicClosePopupService, Notification, Block, Messages, Camera, DetailMessages, User, $localStorage, $state, $stateParams, Location) {
    $scope.showLoading('Loading...');
    $scope.Unread = Messages($localStorage.userLogin.id).getUnread($stateParams.id);
    $scope.Unread.$loaded(function() {
        if ($scope.Unread.$value > 0) {
            Notification($localStorage.userLogin.id).update($scope.Unread.$value);
            Messages($localStorage.userLogin.id).reset($stateParams.id);
        }
    });
    var onNewMessage = firebase.database().ref('detailMessages/' + $localStorage.userLogin.id).child($stateParams.id);
    onNewMessage.on('value', function() {
        $ionicScrollDelegate.$getByHandle('mainScroll').scrollBottom();
    });
    $scope.Detail = DetailMessages($localStorage.userLogin.id).get($stateParams.id);
    $scope.Me = {};
    $scope.Me.name = User($localStorage.userLogin.id).getName();
    $scope.Me.avatar = User($localStorage.userLogin.id).getAvatar();
    $scope.Friend = User($stateParams.id).get();
    $scope.$watch(function() {
        return $ionicSideMenuDelegate.getOpenRatio();
    }, function(right) {
        if (right === -1) $scope.menuRightActived = true;
        else $scope.menuRightActived = false;
    });
    $scope.showPopupMenuMessages = function(type, title, id) {
        if (type != "text") title = "Select action";
        var popupMenuMessages = $ionicPopup.show({
            title: '"' + title + '"',
            cssClass: 'popup-menu-messages',
            scope: $scope,
            buttons: [{
                text: 'Copy',
                type: 'button-clear'
            }, {
                text: 'Delete',
                type: 'button-clear',
                onTap: function(e) {
                    DetailMessages($localStorage.userLogin.id).delete($stateParams.id, id);
                }
            }, ]
        });
        IonicClosePopupService.register(popupMenuMessages);
    }
    $scope.Block = Block($localStorage.userLogin.id).get($stateParams.id);
    $scope.Block.$loaded(function() {
        if (!$scope.Block.$value) {
            $scope.contentBottom = '100px';
            $scope.messageInput = function(option) {
                if (option == "text") $scope.contentBottom = '100px';
                else $scope.contentBottom = '220px';
            };
            $scope.inputText = {
                "from": 0,
                "type": "text"
            };
            $scope.sendText = function() {
                if (angular.isDefined($scope.inputText.content) && angular.isString($scope.inputText.content)) {
                    var now = new Date().getTime();
                    $scope.inputText.time = now;
                    DetailMessages($localStorage.userLogin.id).post($stateParams.id, $scope.inputText);
                    $scope.Messages = {};
                    $scope.Messages.content = $scope.inputText.content;
                    $scope.Messages.time = $scope.inputText.time;
                    $scope.Messages.unread = 0;
                    Messages($localStorage.userLogin.id).post($stateParams.id, $scope.Messages);
                    Notification().post($stateParams.id);
                    $scope.inputText = {
                        "from": 0,
                        "type": "text"
                    };
                }
            };
            $scope.inputPicture = {
                "from": 0,
                "type": "picture"
            };
            $scope.takePicture = function() {
                $ionicTabsDelegate.select(1);
                var options = {
                    quality: 75,
                    targetWidth: 720,
                    targetHeight: 1280,
                    destinationType: 0
                };
                Camera.getPicture(options).then(function(imageData) {
                    $scope.inputPicture.content = "data:image/jpeg;base64," + imageData;
                }, function(err) {
                   // console.log(err);
                });
            };
            $scope.sendPicture = function() {
                if (angular.isDefined($scope.inputPicture.content)) {
                    var now = new Date().getTime();
                    $scope.inputPicture.time = now;
                    DetailMessages($localStorage.userLogin.id).post($stateParams.id, $scope.inputPicture);
                    $scope.Messages = {};
                    $scope.Messages.content = "[picture]";
                    $scope.Messages.time = $scope.inputPicture.time;
                    $scope.Messages.unread = 0;
                    Messages($localStorage.userLogin.id).post($stateParams.id, $scope.Messages);
                    Notification().post($stateParams.id);
                    $scope.inputPicture = {
                        "from": 0,
                        "type": "picture"
                    };
                } else $scope.takePicture();
            };
            $scope.showInputImages = function() {
                var options = {
                    sourceType: 0,
                    destinationType: 0
                };
                Camera.getPicture(options).then(function(imageData) {
                    $scope.inputPicture.content = "data:image/jpeg;base64," + imageData;
                    $ionicTabsDelegate.select(1);
                }, function(err) {
                    //console.log(err);
                });
            };
            $scope.inputSticker = {
                "from": 0,
                "type": "sticker"
            };
            $scope.sendSticker = function(sticker) {
                if (angular.isDefined(sticker) && angular.isNumber(sticker)) {
                    var now = new Date().getTime();
                    $scope.inputSticker.time = now;
                    $scope.inputSticker.content = sticker;
                    DetailMessages($localStorage.userLogin.id).post($stateParams.id, $scope.inputSticker);
                    $scope.Messages = {};
                    $scope.Messages.content = "[sticker]";
                    $scope.Messages.time = $scope.inputSticker.time;
                    $scope.Messages.unread = 0;
                    Messages($localStorage.userLogin.id).post($stateParams.id, $scope.Messages);
                    Notification().post($stateParams.id);
                    $scope.inputSticker = {
                        "from": 0,
                        "type": "sticker"
                    };
                }
            };
            $scope.showSendLocation = function() {
                $state.go('sendLocation', {
                    id: $stateParams.id
                });
            };
        }
        $scope.hideLoading();
        $ionicScrollDelegate.scrollBottom();
    });
    $scope.blockPerson = function() {
        if (!$scope.Block.$value) {
            Block($localStorage.userLogin.id).remove($stateParams.id);
            location.reload();
        } else {
            var confirmPopup = $ionicPopup.confirm({
                template: 'This person will not be able to send messages to you.Block him/her?',
                cssClass: 'popup-confirm-delete',
                buttons: [{
                    text: 'NO',
                    type: 'button-clear',
                    onTap: function(e) {
                        $scope.Block.$value = false
                    }
                }, {
                    text: 'YES',
                    type: 'button-clear button-no-delete',
                    onTap: function(e) {
                        Block($localStorage.userLogin.id).block($stateParams.id);
                        location.reload();
                    }
                }, ]
            });
        }
    };
    $scope.clearHistory = function() {
        var confirmPopup = $ionicPopup.confirm({
            template: 'Delete chat history with this person?',
            cssClass: 'popup-confirm-delete',
            buttons: [{
                text: 'NO',
                type: 'button-clear button-no-delete'
            }, {
                text: 'YES',
                type: 'button-clear',
                onTap: function(e) {
                    DetailMessages($localStorage.userLogin.id).clear($stateParams.id);
                    Messages($localStorage.userLogin.id).clear($stateParams.id);
                }
            }, ]
        });
    };
});


app.controller('broadcastDetail', function($scope, $ionicScrollDelegate, $ionicTabsDelegate, $ionicSideMenuDelegate, $timeout, $ionicPopup, IonicClosePopupService, Notification, Block, Messages, Camera, DetailMessages, User, $localStorage, $state, $stateParams, Location, Broadcast) {

    $scope.showLoading('Loading...');
    $scope.broadcastid = 100;
    //$scope.admin = $localStorage.userData.data.capabilities.subscriber;
    $scope.admin = $localStorage.userData.data.capabilities.administrator;


    $scope.Unread = Messages($localStorage.userLogin.id).getUnread($scope.broadcastid);
    $scope.Unread.$loaded(function() {
        if ($scope.Unread.$value > 0) {
            Notification($localStorage.userLogin.id).update($scope.Unread.$value);
            Messages($localStorage.userLogin.id).reset($scope.broadcastid);
        }
    });
    var onNewMessage = firebase.database().ref('detailMessages/' + $localStorage.userLogin.id).child($scope.broadcastid);
    onNewMessage.on('value', function() {
        $ionicScrollDelegate.$getByHandle('mainScroll').scrollBottom();
    });
    $scope.Detail = DetailMessages($localStorage.userLogin.id).get($scope.broadcastid);
    $scope.Me = {};
    $scope.Me.name = User($localStorage.userLogin.id).getName();
    $scope.Me.avatar = User($localStorage.userLogin.id).getAvatar();
    $scope.Friend = User($scope.broadcastid).get();

    $scope.$watch(function() {
        return $ionicSideMenuDelegate.getOpenRatio();
    }, function(right) {
        if (right === -1) $scope.menuRightActived = true;
        else $scope.menuRightActived = false;
    });
    $scope.showPopupMenuMessages = function(type, title, id) {
        if (type != "text") title = "Select action";
        var popupMenuMessages = $ionicPopup.show({
            title: '"' + title + '"',
            cssClass: 'popup-menu-messages',
            scope: $scope,
            buttons: [{
                text: 'Copy',
                type: 'button-clear'
            }, {
                text: 'Delete',
                type: 'button-clear',
                onTap: function(e) {
                    DetailMessages($localStorage.userLogin.id).delete($stateParams.id, id);
                }
            }, ]
        });
        IonicClosePopupService.register(popupMenuMessages);
    }
    $scope.Block = Block($localStorage.userLogin.id).get($scope.broadcastid);
    $scope.Block.$loaded(function() {
        if (!$scope.Block.$value) {
            $scope.contentBottom = '100px';
            $scope.messageInput = function(option) {
                if (option == "text") $scope.contentBottom = '100px';
                else $scope.contentBottom = '220px';
            };
            $scope.inputText = {
                "from": 0,
                "type": "text"
            };
            $scope.sendText = function() {
                if (angular.isDefined($scope.inputText.content) && angular.isString($scope.inputText.content)) {


                    Broadcast.getList($scope.inputText.country).then(function(data) {
                        $scope.currentUser = data.data.receiver;
                      //  console.log($scope.currentUser);
                        var now = new Date().getTime();
                        $scope.inputText.time = now;

                        $scope.Messages = {};
                        $scope.Messages.content = $scope.inputText.content;
                        var msg = $scope.inputText.content;
                        $scope.Messages.time = $scope.inputText.time;
                        $scope.Messages.unread = 0;

                        angular.forEach($scope.currentUser, function(value, key) {

                            DetailMessages($localStorage.userLogin.id).post(value, $scope.inputText);
                            Messages($localStorage.userLogin.id).post(value, $scope.Messages);
                            Notification().post(value);
                          //  console.log("sent to" + value);
                            $scope.inputText = {
                                "from": 0,
                                "type": "text",
                                "content": msg,
                            };




                        });


                    });
                }
            };

            $scope.takePicture = function() {
                $ionicTabsDelegate.select(1);
                var options = {
                    quality: 75,
                    targetWidth: 720,
                    targetHeight: 1280,
                    destinationType: 0
                };
                Camera.getPicture(options).then(function(imageData) {
                    $scope.inputPicture.content = "data:image/jpeg;base64," + imageData;
                }, function(err) {
                  //  console.log(err);
                });
            };
            $scope.sendPicture = function() {
                if (angular.isDefined($scope.inputPicture.content)) {


                    Broadcast.getList($scope.inputText.country).then(function(data) {
                        $scope.currentUser = data.data.receiver;
                       // console.log($scope.currentUser);

                        var now = new Date().getTime();
                        $scope.inputPicture.time = now;
                        $scope.Messages = {};
                        $scope.Messages.content = "[picture]";
                        $scope.Messages.time = $scope.inputPicture.time;
                        $scope.Messages.unread = 0;
                        angular.forEach($scope.currentUser, function(value, key) {
                            DetailMessages($localStorage.userLogin.id).post(value, $scope.inputPicture);
                            Messages($localStorage.userLogin.id).post(value, $scope.Messages);
                            Notification().post(value);

                            $scope.inputPicture = {
                                "from": 0,
                                "type": "picture",
                                "content": $scope.inputPicture.content,
                            };




                        });

                    });

                } else $scope.takePicture();
            };
            $scope.showInputImages = function() {
                var options = {
                    sourceType: 0,
                    destinationType: 0
                };
                Camera.getPicture(options).then(function(imageData) {
                    $scope.inputPicture.content = "data:image/jpeg;base64," + imageData;
                    $ionicTabsDelegate.select(1);
                }, function(err) {
                  //  console.log(err);
                });
            };
            $scope.inputSticker = {
                "from": 0,
                "type": "sticker"
            };
            $scope.sendSticker = function(sticker) {
                if (angular.isDefined(sticker) && angular.isNumber(sticker)) {
                    Broadcast.getList($scope.inputText.country).then(function(data) {
                        $scope.currentUser = data.data.receiver;
                    //    console.log($scope.currentUser);
                        var now = new Date().getTime();
                        $scope.inputSticker.time = now;
                        $scope.inputSticker.content = sticker;
                        $scope.Messages = {};
                        $scope.Messages.content = "[sticker]";
                        $scope.Messages.time = $scope.inputSticker.time;
                        $scope.Messages.unread = 0;
                        angular.forEach($scope.currentUser, function(value, key) {
                            DetailMessages($localStorage.userLogin.id).post(value, $scope.inputSticker);
                            Messages($localStorage.userLogin.id).post(value, $scope.Messages);
                            Notification().post(value);

                            $scope.inputSticker = {
                                "from": 0,
                                "type": "sticker",
                                "content": sticker,
                            };




                        });

                    });

                }
            };
            $scope.showSendLocation = function() {
                $state.go('sendLocation', {
                    id: $stateParams.id
                });
            };
        }
        $scope.hideLoading();
        $ionicScrollDelegate.scrollBottom();
    });
    $scope.blockPerson = function() {
        if (!$scope.Block.$value) {
            Block($localStorage.userLogin.id).remove($stateParams.id);
            location.reload();
        } else {
            var confirmPopup = $ionicPopup.confirm({
                template: 'This person will not be able to send messages to you.Block him/her?',
                cssClass: 'popup-confirm-delete',
                buttons: [{
                    text: 'NO',
                    type: 'button-clear',
                    onTap: function(e) {
                        $scope.Block.$value = false
                    }
                }, {
                    text: 'YES',
                    type: 'button-clear button-no-delete',
                    onTap: function(e) {
                        Block($localStorage.userLogin.id).block($stateParams.id);
                        location.reload();
                    }
                }, ]
            });
        }
    };
    $scope.clearHistory = function() {
        var confirmPopup = $ionicPopup.confirm({
            template: 'Delete chat history with this person?',
            cssClass: 'popup-confirm-delete',
            buttons: [{
                text: 'NO',
                type: 'button-clear button-no-delete'
            }, {
                text: 'YES',
                type: 'button-clear',
                onTap: function(e) {
                    DetailMessages($localStorage.userLogin.id).clear($stateParams.id);
                    Messages($localStorage.userLogin.id).clear($stateParams.id);
                }
            }, ]
        });
    };
});

app.controller('sendLocation', function($scope, Location, $state, $stateParams, $localStorage, Messages, DetailMessages, DetailGroups, $ionicModal) {
    Location($localStorage.userLogin.id).update();
    $scope.inputLocation = {
        "from": 0,
        "type": "location"
    };
    if (angular.isUndefined($localStorage.recentLocation)) $localStorage.recentLocation = [];
    $scope.recent = $localStorage.recentLocation;
    $scope.Me = Location($localStorage.userLogin.id).get();
    $scope.Me.$loaded(function() {
        if (angular.isDefined($scope.Me.$value)) $scope.Me = {
            lat: 21.036728,
            lng: 105.8346994
        };
        $scope.location = {};
        $scope.location.lat = $scope.Me.lat;
        $scope.location.lng = $scope.Me.lng;
        var mapOptions = {
            center: {
                lat: $scope.location.lat,
                lng: $scope.location.lng
            },
            zoom: 18,
        };
        $scope.map = new google.maps.Map(document.getElementById("map"), mapOptions);
        //Marker location of user logined
        $scope.markerIcon = {
            url: 'css/img/icon-location-marker.png',
            scaledSize: new google.maps.Size(32, 32)
        };
        $scope.createMarker = function() {
            $scope.marker = new google.maps.Marker({
                map: $scope.map,
                position: $scope.location,
                icon: $scope.markerIcon
            });
        };
        $scope.createMarker();
        $scope.data = {};
        $scope.$watch('data.search', function() {
            if ($scope.data.search) {
                var request = {};
                request.query = $scope.data.search;
                $scope.search = new google.maps.places.PlacesService($scope.map);
                $scope.search.textSearch(request, function(resuilt, status) {
                    if (status == google.maps.places.PlacesServiceStatus.OK) {
                        $scope.resuilt = resuilt;
                    }
                });
            }
        });
        $scope.selectLocation = function(location) {
            $scope.location.lat = location.geometry.location.lat();
            $scope.location.lng = location.geometry.location.lng();
            $scope.data.name = location.name;
            $scope.data.address = location.formatted_address;
            $scope.createMarker();
            $scope.map.panTo($scope.location);
            $scope.closeSearchLocation();
        };
        $scope.selectRecent = function(location) {
            $scope.location = location.location;
            $scope.data.name = location.name;
            $scope.data.address = location.address;
            $scope.createMarker();
            $scope.map.panTo($scope.location);
        };
    });
    $ionicModal.fromTemplateUrl('templates/messages/search-location.html', {
        scope: $scope
    }).then(function(modal) {
        $scope.modalsearchLocation = modal;
    });
    $scope.showSearchLocation = function() {
        $scope.modalsearchLocation.show();
    };
    $scope.closeSearchLocation = function() {
        $scope.modalsearchLocation.hide();
    };
    $scope.sendLocation = function() {
        $scope.inputLocation.content = $scope.location;
        if (angular.isDefined($scope.inputLocation.content)) {
            if (angular.isDefined($scope.data.name)) {
                var check = true;
                angular.forEach($localStorage.recentLocation, function(value) {
                    if (value.name = $scope.data.name) check = false;
                });
                if (check == true) {
                    var newRecent = {};
                    newRecent.location = $scope.inputLocation.content;
                    newRecent.name = $scope.data.name;
                    newRecent.address = $scope.data.address;
                    $localStorage.recentLocation.push(newRecent);
                }
            }
            var now = new Date().getTime();
            $scope.inputLocation.time = now;
            if ($stateParams.source == 'group') {
                $state.go('groupDetail', {
                    id: $stateParams.id
                });
                $scope.inputLocation.from = $localStorage.userLogin.id;
                DetailGroups($stateParams.id).post($scope.inputLocation);
                $scope.inputLocation = {
                    "from": 0,
                    "type": "location"
                };
            } else {
                $state.go('detail', {
                    id: $stateParams.id
                });
                DetailMessages($localStorage.userLogin.id).post($stateParams.id, $scope.inputLocation);
                $scope.Messages = {};
                $scope.Messages.content = '[location]';
                $scope.Messages.time = $scope.inputLocation.time;
                $scope.Messages.unread = 0;
                Messages($localStorage.userLogin.id).post($stateParams.id, $scope.Messages);
                Notification().post($stateParams.id);
                $scope.inputLocation = {
                    "from": 0,
                    "type": "location"
                };
            }
        }
    };
});

app.controller('messagesCall', function($scope, $ionicModal, $timeout) {
    $scope.callStatus = "Calling";
    $scope.callTime = {};
    $scope.callTime = {
        "minute": 0,
        "second": 0
    };
    $scope.call = {};
    $scope.call.recount = 0;
    $scope.call.size = 140;
    $scope.call.spacing = 20;
    $scope.call.margin = -70;
    $scope.call.top = -40;
    $scope.changeBackground = function() {
        if ($scope.call.size >= 300) {
            $scope.call.size = 140;
            $scope.call.spacing = 20;
            $scope.call.margin = -70;
            $scope.call.top = -40;
            $scope.call.recount++;
        } else {
            $scope.call.size += 40;
            $scope.call.spacing += 10;
            $scope.call.margin -= 20;
            $scope.call.top -= 20;
        }
        if ($scope.call.recount >= 2) $scope.callStatus = "Ringing...";
        if ($scope.call.recount >= 3) {
            $scope.callStatus = "Quality:";
            $scope.callListing = true;
        }
        if ($scope.callStatus == "Quality:") {
            $scope.callTime.second++;
            if ($scope.callTime.second >= 60) {
                $scope.callTime.minute++;
                $scope.callTime.second = 0;
            }
        }
        $scope.autoChange = $timeout(function() {
            $scope.changeBackground();
        }, 1000);
    }
    $scope.changeBackground();
    $ionicModal.fromTemplateUrl('templates/messages/call.html', {
        scope: $scope
    }).then(function(modal) {
        $scope.modalmessagesCall = modal;
    });
    $scope.showMessagesCall = function() {
        $scope.modalmessagesCall.show();
    };
    $scope.closeMessagesCall = function() {
        $scope.modalmessagesCall.hide();
        location.reload();
    };
});

app.controller('contactsCtrl', function($scope, $ionicPopup, IonicClosePopupService, Block, Contacts, ContactsRecommended, User, $localStorage, $filter) {
    $scope.showLoading('Loading...');
    $scope.timeNow = new Date().getTime();
    $scope.contactRecommended = ContactsRecommended($localStorage.userLogin.id).get();
    $scope.contacts = Contacts($localStorage.userLogin.id).get();
    $scope.contacts.$loaded(function() {
        $scope.hideLoading();
        angular.forEach($scope.contacts, function(value) {
            value.name = User(value.$id).getName();
            value.avatar = User(value.$id).getAvatar();
            value.lastSign = User(value.$id).getLastSign();
        });
        $scope.getAlpha = function(id) {
            if (id >= 1) {
                $scope.contacts = $filter('orderBy')($scope.contacts, 'name.$value');
                var lastName = $filter('firstChar')($scope.contacts[id - 1].name.$value);
                var nowName = $filter('firstChar')($scope.contacts[id].name.$value);
                if (lastName == nowName) return false;
                else return true;
            }
        };
    });
    $scope.showMenuSearch = function(name, id) {
        var confirmPopup = $ionicPopup.confirm({
            title: name,
            cssClass: 'popup-menu-contact',
            buttons: [{
                text: 'Block',
                type: 'button-clear',
                onTap: function(e) {
                    $scope.Block = Block($localStorage.userLogin.id).get(id);
                    $scope.Block.$loaded(function() {
                        if ($scope.Block.$value) {
                            Block($localStorage.userLogin.id).remove(id);
                            location.reload();
                        } else {
                            var confirmPopup = $ionicPopup.confirm({
                                template: 'This person will not be able to send messages to you.Block him/her?',
                                cssClass: 'popup-confirm-delete',
                                buttons: [{
                                    text: 'NO',
                                    type: 'button-clear',
                                }, {
                                    text: 'YES',
                                    type: 'button-clear button-no-delete',
                                    onTap: function(e) {
                                        Block($localStorage.userLogin.id).block(id);
                                        location.reload();
                                    }
                                }, ]
                            });
                        }
                    });
                }
            }, {
                text: 'Remove friend',
                type: 'button-clear',
                onTap: function(e) {
                    Contacts($localStorage.userLogin.id).remove(id);
                }
            }]
        });
        IonicClosePopupService.register(confirmPopup);
    };
});
app.controller('contactsRecommended', function($scope, ContactsRecommended, Contacts, User, $localStorage) {
    $scope.showLoading('Loading...');
    $scope.contacts = ContactsRecommended($localStorage.userLogin.id).get();
    $scope.contacts.$loaded(function() {
        $scope.hideLoading();
        angular.forEach($scope.contacts, function(value) {
            value.name = User(value.$id).getName();
            value.avatar = User(value.$id).getAvatar();
            value.phone = User(value.$id).getPhone();
        });
    });

    $scope.accept = function(id) {
        Contacts($localStorage.userLogin.id).post(id);
        ContactsRecommended($localStorage.userLogin.id).remove(id);
    };
});
app.controller('contactsAdd', function($scope, $state, $localStorage, $ionicPopup, Login) {
    $scope.choseArea = {
        name: "United States",
        "areacode": "1"
    };
    $scope.warning = false;
    $scope.searchPerson = function(phone) {
        $scope.warning = false;
        $scope.phoneFull = $scope.choseArea.areacode + phone;
        if ($scope.phoneFull.length < 9) {
            $scope.warning = true
        } else {
            $scope.person = Login().get($scope.phoneFull);
            $scope.person.$loaded(function() {
                if (angular.isDefined($scope.person.id) && $scope.person.id != $localStorage.userLogin.id) {
                    $state.go('App.searchContacts', {
                        id: $scope.person.id
                    });
                } else {
                    $scope.warning = true
                }
            });
        }
    };
    $scope.inviteSms = function() {
        window.plugins.socialsharing.shareViaSMS($scope.inviteText, null, function(msg) {
           // console.log('ok: ' + msg)
        }, function(msg) {
            alert('Error: ' + msg)
        });
    };
});
app.controller('contactsSearch', function($scope, $state, $stateParams, User, Contacts, $localStorage) {
    $scope.showLoading("Loading...");
    $scope.contact = User($stateParams.id).get();
    $scope.contact.$loaded(function() {
        $scope.myFriend = Contacts($localStorage.userLogin.id).getFriend();
        $scope.myFriend.$loaded(function() {
            $scope.myFriend = Object.keys($scope.myFriend);
            if ($scope.myFriend.indexOf($scope.contact.$id) != -1) $scope.isFriend = true;
            $scope.hideLoading();
        });
    });
    $scope.inviteFriend = function(id) {
        $state.go('tab.inviteContacts', {
            id: id
        });
    };
});
app.controller('contactsUpdate', function($scope, $timeout, $localStorage, Login, ContactsRecommended) {
    $scope.lastupdate = $localStorage.lastUpdate;
    document.addEventListener("deviceready", onDeviceReady, false);

    function onDeviceReady() {
        $scope.showLoading("Loading...");

        function onSuccess(contacts) {
            $scope.contacts = {};
            var nowPhone;
            angular.forEach(contacts, function(value) {
                if (angular.isArray(value.phoneNumbers)) {
                    angular.forEach(value.phoneNumbers, function(phone) {
                        if (phone.type == "mobile") {
                            nowPhone = phone.value.match(/\d/g);
                            if (nowPhone != null) {
                                nowPhone = Number(nowPhone.join(""));
                                nowPhone = $localStorage.userLogin.areacode + nowPhone.toString();
                                $scope.contacts[nowPhone] = Login().getId(nowPhone);
                            }
                        }
                    });
                }
            });
            $scope.hideLoading();
            $scope.updateContacts = function() {
                $scope.showLoading("Loading...");
                angular.forEach($scope.contacts, function(valuePhone) {
                    ContactsRecommended($localStorage.userLogin.id).post(valuePhone.$value);
                });
                $localStorage.lastUpdate = new Date().getTime();
                $scope.lastupdate = $localStorage.lastUpdate;
                $scope.hideLoading();
            };
        };

        function onError(contactError) {
            $scope.hideLoading();
            alert(contactError);
        };
        var fields = ["phoneNumbers"];
        navigator.contacts.find(fields, onSuccess, onError);
    }
});
app.controller('contactsNearby', function($scope, $http, $ionicModal, $ionicPopup, User, Contacts, $localStorage) {
    $scope.settings = {
        "gender": "All",
        "fromage": 15,
        "toage": 80,
        "visible": "All"
    };
    $scope.getRangeAge = function() {
        $scope.beforefrom = $scope.settings.fromage - 1;
        $scope.afterfrom = $scope.settings.fromage + 1;
        $scope.beforeto = $scope.settings.toage - 1;
        $scope.afterto = $scope.settings.toage + 1;
        if ($scope.beforefrom < 15) $scope.beforefrom = 80;
        if ($scope.beforeto < 15) $scope.beforeto = 80;
        if ($scope.afterfrom > 80) $scope.afterfrom = 15;
        if ($scope.afterto > 80) $scope.afterto = 15;
    };
    $scope.getRangeAge();
    $scope.selectRange = function(to, number) {
        if (to == 1) {
            $scope.settings.toage = number;
        } else {
            $scope.settings.fromage = number;
        }
        $scope.getRangeAge();
    };
    $scope.plusFromAge = function() {
        $scope.settings.fromage = $scope.afterfrom;
        $scope.getRangeAge();
    };
    $scope.minusFromAge = function() {
        $scope.settings.fromage = $scope.beforefrom;
        $scope.getRangeAge();
    };
    $scope.plusToAge = function() {
        $scope.settings.toage = $scope.afterto;
        $scope.getRangeAge();
    };
    $scope.minusToAge = function() {
        $scope.settings.toage = $scope.beforeto;
        $scope.getRangeAge();
    };
    $ionicModal.fromTemplateUrl('templates/contacts/nearby-setting.html', {
        scope: $scope
    }).then(function(modal) {
        $scope.modalnearbySetting = modal;
    });
    $scope.showNearbySetting = function() {
        $scope.iSettings = angular.copy($scope.settings);
        $scope.modalnearbySetting.show();
    };
    $scope.closeNearbySetting = function() {
        $scope.modalnearbySetting.hide();
    };
    $scope.cancelNearbySetting = function() {
        $scope.settings = $scope.iSettings;
        $scope.closeNearbySetting();
    };
    $scope.updateNearbySetting = function() {
        $scope.closeNearbySetting();
        $scope.updateNearby();
    };
    $scope.selectRangeAge = function() {
        $scope.iRangeAge = angular.copy($scope.settings);
        var selectRangeAge = $ionicPopup.confirm({
            title: 'Select age',
            templateUrl: 'templates/contacts/select-range-age.html',
            scope: $scope,
            cssClass: 'popup-select-age',
            buttons: [{
                text: 'CANCEL',
                type: 'button-clear',
                onTap: function(e) {
                    $scope.settings = $scope.iRangeAge;
                    $scope.closeSelectRangeAge();
                }
            }, {
                text: 'OK',
                type: 'button-clear button-ok',
                onTap: function(e) {
                    if ($scope.settings.toage < $scope.settings.fromage) {
                        var tg = angular.copy($scope.settings.toage);
                        $scope.settings.toage = angular.copy($scope.settings.fromage);
                        $scope.settings.fromage = tg;
                    }
                    $scope.closeSelectRangeAge();
                }
            }]
        });
        $scope.closeSelectRangeAge = function() {
            selectRangeAge.close();
        };
    };
    $scope.updateNearby = function() {
        $scope.showLoading('Loading...');
        $scope.nearby = new Array;
        var currentYear = new Date().getFullYear();
        $scope.myFriend = Contacts($localStorage.userLogin.id).getFriend();
        $scope.myFriend.$loaded(function() {
            $scope.myFriend = Object.keys($scope.myFriend);
            $scope.iNearby = User().filter($scope.settings.gender);
            $scope.iNearby.$loaded(function() {
                var userYear;
                angular.forEach($scope.iNearby, function(value) {

                    if (value.birthday) {
                        value.age = currentYear - Number(value.birthday.split('/')[2]);
                    }

                    if (value.age >= $scope.settings.fromage && value.age <= $scope.settings.toage && $scope.myFriend.indexOf(value.$id) == -1) $scope.nearby.push(value);
                });
                $scope.hideLoading();
            });
        });
    };
    $scope.updateNearby();
});
app.controller('nearbyLocation', function($scope, $ionicPopover, $localStorage, Location, User) {
    Location($localStorage.userLogin.id).update();
    $scope.Me = Location($localStorage.userLogin.id).get();
    $scope.Me.$loaded(function() {
        if (angular.isDefined($scope.Me.$value)) $scope.Me = {
            lat: 21.036728,
            lng: 105.8346994
        };
        $scope.location = {};
        $scope.location.lat = $scope.Me.lat;
        $scope.location.lng = $scope.Me.lng;
        var mapOptions = {
            center: {
                lat: $scope.location.lat,
                lng: $scope.location.lng
            },
            zoom: 18,
        };
        $scope.map = new google.maps.Map(document.getElementById("map"), mapOptions);
        //Marker location of user logined
        $scope.markerIcon = {
            url: 'css/img/icon-location-marker.png',
            scaledSize: new google.maps.Size(32, 32)
        };
        $scope.marker = new google.maps.Marker({
            map: $scope.map,
            position: $scope.location,
            icon: $scope.markerIcon
        });
        $scope.nearby = Location().getNearby($scope.Me.nearby);
        $scope.nearby.$loaded(function() {
            delete $scope.nearby[$localStorage.userLogin.id];
            angular.forEach($scope.nearby, function(value, key) {
                value.user = User(key).get();
                value.user.$loaded(function() {
                    var currentYear = new Date().getFullYear();
                    var userAge = value.user.birthday.split('/');
                    var userAge = currentYear - Number(userAge[2]);
                    if (angular.isDefined(value.user.avatar)) $scope.markerAvatar = value.user.avatar;
                    else $scope.markerAvatar = 'css/img/icon-avatar.png';
                    $scope.markerIcon = {
                        url: $scope.markerAvatar,
                        scaledSize: new google.maps.Size(32, 32)
                    };
                    $scope.marker = new google.maps.Marker({
                        map: $scope.map,
                        position: {
                            lat: value.lat,
                            lng: value.lng
                        },
                        icon: $scope.markerIcon,
                    });
                    var content = '<div class="list"><div class="item item-avatar"><img src="';
                    if (angular.isDefined(value.user.avatar)) content = content + value.user.avatar;
                    else content = content + 'css/img/icon-avatar.png';
                    content = content + '"><div>' + value.user.name + '</div><span class="positive margin-right ';
                    if (value.user.gender == 'Male') content = content + 'ion-male';
                    else content = content + 'ion-female';
                    content = content + '"></span> ' + userAge + '<a class="button button-outline button-positive" href="#/tab/contacts/invite/' + key + '">+ Add</a></div></div>';
                    $scope.infowindow = new google.maps.InfoWindow({
                        content: content
                    });
                    $scope.marker.addListener('click', function() {
                        $scope.infowindow.open($scope.map, this);
                    });
                });
            });
        });
    });
}).controller('contactsInvite', function($scope, $stateParams, ContactsRecommended, $localStorage, User) {
    $scope.Me = User($localStorage.userLogin.id).getName();
    $scope.Friend = {};
    $scope.Friend.name = User($stateParams.id).getName();
    $scope.Friend.phone = User($stateParams.id).getPhone();
    $scope.acceptInvite = function() {
        ContactsRecommended($localStorage.userLogin.id).post($stateParams.id);
        $scope.goBack();
    }
});
app.controller('groupCtrl', function($scope, $http, $state, IonicClosePopupService, UserGroups, Groups, User, $ionicPopup, $localStorage) {
    $scope.showLoading("Loading...");
    $scope.groups = UserGroups($localStorage.userLogin.id).get();
    $scope.groups.$loaded(function() {
        angular.forEach($scope.groups, function(item) {
            item.avatar = new Array;
            item.numUser = Groups(item.$id).getNumUser();
            item.nameGroup = Groups(item.$id).getName();
            item.user = Groups(item.$id).getUser(4);
            item.user.$loaded(function() {
                item.name = new Array;
                angular.forEach(item.user, function(user) {
                    item.name.push(User(user.$id).getName());
                    item.avatar.push(User(user.$id).getAvatar());
                });
            });
        });
        $scope.hideLoading();
    });
    $scope.showPopupMenuGroup = function(id, nameGroup, title) {
        if (nameGroup && angular.isString(nameGroup)) var name = nameGroup;
        else {
            var name = '';
            for (var i = 0; i <= 2; i++) {
                if (title[i].$value) name += title[i].$value + ', ';
            }
        }
        var popupMenuGroup = $ionicPopup.show({
            title: name,
            cssClass: 'popup-menu-group',
            scope: null,
            buttons: [{
                text: 'Leave group',
                type: 'button-clear',
                onTap: function(e) {
                    $scope.confirmLeave(id)
                }
            }, {
                text: 'Change name',
                type: 'button-clear',
                onTap: function(e) {
                    $scope.changeName(id, nameGroup)
                }
            }, {
                text: 'Add user',
                type: 'button-clear',
                onTap: function(e) {
                    $state.go('tab.addGroup', {
                        id: id
                    });
                }
            }, {
                text: 'View user',
                type: 'button-clear',
                onTap: function(e) {
                    $state.go('tab.viewGroup', {
                        id: id
                    });
                }
            }, ]
        });
        IonicClosePopupService.register(popupMenuGroup);
    };
    $scope.confirmLeave = function(id) {
        var confirmPopup = $ionicPopup.confirm({
            template: 'Leave group chat will delete chat history. Leave?',
            cssClass: 'popup-confirm-leave',
            buttons: [{
                text: 'NO',
                type: 'button-clear'
            }, {
                text: 'YES',
                type: 'button-clear button-no-delete',
                onTap: function(e) {
                    Groups(id).leave($localStorage.userLogin.id);
                    UserGroups($localStorage.userLogin.id).leave(id);
                }
            }, ]
        });
    };
    $scope.changeName = function(id, name) {
        $scope.data = {
            name: name
        };
        var myPopup = $ionicPopup.show({
            template: '<input type="text" ng-model="data.name" class="light-bg">',
            cssClass: 'popup-confirm-leave',
            scope: $scope,
            buttons: [{
                text: 'Cancel',
                type: 'button-clear'
            }, {
                text: '<b>Save</b>',
                type: 'button-clear button-no-delete',
                onTap: function(e) {
                    Groups(id).changeName($scope.data.name);
                }
            }]
        });
    };
});
app.controller('groupCreate', function($scope, $state, Groups, UserGroups, Contacts, User, $localStorage, $filter) {
    $scope.showLoading('Loading...');
    $scope.contacts = Contacts($localStorage.userLogin.id).get();
    $scope.contacts.$loaded(function() {
        $scope.hideLoading();
        angular.forEach($scope.contacts, function(value) {
            value.name = User(value.$id).getName();
            value.avatar = User(value.$id).getAvatar();
        });
        $scope.getAlpha = function(id) {
            if (id >= 1) {
                $scope.contacts = $filter('orderBy')($scope.contacts, 'name.$value');
                var lastName = $filter('firstChar')($scope.contacts[id - 1].name.$value);
                var nowName = $filter('firstChar')($scope.contacts[id].name.$value);
                if (lastName == nowName) return false;
                else return true;
            }
        };
    });
    $scope.contactsSelected = {};
    $scope.selectedCount = 0;
    $scope.change = function(contact) {
        if (contact.selected) {
            $scope.contactsSelected[contact.$id] = true;
            $scope.selectedCount++;
        } else {
            delete $scope.contactsSelected[contact.$id];
            $scope.selectedCount--
        }
    };
    $scope.createGroup = function() {
        if ($scope.selectedCount > 0) {
            $scope.last = Groups().getLast();
            $scope.last.$loaded(function() {
                $scope.last = Number($scope.last.$value) + 1;
                Groups().create($scope.last, $localStorage.userLogin.id, $scope.selectedCount, $scope.contactsSelected, $scope.nameGroup);
                UserGroups().post($localStorage.userLogin.id, $scope.contactsSelected, $scope.last);
                $state.go('groupDetail', {
                    id: $scope.last
                });
            });
        }
    };
});
app.controller('groupAdd', function($scope, $stateParams, $state, Groups, UserGroups, Contacts, User, $localStorage, $filter) {
    $scope.showLoading('Loading...');
    $scope.contacts = Contacts($localStorage.userLogin.id).get();
    $scope.contacts.$loaded(function() {
        $scope.hideLoading();
        angular.forEach($scope.contacts, function(value) {
            value.name = User(value.$id).getName();
            value.avatar = User(value.$id).getAvatar();
        });
        $scope.getAlpha = function(id) {
            if (id >= 1) {
                $scope.contacts = $filter('orderBy')($scope.contacts, 'name.$value');
                var lastName = $filter('firstChar')($scope.contacts[id - 1].name.$value);
                var nowName = $filter('firstChar')($scope.contacts[id].name.$value);
                if (lastName == nowName) return false;
                else return true;
            }
        };
    });
    $scope.contactsSelected = {};
    $scope.selectedCount = 0;
    $scope.change = function(contact) {
        if (contact.selected) {
            $scope.contactsSelected[contact.$id] = true;
            $scope.selectedCount++;
        } else {
            delete $scope.contactsSelected[contact.$id];
            $scope.selectedCount--
        }
    };
    $scope.addGroup = function() {
        if ($scope.selectedCount > 0) {
            Groups($stateParams.id).add($scope.contactsSelected, $scope.selectedCount);
            UserGroups().add($stateParams.id, $scope.contactsSelected);
            $state.go('tab.group');
        }
    };
});
app.controller('groupView', function($scope, $stateParams, Groups, User, $filter) {
    $scope.showLoading("Loading...");
    $scope.name = Groups($stateParams.id).getName();
    $scope.count = Groups($stateParams.id).getNumUser();
    $scope.contacts = Groups($stateParams.id).getUser();
    $scope.contacts.$loaded(function() {
        angular.forEach($scope.contacts, function(value) {
            value.name = User(value.$id).getName();
            value.avatar = User(value.$id).getAvatar();
        });
        $scope.getAlpha = function(id) {
            if (id >= 1) {
                $scope.contacts = $filter('orderBy')($scope.contacts, 'name.$value');
                var lastName = $filter('firstChar')($scope.contacts[id - 1].name.$value);
                var nowName = $filter('firstChar')($scope.contacts[id].name.$value);
                if (lastName == nowName) return false;
                else return true;
            }
        };
        $scope.hideLoading();
    });
});
app.controller('groupDetail', function($scope, $state, $localStorage, $ionicModal, $ionicTabsDelegate, $timeout, $ionicScrollDelegate, User, Groups, DetailGroups, Camera, $stateParams, Location) {
    $scope.contentBottom = '100px';
    $scope.showLoading('Loading...');
    $scope.Me = $localStorage.userLogin.id;
    $scope.Groups = {};
    $scope.Groups.nameGroup = Groups($stateParams.id).getName();
    $scope.Groups.countUser = Groups($stateParams.id).getNumUser();
    $scope.Groups.user = Groups($stateParams.id).getUser();
    $scope.Groups.user.$loaded(function() {
        $scope.Groups.name = {};
        $scope.Groups.avatar = {};
        angular.forEach($scope.Groups.user, function(item) {
            $scope.Groups.name[item.$id] = User(item.$id).getName();
            $scope.Groups.avatar[item.$id] = User(item.$id).getAvatar();
        });
    });
    $scope.Detail = DetailGroups($stateParams.id).get();
    $scope.Detail.$loaded(function() {
        $scope.hideLoading();
        $ionicScrollDelegate.scrollBottom();
    });
    var onNewMessage = firebase.database().ref('detailGroups').child($stateParams.id);
    onNewMessage.on('value', function() {
        $ionicScrollDelegate.$getByHandle('mainScroll').scrollBottom();
    });
    $scope.messageInput = function(option) {
        if (option == "text") $scope.contentBottom = '100px';
        else $scope.contentBottom = '220px';
    };
    $scope.inputText = {
        "type": "text"
    };
    $scope.sendText = function() {
        if (angular.isDefined($scope.inputText.content) && angular.isString($scope.inputText.content)) {
            var now = new Date().getTime();
            $scope.inputText.time = now;
            $scope.inputText.from = $scope.Me;
            DetailGroups($stateParams.id).post($scope.inputText);
            $scope.inputText = {
                "type": "text"
            };
        }
    };
    $scope.inputPicture = {
        "type": "picture"
    };
    $scope.takePicture = function() {
        $ionicTabsDelegate.select(1);
        var options = {
            quality: 75,
            targetWidth: 720,
            targetHeight: 1280,
            destinationType: 0
        };
        Camera.getPicture(options).then(function(imageData) {
            $scope.inputPicture.content = "data:image/jpeg;base64," + imageData;
        }, function(err) {
          //  console.log(err);
        });
    };
    $scope.sendPicture = function() {
        if (angular.isDefined($scope.inputPicture.content)) {
            var now = new Date().getTime();
            $scope.inputPicture.time = now;
            $scope.inputPicture.from = $scope.Me;
            DetailGroups($stateParams.id).post($scope.inputPicture);
            $scope.inputPicture = {
                "type": "picture"
            };
        } else $scope.takePicture();
    };
    $scope.showInputImages = function() {
        var options = {
            sourceType: 0,
            destinationType: 0
        };
        Camera.getPicture(options).then(function(imageData) {
            $scope.inputPicture.content = "data:image/jpeg;base64," + imageData;
            $ionicTabsDelegate.select(1);
        }, function(err) {
           // console.log(err);
        });
    };
    $scope.inputSticker = {
        "type": "sticker"
    };
    $scope.sendSticker = function(sticker) {
        if (angular.isDefined(sticker) && angular.isNumber(sticker)) {
            var now = new Date().getTime();
            $scope.inputSticker.time = now;
            $scope.inputSticker.from = $scope.Me;
            $scope.inputSticker.content = sticker;
            DetailGroups($stateParams.id).post($scope.inputSticker);
            $scope.inputSticker = {
                "type": "sticker"
            };
        }
    };
    $scope.showSendLocation = function() {
        $state.go('sendLocation', {
            id: $stateParams.id,
            source: 'group'
        });
    };
});
app.controller('settingsCtrl', function($scope, $ionicModal, $http, $ionicPopup, IonicClosePopupService, $state, $localStorage, User, Settings, Camera) {
    $scope.default = {};
    $scope.profile = User($localStorage.userLogin.id).get();
    $scope.default.lang = window.localStorage.lang;
    $scope.changeAvatar = function() {
        var options = {
            sourceType: 0,
            allowEdit: true,
            targetWidth: 160,
            targetHeight: 160,
            destinationType: 0
        };
        Camera.getPicture(options).then(function(imageData) {
            $scope.avatar = "data:image/jpeg;base64," + imageData;
            User($localStorage.userLogin.id).editAvatar($scope.avatar);
        }, function(err) {
           // console.log(err);
        });
    };

    $ionicModal.fromTemplateUrl('templates/settings/name.html', {
        scope: $scope
    }).then(function(modal) {
        $scope.modalChangeName = modal;
    });
    $scope.showChangeName = function() {
        $scope.modalChangeName.show();
    };
    $scope.closeChangeName = function() {
        $scope.modalChangeName.hide();
    };
    $scope.changeName = function() {
        if ($scope.profile.name.length <= 20) {
            User($localStorage.userLogin.id).editName($scope.profile.name);
            $scope.closeChangeName();
        }
    };

    $ionicModal.fromTemplateUrl('templates/settings/country.html', {
        scope: $scope
    }).then(function(modal) {
        $scope.modalChangeCountry = modal;
    });
    $scope.showChangeCountry = function() {
        $scope.modalChangeCountry.show();
    };
    $scope.closeChangeCountry = function() {
        $scope.modalChangeCountry.hide();
    };
    $scope.changeCountry = function() {
        User($localStorage.userLogin.id).editCountry($scope.profile.country);

    };
    $scope.changeLang = function() {
        User($localStorage.userLogin.id).editLang($scope.default.lang);
       
    };

    $ionicModal.fromTemplateUrl('templates/settings/phone.html', {
        scope: $scope
    }).then(function(modal) {
        $scope.modalChangePhone = modal;
    });
    $scope.showChangePhone = function() {
        $scope.modalChangePhone.show();
    };
    $scope.closeChangePhone = function() {
        $scope.modalChangePhone.hide();
    };
    $scope.dataPhone = {};
    $scope.dataPhone.areacode = $localStorage.userLogin.areacode;
    $scope.alertPhone = function() {
        var confirmPopup = $ionicPopup.confirm({
            template: 'Your phone number is too short in the country enter<br/><br/>Enter the country code if you have not entered',
            cssClass: 'popup-confirm-delete',
            buttons: [{
                text: 'OK',
                type: 'button-clear button-no-delete col-50 col-offset-50'
            }]
        });
    };
    $scope.changePhone = function() {
        if ($scope.dataPhone.areacode && $scope.dataPhone.phone) {
            $scope.phoneFull = $scope.dataPhone.areacode.toString() + $scope.dataPhone.phone;
            alert($scope.phoneFull.length);
            if ($scope.phoneFull.length >= 10) {
                User($localStorage.userLogin.id).editPhone($scope.phoneFull);
                $scope.closeChangePhone();
            } else $scope.alertPhone();
        } else $scope.alertPhone();
    };
    $scope.changeGender = function(gender) {
        if (gender == 0) gender = "Male";
        else gender = "Female";
        User($localStorage.userLogin.id).editGender(gender);
    };
    $scope.settings = {};
    $scope.settings.messages = Settings($localStorage.userLogin.id).get('messages');
    $scope.changeMessages = function(child) {
        var data = $scope.settings.messages[child];
        child = 'messages/' + child;
        Settings($localStorage.userLogin.id).change(child, data);
    };
    $scope.lastUpdate = $localStorage.lastUpdate;
    $scope.settings.contacts = Settings($localStorage.userLogin.id).get('contacts');
    $scope.changeContacts = function(child) {
        var data = $scope.settings.contacts[child];
        child = 'contacts/' + child;
        Settings($localStorage.userLogin.id).change(child, data);
    };
    $scope.showPopupSettingsListFriends = function() {
        var popupSettingsListFriends = $ionicPopup.show({
            title: 'Friends list show in contacts',
            cssClass: 'popup-select-radio',
            scope: $scope,
            template: '<ion-radio ng-model="settings.contacts.show_friend" ng-value="true" ng-click="changeContacts(\'show_friend\'); closePopupSettingsListFriends()">All friends</ion-radio><ion-radio ng-model="settings.contacts.show_friend" ng-value="false" ng-click="changeContacts(\'show_friend\'); closePopupSettingsListFriends()">Friends who use Cognisance</ion-radio>'
        });
        $scope.closePopupSettingsListFriends = function() {
            popupSettingsListFriends.close();
        };
        IonicClosePopupService.register(popupSettingsListFriends);
    };
    $scope.settings.languages = Settings($localStorage.userLogin.id).get('languages');
    $scope.showPopupSettingsLanguages = function() {
        var popupSettingsLanguages = $ionicPopup.show({
            title: 'Language',
            cssClass: 'popup-select-radio',
            scope: $scope,
            templateUrl: 'templates/settings/language.html'
        });
        $scope.closePopupSettingsLanguages = function() {
            popupSettingsLanguages.close();
        };
        IonicClosePopupService.register(popupSettingsLanguages);
    };
    $scope.changeLanguage = function() {
        Settings($localStorage.userLogin.id).change('languages/language', $scope.settings.languages.language);
    }
    $scope.showPopupSettingsFonts = function() {
        var popupSettingsFonts = $ionicPopup.show({
            title: 'Select font',
            cssClass: 'popup-select-radio',
            scope: $scope,
            template: '<ion-radio ng-model="settings.languages.font" ng-value="true" ng-click="changeFont(); closePopupSettingsFonts()">V-Life font</ion-radio><ion-radio ng-model="settings.languages.font" ng-value="false" ng-click="changeFont(); closePopupSettingsFonts()">System font</ion-radio>'
        });
        $scope.closePopupSettingsFonts = function() {
            popupSettingsFonts.close();
        };
        IonicClosePopupService.register(popupSettingsFonts);
    };
    $scope.changeFont = function() {
        Settings($localStorage.userLogin.id).change('languages/font', $scope.settings.languages.font);
    };
    $scope.showPopupLogout = function() {
        var confirmPopup = $ionicPopup.confirm({
            template: 'Log out?',
            cssClass: 'popup-confirm-logout',
            buttons: [{
                text: 'NO',
                type: 'button-clear button-no-logout'
            }, {
                text: 'YES',
                type: 'button-clear',
                onTap: function(e) {
                    delete $localStorage.userLogin;
                    $state.go('walkthrough');
                }
            }, ]
        });
    };
});




app.controller('changePasswordCtrl', function($scope, $ionicPopup, $state, $localStorage, Login) {
    $scope.data = {};
    $scope.warning = false;
    $scope.showValue = {
        "type": "password",
        "text": "Show"
    }
    $scope.showPassword = function() {
        if ($scope.showValue.type == "password") {
            $scope.showValue = {
                "type": "text",
                "text": "Hide"
            }
        } else {
            $scope.showValue = {
                "type": "password",
                "text": "Show"
            }
        }
    };
    $scope.showcurrentValue = {
        "type": "password",
        "text": "Show"
    }
    $scope.showcurrentPassword = function() {
        if ($scope.showcurrentValue.type == "password") {
            $scope.showcurrentValue = {
                "type": "text",
                "text": "Hide"
            }
        } else {
            $scope.showcurrentValue = {
                "type": "password",
                "text": "Show"
            }
        }
    }
    $scope.updatePassword = function() {
        $scope.warning = false;
        if (!$scope.data.oldpassword || !$scope.data.password || !$scope.data.repassword) {
            $scope.warning = true;
        } else {
            if ($scope.data.password != $scope.data.repassword) $scope.showPopupError();
            else {
                $scope.User = Login().get($localStorage.userLogin.phone);
                $scope.User.$loaded(function() {
                    if ($scope.data.oldpassword != $scope.User.password) $scope.warning = true;
                    else {
                        Login().changePass($localStorage.userLogin.phone, $scope.data.password);
                        $scope.data = {};
                        $state.go('settingsAccount');
                    }
                });
            }
        }
    };
    $scope.showPopupError = function() {
        var confirmPopup = $ionicPopup.confirm({
            template: 'Invalid confirm password, please check and try again.',
            cssClass: 'popup-confirm-logout',
            buttons: [{
                text: 'CLOSE',
                type: 'button-clear button-no-logout'
            }]
        });
    };

});
app.controller('searchCtrl', function($scope, $state, $localStorage, $ionicPopup, IonicClosePopupService, Contacts, User, Block) {
    $scope.showLoading('Loading...');
    if (angular.isUndefined($localStorage.searchRecent)) $localStorage.searchRecent = new Object;
    $scope.Recent = $localStorage.searchRecent;
    $scope.Search = new Array;
    $scope.Contacts = Contacts($localStorage.userLogin.id).get();
    $scope.Contacts.$loaded(function() {
        angular.forEach($scope.Contacts, function(value) {
            var Person = {
                "id": value.$id
            };
            Person.name = User(value.$id).getName();
            Person.avatar = User(value.$id).getAvatar();
            $scope.Search.push(Person);
        });
        $scope.hideLoading();
    });
    $scope.viewMessages = function(id) {
        $state.go('detail', {
            id: id
        });
    };
    $scope.deleteRecent = function(name, id) {
        var confirmPopup = $ionicPopup.confirm({
            title: name,
            cssClass: 'popup-menu-contact',
            buttons: [{
                text: 'Clear search history',
                type: 'button-clear',
                onTap: function(e) {
                    delete $localStorage.searchRecent[id];
                }
            }, ]
        });
        IonicClosePopupService.register(confirmPopup);
    };
    $scope.choseContact = function(contact) {
        $localStorage.searchRecent[contact.id] = contact;
        $scope.viewMessages(contact.id);
    };
    $scope.showMenuSearch = function(name, id) {
        var confirmPopup = $ionicPopup.confirm({
            title: name,
            cssClass: 'popup-menu-contact',
            buttons: [{
                text: 'Block',
                type: 'button-clear',
                onTap: function(e) {
                    $scope.Block = Block($localStorage.userLogin.id).get(id);
                    $scope.Block.$loaded(function() {
                        if ($scope.Block.$value) {
                            Block($localStorage.userLogin.id).remove(id);
                            location.reload();
                        } else {
                            var confirmPopup = $ionicPopup.confirm({
                                template: 'This person will not be able to send messages to you.Block him/her?',
                                cssClass: 'popup-confirm-delete',
                                buttons: [{
                                    text: 'NO',
                                    type: 'button-clear',
                                }, {
                                    text: 'YES',
                                    type: 'button-clear button-no-delete',
                                    onTap: function(e) {
                                        Block($localStorage.userLogin.id).block(id);
                                        location.reload();
                                    }
                                }, ]
                            });
                        }
                    });
                }
            }, {
                text: 'Remove friend',
                type: 'button-clear',
                onTap: function(e) {
                    Contacts($localStorage.userLogin.id).remove(id);
                }
            }]
        });
        IonicClosePopupService.register(confirmPopup);
    };
});

//woocomerce
app.controller('BrowseCtrl', function($scope, $localStorage, $rootScope, Prductdata, Channelslib) {

    $scope.products = Prductdata.data.product;
    $scope.doRefresh = function() {
        $scope.$broadcast('scroll.refreshComplete');
    }

    $scope.addToCart = function(product) {

        console.log("list single product ===>", product);
        
        var countIncreased = false;
        if (angular.isDefined($localStorage.cart) && $localStorage.cart.length > 0) {
            $localStorage.cart.forEach(function(item, index) {
                if ($localStorage.cart[index].postid == product.postid && !countIncreased) {
                    $localStorage.cart[index].count += 1;
                    countIncreased = true;
                }
            });
        } else {
            $localStorage.cart = [];
        }
        if (!countIncreased) {
            product.count = 1;            
            $localStorage.cart.push(product);
            
        }
        $rootScope.cartCount = $localStorage.cart.length;
    }

    $scope.roundedPercentage = function(perchant, totalValue) {
        var result = ((perchant * totalValue) / 100)
        var price = (totalValue - result);
        return price.toFixed(2);
    }


})
app.controller('ProductCtrl', function($scope, $stateParams, $ionicSlideBoxDelegate, $localStorage, $rootScope,Prductdata) {

  $scope.product = Prductdata.data;
  
    $scope.place = {};
    $scope.addToCart = function(product) {
        console.log("singel product===>", product);
        
        var countIncreased = false;
        if (angular.isDefined($localStorage.cart) && $localStorage.cart.length > 0) {
            $localStorage.cart.forEach(function(item, index) {
                if (item.id == product.postid && !countIncreased) {
                    item.count += 1;
                    countIncreased = true;
                }
            });
        } else {
            $localStorage.cart = [];
        }
        if (!countIncreased) {
            product.count = 1;
            $localStorage.cart.push(product);
        }
        $rootScope.cartCount = $localStorage.cart.length;
    }

    $scope.roundedPercentage = function(perchant, totalValue) {
        var result = ((perchant * totalValue) / 100)
        var price = (totalValue - result);
        return price.toFixed(2);
    }
});

//$scope, $rootScope, Channelinfo, $state, $stateParams, $sce, 
app.controller('CheckoutCtrl', function($scope, PaypalService, GetShippingMethod, EasyShipping, DollarRate, $localStorage, $ionicPopup, $ionicHistory, $state, $ionicModal, $http, $ionicLoading, OrderService, StripePayment, AuthService, Account, $ionicScrollDelegate, $rootScope) {
    $scope.newOrder = {};  

    $scope.init = function() {
        $scope.newOrder = {};
        $scope.newOrder.billing = {};
        $scope.newOrder.shipping = {};
        $scope.newOrder.methods = {};
        $scope.newOrder.countries = {};
        $scope.newOrder.billing.first_name = $scope.data.billing.first_name;
        $scope.newOrder.billing.last_name = $scope.data.billing.last_name;
        $scope.newOrder.billing.address_1 = $scope.data.billing.address_1;
        $scope.newOrder.billing.address_2 = $scope.data.billing.address_2;
        $scope.newOrder.billing.city = $scope.data.billing.city;
        $scope.newOrder.billing.state = $scope.data.billing.state;
        $scope.newOrder.billing.postcode = $scope.data.billing.postcode;
        $scope.newOrder.billing.phone = $scope.data.billing.phone;
        $scope.newOrder.billing.country = $scope.data.billing.country;
        $scope.newOrder.country_arr = $scope.data.country_arr;
        $scope.newOrder.country_key_value = $scope.data.country_key_value;
        $scope.newOrder.methods = $scope.data.methods;

        //shiping
        $scope.newOrder.shipping.first_name = $scope.data.shipping.first_name;
        $scope.newOrder.shipping.last_name = $scope.data.shipping.last_name;
        $scope.newOrder.shipping.address_1 = $scope.data.shipping.address_1;
        $scope.newOrder.shipping.address_2 = $scope.data.shipping.address_2;
        $scope.newOrder.shipping.city = $scope.data.shipping.city;
        $scope.newOrder.shipping.state = $scope.data.shipping.state;
        $scope.newOrder.shipping.postcode = $scope.data.shipping.postcode;
        $scope.newOrder.shipping.country = $scope.data.shipping.country;
        $scope.newOrder.shipping.method = $scope.data.shipping.method; 
       
        //Preset 
        $scope.newOrder.paymentMethod       = '';  
        $scope.newOrder.billing.country     = ''; 
        $scope.newOrder.shipping.country    = '';            
        $scope.newOrder.wallet_balance      = $scope.data.wallet_balance;
        $scope.newOrder.method_unavailable_msg = false;

        DollarRate.dollarrate().then(function(data) {
            $scope.dollar_rate = data.SGD_USD.val;
        });        
     
    };

    Account.adrs().then(function(page_data) {
        $scope.data = page_data.data;
        $scope.profiledata = $localStorage.userData.data;
        $scope.init();
    })


    $scope.switchBillingToShipping = function(e) {

        $scope.newOrder.shipping = $scope.newOrder.billing;
        $scope.newOrder.billingToShipping = true;
        
        if( this.newOrder.billing.first_name == '' || this.newOrder.billing.first_name == null ||
            this.newOrder.billing.last_name == '' || this.newOrder.billing.last_name == null ||
            this.newOrder.billing.address_1 == '' ||  this.newOrder.billing.address_1 == null ||
            this.newOrder.billing.country == '' || this.newOrder.billing.country == null ||         
            this.newOrder.billing.phone == '' || this.newOrder.billing.phone == null ||
            this.newOrder.billing.city == '' || this.newOrder.billing.city == null ||
            this.newOrder.billing.postcode == '' || this.newOrder.billing.postcode == null        
        ){
            this.newOrder.billingToShipping = false;
            $ionicPopup.alert({
                title: 'Billing info!',
                template: 'Name, address, phone, city, zipcode country are required'
            });
            return;
        } else {

            this.newOrder.billingToShipping = true;
            if (this.newOrder.billingToShipping) {

                $ionicLoading.show({
                    template: 'Please wait...'
                });
                var data = {
                    country_id: this.newOrder.billing.country,
                    state: this.newOrder.billing.state,
                    zipcode: this.newOrder.billing.postcode,
                };
    
                var paramJSON = JSON.stringify(data);
                GetShippingMethod.shippingmethod(paramJSON).then(function(data) {   
    
                    delete data.status;
                    if( Object.keys(data).length === 0 ){
    
                        $scope.newOrder.method_unavailable_msg = true;
                        $scope.newOrder.shippingList = false; 
                        $scope.costSum = parseFloat(parseFloat($scope.costSum) - parseFloat($scope.total_shipping_cost)).toFixed(2); 
                        $scope.total_shipping_cost = 0;  
    
                        var items = [];
                        if ($localStorage.cart) {
                          $localStorage.cart.forEach(function(element, index) {
    
                              if( element.sale !=''){
                                  var actual_price =  element.sale;               
                              } else {
                                  var actual_price =  element.regular;  
                              }                        
                              items.push({
                                  product_id: element.postid,
                                  quantity: element.count,
                                "actual_weight": element.weight,
                                "height": element.height,
                                "width": element.width,
                                "length": element.length,
                                "category": "health_beauty",
                                "declared_currency": element.currency,
                                "declared_customs_value": actual_price,                           
                              });
                          });
                        }             
    
                        var data = {
                          "origin_country_alpha2": "SG",
                          "origin_postal_code": "WC2N",
                          "destination_country_alpha2": $scope.newOrder.shipping.country,
                          "destination_postal_code": $scope.newOrder.shipping.postcode,
                          "taxes_duties_paid_by": "Sender",
                          "is_insured": false,
                          "items": items
                        }
                        var paramJSON = JSON.stringify(data);
                        EasyShipping.easyshipping(paramJSON).then(function(data) {                        
                            $scope.easyShippingList = data.rates;
                            $scope.easyship_charge = data.rates[0].total_charge;
                            $scope.costSum = parseFloat(parseFloat($scope.costSum) + parseFloat($scope.easyship_charge*$scope.dollar_rate+1)).toFixed(2);
                            $scope.total_shipping_cost = parseFloat($scope.easyship_charge*$scope.dollar_rate + 1).toFixed(2);                       
                            //$scope.newOrder.shipping.method = 'Easyship';                                                                        
                            $ionicLoading.hide(); 
    
                            
                            console.log("switch and easyshipping infor====>", data);
                            console.log("total charges===>", data.rates[0].total_charge);                        
                        });
    
                    } else {
                      $ionicLoading.hide();
                      $scope.newOrder.shippingList = data; 
                      $scope.shippingList = data; 
                      $scope.newOrder.method_unavailable_msg = false; 
    
                    }       
                }); 
            } else {
                $scope.newOrder.method_unavailable_msg = false; 
            }
        }


    }

    $scope.shippingMethod = function() {

        $scope.newOrder.shipping.method = this.newOrder.shipping.method;        
        
        $scope.costSum = parseFloat(parseFloat($scope.costSum) - parseFloat($scope.total_shipping_cost)).toFixed(2); 
        $scope.total_shipping_cost = 0;
        $scope.charge = 0;
        if (angular.isDefined($localStorage.cart) && $localStorage.cart.length > 0) {
            $localStorage.cart.forEach(function(item, index) {
                $scope.charge += parseFloat(item.count); 
                if( $scope.shippingList[index] !=undefined ){
                    if( $scope.shippingList[index].cost == $scope.newOrder.shipping.method ){
                        $scope.shipping_id =$scope.shippingList[index].id;
                        $scope.method_id =$scope.shippingList[index].method_id;
                        $scope.shipping_label =$scope.shippingList[index].label;  
                        $scope.shipping_cost =$scope.shippingList[index].cost;
                    }
                }
            }); 
            if( $scope.newOrder.shipping.method == 0){
            $scope.total_shipping_cost =  parseFloat($scope.charge)  * 0;                 
            } else {
            $scope.total_shipping_cost =  parseFloat($scope.charge)  * parseFloat($scope.newOrder.shipping.method);                 
            }
            $scope.costSum = parseFloat(parseFloat($scope.costSum) + parseFloat($scope.total_shipping_cost)).toFixed(2);

        }

        if(    this.newOrder.billing.country != ''
            && this.newOrder.paymentMethod   != '' 
            && this.newOrder.shipping.method != '' 
            && this.newOrder.shipping.phone  != ''
        ){
            $scope.showBtn = true;
        } else {
            $scope.showBtn = false;
        }        

    }

    $scope.CancelCheckout = function() {
        $state.go("App.shop");
    }

    $scope.checkAllfield = function() {
        if(    this.newOrder.billing.country != ''
            && this.newOrder.paymentMethod   != '' 
            && this.newOrder.shipping.method != '' 
            && this.newOrder.shipping.phone  != ''
        ){
            $scope.showBtn = true;
        } else {
            $scope.showBtn = false;
        }


        if (this.newOrder.billingToShipping) {

            $ionicLoading.show({
                template: 'Please wait...'
            });
            var data = {
                country_id: this.newOrder.billing.country,
                state: this.newOrder.billing.state,
                zipcode: this.newOrder.billing.postcode,
            };

            var paramJSON = JSON.stringify(data);
            GetShippingMethod.shippingmethod(paramJSON).then(function(data) {   

                delete data.status;
                if( Object.keys(data).length === 0){
                    $scope.newOrder.method_unavailable_msg = true;
                    $scope.newOrder.shippingList = false;
                    $scope.costSum = parseFloat(parseFloat($scope.costSum) - parseFloat($scope.total_shipping_cost)).toFixed(2);  
                    $scope.total_shipping_cost = 0;

                    var items = [];
                    if ($localStorage.cart) {
                      $localStorage.cart.forEach(function(element, index) {

                          if( element.sale !=''){
                            var actual_price =  element.sale;               
                          } else {
                            var actual_price =  element.regular;  
                          }                        
                          items.push({
                            "actual_weight": element.weight,
                            "height": element.height,
                            "width": element.width,
                            "length": element.length,
                            "category": "health_beauty",
                            "declared_currency": element.currency,
                            "declared_customs_value": actual_price,                           
                          });
                      });
                    }             

                    var data = {
                      "origin_country_alpha2": "SG",
                      "origin_postal_code": "WC2N",
                      "destination_country_alpha2": $scope.newOrder.shipping.country,
                      "destination_postal_code": $scope.newOrder.shipping.postcode,
                      "taxes_duties_paid_by": "Sender",
                      "is_insured": false,
                      "items": items
                    }
                    var paramJSON = JSON.stringify(data);
                    EasyShipping.easyshipping(paramJSON).then(function(data) { 
                        $scope.easyShippingList = data.rates;
                        $scope.easyship_charge = data.rates[0].total_charge;
                        $scope.costSum = parseFloat(parseFloat($scope.costSum) + parseFloat($scope.easyship_charge*$scope.dollar_rate+1)).toFixed(2);
                        $scope.total_shipping_cost = parseFloat($scope.easyship_charge*$scope.dollar_rate + 1).toFixed(2); 
                        
                        $scope.newOrder.shipping.method = 'Easyship';  
                        $scope.shipping_id = data.rates[0].courier_id;
                        $scope.method_id = data.rates[0].courier_id;
                        $scope.shipping_label = data.rates[0].courier_name;
                        $scope.shipping_cost = parseFloat(data.rates[0].total_charge*$scope.dollar_rate + 1).toFixed(2);                  
                        // console.log("easyshipping infor====>", data);
                        // console.log("total charges===>", data.rates[0].total_charge);
                        
                        $ionicLoading.hide(); 
                    });

                } else {
                    $ionicLoading.hide();  
                    $scope.newOrder.shippingList = data; 
                    $scope.shippingList = data; 
                    $scope.newOrder.method_unavailable_msg = false; 
                }       
            }); 
        }

        $scope.$broadcast('scroll.refreshComplete');
    };

    $scope.getShipping = function(){
        $ionicLoading.show({
            template: 'Please wait...'
        });
        $scope.costSum = parseFloat(parseFloat($scope.costSum) - parseFloat($scope.total_shipping_cost)).toFixed(2); 
        $scope.total_shipping_cost = 0;        

        var data = {
            country_id: this.newOrder.shipping.country,
            state: this.newOrder.shipping.state,
            zipcode: this.newOrder.shipping.postcode,
        };

        var paramJSON = JSON.stringify(data);
        GetShippingMethod.shippingmethod(paramJSON).then(function(data) {   
            delete data.status;
            if( Object.keys(data).length === 0 ){

                $ionicLoading.hide();
                $scope.newOrder.method_unavailable_msg = true;
                $scope.newOrder.shippingList = false; 

                var items = [];
                if ($localStorage.cart) {
                    $localStorage.cart.forEach(function(element, index) {

                        if( element.sale !=''){
                            var actual_price =  element.sale;               
                        } else {
                            var actual_price =  element.regular;  
                        }                        
                        items.push({
                          "actual_weight": element.weight,
                          "height": element.height,
                          "width": element.width,
                          "length": element.length,
                          "category": "health_beauty",
                          "declared_currency": element.currency,
                          "declared_customs_value": actual_price,                           
                        });
                    });
                }             

                var data = {
                    "origin_country_alpha2": "SG",
                    "origin_postal_code": "WC2N",
                    "destination_country_alpha2": $scope.newOrder.shipping.country,
                    "destination_postal_code": $scope.newOrder.shipping.postcode,
                    "taxes_duties_paid_by": "Sender",
                    "is_insured": false,
                    "items": items
                }
                var paramJSON = JSON.stringify(data);
                EasyShipping.easyshipping(paramJSON).then(function(data) {

                    $scope.easyShippingList = data.rates;
                    $scope.easyship_charge = data.rates[0].total_charge;
                    $scope.costSum = parseFloat(parseFloat($scope.costSum) + parseFloat($scope.easyship_charge*$scope.dollar_rate+1)).toFixed(2);
                    $scope.total_shipping_cost = parseFloat($scope.easyship_charge*$scope.dollar_rate + 1).toFixed(2); 

                    $scope.newOrder.shipping.method = 'Easyship';
                    $scope.shipping_id = data.rates[0].courier_id;
                    $scope.method_id = data.rates[0].courier_id;
                    $scope.shipping_label = data.rates[0].courier_name;
                    $scope.shipping_cost = parseFloat(data.rates[0].total_charge*$scope.dollar_rate + 1).toFixed(2);                  
                    console.log("easyshipping infor====>", data);
                    console.log("total charges===>", data.rates[0].total_charge);
                });


            } else {
              $ionicLoading.hide();
              $scope.newOrder.shippingList = data; 
              $scope.shippingList = data;   
              $scope.newOrder.method_unavailable_msg = false;
            }       
        }); 
    }

    $scope.easyshipCharge = function(event, id, courier_name, total_charge){
        console.log("clicked on easyship");
        
        $scope.costSum = parseFloat(parseFloat($scope.costSum) - parseFloat($scope.total_shipping_cost)).toFixed(2); 
        $scope.total_shipping_cost = 0;
        $scope.costSum = parseFloat(parseFloat($scope.costSum) + parseFloat(this.easyship_charge*$scope.dollar_rate+1)).toFixed(2);

        $scope.total_shipping_cost = parseFloat(this.easyship_charge*$scope.dollar_rate + 1).toFixed(2); 
        $scope.shipping_id = id;
        $scope.method_id = id;
        $scope.shipping_label = courier_name;
        $scope.shipping_cost = parseFloat(this.easyship_charge*$scope.dollar_rate + 1).toFixed(2);
        $scope.newOrder.shipping.method = 'Easyship';
    }
    
    $scope.placeOrder = function(newOrder) {

        if( this.newOrder.billing.first_name == '' || this.newOrder.billing.first_name == null ||
            this.newOrder.billing.last_name == '' || this.newOrder.billing.last_name == null ||
            this.newOrder.billing.address_1 == '' ||  this.newOrder.billing.address_1 == null ||
            this.newOrder.billing.country == '' || this.newOrder.billing.country == null ||         
            this.newOrder.billing.phone == '' || this.newOrder.billing.phone == null ||
            this.newOrder.shipping.method == '' || this.newOrder.shipping.method == null
        ){
       
            $ionicPopup.alert({
                title: 'Checkout info!',
                template: 'Name, address, phone, country, shipping and payment method are required'
            });
            return;
        } else if( this.newOrder.paymentMethod == 'wallet' ){
            if( $scope.costSum > newOrder.wallet_balance ){
                $ionicPopup.alert({
                    title: 'Walllet Balance',
                    template: 'You don\'t have sufficient balance!'
                });
                return;
            }
             
        } 

        $scope.orderItems = [];
        if ($localStorage.cart) {
            $localStorage.cart.forEach(function(element, index) {
                $scope.orderItems.push({
                    product_id: element.postid,
                    quantity: element.count,
                });
            });
        } else {
            return;
        }

        var data = {
            payment_details: {
                method_id: newOrder.paymentMethod,
                method_title: newOrder.paymentMethod,
                paid: true
            },
            billing_address: {
                first_name: newOrder.billing.first_name,
                last_name: newOrder.billing.last_name,
                address_1: newOrder.billing.address_1,
                address_2: newOrder.billing.address_2,
                city: newOrder.billing.city,
                state: newOrder.billing.state,
                postcode: newOrder.billing.postcode,
                country: newOrder.billing.country,
                email: $localStorage.userData.data.email,
                phone: newOrder.billing.phone
            },
            shipping_address: {
                first_name: newOrder.shipping.first_name,
                last_name: newOrder.shipping.last_name,
                address_1: newOrder.shipping.address_1,
                address_2: newOrder.shipping.address_2,
                city: newOrder.shipping.city,
                state: newOrder.shipping.state,
                postcode: newOrder.shipping.postcode,
                country: newOrder.shipping.country,
            },
            shipping_method: {
                shipping_id: $scope.shipping_id,
                method_id: $scope.method_id,
                shipping_label: $scope.shipping_label,
                shipping_cost: $scope.shipping_cost,
            },   
            shipping_charge : $scope.total_shipping_cost,                
            customer_id: $localStorage.userData.data.id || '',
            line_items: $scope.orderItems
        };
      

        var paramJSON = JSON.stringify(data);
        $ionicLoading.show({
            template: 'Processing...'
        });

        if( 'paypal' === this.newOrder.paymentMethod ){
            PaypalService.initPaymentUI().then(function () {
                PaypalService.makePayment($scope.costSum, "Total", 'USD').then(function(x){
                    
                    OrderService.placeorder(paramJSON).then(function(data) {
                        if (data.status == "ok") {
                            $ionicLoading.hide();
                            $localStorage.cart = [];
                            $scope.cartItems = [];
                            $rootScope.cartCount = 0;
                            $scope.newOrder.paymentMethod = '';
                            $scope.newOrder.shipping.charge = 0;
                            $scope.total_shipping_cost = 0;
                            $scope.costSum = 0;
                            $state.go("App.accountorder")
                        } else {
                            $scope.modal.hide();
                            $ionicLoading.hide();
                            $ionicPopup.alert({
                                title: 'Order Place Failed!',
                                template: 'Something went wrong.'
                            });                            
                        }
                    });

                   $ionicLoading.hide();
                }, function(e){
                    //$scope.modal.hide();
                    $ionicLoading.hide();
                    console.log(e);
                    $scope.showError(e);
                });
            }, function(e){
                console.log(e);
                $scope.showError(e);
            });
            
        } else if( 'stripe' === this.newOrder.paymentMethod ){

            $ionicLoading.hide();            
            $scope.modal = {};
            $ionicModal.fromTemplateUrl('templates/shop/stripe.html', {
                scope: $scope,
                animation: 'slide-in-up'
            }).then(function(modal) {
                $scope.modal = modal;
                $scope.modal.show();
            });            


        } else if( 'wallet' === this.newOrder.paymentMethod ){

            OrderService.placeorder(paramJSON).then(function(data) {
                if (data.status == "ok" && data.payment == "wallet") {
                        $scope.newOrder = {};
                        $scope.newOrder.billing = {};
                        $scope.newOrder.shipping = {};
                        $scope.newOrder.methods = {};
                        $scope.newOrder.countries = {}; 
                    $scope.modal.hide();
                    $ionicLoading.hide();
                    $localStorage.cart = [];
                    $scope.cartItems = [];
                    $rootScope.cartCount = 0;
                    $scope.newOrder.paymentMethod = '';
                    $scope.newOrder.shipping.charge = 0;
                    $scope.total_shipping_cost = 0;
                    $scope.costSum = 0;
                    $state.go("App.accountorder")
                } else {
                    $scope.modal.hide();
                    $ionicLoading.hide();
                    $ionicPopup.alert({
                        title: 'Order Place Failed!',
                        template: 'Something went wrong.'
                    });                      
                }
            });

        } 

    }

    $scope.orderPlaceByStripe = function(newOrder) {

        if( this.newOrder.card_no == '' || this.newOrder.card_no == null ||
            this.newOrder.month == '' || this.newOrder.month == null ||
            this.newOrder.year == '' ||  this.newOrder.year == null ||
            this.newOrder.cvc == ''  || this.newOrder.cvc == null           
        ){
            $ionicPopup.alert({
                title: 'Card Info!',
                template: 'All information is required'
            });
            return;
        } 

        $scope.orderItems = [];
        if ($localStorage.cart) {
            $localStorage.cart.forEach(function(element, index) {
                $scope.orderItems.push({
                    product_id: element.postid,
                    quantity: element.count,
                });
            });
        } else {
            return;
        }

        var data = {
            payment_details: {
                method_id: newOrder.paymentMethod,
                method_title: newOrder.paymentMethod,
                paid: true
            },
            billing_address: {
                first_name: newOrder.billing.first_name,
                last_name: newOrder.billing.last_name,
                address_1: newOrder.billing.address_1,
                address_2: newOrder.billing.address_2,
                city: newOrder.billing.city,
                state: newOrder.billing.state,
                postcode: newOrder.billing.postcode,
                country: newOrder.billing.country,
                email: $localStorage.userData.data.email,
                phone: newOrder.billing.phone
            },
            shipping_address: {
                first_name: newOrder.shipping.first_name,
                last_name: newOrder.shipping.last_name,
                address_1: newOrder.shipping.address_1,
                address_2: newOrder.shipping.address_2,
                city: newOrder.shipping.city,
                state: newOrder.shipping.state,
                postcode: newOrder.shipping.postcode,
                country: newOrder.shipping.country
            }, 
            shipping_method: {
                shipping_id: $scope.shipping_id,
                method_id: $scope.method_id,
                shipping_label: $scope.shipping_label,
                shipping_cost: $scope.shipping_cost,
            },   
            shipping_charge : $scope.total_shipping_cost,                         
            stripe: {
                card_no: newOrder.card_no,
                month: newOrder.month,
                year: newOrder.year,
                cvc: newOrder.cvc,
                amount: $scope.costSum
            },
            customer_id: $localStorage.userData.data.id || '',
            line_items: $scope.orderItems
        }; 

        var paramJSON = JSON.stringify(data);
        $ionicLoading.show({
            template: 'Processing...'
        });

        StripePayment.stripepayment(paramJSON).then(function(data) {

            var extract = JSON.parse(data.body);
            if (extract.success == true) {
                OrderService.placeorder(paramJSON).then(function(data) {
                    if (data.status == "ok") {  

                        $scope.newOrder = {};
                        $scope.newOrder.billing = {};
                        $scope.newOrder.shipping = {};
                        $scope.newOrder.methods = {};
                        $scope.newOrder.countries = {}; 
                                                                
                        $scope.modal.hide();
                        $ionicLoading.hide();
                        $localStorage.cart = [];
                        $scope.cartItems = [];
                        $rootScope.cartCount = 0;
                        $scope.newOrder.paymentMethod = '';
                        $scope.newOrder.shipping.charge = 0;
                        $scope.total_shipping_cost = 0;
                        $scope.costSum = 0;                        
                        $scope.newOrder.shipping.charge = 0;
                        $state.go("App.accountorder")

                    } else {
                        $ionicLoading.hide();
                        $ionicPopup.alert({
                            title: 'Order Place Failed!',
                            template: 'Something went wrong.'
                        });   
                    }

                });
               
            } else {
                $scope.modal.hide();
                $ionicLoading.hide();
                $ionicPopup.alert({
                    title: 'Payment Failed!',
                    template: extract.message
                });                
            }
        });        

    }

});