angular.module('main', ["ngRoute"])
.controller('AppCtrl', function($scope,$location) {
    $scope.data = {
        tasks: [],
        feed: [],
        status: 'Sleeping'
    }
    var blankTask = {
        isEnabled: !0,
        type: 'hashtag',
        textarea: ''
    }
    $scope.window = window;
    $scope.ap = {
        showError1: !1,
        taskFunc: 'add'
    };
    $scope.newTask = blankTask;

	// window.location.href = '#!task';
    $scope.theme = function(e){
        $('select.dropdown').dropdown()
        $('.ui.checkbox').checkbox()
        if(e){
            $('html, body').css('width', '420px')
        }else{
            $('html, body').css('width', '320px')
        }
        $('.indicating.progress').progress({
            label: 'ratio',
            value: $scope.data.feed.length,
            total: 500,
            text: {
                success : 'Daily quota reached!'
            }
        });
    }
    $scope.taskFunc = function(e){
        $scope.ap.taskFunc = e;
        if(e !== 'add'){
            $scope.newTask = $scope.data.tasks[$scope.ap.taskFunc]
        }
        window.location.href = '#!task';
    }

    $scope.get = function(cb){
        chrome.runtime.sendMessage({why: "getData"}, function(response) {
            if(!cb){
                console.log(response)
                $scope.data = response;
                $scope.data.feed = $scope.data.feed.reverse()
                $scope.$apply();
            }else{
                cb(response)
            }
        });
    }
    $scope.get();
    $scope.save = function(){
        if($scope.ap.taskFunc == 'add'){
            $scope.data.tasks.push($scope.newTask)
        }else{
            $scope.data.tasks[0] = $scope.newTask;
        }
        $scope.newTask = blankTask;
        chrome.runtime.sendMessage({why: "setData", data: $scope.data});
        window.location.href = '#!home';
    }
    setInterval(function() {
        $scope.get(function(e){
            if($scope.data.feed.length !== e.feed.length) {
                $scope.data.feed.push(e.feed.pop())
                $('.indicating.progress').progress('increment');
            }
            $scope.data.status = e.status;
            $scope.$apply();
        })
    }, 5000);
})
.filter('capitalize', function() {
    return function(input) {
      return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '';
    }
})
.filter('join', function() {
    return function(input) {
      return input.join(', ');
    }
})
.config(function($routeProvider) {
    $routeProvider
    .when("/task", {
        templateUrl : "/src/popup/parts/task.html"
    })
    .when("/home", {
        templateUrl : "/src/popup/parts/home.html"
    })
    .when("/info", {
        templateUrl : "/src/popup/parts/info.html"
    })
    .otherwise({
        redirectTo: "/home"
    });
});