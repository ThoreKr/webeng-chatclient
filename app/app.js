// Make hash voodoo
// https://stackoverflow.com/a/41753979/4375998

String.prototype.hashCode = function() {
	let hash = 5381, i = this.length
	while(i) {
		hash = (hash * 33) ^ this.charCodeAt(--i)
	}
	return hash >>> 0;
}

angular.module("crappyChat", []).controller("chatCtrl", ['$scope', '$http', function($scope, $http) {
	$scope.endpoint = "http://[2a03:4000:6:12db:dead:beef:abad:1dea]:3000/api/chats/";
	$scope.username = "me" // get this from login
	$scope.apiUser = "dhbw";
	$scope.apiPassword = "dhbw-pw";
	$scope.channels = ["Lobby"];
	$scope.messages = [];
	$scope.users = [{"name":"someone"},{"name":"someoneElse"}, {"name": $scope.username}];
	$scope.currentChannel = "Lobby";

	$scope.sendMessage = function() {
		// Clear line
		var message = $scope.chatInput;
		$scope.chatInput = null;

		// POST it
		$http.post($scope.endpoint + $scope.currentChannel,
			JSON.stringify({
				"message": message,
				"user": $scope.username
			}),
			{
				headers: {
					'Authorization': 'Basic ' + btoa($scope.apiUser + ':' + $scope.apiPassword),
					'Content-Type': 'application/json'
				}
			}).then(response => {
			console.log('successfully sent message');
			$scope.messages = response.data;
		}, response => {
			console.error('An error occured. Server responded: ' + response.status.toString() + ' ' + response.statusText);
		});
	};
	
	$scope.colorUser = function(userName) {
		return userName.hashCode().toString(16).slice(0,6);
		
	}

	$scope.fetchMessages = function() {
		$http.get($scope.endpoint + $scope.currentChannel,
			{
				headers: {
					Authorization: 'Basic ' + btoa($scope.apiUser + ':' + $scope.apiPassword)
				}
			}).then(response => {
			$scope.messages = response.data;
			return response.data;
		}, response => {
			console.error('An error occured. Server responded: ' + response.status.toString() + ' ' + response.statusText);
		});
	}

	// Poll Messages
	$scope.fetchMessages();
	setInterval($scope.fetchMessages, 1000);

	$scope.fetchChannels = function() {
		$http.get($scope.endpoint,
			{
				headers: {
					Authorization: 'Basic ' + btoa($scope.apiUser + ':' + $scope.apiPassword)
				}
			}).then(response => {
			$scope.channels = response.data;
			return response.data;
		}, response => {
			console.error('An error occured. Server responded: ' + response.status.toString() + ' ' + response.statusText);
		});
	}

	// Poll channels
	$scope.fetchChannels();
	setInterval($scope.fetchChannels, 5000);

	$scope.setCurrentChannel = function(channel) {
		if ($scope.channels.indexOf(channel) === -1)
		{
			console.error("Channel " + channel + " does not exist!");
			return;
		}
		$scope.currentChannel = channel;

		// Force poll
		$scope.fetchMessages();
	}
}]);
