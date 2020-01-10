var appServices = angular.module('App.factories', []);

appServices.factory('Chats', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var chats = [{
    id: 0,
    name: 'Ben Sparrow',
    lastText: 'You on your way? So much busy? Come one baby!',
    face: 'img/ben.png'
  }, {
    id: 1,
    name: 'Max Lynx',
    lastText: 'Hey, it\'s me',
    face: 'img/max.png'
  }, {
    id: 2,
    name: 'Adam Bradleyson',
    lastText: 'I should buy a boat',
    face: 'img/adam.jpg'
  }, {
    id: 3,
    name: 'Perry Governor',
    lastText: 'Look at my mukluks!',
    face: 'img/perry.png'
  }, {
    id: 5,
    name: 'Mike Harrington',
    lastText: 'This is wicked good ice cream.',
    face: 'img/mike.png'
  }];

  return {
    all: function() {
      return chats;
    },
    remove: function(chat) {
      chats.splice(chats.indexOf(chat), 1);
    },
    get: function(chatId) {
      for (var i = 0; i < chats.length; i++) {
        if (chats[i].id === parseInt(chatId)) {
          return chats[i];
        }
      }
      return null;
    }
  };
});

appServices.factory('WpPage', function($http,$q,WORDPRESS_API_URL) {
  var sdo = {
    getpage: function(page_slug) {
    var deferred = $q.defer();
    $http.jsonp(WORDPRESS_API_URL + 'get_page/' +
    '?id='+ page_slug +
    '&insecure=cool' +
    '&callback=JSON_CALLBACK')
    .success(function(data) {
      deferred.resolve(data);
    })
    .error(function(data) {
      deferred.reject(data);
    });
    return deferred.promise;
    }

  }
  return sdo;
});

appServices.factory('Broadcast', function($http,$q,WORDPRESS_API_URL) {
  var sdo = {
    getList: function(country) {
    var user = JSON.parse(window.localStorage.ionWordpress_user || null);
    var postsApi = WORDPRESS_API_URL +'user/get_list/' +'?cookie='+ user.cookie +'&country='+country+'&insecure=cool' +'&callback=JSON_CALLBACK';
      var promise =$http.jsonp(postsApi);
         promise.success(function(data, status, headers, conf) {
        return data;
      });
      return promise;
    }
  }
  return sdo;
});


appServices.factory('Channelslib', function($http,$q,WORDPRESS_API_URL,$stateParams,$timeout) {

  function getChannels() {
      var user = JSON.parse(window.localStorage.ionWordpress_user || null);
      var postsApi = WORDPRESS_API_URL +'user/getChannels/' +'?cookie='+ user.cookie +'&insecure=cool' +'&callback=JSON_CALLBACK';
      var promise =$http.jsonp(postsApi);
      promise.success(function(data, status, headers, conf) {
        //console.log(data);
        return data;
      });

      promise.error(function(data) {
        deferred.reject(data);
        //console.log(data);
        $ionicLoading.hide();
        state.go('App.home');
      });
    return promise;
  };

  function getPrdoducts() {
      var user = JSON.parse(window.localStorage.ionWordpress_user || null);
      var postsApi = WORDPRESS_API_URL +'user/getProducts/' +'?cookie='+ user.cookie +'&insecure=cool' +'&callback=JSON_CALLBACK';
       //alert(postsApi);
      var promise =$http.jsonp(postsApi);
         promise.success(function(data, status, headers, conf) {
        return data;
      });
      promise.error(function(data) {
        deferred.reject(data);
        $ionicLoading.hide();
        state.go('App.home');
      });

      return promise;
  };


  function getsingleChannel(postId) {
          var deferred = $q.defer();
          var user = JSON.parse(window.localStorage.ionWordpress_user || null);

          $http.jsonp(WORDPRESS_API_URL + 'user/getsingleChannel/' +
            '?post_id='+ postId +
            '&cookie='+ user.cookie +
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
  function getchannelpost(postId,catId) {
          var deferred = $q.defer();
          var user = JSON.parse(window.localStorage.ionWordpress_user || null);

          $http.jsonp(WORDPRESS_API_URL + 'user/getchannelpost/' +
            '?post_id='+ postId +
            '&cat_id='+ catId +
            '&cookie='+ user.cookie +
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

  function getnotification() {
          var deferred = $q.defer();
          var user = JSON.parse(window.localStorage.ionWordpress_user || null);

          $http.jsonp(WORDPRESS_API_URL + 'user/get_notification/' +
            '?cookie='+ user.cookie +
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


  function checknotification() {
          var deferred = $q.defer();
          var user = JSON.parse(window.localStorage.ionWordpress_user || null);

          $http.jsonp(WORDPRESS_API_URL + 'user/trace_notification/' +
            '?cookie='+ user.cookie +
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

  return {
    getPrdoducts:getPrdoducts,
    checknotification: checknotification,
    getnotification: getnotification,
    getChannels: getChannels,
    getsingleChannel:getsingleChannel,
    getchannelpost:getchannelpost,
  }

});

appServices.factory('Affiliate', function($http,$q,WORDPRESS_API_URL,$injector,$state) {

  function affiliate(subtab,start,end,status,page) {
      var user = JSON.parse(window.localStorage.ionWordpress_user || null);
      var postsApi = WORDPRESS_API_URL +'user/affiliate/' +
                     '?cookie='+ user.cookie +
                     '&u_sts='+status+
                     '&udf='+start+
                     '&udu='+end+
                     '&cas_list_item='+page+
                     '&insecure=cool&cas_aff_subtab='+subtab+
                     '&callback=JSON_CALLBACK';

      var promise = $http.jsonp(postsApi);
         promise.success(function(data, status, headers, conf) {
        return data;
      });
      return promise;
  };

  function affiliate_link(subtab,start,end,status,page) {
      var user = JSON.parse(window.localStorage.ionWordpress_user || null);
      var postsApi = WORDPRESS_API_URL +'user/affiliate_link/' +
                     '?cookie='+ user.cookie +
                     '&u_sts='+status+
                     '&udf='+start+
                     '&udu='+end+
                     '&cas_list_item='+page+
                     '&insecure=cool&cas_aff_subtab='+subtab+
                     '&callback=JSON_CALLBACK';

      var promise = $http.jsonp(postsApi);
         promise.success(function(data, status, headers, conf) {
        return data;
      });
      return promise;
  };   


  function referrals(subtab,start,end,status,page) {
      var user = JSON.parse(window.localStorage.ionWordpress_user || null);
      var postsApi = WORDPRESS_API_URL +'user/referrals/' +
                     '?cookie='+ user.cookie +
                     '&u_sts='+status+
                     '&udf='+start+
                     '&udu='+end+
                     '&cas_list_item='+page+
                     '&insecure=cool&cas_aff_subtab='+subtab+
                     '&callback=JSON_CALLBACK';

      var promise = $http.jsonp(postsApi);
        //console.log(promise);
        promise.success(function(data, status, headers, conf) {
        return data;
      });
      return promise;
  }; 

  function reports(subtab,start,end,status,page) {
      var user = JSON.parse(window.localStorage.ionWordpress_user || null);
      var postsApi = WORDPRESS_API_URL +'user/reports/' +
                     '?cookie='+ user.cookie +
                     '&u_sts='+status+
                     '&udf='+start+
                     '&udu='+end+
                     '&cas_list_item='+page+
                     '&insecure=cool&cas_aff_subtab='+subtab+
                     '&callback=JSON_CALLBACK';

      var promise = $http.jsonp(postsApi);
         promise.success(function(data, status, headers, conf) {
        return data;
      });
      return promise;
  };    

  function visits(subtab,start,end,status,page) {
      var user = JSON.parse(window.localStorage.ionWordpress_user || null);
      var postsApi = WORDPRESS_API_URL +'user/visits/' +
                     '?cookie='+ user.cookie +
                     '&u_sts='+status+
                     '&udf='+start+
                     '&udu='+end+
                     '&cas_list_item='+page+
                     '&insecure=cool&cas_aff_subtab='+subtab+
                     '&callback=JSON_CALLBACK';

      var promise = $http.jsonp(postsApi);
         promise.success(function(data, status, headers, conf) {
        return data;
      });
      return promise;
  }; 

  function campaign_reports(subtab,start,end,status,page) {
      var user = JSON.parse(window.localStorage.ionWordpress_user || null);
      var postsApi = WORDPRESS_API_URL +'user/campaign_reports/' +
                     '?cookie='+ user.cookie +
                     '&u_sts='+status+
                     '&udf='+start+
                     '&udu='+end+
                     '&cas_list_item='+page+
                     '&insecure=cool&cas_aff_subtab='+subtab+
                     '&callback=JSON_CALLBACK';

      var promise = $http.jsonp(postsApi);
         promise.success(function(data, status, headers, conf) {
        return data;
      });
      return promise;
  };       

  function edit_account(subtab,start,end,status,page) {
      var user = JSON.parse(window.localStorage.ionWordpress_user || null);
      var postsApi = WORDPRESS_API_URL +'user/edit_account/' +
                     '?cookie='+ user.cookie +
                     '&u_sts='+status+
                     '&udf='+start+
                     '&udu='+end+
                     '&cas_list_item='+page+
                     '&insecure=cool&cas_aff_subtab='+subtab+
                     '&callback=JSON_CALLBACK';

      var promise = $http.jsonp(postsApi);
         promise.success(function(data, status, headers, conf) {
        return data;
      });
      return promise;
  }; 


  function payments_settings(subtab,start,end,status,page) {
      var user = JSON.parse(window.localStorage.ionWordpress_user || null);
      var postsApi = WORDPRESS_API_URL +'user/payments_settings/' +
                     '?cookie='+ user.cookie +
                     '&u_sts='+status+
                     '&udf='+start+
                     '&udu='+end+
                     '&cas_list_item='+page+
                     '&insecure=cool&cas_aff_subtab='+subtab+
                     '&callback=JSON_CALLBACK';

      var promise = $http.jsonp(postsApi);
         promise.success(function(data, status, headers, conf) {
          console.log(data);
        return data;
      });
      return promise;
  };

  function affiliate_withdraw(subtab,start,end,status,page) {
      var user = JSON.parse(window.localStorage.ionWordpress_user || null);
      var postsApi = WORDPRESS_API_URL +'user/affiliate_withdraw/' +
                     '?cookie='+ user.cookie +
                     '&u_sts='+status+
                     '&udf='+start+
                     '&udu='+end+
                     '&cas_list_item='+page+
                     '&insecure=cool&cas_aff_subtab='+subtab+
                     '&callback=JSON_CALLBACK';

      var promise = $http.jsonp(postsApi);
         promise.success(function(data, status, headers, conf) {
        return data;
      });
      return promise;
  }; 


  function add_withdraw(subtab, withdraw_amount) {
      var user = JSON.parse(window.localStorage.ionWordpress_user || null);
      var postsApi = WORDPRESS_API_URL +'user/add_withdraw/' +
                     '?cookie='+ user.cookie +
                     '&withdraw_amount='+withdraw_amount+
                     '&insecure=cool&cas_aff_subtab='+subtab+
                     '&callback=JSON_CALLBACK';       
        var promise = $http.jsonp(postsApi);
        promise.success(function(data, status, headers, conf) {
        return data;
      });
      return promise;
  }; 

  function wallet(subtab,start,end,status,page) {
      var user = JSON.parse(window.localStorage.ionWordpress_user || null);
      var postsApi = WORDPRESS_API_URL +'user/affiliate_wallet/' +
                     '?cookie='+ user.cookie +
                     '&u_sts='+status+
                     '&udf='+start+
                     '&udu='+end+
                     '&cas_list_item='+page+
                     '&insecure=cool&cas_aff_subtab='+subtab+
                     '&callback=JSON_CALLBACK';

      var promise = $http.jsonp(postsApi);
         promise.success(function(data, status, headers, conf) {
        return data;
      });
      return promise;
  };     

  function addwallet(amount) {
      var user = JSON.parse(window.localStorage.ionWordpress_user || null);
      var postsApi = WORDPRESS_API_URL +'user/addwallet/' +
                     '?cookie='+ user.cookie +
                     '&amount='+amount+
                     '&insecure=cool'+
                     '&callback=JSON_CALLBACK';

      var promise = $http.jsonp(postsApi);
         promise.success(function(data, status, headers, conf) {
        return data;
      });
      return promise;
  };     


  function referrals_history(subtab,start,end,status,page) {
      var user = JSON.parse(window.localStorage.ionWordpress_user || null);
      var postsApi = WORDPRESS_API_URL +'user/referrals_history/' +
                     '?cookie='+ user.cookie +
                     '&u_sts='+status+
                     '&udf='+start+
                     '&udu='+end+
                     '&cas_list_item='+page+
                     '&insecure=cool&cas_aff_subtab='+subtab+
                     '&callback=JSON_CALLBACK';

        var promise = $http.jsonp(postsApi);
        console.log(promise);
        promise.success(function(data, status, headers, conf) {
        return data;
      });
      return promise;
  };

  function mlm(subtab,start,end,status,page) {
      var user = JSON.parse(window.localStorage.ionWordpress_user || null);
      var postsApi = WORDPRESS_API_URL +'user/mlm/' +
                     '?cookie='+ user.cookie +
                     '&u_sts='+status+
                     '&udf='+start+
                     '&udu='+end+
                     '&cas_list_item='+page+
                     '&insecure=cool&cas_aff_subtab='+subtab+
                     '&callback=JSON_CALLBACK';

      var promise = $http.jsonp(postsApi);
         promise.success(function(data, status, headers, conf) {
        return data;
      });
      return promise;
  };


  function campaigns(subtab,start,end,status,page) {
      var user = JSON.parse(window.localStorage.ionWordpress_user || null);
      var postsApi = WORDPRESS_API_URL +'user/campaigns/' +
                     '?cookie='+ user.cookie +
                     '&u_sts='+status+
                     '&udf='+start+
                     '&udu='+end+
                     '&cas_list_item='+page+
                     '&insecure=cool&cas_aff_subtab='+subtab+
                     '&callback=JSON_CALLBACK';

      var promise = $http.jsonp(postsApi);
         promise.success(function(data, status, headers, conf) {
        return data;
      });
      return promise;
  };  

  function affiliatecampremove(subtab,id) {
      var user = JSON.parse(window.localStorage.ionWordpress_user || null);
      var postsApi = WORDPRESS_API_URL +'user/affiliate/' +
                     '?cookie='+ user.cookie +
                     '&cas_delete_campaign='+id+
                     '&insecure=cool&cas_aff_subtab='+subtab+
                     '&callback=JSON_CALLBACK';
       //alert(postsApi);
      var promise =$http.jsonp(postsApi);
         promise.success(function(data, status, headers, conf) {
        return data;
      });
      return promise;
  };
  function affiliatecampadd(subtab,id) {
      var user = JSON.parse(window.localStorage.ionWordpress_user || null);
      var postsApi = WORDPRESS_API_URL +'user/affiliate/' +
                     '?cookie='+ user.cookie +
                     '&campaign_name='+id+
                     '&insecure=cool&cas_aff_subtab='+subtab+
                     '&callback=JSON_CALLBACK';
       //alert(postsApi);
      var promise =$http.jsonp(postsApi);
         promise.success(function(data, status, headers, conf) {
        return data;
      });
      return promise;
  };

    function affiliateslugadd(subtab,id) {
      var user = JSON.parse(window.localStorage.ionWordpress_user || null);
      var postsApi = WORDPRESS_API_URL +'user/affiliate/' +
                     '?cookie='+ user.cookie +
                     '&cas_affiliate_custom_slug='+id+
                     '&insecure=cool&cas_aff_subtab='+subtab+
                     '&callback=JSON_CALLBACK';
       //alert(postsApi);
      var promise =$http.jsonp(postsApi);
         promise.success(function(data, status, headers, conf) {
        return data;
      });
      return promise;
  };

  function banners(subtab,start,end,status,page) {
      var user = JSON.parse(window.localStorage.ionWordpress_user || null);
      var postsApi = WORDPRESS_API_URL +'user/banners/' +
                     '?cookie='+ user.cookie +
                     '&u_sts='+status+
                     '&udf='+start+
                     '&udu='+end+
                     '&cas_list_item='+page+
                     '&insecure=cool&cas_aff_subtab='+subtab+
                     '&callback=JSON_CALLBACK';

      var promise = $http.jsonp(postsApi);
         promise.success(function(data, status, headers, conf) {
        return data;
      });
      return promise;
  };  


  function payments(subtab,start,end,status,page) {
      var user = JSON.parse(window.localStorage.ionWordpress_user || null);
      var postsApi = WORDPRESS_API_URL +'user/payments/' +
                     '?cookie='+ user.cookie +
                     '&u_sts='+status+
                     '&udf='+start+
                     '&udu='+end+
                     '&cas_list_item='+page+
                     '&insecure=cool&cas_aff_subtab='+subtab+
                     '&callback=JSON_CALLBACK';

        var promise = $http.jsonp(postsApi);
        console.log(promise);
        promise.success(function(data, status, headers, conf) {
        return data;
      });
      return promise;
  };

  function generatelink(camp,referance,friendly,url) {
    //camp,referance,friendly,url
      var user = JSON.parse(window.localStorage.ionWordpress_user || null);
      var postsApi = WORDPRESS_API_URL +'user/affiliate_link_save/' +
                     '?cookie='+ user.cookie +
                     '&campaign='+camp+
                     '&slug='+referance+
                     '&friendly_links='+friendly+
                     '&url='+url+
                     '&save_settings=save&insecure=cool&callback=JSON_CALLBACK';
      var promise =$http.jsonp(postsApi);
         //console.log(postsApi);
         promise.success(function(data, status, headers, conf) {
        return data;
      });
      return promise;
  };


  function affiliatepaymentadd(subtab,type,paypal,accnumber,bank,bankaddress,bankswift,alipay,wechat_pay) {
      var user = JSON.parse(window.localStorage.ionWordpress_user || null);
      var postsApi = WORDPRESS_API_URL +'user/payments_settings/' +
                     '?cookie='+ user.cookie +
                     '&cas_affiliate_payment_type='+type+
                     '&cas_affiliate_paypal_email='+paypal+
                     '&cas_affiliate_bank_transfer_ac='+accnumber+
                     '&cas_affiliate_bank_transfer_bank_name='+bank+
                     '&cas_affiliate_bank_transfer_bank_address='+bankaddress+
                     '&cas_affiliate_bank_transfer_bank_swift='+bankswift+
                     '&cas_affiliate_alipay='+alipay+
                     '&cas_affiliate_wechat_pay='+wechat_pay+
                     '&save_settings=save&insecure=cool&cas_aff_subtab='+subtab+          
                     '&callback=JSON_CALLBACK';
       //console.log(postsApi);
      var promise =$http.jsonp(postsApi);
         promise.success(function(data, status, headers, conf) {
        return data;
      });
      return promise;
  };

  function affiliate(subtab,start,end,status,page) {
      var user = JSON.parse(window.localStorage.ionWordpress_user || null);
      var postsApi = WORDPRESS_API_URL +'user/affiliate/' +
                     '?cookie='+ user.cookie +
                     '&u_sts='+status+
                     '&udf='+start+
                     '&udu='+end+
                     '&cas_list_item='+page+
                     '&insecure=cool&cas_aff_subtab='+subtab+
                     '&callback=JSON_CALLBACK';

      var promise = $http.jsonp(postsApi);
         promise.success(function(data, status, headers, conf) {
        return data;
      });
      return promise;
  };

  function custom_affiliate_slug(subtab,start,end,status,page) {
      var user = JSON.parse(window.localStorage.ionWordpress_user || null);
      var postsApi = WORDPRESS_API_URL +'user/custom_affiliate_slug/' +
                     '?cookie='+ user.cookie +
                     '&u_sts='+status+
                     '&udf='+start+
                     '&udu='+end+
                     '&cas_list_item='+page+
                     '&insecure=cool&cas_aff_subtab='+subtab+
                     '&callback=JSON_CALLBACK';

      var promise = $http.jsonp(postsApi);
         promise.success(function(data, status, headers, conf) {
        return data;
      });
      return promise;
  };  

   
  return {
    campaigns:campaigns,
    banners:banners,
    affiliate_link:affiliate_link,
    generatelink:generatelink,
    affiliatepaymentadd:affiliatepaymentadd,
    affiliateslugadd:affiliateslugadd,
    affiliate:affiliate,
    edit_account:edit_account,
    payments:payments,
    payments_settings:payments_settings,
    affiliate_withdraw:affiliate_withdraw,
    wallet:wallet,
    addwallet:addwallet,
    referrals:referrals,
    reports:reports,
    visits:visits,
    referrals_history:referrals_history,
    campaign_reports:campaign_reports,
    mlm:mlm,
    affiliatecampadd:affiliatecampadd,
    affiliatecampremove:affiliatecampremove,
    add_withdraw:add_withdraw,
  }

});

appServices.factory('Game', function($http,$q,WORDPRESS_API_URL,$injector,$state) {

  function get_score() {
      var user = JSON.parse(window.localStorage.ionWordpress_user || null);
      var postsApi = WORDPRESS_API_URL +'user/get_score/'+'?cookie='+ user.cookie +'&insecure=cool&callback=JSON_CALLBACK';
      var promise =$http.jsonp(postsApi);
        promise.success(function(data, status, headers, conf) {
        return data;
      });
      return promise;
    };
    return {
      get_score:get_score,
    }
});

//wall
appServices.factory('Wall', function($http,$q,WORDPRESS_API_URL) {

    function home() {
      var user     = JSON.parse(window.localStorage.ionWordpress_user || null);
      var postsApi = WORDPRESS_API_URL +'user/get_home/' +'?cookie='+ user.cookie +'&insecure=cool' +'&callback=JSON_CALLBACK';
      var promise  = $http.jsonp(postsApi);
        promise.success(function(data, status, headers, conf) {
          return data;
        });
        return promise;
    };

    function get_activity_comment() {
      var user = JSON.parse(window.localStorage.ionWordpress_user || null);
      var postsApi = WORDPRESS_API_URL +'user/get_activity_comment/' +'?cookie='+ user.cookie +'&insecure=cool' +'&callback=JSON_CALLBACK';
      var promise =$http.jsonp(postsApi);
         promise.success(function(data, status, headers, conf) {
        return data;
      });
      return promise;
    };


    function get_activity() {
      var user = JSON.parse(window.localStorage.ionWordpress_user || null);
      var postsApi = WORDPRESS_API_URL +'user/get_activity/' +'?cookie='+ user.cookie +'&insecure=cool' +'&callback=JSON_CALLBACK';
       //alert(postsApi);
      var promise =$http.jsonp(postsApi);
         promise.success(function(data, status, headers, conf) {
        return data;
      });
      return promise;
    };


    function get_user() {
      var user = JSON.parse(window.localStorage.ionWordpress_user || null);
      var postsApi = WORDPRESS_API_URL +'user/get_user/' +'?cookie='+ user.cookie +'&insecure=cool' +'&callback=JSON_CALLBACK';
       //alert(postsApi);
      var promise =$http.jsonp(postsApi);
         promise.success(function(data, status, headers, conf) {
        return data;
      });
      return promise;
       };

      function get_likers(postId) {
          var deferred = $q.defer();
          var user = JSON.parse(window.localStorage.ionWordpress_user || null);
          $http.jsonp(WORDPRESS_API_URL + 'user/get_likers/' +
            '?post_id='+ postId +
            '&cookie='+ user.cookie +
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


    function get_single_activity(postId) {
        var deferred = $q.defer();
        var user = JSON.parse(window.localStorage.ionWordpress_user || null);

        $http.jsonp(WORDPRESS_API_URL + 'user/get_single_activity/' +
          '?post_id='+ postId +
          '&cookie='+ user.cookie +
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


    function get_single_user_activity(postId) {
        var deferred = $q.defer();
        var user = JSON.parse(window.localStorage.ionWordpress_user || null);

        $http.jsonp(WORDPRESS_API_URL + 'user/get_single_user_activity/' +
          '?post_id='+ postId +
          '&cookie='+ user.cookie +
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


    function get_product(productId) {
        var deferred = $q.defer();
        var user = JSON.parse(window.localStorage.ionWordpress_user || null);

        $http.jsonp(WORDPRESS_API_URL + 'user/get_product/' +
          '?product_id='+ productId +
          '&cookie='+ user.cookie +
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

    function get_payment_method() {

        var deferred = $q.defer();
        var user = JSON.parse(window.localStorage.ionWordpress_user || null);

        $http.jsonp(WORDPRESS_API_URL + 'user/get_payment_methods/' +
          '&cookie='+ user.cookie +
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

      return {
          home:home,
          get_single_activity:get_single_activity,
          get_user:get_user,
          get_activity:get_activity,
          get_activity_comment:get_activity_comment,
          get_likers:get_likers,
          get_single_user_activity:get_single_user_activity,
          get_product:get_product,
          get_payment_method:get_payment_method,
      }

});

appServices.factory('Account', function($http,$q,WORDPRESS_API_URL) {

  function subscription() {
      var user = JSON.parse(window.localStorage.ionWordpress_user || null);
      var postsApi = WORDPRESS_API_URL +'user/get_subscription/' +'?cookie='+ user.cookie +'&insecure=cool' +'&callback=JSON_CALLBACK';
       //alert(postsApi);
      var promise =$http.jsonp(postsApi);
         promise.success(function(data, status, headers, conf) {
          //console.log(data);
        return data;
      });
      return promise;
  };
  function order() {
      var user = JSON.parse(window.localStorage.ionWordpress_user || null);
      var postsApi = WORDPRESS_API_URL +'user/get_order/' +'?cookie='+ user.cookie +'&insecure=cool' +'&callback=JSON_CALLBACK';
       //alert(postsApi);
      var promise =$http.jsonp(postsApi);
          promise.success(function(data, status, headers, conf) {
           // console.log(data);
        return data;
      });
 
      return promise;
  };

    function profile() {
      var user = JSON.parse(window.localStorage.ionWordpress_user || null);
      var postsApi = WORDPRESS_API_URL +'user/get_profile/' +'?cookie='+ user.cookie +'&insecure=cool' +'&callback=JSON_CALLBACK';
       //alert(postsApi);
      var promise =$http.jsonp(postsApi);
         promise.success(function(data, status, headers, conf) {
          //console.log(data);
        return data;
      });
      return promise;
    };
    
    function changelname(lname) {
      var user = JSON.parse(window.localStorage.ionWordpress_user || null);
      var postsApi = WORDPRESS_API_URL +'user/changelname/' +'?cookie='+ user.cookie +'&insecure=cool' +'&name='+lname +'&callback=JSON_CALLBACK';
       //alert(postsApi);
      var promise =$http.jsonp(postsApi);
         promise.success(function(data, status, headers, conf) {
        return data;
      });
      return promise;
    };

      function changefname(fname) {
      var user = JSON.parse(window.localStorage.ionWordpress_user || null);
      var postsApi = WORDPRESS_API_URL +'user/changefname/' +'?cookie='+ user.cookie +'&insecure=cool' +'&name='+fname +'&callback=JSON_CALLBACK';
       //alert(postsApi);
      var promise =$http.jsonp(postsApi);
         promise.success(function(data, status, headers, conf) {
        return data;
      });
      return promise;
  };


  function adrs() {
      var user = JSON.parse(window.localStorage.ionWordpress_user || null);
      var postsApi = WORDPRESS_API_URL +'user/get_adrs/' +'?cookie='+ user.cookie +'&insecure=cool' +'&callback=JSON_CALLBACK';
       //alert(postsApi);
      var promise =$http.jsonp(postsApi);
         promise.success(function(data, status, headers, conf) {
        return data;
      });
      return promise;
  }; 
  return {
    changefname: changefname,
    changelname :changelname,
    order: order,
    profile :profile,
    subscription:subscription,
    adrs:adrs,
  }

});

appServices.factory('ImageService', function($cordovaCamera, FileService, $q, $cordovaFile) {
 
  function makeid() {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
 
    for (var i = 0; i < 5; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  };
 
  function optionsForType(type) {
    var source;
    switch (type) {
      case 0:
        source = Camera.PictureSourceType.CAMERA;
        break;
      case 1:
        source = Camera.PictureSourceType.PHOTOLIBRARY;
        break;
    }
    return {
      destinationType: Camera.DestinationType.FILE_URI,
      sourceType: source,
      allowEdit: false,
      encodingType: Camera.EncodingType.JPEG,
      popoverOptions: CameraPopoverOptions,
      saveToPhotoAlbum: false
    };
  }
 
  function saveMedia(type) {
    return $q(function(resolve, reject) {
      var options = optionsForType(type);
 
      $cordovaCamera.getPicture(options).then(function(imageUrl) {
        var name = imageUrl.substr(imageUrl.lastIndexOf('/') + 1);
        var namePath = imageUrl.substr(0, imageUrl.lastIndexOf('/') + 1);
        var newName = makeid() + name;
        $cordovaFile.copyFile(namePath, name, cordova.file.dataDirectory, newName)
          .then(function(info) {
            FileService.storeImage(newName);
            resolve();
          }, function(e) {
            reject();
          });
      });
    })
  }
  return {
    handleMediaDialog: saveMedia
  }
});
 
appServices.factory('FileService', function() {
  var images;
  var IMAGE_STORAGE_KEY = 'images';
 
  function getImages() {
    var img = window.localStorage.getItem(IMAGE_STORAGE_KEY);
    if (img) {
      images = JSON.parse(img);
    } else {
      images = [];
    }
    return images;
  };
 
  function addImage(img) {
    images.push(img);
    window.localStorage.setItem(IMAGE_STORAGE_KEY, JSON.stringify(images));
  };
 
  return {
    storeImage: addImage,
    images: getImages
  }
});

//learn module
appServices.factory('Learn', function($http,$q,WORDPRESS_API_URL) {

  function learncategories() {
      var user = JSON.parse(window.localStorage.ionWordpress_user || null);
      var postsApi = WORDPRESS_API_URL +'user/learncategories/' +'?cookie='+ user.cookie +'&insecure=cool' +'&callback=JSON_CALLBACK';
       //alert(postsApi);
      var promise =$http.jsonp(postsApi);
         promise.success(function(data, status, headers, conf) {
        return data;
      });
      promise.error(function(data) {
        deferred.reject(data);
        //location.reload();
         $ionicLoading.hide();
        state.go('App.home');
      });
         
    return promise;
  };
  function learnsubcategories() {
      var user = JSON.parse(window.localStorage.ionWordpress_user || null);
      var postsApi = WORDPRESS_API_URL +'user/learnsubcategories/' +'?cookie='+ user.cookie +'&insecure=cool' +'&callback=JSON_CALLBACK';
       //alert(postsApi);
      var promise =$http.jsonp(postsApi);
         promise.success(function(data, status, headers, conf) {
        return data;
      });
      return promise;
  };

  function learnsubcategories(postId) {
    var deferred = $q.defer();
    var user = JSON.parse(window.localStorage.ionWordpress_user || null);

    $http.jsonp(WORDPRESS_API_URL + 'user/learnsubcategories/' +
      '?post_id='+ postId +
      '&cookie='+ user.cookie +
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
  function learnalllesson(postId) {
    var deferred = $q.defer();
    var user = JSON.parse(window.localStorage.ionWordpress_user || null);

    $http.jsonp(WORDPRESS_API_URL + 'user/learnalllesson/' +
      '?post_id='+ postId +
      '&cookie='+ user.cookie +
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

  function learnsinglelesson(postId) {
      var deferred = $q.defer();
      var user = JSON.parse(window.localStorage.ionWordpress_user || null);

      $http.jsonp(WORDPRESS_API_URL + 'user/learnsinglelesson/' +
        '?post_id='+ postId +
        '&cookie='+ user.cookie +
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


  return {
    learncategories: learncategories,
    learnsubcategories :learnsubcategories,
    learnalllesson:learnalllesson,
    learnsinglelesson:learnsinglelesson,
  }

});

//welcome factory
appServices.factory('WelcomeFactory', function($http,$q,WORDPRESS_API_URL) {

  function getlocation() { 
        // var promise =$http.get('http://freegeoip.net/json/');
        //var promise =$http.get('https://ipinfo.io/');
        var promise =$http.get('https://ipstack.com/');
           promise.success(function(data, status, headers, conf) {
          return data;
        });
        return promise;

  };
  return {
    getlocation: getlocation,
  }

})


appServices.factory('Category', function($http,$q,WORDPRESS_API_URL) {

    var newall = function() {
        return [{
                name: "SidebarHome",
                id: 2,
                toogle: true,
                type: "Settings",
                url: "App.home",
                iconClass: 'ion-ios-home-outline',
                items: []
            },
            {
                name: "SidebarInformation",
                id: 1,
                iconClass: 'ion-ios-information-outline',
                items: [ // Required: array, even empty
                    {
                        name: "SidebarAbout",
                        id: 10,
                        type: "page",
                        url: "5449",
                        items: [] // Required: array, even empty
                    }, {
                        name: "SidebarCustomerService",
                        id: 11,
                        type: "page",
                        url: "13915",
                        items: []
                    }, {
                        name: "SidebarContact",
                        id: 12,
                        type: "Settings",
                        url: "App.email",
                        items: []
                    }, {
                        name: "SidebarShipping",
                        id: 13,
                        type: "page",
                        url: "5811",
                        items: []
                    }, {
                        name: "SidebarPrivacyPolicy",
                        id: 14,
                        type: "page",
                        url: "5810",
                        items: []
                    }, {
                        name: "SidebarDisclaimer",
                        id: 15,
                        type: "page",
                        url: "5809",
                        items: []
                    }, {
                        name: "SidebarTerms",

                        type: "page",
                        url: "5812",
                        items: []
                    }
                ]
            }, 

            {
                name: "Products",
                type: "subsub",
                iconClass: "ion-ios-nutrition-outline",
                        items: [
                            {
                                name: "Brain Health",
                                type: "subsub",
                                url: "",
                                items: [
                                    {
                                        name: "N’Hance",
                                        type: "page",
                                        url: "5793",
                                        items: []
                                    },
                                    {
                                        name: "Prep",
                                        type: "page",
                                        url: "5794",
                                        items: []
                                    },
                                    {
                                        name: "Sage",
                                        type: "page",
                                        url: "5795",
                                        items: []
                                    },

                                ]
                            },
                            {
                                name: "Meal Replacement",
                                type: "subsub",
                                url: "",
                                items: [
                                     {
                                    name: "NutriEZ Collagen",
                                    type: "page",
                                    url: "6829",
                                    items: []
                                    },

                                ]
                            }
                        ]

                    },

            {
                name: "SidebarShop",
                id: 2,
                toogle: true,
                type: "Settings",
                url: "App.shop",
                iconClass: 'ion-ios-cart-outline',
                items: []
            }, {
                name: "SidebarMyAccount",
                id: 3,
                iconClass: 'ion-ios-person-outline',
                items: [ // Required: array, even empty
                    {
                        name: "SidebarProfile",
                        id: 30,
                        type: "Settings",
                        url: "App.accountprofile",
                        items: []
                    }, {
                        name: "SidebarMyOrders",
                        id: 31,
                        type: "Settings",
                        url: "App.accountorder",
                        items: []
                    }, {
                        name: "SidebarMySubscriptions",
                        id: 32,
                        type: "Settings",
                        url: "App.accountsubscription",
                        items: [] // Required: array, even empty
                    }, {
                        name: "SidebarAddresses",
                        id: 33,
                        type: "Settings",
                        url: "App.accountadrs",
                        items: [] // Required: array, even empty
                    }
                ]
            },


            {
                name: "SidebarAffiliateDashboard",
                id: 4,
                iconClass: "ion-ios-pulse",
                items: [
                    {
                        name: "SidebarOverview",
                        type: "Settings",
                        url: "App.affiliateoverview",
                        id: 444,
                        items: [] // Required: array, even empty
                    },

                    // {
                    //     name: "SidebarProfile",
                    //     type: "Settings",
                    //     url: "App.editaccount",
                    //     items: [] // Required: array, even empty
                    // },                    

                    {
                        name: "SidebarReferrals",
                        type: "Settings",
                        url: "App.affiliatereferrals",
                        items: []
                    }, 
                    {
                        name: "SidebarPayments",
                        type: "Settings",
                        url: "App.affiliatepayments",
                        items: []
                    },
                    // {
                    //     name: "SidebarWallet",
                    //     type: "Settings",
                    //     url: "App.affiliatewallet",
                    //     items: []
                    // },
                    {
                        name: "SidebarMarketing",
                        type: "subsub",
                        items: [{
                                name: "SidebarAffiliateLink",
                                type: "Settings",
                                url: "App.affiliatelink",
                                items: []
                            },
                            {
                                name: "SidebarCampaign",
                                type: "Settings",
                                url: "App.affiliatecampaign",
                                items: []
                            },
                            {
                                name: "SidebarBanner",
                                type: "Settings",
                                url: "App.affiliatebanner",
                                items: []
                            },
                            {
                                name: "SidebarCoupons",
                                type: "Settings",
                                url: "App.affiliatecoupon",
                                items: []
                            }

                        ]
                    }, 
                    {
                        name: "SidebarReports",
                        type: "subsub",
                        items: [{
                                name: "SidebarOverAll",
                                type: "Settings",
                                url: "App.affiliateoverall",
                                items: []
                            },
                            {
                                name: "SidebarTrafficLog",
                                type: "Settings",
                                url: "App.affiliatetrafficlog",
                                items: []
                            },
                            {
                                name: "SidebarCampaignReports",
                                type: "Settings",
                                url: "App.affiliatecampaignreport",
                                items: []
                            },
                            {
                                name: "SidebarReferralHistory",
                                type: "Settings",
                                url: "App.affiliaterefferalhistory",
                                items: []
                            },
                            {
                                name: "SidebarMLM",
                                type: "Settings",
                                url: "App.affiliatemlm",
                                items: []
                            }
                        ]
                    }, {
                        name: "Settings",
                        type: "subsub",
                        items: [{
                                name: "Custom Slug",
                                type: "Settings",
                                url: "App.affiliatecustomslug",
                                items: []
                            },
                            {
                                name: "Payment Settings",
                                type: "Settings",
                                url: "App.affiliatepaymentsetting",
                                items: []
                            }
                        ]
                    }

                ] // Required: array, even empty
            },
            {
                name: "SidebarAdministration",
                id: 42069,
                iconClass: "ion-ios-monitor-outline",
                items: [] // Required: array, even empty
            }, {
                name: "SidebarSettings",
                id: 7,
                iconClass: "ion-ios-gear-outline",
                items: [ // Required: array, even empty

                    /*{
                        name: "SidebarProfilesettings",
                        type: "Settings",
                        url: "profiles",
                        id: 44,
                        items: [] // Required: array, even empty
                    }, */


                    {
                        name: "SidebarMessagesettings",
                        type: "Settings",
                        url: "App.settingsMessages",
                        id: 41,
                        items: []
                    }, {
                        name: "SidebarContactsettings",
                        type: "Settings",
                        url: "App.settingsContacts",
                        id: 42,
                        items: []
                    }, {
                        name: "SidebarSecuritysettings",
                        type: "Settings",
                        url: "App.settingsAccount",
                        id: 43,
                        items: [] // Required: array, even empty
                    }, {
                        name: "SidebarLanguagesettings",
                        id: 300,
                        type: "Settings",
                        url: "App.changelanguage",
                        items: []
                    }
                ]
            }
        ]
    };



    var all = function() {
    var deferred = $q.defer();
    var user = JSON.parse(window.localStorage.ionWordpress_user || null);

    $http.jsonp(WORDPRESS_API_URL + 'user/get_menu/' +
      '?cookie='+ user.cookie +
      '&insecure=cool' +
      '&callback=JSON_CALLBACK')
    .success(function(data) {
      deferred.resolve(data);
    })
    .error(function(data) {
      deferred.reject(data);
    });
    return deferred.promise;

    }


    // Should be a DB query in real life
    var get = function(id) {
        var categories = all();
        for (var i = 0; i < categories.length; i++) {
            var level1 = categories[i];
            if (level1.id == id) {
                return level1;
            }
            for (var j = 0; j < level1.items.length; j++) {
                var level2 = level1.items[j];
                if (level2.id == id) {
                    return level2;
                }
                for (var k = 0; k < level2.items.length; k++) {
                    var level3 = level2.items[k];
                    if (level3.id == id) {
                        return level3;
                    }
                }
            }
        }
        return null;
    }
    // Public API
    return {
        all: all,
        get: get
    }
});
