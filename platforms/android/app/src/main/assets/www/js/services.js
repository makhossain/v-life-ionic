angular.module('App.services', [])

    // WP POSTS RELATED FUNCTIONS
    .service('PostService', function($rootScope, $http, $q, WORDPRESS_API_URL, AuthService) {

        //follow service
        this.submitFollow = function(postId) {
            var deferred = $q.defer(),
                user = AuthService.getUser();

            $http.jsonp(WORDPRESS_API_URL + 'user/post_activity_like/' +
                    '?channelID=' + postId +
                    '&cookie=' + user.cookie +
                    '&insecure=cool' +
                    '&callback=JSON_CALLBACK')
                .success(function(data) {
                    deferred.resolve(data);
                })
                .error(function(data) {
                    deferred.reject(data);
                });

            return deferred.promise;
        };


        //mark as seen
        this.markasseen = function(catid, subcatid, postid, type) {
            var deferred = $q.defer(),
                user = AuthService.getUser();
            $http.jsonp(WORDPRESS_API_URL + 'user/markasseen/' +
                    '?catid=' + catid +
                    '&subcatid=' + subcatid +
                    '&postid=' + postid +
                    '&type=' + type +
                    '&cookie=' + user.cookie +
                    '&insecure=cool' +
                    '&callback=JSON_CALLBACK')
                .success(function(data) {
                    deferred.resolve(data);
                })
                .error(function(data) {
                    deferred.reject(data);
                });

            return deferred.promise;
        };



        this.getRecentPosts = function(page) {
            var deferred = $q.defer();

            $http.jsonp(WORDPRESS_API_URL +
                    'get_recent_posts/' +
                    '?page=' + page +
                    '&insecure=cool' +
                    '&callback=JSON_CALLBACK')
                .success(function(data) {
                    deferred.resolve(data);
                })
                .error(function(data) {
                    deferred.reject(data);
                });

            return deferred.promise;
        };

        this.getUserGravatar = function(userId) {
            var deferred = $q.defer();

            $http.jsonp(WORDPRESS_API_URL + 'user/get_avatar/' +
                    '?user_id=' + userId +
                    '&type=full' +
                    '&insecure=cool' +
                    '&callback=JSON_CALLBACK')
                .success(function(data) {
                    var avatar_aux = data.avatar.replace("http:", "");
                    var avatar = 'http:' + avatar_aux;

                    deferred.resolve(avatar);
                })
                .error(function(data) {
                    deferred.reject(data);
                });

            return deferred.promise;
        };

        this.getPost = function(postId) {
            var deferred = $q.defer();

            $http.jsonp(WORDPRESS_API_URL + 'get_post/' +
                    '?post_id=' + postId +
                    '&insecure=cool' +
                    '&callback=JSON_CALLBACK')
                .success(function(data) {
                    deferred.resolve(data);
                })
                .error(function(data) {
                    deferred.reject(data);
                });

            return deferred.promise;
        };

        this.submitComment = function(postId, content) {
            var deferred = $q.defer(),
                user = AuthService.getUser();

            $http.jsonp(WORDPRESS_API_URL + 'user/post_comment/' +
                    '?post_id=' + postId +
                    '&cookie=' + user.cookie +
                    '&comment_status=1' +
                    '&content=' + content +
                    '&insecure=cool' +
                    '&callback=JSON_CALLBACK')
                .success(function(data) {
                    deferred.resolve(data);
                })
                .error(function(data) {
                    deferred.reject(data);
                });

            return deferred.promise;
        };

        this.getPostsFromCategory = function(categoryId, page) {
            var deferred = $q.defer();

            $http.jsonp(WORDPRESS_API_URL + 'get_category_posts/' +
                    '?id=' + categoryId +
                    '&page=' + page +
                    '&insecure=cool' +
                    '&callback=JSON_CALLBACK')
                .success(function(data) {
                    deferred.resolve(data);
                })
                .error(function(data) {
                    deferred.reject(data);
                });

            return deferred.promise;
        };

        this.shortenPosts = function(posts) {
            var maxLength = 600;
            return _.map(posts, function(post) {
                if (post.content.length > maxLength) {
                    //trim the string to the maximum length
                    var trimmedString = post.content.substr(0, maxLength);
                    //re-trim if we are in the middle of a word
                    trimmedString = trimmedString.substr(0, Math.min(trimmedString.length, trimmedString.lastIndexOf("</p>")));
                    post.content = trimmedString;
                }
                return post;
            });
        };

        this.sharePost = function(link) {
            window.plugins.socialsharing.share(null, null, null, link);
        };

        this.bookmarkPost = function(post) {
            BookMarkService.bookmarkPost(post);
            $rootScope.$broadcast("new-bookmark", post);
        };

        this.getWordpressPage = function(page_slug) {
            alert("get");
            var deferred = $q.defer();

            $http.jsonp(WORDPRESS_API_URL + 'get_page/' +
                    '?slug=' + page_slug +
                    '&insecure=cool' +
                    '&callback=JSON_CALLBACK')
                .success(function(data) {
                    deferred.resolve(data);
                    doRegister
                })
                .error(function(data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        };

    })


    // WP POSTS RELATED FUNCTIONS
    .service('WallService', function($rootScope, $http, $q, WORDPRESS_API_URL, AuthService) {


        this.submitComment = function(postId, content) {
            var deferred = $q.defer(),
                user = AuthService.getUser();

            $http.jsonp(WORDPRESS_API_URL + 'user/post_activity_comment/' +
                    '?post_id=' + postId +
                    '&cookie=' + user.cookie +
                    '&comment_status=1' +
                    '&content=' + content +
                    '&insecure=cool' +
                    '&callback=JSON_CALLBACK')
                .success(function(data) {
                    deferred.resolve(data);
                })
                .error(function(data) {
                    deferred.reject(data);
                });

            return deferred.promise;
        };


        this.submitLike = function(postId, content) {
            var deferred = $q.defer(),
                user = AuthService.getUser();

            $http.jsonp(WORDPRESS_API_URL + 'user/post_activity_like/' +
                    '?post_id=' + postId +
                    '&cookie=' + user.cookie +
                    '&comment_status=1' +
                    '&content=' + content +
                    '&insecure=cool' +
                    '&callback=JSON_CALLBACK')
                .success(function(data) {
                    deferred.resolve(data);
                })
                .error(function(data) {
                    deferred.reject(data);
                });

            return deferred.promise;
        };


        this.submitActivity = function(postId) {
            var deferred = $q.defer(),
                user = AuthService.getUser();

            $http.jsonp(WORDPRESS_API_URL + 'user/post_activity/' +
                    '?post_id=' + postId +
                    '&cookie=' + user.cookie +
                    '&insecure=cool' +
                    '&callback=JSON_CALLBACK')
                .success(function(data) {
                    deferred.resolve(data);
                })
                .error(function(data) {
                    deferred.reject(data);
                });

            return deferred.promise;
        };

        this.get_activity = function(page) {
            var deferred = $q.defer(),
                user = AuthService.getUser();

            $http.jsonp(WORDPRESS_API_URL + 'user/get_activity/' +
                    '?page=' + page +
                    '&cookie=' + user.cookie +
                    '&insecure=cool' +
                    '&callback=JSON_CALLBACK')
                .success(function(data) {
                    deferred.resolve(data);
                })
                .error(function(data) {
                    deferred.reject(data);
                });

            return deferred.promise;
        };


        this.get_single_user_activity = function(page, user_id) {
            var deferred = $q.defer(),
                user = AuthService.getUser();

            $http.jsonp(WORDPRESS_API_URL + 'user/get_single_user_activity/' +
                    '?page=' + page +
                    '&post_id=' + user_id +
                    '&cookie=' + user.cookie +
                    '&insecure=cool' +
                    '&callback=JSON_CALLBACK')
                .success(function(data) {
                    deferred.resolve(data);
                })
                .error(function(data) {
                    deferred.reject(data);
                });

            return deferred.promise;
        };
    })

    .service('UserService', function($rootScope, $http, $q, WORDPRESS_JSON_API_URL, AuthService, WORDPRESS_API_URL) {
        this.getuser = function(page) {
            var deferred = $q.defer();
            var url = WORDPRESS_API_URL + 'user/get_refferal/?insecure=cool&per_page=50&callback=JSON_CALLBACK&page=' + page;
            $http.jsonp(url).success(function(data) {
                    deferred.resolve(data);
                })
                .error(function(data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        };


        this.searchuser = function(string) {
            var deferred = $q.defer();
            var url = WORDPRESS_JSON_API_URL + 'users/?per_page=50&search=' + string + '&callback=JSON_CALLBACK';

            $http.get(url)
                .success(function(data) {
                    deferred.resolve(data);
                })
                .error(function(data) {
                    deferred.reject(data);
                });

            return deferred.promise;
        };

    })


    // WP POSTS RELATED FUNCTIONS
    .service('ChannelService', function($rootScope, $http, $q, WORDPRESS_API_URL, AuthService) {
        //follow service
        this.submitFollow = function(postId) {
            var deferred = $q.defer(),
                user = AuthService.getUser();

            $http.jsonp(WORDPRESS_API_URL + 'user/post_follow/' +
                    '?channelID=' + postId +
                    '&cookie=' + user.cookie +
                    '&insecure=cool' +
                    '&callback=JSON_CALLBACK')
                .success(function(data) {
                    deferred.resolve(data);
                })
                .error(function(data) {
                    deferred.reject(data);
                });

            return deferred.promise;
        };

        this.get_channelpost = function(page) {
            var deferred = $q.defer(),
                user = AuthService.getUser();

            $http.jsonp(WORDPRESS_API_URL + 'user/get_channelpost/' +
                    '?page=' + page +
                    '&cookie=' + user.cookie +
                    '&insecure=cool' +
                    '&callback=JSON_CALLBACK')
                .success(function(data) {
                    deferred.resolve(data);
                })
                .error(function(data) {
                    deferred.reject(data);
                });

            return deferred.promise;
        };
    })

    .service('WpPageService', function($http, $q, WORDPRESS_API_URL) {

        this.getpage = function(page_slug) {

            var deferred = $q.defer();
            $http.jsonp(WORDPRESS_API_URL + 'get_page/' + '?id=' + page_slug + '&insecure=cool' + '&callback=JSON_CALLBACK')
                .success(function(data) {
                    deferred.resolve(data);
                })
                .error(function(data) {
                    deferred.reject(data);
                });

            return deferred.promise;
        };

    })

    // WP oredr RELATED FUNCTIONS
    .service('OrderService', function($rootScope, $http, $q, WORDPRESS_API_URL, AuthService) {


        //follow service
        this.placeorder = function(data) {
            var deferred = $q.defer(),
                user = AuthService.getUser();

            $http.jsonp(WORDPRESS_API_URL + 'user/place_order/' +
                    '?data=' + data +
                    '&cookie=' + user.cookie +
                    '&insecure=cool' +
                    '&callback=JSON_CALLBACK')
                .success(function(data) {
                    deferred.resolve(data);
                })
                .error(function(data) {
                    deferred.reject(data);
                });
            //console.log(deferred.promise);
            return deferred.promise;
        };

    })

    // WP oredr RELATED FUNCTIONS
    .service('StripePayment', function($rootScope, $http, $q, WORDPRESS_API_URL, AuthService) {

        //follow service
        this.stripepayment = function(data) {
            var deferred = $q.defer(),
                user = AuthService.getUser();

            $http.jsonp(WORDPRESS_API_URL + 'user/stripepayment/' +
                    '?data=' + data +
                    '&cookie=' + user.cookie +
                    '&insecure=cool' +
                    '&callback=JSON_CALLBACK')
                .success(function(data) {
                    deferred.resolve(data);
                })
                .error(function(data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        };

    })

    // WP oredr RELATED FUNCTIONS
    .service('EasyShipping', function($rootScope, $http, $q, WORDPRESS_API_URL, AuthService) {

        //follow service
        this.easyshipping = function(data) {
            var deferred = $q.defer(),
                user = AuthService.getUser();

            $http.jsonp(WORDPRESS_API_URL + 'user/easyshipping/' +
                    '?data=' + data +
                    '&cookie=' + user.cookie +
                    '&insecure=cool' +
                    '&callback=JSON_CALLBACK')
                .success(function(data) {
                    deferred.resolve(data);
                })
                .error(function(data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        };

    })

    .service('DollarRate', function($rootScope, $http, $q, WORDPRESS_API_URL, AuthService) {

        //follow service
        this.dollarrate = function(data) {
            var deferred = $q.defer();

            $http.jsonp('http://free.currencyconverterapi.com/api/v7/convert?q=SGD_USD&compact=y'+'&insecure=cool&callback=JSON_CALLBACK')
                .success(function(data) {
                    deferred.resolve(data);
                })
                .error(function(data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        };

    })




    //chnage adrs
    // WP oredr RELATED FUNCTIONS
    .service('AccountService', function($rootScope, $http, $q, WORDPRESS_API_URL, AuthService) {

        this.saveadrs = function(data) {
            var deferred = $q.defer(),
                user = AuthService.getUser();
            $http.jsonp(WORDPRESS_API_URL + 'user/set_adrs/' +
                    '?data=' + data +
                    '&cookie=' + user.cookie +
                    '&insecure=cool' +
                    '&callback=JSON_CALLBACK')
                .success(function(data) {
                    deferred.resolve(data);
                })
                .error(function(data) {
                    deferred.reject(data);
                });

            return deferred.promise;
        };

    })  

    .service('GetShippingMethod', function($rootScope, $http, $q, WORDPRESS_API_URL, AuthService) {

        this.shippingmethod = function(data) {
            var deferred = $q.defer(),
            user = AuthService.getUser();
            $http.jsonp(WORDPRESS_API_URL + 'user/shippingmethod/' +
                    '?data=' + data +
                    '&cookie=' + user.cookie +
                    '&insecure=cool' +
                    '&callback=JSON_CALLBACK')
                .success(function(data) {
                    deferred.resolve(data);
                })
                .error(function(data) {
                    deferred.reject(data);
                });

            return deferred.promise;
        };

    }) 

    // SEARCH MENU RELATED FUNCTIONS
    .service('SearchService', function($rootScope, $http, $q, WORDPRESS_API_URL) {

        this.search = function(query) {

            var search_results = [],
                search_results_response = $q.defer(),
                promises = [
                    this.searchPosts(query),
                    this.searchTags(query),
                    this.searchAuthors(query)
                ];

            $q.all(promises).then(function(promises_values) {
                _.map(promises_values, function(promise_value) {
                    search_results.push({
                        _id: promise_value.id,
                        results: _.map(promise_value.posts, function(post) {
                            return {
                                title: post.title,
                                id: post.id,
                                date: post.date,
                                excerpt: post.excerpt
                            };
                        })
                    });
                });
                search_results_response.resolve(search_results);
            });

            return search_results_response.promise;
        };

        this.searchPosts = function(query) {
            var deferred = $q.defer();

            $http.jsonp(WORDPRESS_API_URL + 'get_search_results/' +
                    '?search=' + query +
                    '&insecure=cool' +
                    '&callback=JSON_CALLBACK')
                .success(function(data) {
                    var promise_value = {
                        id: "posts",
                        posts: data.posts
                    };
                    deferred.resolve(promise_value);
                })
                .error(function(data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        };

        this.searchTags = function(query) {
            var tags_deferred = $q.defer(),
                results_deferred = $q.defer();

            //get all tags and filter the ones with the query in the title
            $http.jsonp(WORDPRESS_API_URL + 'get_tag_index/' +
                    '?callback=JSON_CALLBACK')
                .success(function(data) {
                    var tags = _.filter(data.tags, function(tag) {
                        return ((tag.title.indexOf(query) > -1));
                        // || (tag.description.indexOf(query) > -1));
                    });
                    tags_deferred.resolve(tags);
                })
                .error(function(data) {
                    tags_deferred.reject(data);
                });

            tags_deferred.promise.then(function(tags) {
                //for each of the tags matching the query, bring the related posts
                var tag_promises = _.map(tags, function(tag) {
                    return $http.jsonp(WORDPRESS_API_URL + 'get_tag_posts/' +
                        '?id=' + tag.id +
                        '&callback=JSON_CALLBACK');
                });

                //prepare the response
                $q.all(tag_promises).then(function(results) {
                    var posts = [];
                    _.map(results, function(result) {
                        _.each(result.data.posts, function(post) {
                            posts.push(post);
                        });
                    });
                    var promise_value = {
                        id: "tags",
                        posts: posts
                    };
                    results_deferred.resolve(promise_value);
                });
            });

            return results_deferred.promise;
        };

        this.searchAuthors = function(query) {
            var authors_deferred = $q.defer(),
                results_deferred = $q.defer();

            //get all the authors and filter the ones with the query
            $http.jsonp(WORDPRESS_API_URL + 'get_author_index/' +
                    '?callback=JSON_CALLBACK')
                .success(function(data) {
                    var authors = _.filter(data.authors, function(author) {
                        return ((author.name.indexOf(query) > -1) || (author.nickname.indexOf(query) > -1) || (author.first_name.indexOf(query) > -1));
                    });
                    authors_deferred.resolve(authors);
                })
                .error(function(data) {
                    authors_deferred.reject(data);
                });

            authors_deferred.promise.then(function(authors) {
                //for each of the tags matching the query, bring the related posts
                var author_promises = _.map(authors, function(author) {
                    return $http.jsonp(WORDPRESS_API_URL + 'get_author_posts/' +
                        '?id=' + author.id +
                        '&callback=JSON_CALLBACK');
                });

                //prepare the response
                $q.all(author_promises).then(function(results) {
                    var posts = [];
                    _.map(results, function(result) {
                        _.each(result.data.posts, function(post) {
                            posts.push(post);
                        });
                    });

                    var promise_value = {
                        id: "authors",
                        posts: posts
                    };
                    results_deferred.resolve(promise_value);
                });
            });

            return results_deferred.promise;
        };
    })

    // WP AUTHENTICATION RELATED FUNCTIONS
    .service('AuthService', function($rootScope, $http, $q, WORDPRESS_API_URL, $localStorage) {

        this.validateAuth = function(user) {
            var deferred = $q.defer();
            $http.jsonp(WORDPRESS_API_URL +
                    'user/validate_auth_cookie/' +
                    '?cookie=' + user.cookie +
                    '&insecure=cool' +
                    '&callback=JSON_CALLBACK')
                .success(function(data) {
                    deferred.resolve(data);
                })
                .error(function(data) {
                    deferred.reject(data);
                });

            //console.log(WORDPRESS_API_URL);
            return deferred.promise;
        };

        this.doLogin = function(user) {
            var deferred = $q.defer(),
                nonce_dfd = $q.defer(),
                authService = this;

            authService.requestNonce("user", "generate_auth_cookie")
                .then(function(nonce) {
                    console.log("retrieve nonce", nonce);
                    
                    nonce_dfd.resolve(nonce);
                });
            WORDPRESS_API_URL

            nonce_dfd.promise.then(function(nonce) {
                //now that we have the nonce, ask for the new cookie
                authService.generateAuthCookie(user.userName, user.password, nonce)
                    .then(function(data) {
                        console.log("retrieve login response", data);
                        if (data.status == "error") {
                            // return error message
                            //alert("test");
                            deferred.reject(data.error);
                        } else {
                            //recieve and store the user's cookie in the local storage
                            var user = {
                                lang: data.lang,
                                meta: data.meta,
                                cookie: data.cookie,
                                data: data.user,
                                user_id: data.user.id
                            };
                            authService.saveUser(user);
                            deferred.resolve(user);
                        }
                    });
            });
            return deferred.promise;
        };

        this.doLoginafterreg = function(user) {
            var deferred = $q.defer(),
                nonce_dfd = $q.defer(),
                authService = this;

            authService.requestNonce("user", "generate_auth_cookie")
                .then(function(nonce) {
                    nonce_dfd.resolve(nonce);
                });            

            nonce_dfd.promise.then(function(nonce) {
                //now that we have the nonce, ask for the new cookie
                authService.generateAuthCookie(user.email, user.password, nonce)
                    .then(function(data) {
                        if (data.status == "error") {
                            deferred.reject(data.error);
                        } else {
                            var user = {
                                lang: data.lang,
                                meta: data.meta,
                                cookie: data.cookie,
                                data: data.user,
                                user_id: data.user.id
                            };
                            //console.log(data);
                            authService.saveUser(user);
                            deferred.resolve(user);
                        }
                    });
            });
            return deferred.promise;
        };

        this.doRegister = function(user) {
            var deferred = $q.defer(),
                nonce_dfd = $q.defer(),
                authService = this;

            authService.requestNonce("user", "register")
                .then(function(nonce) {
                    nonce_dfd.resolve(nonce);
                });

            nonce_dfd.promise.then(function(nonce) {
                authService.registerUser(user.userName, user.email,
                        user.displayName, user.password, nonce, user.address, user.first_name, user.last_name, user.country, user.avatar, user.gender, user.bday, user.phone, user.refer)
                    .then(function(data) {
                        if (data.status == "error") {
                            deferred.reject(data.error);
                        } else {
                            authService.doLoginafterreg(user).then(function() {
                                deferred.resolve(user);
                            });
                        }
                    });
            });

            return deferred.promise;
        };

        this.requestNonce = function(controller, method) {
            var deferred = $q.defer();

            $http.jsonp(WORDPRESS_API_URL + 'get_nonce/' +
                    '?controller=' + controller +
                    '&method=' + method +
                    '&insecure=cool' +
                    '&callback=JSON_CALLBACK')
                .success(function(data) {
                    console.log("got nonce==>", data);
                    
                    deferred.resolve(data.nonce);
                })
                .error(function(data, err) {
                    if (data && data.nonce) {
                        deferred.reject(data.nonce);
                    } else {
                        deferred.reject(err);
                    }

                });
            return deferred.promise;
        };

        this.doForgotPassword = function(username) {
            var deferred = $q.defer();
            $http.jsonp(WORDPRESS_API_URL + 'user/retrieve_password/' +
                    '?user_login=' + username +
                    '&insecure=cool' +
                    '&callback=JSON_CALLBACK')
                .success(function(data) {
                    deferred.resolve(data);
                })
                .error(function(data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        };

        this.generateAuthCookie = function(username, password, nonce) {
            var deferred = $q.defer();
            $http.jsonp(WORDPRESS_API_URL + 'user/generate_auth_cookie/' +
                    '?username=' + username +
                    '&password=' + password +
                    '&insecure=cool' +
                    '&nonce=' + nonce +
                    '&callback=JSON_CALLBACK')
                .success(function(data) {
                    //console.log(data);
                    deferred.resolve(data);
                })
                .error(function(data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        };

        this.saveUser = function(user) {
            window.localStorage.ionWordpress_user = JSON.stringify(user);
            window.localStorage.lang = user.lang;
            $localStorage.userData = user;
            $localStorage.userLogin = {};
            $localStorage.userLogin.isLogin = true;
            $localStorage.userLogin.id = user.data.id;
            $localStorage.userLogin.phone = user.data.phone;
            $localStorage.userLogin.password = user.data.id;
            $localStorage.userLogin.areacode = user.data.id;
        };

        this.getUser = function() {

            var data = (window.localStorage.ionWordpress_user) ? JSON.parse(window.localStorage.ionWordpress_user).data : null,
                cookie = (window.localStorage.ionWordpress_user) ? JSON.parse(window.localStorage.ionWordpress_user).cookie : null;

            return {
                avatar: JSON.parse(window.localStorage.ionWordpress_user_avatar || null),
                data: data,
                cookie: cookie
            };
        };

        this.checkUser = function(email) {
            var deferred = $q.defer();
            $http.jsonp(WORDPRESS_API_URL + 'user/cs_jua_email_exists/' +
                    '?&email=' + email +
                    '&insecure=cool' +
                    '&callback=JSON_CALLBACK')
                .success(function(data) {
                    deferred.resolve(data);
                })
                .error(function(data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        };

        this.registerUser = function(username, email, displayName, password, nonce, address, first_name, last_name, country, avatar, gender, bday, phone, refer, $localStorage) {
            var deferred = $q.defer();
            $http.jsonp(WORDPRESS_API_URL + 'user/register/' +
                    '?username=' + username +
                    '&email=' + email +
                    '&display_name=' + displayName +
                    '&user_pass=' + password +
                    '&nonce=' + nonce +
                    '&address=' + address +
                    '&first_name=' + first_name +
                    '&last_name=' + last_name +
                    '&country=' + country +
                    '&gender=' + gender +
                    '&bday=' + bday +
                    '&phone=' + phone +
                    '&refer=' + refer +
                    '&insecure=cool' +
                    '&callback=JSON_CALLBACK')
                .success(function(data) {
                    deferred.resolve(data);
                })
                .error(function(data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        };

        this.userIsLoggedIn = function() {

            //alert("ttt");
            var deferred = $q.defer();

            var user = JSON.parse(window.localStorage.ionWordpress_user || null);
            if (user !== null && user.cookie !== null) {
                this.validateAuth(user).then(function(data) {
                    deferred.resolve(data.valid);
                });
            } else {
                deferred.resolve(false);
            }
            return deferred.promise;
        };

        this.logOut = function() {
            //empty user data
            $localStorage.$reset();
            window.localStorage.clear();
            $localStorage.userData = undefined;
            $rootScope.userData = undefined;
            window.localStorage.ionWordpress_user = null;
            window.localStorage.ionWordpress_user_avatar = null;
            window.localStorage.ionWordpress_bookmarks = null;
            delete $localStorage.userLogin;

        };

        //update user avatar from WP
        this.updateUserAvatar = function() {
            var avatar_dfd = $q.defer(),
                authService = this,
                user = JSON.parse(window.localStorage.ionWordpress_user || null);

            $http.jsonp(WORDPRESS_API_URL + 'user/get_avatar/' +
                    '?user_id=' + user.user_id +
                    '&insecure=cool' +
                    '&type=full' +
                    '&callback=JSON_CALLBACK')
                .success(function(data) {

                    var avatar_aux = data.avatar.replace("http:", "");
                    var avatar = 'http:' + avatar_aux;

                    window.localStorage.ionWordpress_user_avatar = JSON.stringify(avatar);

                    avatar_dfd.resolve(avatar);
                })
                .error(function(err) {
                    avatar_dfd.reject(err);
                });

            return avatar_dfd.promise;
        };
    })

    .service('PaypalService', ['$q', '$ionicPlatform', 'Shop', '$filter', '$timeout', function ($q, $ionicPlatform, Shop, $filter, $timeout) {
      var init_defer;
      var service = {
          initPaymentUI: initPaymentUI,
          createPayment: createPayment,
          configuration: configuration,
          onPayPalMobileInit: onPayPalMobileInit,
          makePayment: makePayment
      };

      function initPaymentUI() {

          init_defer = $q.defer();
          $ionicPlatform.ready().then(function () {

              var clientIDs = {
                  "PayPalEnvironmentProduction": Shop.payPalLiveClientID,
                  "PayPalEnvironmentSandbox": Shop.payPalSandboxClientID
              };
              PayPalMobile.init(clientIDs, onPayPalMobileInit);
          });

          return init_defer.promise;

      }
      
      function createPayment(total, name, currency) {
          var payment = new PayPalPayment("" + total, currency, "" + name, "Sale");
          return payment;
      }

      function configuration() {
          // for more options see `paypal-mobile-js-helper.js`
          var config = new PayPalConfiguration({merchantName: Shop.name, merchantPrivacyPolicyURL: null, merchantUserAgreementURL: null});
          return config;
      }

      function onPayPalMobileInit() {
          $ionicPlatform.ready().then(function () {
              // must be called
              // use PayPalEnvironmentNoNetwork mode to get look and feel of the flow
              PayPalMobile.prepareToRender(Shop.payPalEnv, configuration(), function () {
                  $timeout(function () {
                      init_defer.resolve();
                  });

              });
          });
      }

      function makePayment(total, name, currency) {
          var defer = $q.defer();
          total = $filter('number')(total, 2);
          $ionicPlatform.ready().then(function () {
              PayPalMobile.renderSinglePaymentUI(createPayment(total, name, currency), function (result) {
                  $timeout(function () {
                      defer.resolve(result);
                  });
              }, function (error) {
                  $timeout(function () {
                      defer.reject(error);
                  });
              });
          });

          return defer.promise;
      }

      return service;
  }])


    .factory('myFactory', function($http, $q) {
        var service = {};
        var baseUrl = 'https://itunes.apple.com/search?term='
        var _artist = '';
        var _finalUrl = '';

        var makeUrl = function() {
            _artist = _artist.split(' ').join('+');
            _finalUrl = baseUrl + _artist + '&callback=JSON_CALLBACK';
            return _finalUrl;
        }

        service.setArtist = function(artist) {
            _artist = artist;
        }

        service.getArtist = function() {
            return _artist;
        }

        service.callItunes = function() {
            makeUrl()
            var deferred = $q.defer();
            $http({
                method: 'JSONP',
                url: _finalUrl
            }).success(function(data) {
                deferred.resolve(data);
            }).error(function() {
                deferred.reject('There was an error');
            })

            return deferred.promise;
        }

        return service;
    });