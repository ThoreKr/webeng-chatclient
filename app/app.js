// Make hash voodoo
// https://stackoverflow.com/a/41753979/4375998

String.prototype.hashCode = function() {
	let hash = 5381, i = this.length
	while(i) {
		hash = (hash * 33) ^ this.charCodeAt(--i)
	}
	return hash >>> 0;
}

function messagesEqual(message1, message2) {
	return ((message1.message === message2.message) && (message1.timestamp === message2.timestamp) && (message1.user === message2.user));
}

angular.module("crappyChat", []).controller("chatCtrl", ['$scope', '$http', function($scope, $http) {
	$scope.endpoint = "http://liebknecht.danielrutz.com:3000/api/chats/";
	$scope.username = "me" // get this from login
	$scope.apiUser = "dhbw";
	$scope.apiPassword = "dhbw-pw";
	$scope.channels = ["Lobby"];
	$scope.messages = [];
	$scope.users = [];
	$scope.currentChannel = "Lobby";

	$http.defaults.headers.common.Authorization = 'Basic ' + btoa($scope.apiUser + ':' + $scope.apiPassword);

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

	// check whether we are allowed to send notifications
	if (Notification.permission !== 'granted') {
		Notification.requestPermission();
	}

	$scope.notfiyOnNewMessage = function(newMessageArray) {
		let newMessages = newMessageArray.filter(function(message) {
			for (let oldMessageIndex in $scope.messages) {
				if (messagesEqual(message, $scope.messages[oldMessageIndex])) {
					return false;
				}
			}
			return true;
		});
		if (newMessages.length > 0) {
			let bodyString = '';
			newMessages.forEach(message => bodyString += (message.user + ' wrote: ' + message.message.substring(0, 20) + '...\n'));
			new Notification(newMessages.length.toString() + ' new message(s)!', {
				body: bodyString
			});
		}
	}

	$scope.fetchMessages = function() {
		$http.get($scope.endpoint + $scope.currentChannel).then(response => {
			if($scope.messages.length > 0) { // only show notification when we haven't just switched to that channel
				$scope.notfiyOnNewMessage(response.data);
			}
			$scope.messages = response.data;
			return response.data;
		}, response => {
			console.error('An error occured. Server responded: ' + response.status.toString() + ' ' + response.statusText);
		});
	}

	$scope.fetchChannels = function() {
		$http.get($scope.endpoint).then(response => {
			$scope.channels = response.data;
			return response.data;
		}, response => {
			console.error('An error occured. Server responded: ' + response.status.toString() + ' ' + response.statusText);
		});
	}

	$scope.setCurrentChannel = function(channel) {
		if ($scope.channels.indexOf(channel) === -1)
		{
			console.error("Channel " + channel + " does not exist!");
			return;
		}
		$scope.currentChannel = channel;
		$scope.messages = [];

		// Force poll
		$scope.fetchMessages();
		$scope.fetchUsers();
	}

	$scope.fetchUsers = function() {
		$http.get($scope.endpoint + $scope.currentChannel + "/users").then(response => {
			$scope.users = response.data;
			return response.data;
		}, response => {
			console.error('An error occured. Server responded: ' + response.status.toString() + ' ' + response.statusText);
		});
	}

	// Poll Messages
	$scope.fetchMessages();
	setInterval($scope.fetchMessages, 1000);
	// Poll channels
	$scope.fetchChannels();
	setInterval($scope.fetchChannels, 5000);
	// Poll users
	$scope.fetchUsers();
	setInterval($scope.fetchUsers, 1000);
}]);
