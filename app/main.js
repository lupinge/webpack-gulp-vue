var mod = require('./module1');
require('./index.scss');
var Vue = require('vue');

import {data} from './data.js';
window.console.log(JSON.stringify(data));

var myComponent = Vue.component('my-component', require('./components/my-component'));

var app = new Vue({
    el:'#app',
    data:{
        name: 'webpack-lp'
    },
    methods: {
        initPage: function () {
            mod.sayHi('jiao');
            mod.sayBye('du');
        }

    },
    created: function() {
        document.body.addEventListener('touchstart', function () {});
        this.initPage();
    }
});