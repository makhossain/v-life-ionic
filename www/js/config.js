angular.module('App.config', [])
.constant('WORDPRESS_API_URL', 'http://v-life.co/api/')
.constant('WORDPRESS_API_URL', 'http://v-life.co/api/')
.constant('WORDPRESS_JSON_API_URL', 'http://v-life.co//wp-json/wp/v2/')

.constant('Shop', {
  version                             : '1.1.0',
  name                                : 'V-Life',
  URL                                 : 'http://v-life.co/shop/',
  EMAIL                               : 'cs@v-life.co',
  ConsumerKey                         : 'ck_8fbb5ed779a0e8c8c3fb0f47be7538552498867f', // Get this from your WooCommerce
  ConsumerSecret                      : 'cs_629cb496dad6696dcc4832e9ff4675f0e45f93dd', // Get this from your WooCommerce

  homeSlider                          : true, // If you dont want to use home slider, set it to FALSE
  CurrencyFormat                      : true, // If you want to use currency format, set it to TRUE
  shipping                            : [
                                          {id: 'flat_rate:4', name: 'Local Pickup', cost: 0},
                                          {id: 'flat_rate:3', name: 'Flat Rate', cost: 5},
                                          {id: 'flat_rate:2', name: 'Worldwide Flat Rate', cost: 15}
                                        ],
  payment                             : [
                                          {id: 'cod', name: 'Cash on Delivery', icon: 'fa fa-money', desc: 'Pay with cash upon delivery.'},
                                          {id: 'bacs', name: 'Direct Bank Transfer', icon: 'fa fa-university', desc: 'You can pay using direct bank account'},
                                          {id: 'paypal', name: 'Paypal', icon: 'fa fa-cc-paypal', desc: 'You can pay via Paypal and Credit Card'},
                                        ],

  GCM_SenderID                        : 'xxxxxxxxxxxx', // Get this from https://console.developers.google.com
  OneSignalAppID                      : 'xxxxxxxxxxxx', // Get this from https://onesignal.com

                                        // Change this Paypal Sandbox and LIVE with yours
  payPalLiveClientID                  : 'AbaoZEfGv4BZ0D_9gUBZqilxAW7JUvvvGA6GXr52ivNqq5jeh45CkB5M0Jg79lO_19IeaiiAC70vL7C3',
  payPalEnv                           : 'PayPalEnvironmentProduction', // to go live, use this: 'PayPalEnvironmentProduction'
  payPalSandboxClientID               : 'Ab6DxgQBUsu6kWJy4RQsv7PZgEzDH274Pqlk9GXsfrp0ykthSOqn2eiUshzA4VQN__-Lc82f12aL6U0z',
  // payPalEnv                           : 'PayPalEnvironmentSandbox', // to go live, use this: 'PayPalEnvironmentProduction'

                                        // RazorPay only can be used for Indian currency (INR = Indian Rupee)
                                        // If you want use LIVE, get your LIVE key from RazorPay Dashboard and use it here                                       
})
