// Ionic App App
// angular.module is a global place for creating, registering and retrieving Angular modules
// 'App' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'App.services' is found in services.js
// 'App.controllers' is found in controllers.js
var app = angular.module('App', ['ionic', 'ngCordova', 'App.controllers', 'App.factories', 'App.categoryTree', 'App.services', 'App.config', 'App.directives', 'angularMoment', 'ngStorage', 'App.msg', 'pascalprecht.translate']);


app.run(function($timeout, $ionicPlatform, $rootScope, $ionicPopup, $ionicHistory, $ionicLoading, $localStorage, $location, $filter, Location, $state, AuthService, Channelslib) {

    $rootScope.hostMail = 'https://cognisance.life/mobileapp/appchat/active.php';
    $rootScope.keyMap = 'AIzaSyBkoCe6SWsU-TY313QWkK6zc1KntCoubLc';
    $rootScope.getMap = 'https://maps.googleapis.com/maps/api/staticmap?key=' + $rootScope.keyMap + '&';
    $rootScope.linkDownload = 'https://cognisance.life/dl?c=1234fmiakqua';
    $rootScope.inviteText = 'Invited you to install V-Life, a community-based social application: ' + $rootScope.linkDownload;

    $rootScope.goBack = function() {
        $ionicHistory.goBack();
        // window.history.back();
        $ionicNavBarDelegate.back()
    };
    $rootScope.showLoading = function(template) {
        $ionicLoading.show({
            template: template
        });
    };
    $rootScope.hideLoading = function() {
        $ionicLoading.hide();
    };
    $rootScope.openLink = function(link) {
        var ref = cordova.InAppBrowser.open(link, '_blank', 'location=yes');
    };

    $rootScope.open_link = function(event) {

        event.preventDefault();
        var href = (event.target.parentNode && event.target.parentNode.href) ? event.target.parentNode.href : event.target.href;
        //alert(href);
        var browserRef = window.open(href, '_system', 'location=no,clearsessioncache=no,clearcache=no');

    }

    $ionicPlatform.on('pause', function() {
        $rootScope.inBackground = 1;
    });
    $ionicPlatform.on('resume', function() {
        $rootScope.inBackground = 0;
    });
    document.addEventListener("offline", onOffline, false);

    function onOffline() {
        $rootScope.hideLoading();
        var confirmPopup = $ionicPopup.alert({
            title: 'Connection is disconnected',
            template: 'This App only work while Connection connected !'
        }).then(function() {
            navigator.app.exitApp();
        });
    }
    if (angular.isDefined($localStorage.userLogin)) {
        $ionicPlatform.ready(function() {

            $rootScope.showNotification = function(numMessages) {
                cordova.plugins.notification.local.schedule({
                    id: 1,
                    title: "V-Life notification",
                    text: "You have new messages",
                });
            };

            var notification = firebase.database().ref('notification').child($localStorage.userLogin.id);
            notification.on('value', function(snapshot) {
                var data = snapshot.val();
                if (data) {
                    if (data.messagesNew > 0 && $rootScope.inBackground === 1)
                        $rootScope.showNotification();
                }
            });
        });
    }
    $ionicPlatform.registerBackButtonAction(function() {
        if ($state.current.name == "detail") $state.go("tab.messages");
        else if ($state.current.name == "groupDetail" || $state.current.name == "createGroup")
            $state.go("App.group");
        else $rootScope.goBack();
    }, 100);

    $ionicPlatform.on("deviceready", function() {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            cordova.plugins.Keyboard.disableScroll(true);

        }
        if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleDefault();
        }

        AuthService.userIsLoggedIn().then(function(response) {

            if (response === true) {
                //update user avatar and go on
                // AuthService.updateUserAvatar();

                $state.go('App.home');
            } else {
                $state.go('welcome');
            }
        });

    });


    // UI Router Authentication Check
    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {


        if (toState.name === 'App.learnlesson' || toState.name === 'App.learnsinglelesson' || toState.name === 'App.learnsubcategory' || toState.name === 'App.messages' || toState.name === 'App.post' || toState.name === 'App.contacts' || toState.name === 'App.addContacts' || toState.name === 'App.group' || toState.name === 'App.recommended' || toState.name === 'App.settings' || toState.name === 'App.nearbyContacts' || toState.name === 'App.nearbyLocation' || toState.name === 'App.inviteContacts' || toState.name === 'App.game' || toState.name === 'App.learn' || toState.name === 'App.channels' || toState.name === 'App.channels-channel' || toState.name === 'App.post' ) {
            $rootScope.showmenu = true;
        } else {
            $rootScope.showmenu = false;
        }


        if (toState.name === 'App.shop' || toState.name === 'App.product' || toState.name === 'App.checkout') {
            $rootScope.showmenucart = true;
        } else {
            $rootScope.showmenucart = false;
        }


        if (toState.name === 'welcome' || toState.name === 'intro') {
            // doe she/he try to go to login? - let him/her go
            return;
        }

        AuthService.userIsLoggedIn().then(function(response) {
            if (response === false) {
                event.preventDefault();
                $state.go('welcome');

            } else {
                Channelslib.checknotification().then(function(checknotification) {
                    $rootScope.notifyicon = checknotification.notification;
                });

            }
        });


    });

    $rootScope.$on('loading:show', function() {
        $ionicLoading.show({
            template: 'Please wait..'
        })
    });

    $rootScope.$on('loading:hide', function() {
        $ionicLoading.hide();
    });

    $rootScope.$on('$stateChangeStart', function() {
        $rootScope.$broadcast('loading:show');
    });

    $rootScope.$on('$stateChangeSuccess', function() {
        $rootScope.$broadcast('loading:hide');       
    });

});


app.config(function($translateProvider) {

    if (localStorage.lang) {
        var defaultlan = localStorage.lang;
    } else {
        var defaultlan = "en";
    }
    $translateProvider.translations('en', translations_en);
    $translateProvider.translations('ch', translations_ch);
    $translateProvider.preferredLanguage(defaultlan);
    $translateProvider.fallbackLanguage('en');
});



app.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {

        // Ionic uses AngularUI Router which uses the concept of states
        // Learn more here: https://github.com/angular-ui/ui-router
        // Set up the various states which the app can be in.
        // Each state's controller can be found in controllers.js
        $ionicConfigProvider.tabs.position('bottom');
        $ionicConfigProvider.backButton.previousTitleText(false).text('');
        $stateProvider

            .state('welcome', {
                cache: false,
                url: '/welcome',
                templateUrl: 'templates/welcome.html',
                controller: 'welcomeCtrl',
            })

            // Intro
            // after signup
            .state('intro', {
                url: '/intro',
                templateUrl: 'templates/intro.html',
                controller: 'welcomeCtrl2',
                resolve: {
                    WelcomeData: function(WelcomeFactory, $ionicLoading) {
                        return WelcomeFactory.getlocation();
                    }
                }

            })

            // setup an abstract state for the tabs directive
            .state('App', {
                cache: false,
                url: '/tab',
                abstract: true,
                templateUrl: 'templates/tabs.html',
                controller: 'AppCtrl',
                resolve: {
                    CategoryData: function(Category, $ionicLoading, $stateParams) {
                        return Category.all();
                    },

                    AccountData: function(Account, $stateParams) {
                        return Account.adrs();
                    }                   
                }
            })

            .state('NewApp', {
                cache: false,
                url: '/tab',
                abstract: true,
                templateUrl: 'templates/newtab.html',
                controller: 'AppCtrl',
                resolve: {
                    CategoryData: function(Category, $ionicLoading, $stateParams) {
                        return Category.all();
                    }
                }
            })

            //messaging state
            .state('editInfomation', {
                url: '/editInfomation',
                templateUrl: 'templates/sign/edit-infomation.html',
                controller: 'signCtrl'
            })

            .state('App.messages', {
                cache: false,
                url: '/messages',
                views: {
                    'tab-messages': {
                        templateUrl: 'templates/messages/index.html',
                        controller: 'messagesCtrl'
                    }
                }
            })

            .state('App.chats', {
                url: '/chats',
                views: {
                    'tab-chats': {
                        templateUrl: 'templates/tab-chats.html',
                        controller: 'ChatsCtrl'
                    }
                }
            })

            .state('App.chat-detail', {
                url: '/chats/:chatId',
                views: {
                    'tab-chats': {
                        templateUrl: 'templates/chat-detail.html',
                        controller: 'ChatDetailCtrl'
                    }
                }
            })

            .state('wallsinglepost', {
                cache: false,
                url: '/home/wall/:postId',
                templateUrl: 'templates/wall.html',
                controller: 'SingleHomeCtrl',
                resolve: {
                    post_data: function(Wall, $ionicLoading, $stateParams) {
                        var postId = $stateParams.postId;
                        return Wall.get_single_activity(postId);
                    }
                }
            })


            .state('userprofile', {
                cache: false,
                url: '/userprofile/:postId',
                templateUrl: 'templates/userprofile.html',
                controller: 'UserProfileCtrl',
                resolve: {
                    Walldata: function(Wall, $ionicLoading, $stateParams) {
                        var postId = $stateParams.postId;
                        return Wall.get_single_user_activity(postId);
                    }
                }
            })

            .state('postlikers', {
                cache: false,
                url: '/likers/:postId',
                templateUrl: 'templates/liker.html',
                controller: 'SingleLikeCtrl',
                resolve: {
                    post_data: function(Wall, $ionicLoading, $stateParams) {
                        var postId = $stateParams.postId;
                        return Wall.get_likers(postId);
                    }
                }
            })

            .state('channelpostlikers', {
                cache: false,
                url: '/channellikers/:catId/:postId',
                templateUrl: 'templates/channelliker.html',
                controller: 'SingleLikeCtrl',
                resolve: {
                    post_data: function(Wall, $ionicLoading, $stateParams) {
                        var postId = $stateParams.postId;
                        return Wall.get_likers(postId);
                    }
                }
            })


            .state('App.userlist', {
                cache: false,
                url: '/home/userlist/',
                views: {
                    'tab-userlist': {
                        templateUrl: 'templates/user.html',
                        controller: 'UserHomeCtrl',
                    }
                },
                resolve: {
                    user_data: function(Wall, $ionicLoading) {
                        return Wall.get_user();
                    }
                }
            })


            .state('detail', {
                cache: false,
                url: '/messages/detail/:id',
                templateUrl: 'templates/messages/detail.html',
                controller: 'messagesDetail'
            })

            .state('sendLocation', {
                cache: false,
                url: '/messages/location/:id/:source',
                templateUrl: 'templates/messages/location.html',
                controller: 'sendLocation'
            })

            .state('App.contacts', {
                cache: false,
                url: '/contacts',
                views: {
                    'tab-contacts': {
                        templateUrl: 'templates/contacts/index.html',
                        controller: 'contactsCtrl'
                    }
                }
            })

            .state('App.recommended', {
                url: '/contacts/recommended',
                views: {
                    'tab-contacts': {
                        templateUrl: 'templates/contacts/recommended.html',
                        controller: 'contactsRecommended'
                    }
                }
            })

            .state('App.addContacts', {
                cache: false,
                url: '/contacts/add',
                views: {
                    'tab-contacts': {
                        templateUrl: 'templates/contacts/add.html',
                        controller: 'contactsAdd'
                    }
                }
            })

            .state('App.searchContacts', {
                cache: false,
                url: '/contacts/search/:id',
                views: {
                    'tab-contacts': {
                        templateUrl: 'templates/contacts/search.html',
                        controller: 'contactsSearch'
                    }
                }
            })

            .state('App.inviteContacts', {
                url: '/contacts/invite/:id',
                views: {
                    'tab-contacts': {
                        templateUrl: 'templates/contacts/invite.html',
                        controller: 'contactsInvite'
                    }
                }
            })

            .state('App.updateContacts', {
                url: '/contacts/update',
                views: {
                    'tab-contacts': {
                        templateUrl: 'templates/contacts/update.html',
                        controller: 'contactsUpdate'
                    }
                }
            })

            .state('App.nearbyContacts', {
                cache: false,
                url: '/contacts/nearby',
                views: {
                    'tab-contacts': {
                        templateUrl: 'templates/contacts/nearby.html',
                        controller: 'contactsNearby'
                    }
                }
            })

            .state('App.nearbyLocation', {
                cache: false,
                url: '/contacts/location',
                views: {
                    'tab-contacts': {
                        templateUrl: 'templates/contacts/location.html',
                        controller: 'nearbyLocation'
                    }
                }
            })

            .state('App.group', {
                cache: false,
                url: '/group',
                views: {
                    'tab-group': {
                        templateUrl: 'templates/group/index.html',
                        controller: 'groupCtrl'
                    }
                }
            })

            .state('createGroup', {
                cache: false,
                url: '/group/create',
                templateUrl: 'templates/group/create.html',
                controller: 'groupCreate'
            })

            .state('App.addGroup', {
                url: '/group/add/:id',
                views: {
                    'tab-group': {
                        templateUrl: 'templates/group/add.html',
                        controller: 'groupAdd'
                    }
                }
            })
            .state('App.viewGroup', {
                cache: false,
                url: '/group/view/:id',
                views: {
                    'tab-group': {
                        templateUrl: 'templates/group/view.html',
                        controller: 'groupView'
                    }
                }
            })

            .state('groupDetail', {
                cache: false,
                url: '/group/detail/:id',
                templateUrl: 'templates/group/detail.html',
                controller: 'groupDetail'
            })

            .state('App.settings', {
                cache: false,
                url: '/settings',
                views: {
                    'tab-settings': {
                        templateUrl: 'templates/settings/index.html',
                        controller: 'settingsCtrl'
                    }
                }
            })

            .state('profiles', {
                url: '/settings/profiles',
                templateUrl: 'templates/settings/profiles.html',
                controller: 'settingsCtrl'
            })

            .state('App.settingsMessages', {
                cache: false,
                url: '/settings/messages',
                views: {
                    'tab-settingsMessages': {
                        templateUrl: 'templates/settings/messages.html',
                        controller: 'settingsCtrl'
                    }
                }
            })

            .state('App.settingsContacts', {
                cache: false,
                url: '/settings/contacts',
                views: {
                    'tab-settingsContacts': {
                        templateUrl: 'templates/settings/contacts.html',
                        controller: 'settingsCtrl'
                    }
                }
            })

            .state('settingsLanguages', {
                url: '/settings/languages',
                templateUrl: 'templates/settings/languages.html',
                controller: 'settingsCtrl'
            })

            .state('about', {
                url: '/settings/about',
                templateUrl: 'templates/settings/about.html',
            })

            .state('App.settingsAccount', {
                cache: false,
                url: '/settings/account',
                views: {
                    'tab-settingsAccount': {
                        templateUrl: 'templates/settings/account.html',
                        controller: 'settingsCtrl'
                    }
                }
            })

            .state('settingsPassword', {
                url: '/settings/password',
                templateUrl: 'templates/settings/password.html',
                controller: 'changePasswordCtrl'
            })

            .state('search', {
                cache: false,
                url: '/search',
                templateUrl: 'templates/search.html',
                controller: 'searchCtrl'
            })


            .state('App.changelanguage', {
                cache: false,
                url: '/settings/changelanguage',
                views: {
                    'tab-changelanguage': {
                        templateUrl: 'templates/settings/changelanguage.html',
                        controller: 'settingsCtrl'
                    }
                }
            })

            // Each tab has its own nav history stack:
            .state('App.home', {
                cache: false,
                url: '/home',
                views: {
                    'tab-home': {
                        templateUrl: 'templates/tab-home.html',
                        controller: 'HomeCtrl'
                    }
                },
                data: {
                    authenticate: true
                },
                resolve: {
                    Walldata: function(Wall, $stateParams) {
                        return Wall.home();
                    }
                }
            })


            .state('App.category', {
                url: '/category/:id',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/category.html',
                        controller: 'CategoryCtrl'
                    }
                }
            })

            .state('App.channels', {
                cache: false,
                url: '/channels',
                views: {
                    'tab-channels': {
                        templateUrl: 'templates/channel/tab-channels.html',
                        controller: 'ChannelsCtrl'
                    }
                },
                resolve: {
                    Channeldata: function(Channelslib) {
                        return Channelslib.getChannels();
                    }
                }
            })

            .state('App.channels-channel', {
                cache: false,
                url: "/posts/:postId",
                views: {
                    'tab-channels-channel': {
                        templateUrl: 'templates/channel/channel.html',
                        controller: 'ChannelCtrl'
                    }
                },
                resolve: {
                    Channeldata: function(Channelslib, $stateParams) {
                        return Channelslib.getsingleChannel($stateParams.postId);
                    }
                }
            })

            .state('App.post', {
                cache: false,
                url: "/singleposts/:postId/:catId",
                views: {
                    'tab-singlepost': {
                        templateUrl: 'templates/channel/post.html',
                        controller: 'PostCtrl'
                    }
                },
                resolve: {
                    Channeldata: function(Channelslib, $stateParams) {
                        return Channelslib.getchannelpost($stateParams.postId, $stateParams.catId);
                    },
                }
            })



            .state('App.learn', {
                cache: false,
                url: '/learn',
                views: {
                    'tab-learn': {
                        templateUrl: 'templates/learn/tab-learn.html',
                        controller: 'LearncatCtrl'
                    }
                },
                resolve: {
                    Learndata: function(Learn, $ionicLoading) {
                        //var postId = $stateParams.postId;
                        return Learn.learncategories();
                    }
                }
            })

            .state('App.learnsubcategory', {
                cache: false,
                url: '/learnsubcategory/:postID',
                views: {
                    'tab-learnsubcategory': {
                        templateUrl: 'templates/learn/all-courses.html',
                        controller: 'LearnsubcatCtrl'
                    }
                },
                resolve: {
                    Learndata: function(Learn, $ionicLoading, $stateParams) {
                        var postId = $stateParams.postID;
                        return Learn.learnsubcategories(postId);
                    }
                }
            })

            .state('App.learnlesson', {
                cache: false,
                url: '/learnlesson/:postID/:catid',
                views: {
                    'tab-learnlesson': {
                        templateUrl: 'templates/learn/single-course.html',
                        controller: 'LearnlessonCtrl'
                    }
                },
                resolve: {
                    Learndata: function(Learn, $ionicLoading, $stateParams) {
                        var postId = $stateParams.postID;
                        return Learn.learnalllesson(postId);
                    }
                }
            })

            .state('App.learnsinglelesson', {
                cache: false,
                url: '/learnsinglelesson/:postID/:lessonid/:catid',
                views: {
                    'tab-learnsinglelesson': {
                        templateUrl: 'templates/learn/lesson.html',
                        controller: 'LearnsinglelessonCtrl'
                    }
                },
                resolve: {
                    Learndata: function(Learn, $ionicLoading, $stateParams) {
                        var postId = $stateParams.postID;
                        return Learn.learnsinglelesson(postId);
                    }
                }
            })

            .state('App.health', {
                url: '/health',
                views: {
                    'tab-health': {
                        templateUrl: 'templates/tab-health.html',
                        controller: 'HealthCtrl'
                    }
                },
                resolve: {
                    Gamedata: function(Game) {
                        return Game.get_score();
                    }
                }
            })
            .state('App.checkout', {
                cache: false,
                url: '/checkout/',
                views: {
                    'tab-checkout': {
                        templateUrl: 'templates/shop/checkout.html',
                        controller: 'CheckoutCtrl'
                    }
                },               
            })


            .state('App.account', {
                url: '/account',
                views: {
                    'tab-account': {
                        templateUrl: 'templates/tab-account.html',
                        controller: 'AccountCtrl'
                    }
                }
            })



            .state('App.wppage', {
                cache: false,
                url: '/wp/page/:pageid',
                views: {
                    'tab-wppage': {
                        templateUrl: 'templates/page.html',
                        controller: 'PageCtrl'
                    }
                },
                resolve: {
                    page_data: function(WpPage, $stateParams) {
                        return WpPage.getpage($stateParams.pageid);
                    }
                }
            })
            //woocommerce
            .state('App.shop', {
                cache: false,
                url: '/shop',
                views: {
                    'tab-shop': {
                        templateUrl: 'templates/shop/browse.html',
                        controller: 'BrowseCtrl'
                    }
                },
                resolve: {
                    Prductdata: function(Channelslib) {
                        return Channelslib.getPrdoducts();
                    }
                }
            })

            .state('App.product', {
                cache: false,
                url: '/product/:productID',
                views: {
                    'tab-product': {
                        templateUrl: 'templates/shop/product.html',
                        controller: 'ProductCtrl'
                    }
                },
                resolve: {
                    Prductdata: function(Wall, $ionicLoading, $stateParams) {
                        var productID = $stateParams.productID;
                        return Wall.get_product(productID);
                    }
                }
            })
            .state('App.email', {
                cache: false,
                url: "/email",
                views: {
                    'tab-email': {
                        templateUrl: "templates/email.html",
                        controller: 'EmailSenderCtrl'
                    }
                }
            })

            //affiliate
            .state('App.affiliateurl', {
                cache: false,
                url: '/affiliateurl',
                views: {
                    'tab-affiliateurl': {
                        templateUrl: 'templates/affiliate/url.html',
                        controller: 'AffiliateUrlCtrl'
                    }
                },
                resolve: {
                    AffiliateData: function(Affiliate, $stateParams) {
                        return Affiliate.geturl();
                    }
                }
            })
            .state('App.affiliatepayouts', {
                cache: false,
                url: '/affiliatepayouts',
                views: {
                    'tab-affiliatepayouts': {
                        templateUrl: 'templates/affiliate/payouts.html',
                        controller: 'AffiliatePayoutCtrl'
                    }
                },
                resolve: {
                    AffiliateData: function(Affiliate, $stateParams) {
                        return Affiliate.payout();
                    }
                }
            })

            .state('App.affiliatecreatives', {
                cache: false,
                url: '/affiliatecreatives',
                views: {
                    'tab-affiliatecreatives': {
                        templateUrl: 'templates/affiliate/creatives.html',
                        controller: 'AffiliateCreativeCtrl'
                    }
                },
                resolve: {
                    AffiliateData: function(Affiliate, $stateParams) {
                        return Affiliate.creative();
                    }
                }
            })

            .state('App.affiliatenetwork', {
                url: '/affiliatenetwork',
                views: {
                    'tab-affiliatenetwork': {
                        templateUrl: 'templates/affiliate/network.html',
                        controller: 'AffiliateNetworkCtrl'
                    }
                },
                resolve: {
                    AffiliateData: function(Affiliate, $stateParams) {
                        return Affiliate.network();
                    }
                }
            })

            .state('App.affiliatesettings', {
                url: '/affiliatesettings',
                views: {
                    'tab-affiliatesettings': {
                        templateUrl: 'templates/affiliate/settings.html',
                        controller: 'AffiliateSettingCtrl'
                    }
                },
                resolve: {
                    AffiliateData: function(Affiliate, $stateParams) {
                        return Affiliate.setting();
                    }
                }
            })

            //new affiliate Dashboard
            .state('App.affiliatedemo', {
                url: '/affiliatedemo',
                views: {
                    'tab-affiliatedemo': {
                        templateUrl: 'templates/affiliate/demo.html',
                        controller: 'AffiliateDemoCtrl'
                    }
                }
            })

            .state('App.affiliateoverview', {
                cache: false,
                url: '/affiliateoverview',
                views: {
                    'tab-affiliateoverview': {
                        templateUrl: 'templates/affiliate/overview.html',
                        controller: 'AffiliateOverviewCtrl'
                    }
                },
                resolve: {
                    AffiliateData: function(Affiliate, $stateParams) {
                        return Affiliate.affiliate("overview", false, false, -1, 1);
                    }
                }
            })

            .state('App.editaccount', {
                cache: false,
                url: '/editaccount',
                views: {
                    'tab-editaccount': {
                        templateUrl: 'templates/affiliate/editaccount.html',
                        controller: 'EditAccountCtrl'
                    }
                },
                resolve: {
                    AffiliateData: function(Affiliate, $stateParams) {
                        return Affiliate.edit_account("edit_account", false, false, -1, 1);
                    }
                }
            })


            .state('App.affiliatereferrals', {
                cache: false,
                url: '/affiliatereferrals',
                views: {
                    'tab-affiliatereferrals': {
                        templateUrl: 'templates/affiliate/referrals.html',
                        controller: 'AffiliateRefferalsCtrl'
                    }
                },
                resolve: {
                    AffiliateData: function(Affiliate, $stateParams) {
                        return Affiliate.referrals("referrals", "", "", -1, 1);
                    }
                }
            })

            .state('App.affiliatewithdraw', {
              cache: false,
              url: '/withdraw',
              views: {
                  'tab-withdraw': {
                      templateUrl: 'templates/affiliate/withdraw.html',
                      controller: 'AffiliateWithdrawCtrl'
                  }
              },
              resolve: {
                  AffiliateData: function(Affiliate, $stateParams) {
                      return Affiliate.affiliate_withdraw("withdraw", false, false, -1, 1);
                  }
              }
            })

            .state('App.affiliatepayments', {
                cache: false,
                url: '/affiliatepayments',
                views: {
                    'tab-affiliatepayments': {
                        templateUrl: 'templates/affiliate/payments.html',
                        controller: 'AffiliatePaymentsCtrl'
                    }
                },
                resolve: {
                    AffiliateData: function(Affiliate, $stateParams) {
                        return Affiliate.payments("payments", "", "", -1, 1);
                    }
                }
            })
            .state('App.affiliatelink', {
                cache: false,
                url: '/affiliatelink',
                views: {
                    'tab-affiliatelink': {
                        templateUrl: 'templates/affiliate/affiliate-links.html',
                        controller: 'AffiliateLink'
                    }
                },
                resolve: {
                    AffiliateData: function(Affiliate, $stateParams) {
                        return Affiliate.affiliate_link("affiliate_link", false, false, -1, 1);
                    }
                }
            })

            .state('App.affiliatewallet', {
                cache: false,
                url: '/affiliatewallet',
                views: {
                    'tab-affiliatewallet': {
                        templateUrl: 'templates/affiliate/wallet.html',
                        controller: 'AffiliateWalletCtrl'
                    }
                },
                resolve: {
                    AffiliateData: function(Affiliate, $stateParams) {
                        return Affiliate.wallet("wallet", false, false, -1, 1);
                    }
                }
            })

            .state('App.affiliatecampaign', {
                cache: false,
                url: '/affiliatecampaign',
                views: {
                    'tab-affiliatecampaign': {
                        templateUrl: 'templates/affiliate/campaigns.html',
                        controller: 'AffiliateCampaignCtrl'
                    }
                },
                resolve: {
                    AffiliateData: function(Affiliate, $stateParams) {
                        return Affiliate.campaigns("campaigns", false, false, -1, 1);
                    }
                }
            })
            .state('App.affiliatebanner', {
                cache: false,
                url: '/affiliatebanner',
                views: {
                    'tab-affiliatebanner': {
                        templateUrl: 'templates/affiliate/banners.html',
                        controller: 'AffiliateBannerCtrl'
                    }
                },
                resolve: {
                    AffiliateData: function(Affiliate, $stateParams) {
                        return Affiliate.banners("banners", false, false, -1, 1);
                    }
                }
            })
            .state('App.affiliatecoupon', {
                cache: false,
                url: '/affiliatecoupon',
                views: {
                    'tab-affiliatecoupon': {
                        templateUrl: 'templates/affiliate/coupons.html',
                        controller: 'AffiliateCtrl'
                    }
                },
                resolve: {
                    AffiliateData: function(Affiliate, $stateParams) {
                        return Affiliate.affiliate("coupons", false, false, -1, 1);
                    }
                }
            })
            .state('App.affiliateoverall', {
                cache: false,
                url: '/affiliateoverall',
                views: {
                    'tab-affiliateoverall': {
                        templateUrl: 'templates/affiliate/overall-reports.html',
                        controller: 'AffiliateOverAllCtrl'
                    }
                },
                resolve: {
                    AffiliateData: function(Affiliate, $stateParams) {
                        return Affiliate.reports("reports", false, false, -1, 1);
                    }
                }
            })

            .state('App.affiliatetrafficlog', {
                cache: false,
                url: '/affiliatetrafficlog',
                views: {
                    'tab-affiliatetrafficlog': {
                        templateUrl: 'templates/affiliate/trafic-log.html',
                        controller: 'AffiliateTrafficCtrl'
                    }
                },
                resolve: {
                    AffiliateData: function(Affiliate, $stateParams) {
                        return Affiliate.visits("visits", "", "", -1, 1);
                    }
                }
            })
            .state('App.affiliatecampaignreport', {
                cache: false,
                url: '/affiliatecampaignreport',
                views: {
                    'tab-affiliatecampaignreport': {
                        templateUrl: 'templates/affiliate/campaign-reports.html',
                        controller: 'AffiliateCtrl'
                    }
                },
                resolve: {
                    AffiliateData: function(Affiliate, $stateParams) {
                        return Affiliate.campaign_reports("campaign_reports", false, false, -1, 1);
                    }
                }
            })
            .state('App.affiliaterefferalhistory', {
                cache: false,
                url: '/affiliaterefferalhistory',
                views: {
                    'tab-affiliaterefferalhistory': {
                        templateUrl: 'templates/affiliate/referral-history.html',
                        controller: 'AffiliateReferralsHistoryCtrl'
                    }
                },
                resolve: {
                    AffiliateData: function(Affiliate, $stateParams) {
                        return Affiliate.referrals_history("referrals_history", "", "", -1, 1);
                    }
                }
            })
            .state('App.affiliatemlm', {
                cache: false,
                url: '/affiliatemlm',
                views: {
                    'tab-affiliatemlm': {
                        templateUrl: 'templates/affiliate/mlm.html',
                        controller: 'AffiliateMlmCtrl'
                    }
                },
                resolve: {
                    AffiliateData: function(Affiliate, $stateParams) {
                        return Affiliate.mlm("mlm", false, false, -1, 1);
                    }
                }
            })

            .state('App.affiliatecustomslug', {
                cache: false,
                url: '/affiliatecustomslug',
                views: {
                    'tab-affiliatecustomslug': {
                        templateUrl: 'templates/affiliate/custom-affiliate-slug.html',
                        controller: 'AffiliateCustomSlug'
                    }
                },
                resolve: {
                    AffiliateData: function(Affiliate, $stateParams) {
                        return Affiliate.affiliate("custom_affiliate_slug");
                    }
                }
            })
            .state('App.affiliatepaymentsetting', {
                cache: false,
                url: '/affiliatepaymentsetting',
                views: {
                    'tab-affiliatepaymentsetting': {
                        templateUrl: 'templates/affiliate/payment-settings.html',
                        controller: 'AffiliatePaymentSetting'
                    }
                },
                resolve: {
                    AffiliateData: function(Affiliate, $stateParams) {
                        return Affiliate.payments_settings("payments_settings");
                    }
                }
            })

            //my account menu
            .state('App.accountprofile', {
                cache: false,
                url: '/accountprofile',
                views: {
                    'tab-accountprofile': {
                        templateUrl: 'templates/account/profile.html',
                        controller: 'AccountProfile'
                    }
                },
                resolve: {
                    AccountData: function(Account, $stateParams) {
                        return Account.profile();
                    }
                }
            })

            .state('App.accountorder', {
                cache: false,
                url: '/accountorder',
                views: {
                    'tab-accountorder': {
                        templateUrl: 'templates/account/order.html',
                        controller: 'AccountOrder'
                    }
                },
                resolve: {
                    AccountData: function(Account, $stateParams) {
                        return Account.order();
                    }
                }
            })

            .state('App.accountsubscription', {
                cache: false,
                url: '/accountsubscription',
                views: {
                    'tab-accountsubscription': {
                        templateUrl: 'templates/account/subscription.html',
                        controller: 'Accountsubscription'
                    }
                },
                resolve: {
                    AccountData: function(Account, $stateParams) {
                        return Account.subscription();
                    }
                }
            })

            .state('App.accountadrs', {
                cache: false,
                url: '/accountadrs',
                views: {
                    'tab-accountadrs': {
                        templateUrl: 'templates/account/adrs.html',
                        controller: 'Accountadrs'
                    }
                },
                resolve: {
                    AccountData: function(Account, $stateParams) {
                        return Account.adrs();
                    }
                }
            })


            .state('NewApp.broadcast', {
                cache: false,
                url: '/broadcast',
                views: {
                    'tab-broadcast': {
                        templateUrl: 'templates/broadcast/detail.html',
                        controller: 'broadcastDetail'
                    }
                }
            })


            .state('App.game', {
                cache: false,
                url: '/game/:gameID',
                views: {
                    'tab-game': {
                        templateUrl: 'templates/game.html',
                        controller: 'GameCtrl'
                    }
                }
            })


        ;


        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('tab/home');

    })
    .directive('hideTabs', function($rootScope) {
        return {
            restrict: 'A',
            link: function(scope, element, attributes) {
                scope.$watch(attributes.hideTabs, function(value) {
                    $rootScope.hideTabs = value;
                });
                scope.$on('$ionicView.beforeLeave', function() {
                    $rootScope.hideTabs = false;
                });
            }
        };
    })

    .filter('firstChar', function(){
        return function(string){
            if (angular.isDefined(string) && string != '' && string != null && string != undefined) return string.substring(0, 1).toUpperCase();
        };
    })

    .filter('sinceTime', function($filter) {
        return function(time) {
            time = Number(time);
            if (angular.isDefined(time) && angular.isNumber(time)) {
                var now = new Date().getTime();
                var since = now - time;
                if (since > 432000000) {
                    return $filter('date')(time, 'dd/MM/yyyy');
                } else {
                    if (since < 120000) return 'Just Now';
                    else {
                        if (since < 3600000) return $filter('date')(since, 'mm') + ' minutes';
                        else if (since < 86400000) return Math.floor(since / 1000 / 60 / 60) + ' hours';
                        else return $filter('date')(since, 'dd') + ' days';
                    }
                }
            }
        };
    })

    .filter('isEmpty', function() {
        var bar;
        return function(obj) {
            for (bar in obj) {
                if (obj.hasOwnProperty(bar)) {
                    return false;
                }
            }
            return true;
        };
    })

    .config(function($ionicConfigProvider) {
        // $ionicConfigProvider.tabs.position('top');
    })




;