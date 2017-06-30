// Make hash voodoo
// https://stackoverflow.com/a/41753979/4375998

String.prototype.hashCode = function() {
	var hash = 5381, i = this.length
	while(i) {
		hash = (hash * 33) ^ this.charCodeAt(--i)
	}
	return hash >>> 0;
}

var app = angular.module("crappyChat", []);

app.controller("chatCtrl", function($scope) {
	$scope.username = "me" // get this from login
	$scope.channels = [ "a","b","c" ]; // do some get channels api magic here
	$scope.messages = [{"sender": "someone", "time":"now", "text":"I hate this"},{"sender": "someoneElse", "time":"later", "text":"I hate this too"}];
	$scope.users = [{"name":"someone"},{"name":"someoneElse"}, {"name": $scope.username}];


	$scope.sendMessage = function() {
		// Do api magic here. I have no idea how, so I will just save it locally
		var message = $scope.chatInput;
		$scope.chatInput = null;
		$scope.messages.push({
			"sender":$scope.username,
			"time": new Date().toISOString(),
			"text": message
		});
	};
	
	$scope.colorUser = function(userName) {
		return userName.hashCode().toString(16).slice(0,6);
		
	}
});
