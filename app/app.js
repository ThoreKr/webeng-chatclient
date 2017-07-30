// Make hash voodoo
// https://stackoverflow.com/a/41753979/4375998

String.prototype.hashCode = function() {
	let hash = 5381, i = this.length;
	while(i) {
		hash = (hash * 33) ^ this.charCodeAt(--i)
	}
	return hash >>> 0;
};

function messagesEqual(message1, message2) {
	return ((message1.message === message2.message) && (message1.timestamp === message2.timestamp) && (message1.user === message2.user));
}

var app = angular.module("crappyChat", ["ngAnimate", "ngAria", "ngMessages", "ngMaterial", "ngSanitize", "vkEmojiPicker", "luegg.directives", "ngCookies"]);

app.controller("chatCtrl", ['$scope', '$http', '$mdDialog', '$filter', '$cookies', '$cookieStore', function($scope, $http, $mdDialog, $filter, $cookies, $cookieStore) {
	$scope.endpoint = "http://liebknecht.danielrutz.com:3000/api/chats/";
	$scope.locked = true;
	$scope.customFullscreen = false;
	$scope.userName = ""; // get this from login
	$scope.apiUser = "";
	$scope.apiPassword = "";
	$scope.channels = [""];
	$scope.messages = [];
	$scope.users = [];
	$scope.currentChannel = "Lobby";
	$http.defaults.headers.common.Authorization = 'Basic ' + btoa($scope.apiUser + ':' + $scope.apiPassword);

	$scope.showLogin = function(ev) {
		$mdDialog.show({
			controller: DialogController,
			templateUrl: 'app/templates/login-form.tmpl.html',
			parent: angular.element(document.body),
			targetEvent: ev,
			clickOutsideToClose: false,
			fullscreen: $scope.customFullscreen
		}).then(
			function(result) {
				if (result.userName != null) {
					$scope.userName = result.userName;
					$scope.apiUser = result.apiUser;
					$scope.apiPassword = result.apiPassword;
					$http.defaults.headers.common.Authorization = 'Basic ' + btoa($scope.apiUser + ':' + $scope.apiPassword);
					checkApiCredentials()
				}	
			},
			function() {
				$scope.locked = true;
				console.log("Cancelled");
			}
		);
	};

	// On load launch look for a cookie storing login information
	// Otherwise open the login form
	let loginCookie = $cookies.get('crappyLogin');
	let userCookie = $cookies.get('crappyUserName');
	if (!loginCookie || !userCookie) {
		$scope.showLogin();
	} else {
		$http.defaults.headers.common.Authorization = loginCookie;
		$scope.userName = userCookie;
		checkApiCredentials();
	}

	$scope.showLoginAlert = function(text, ev) {
		$mdDialog.show(
			$mdDialog.alert()
				.parent(angular.element(document.querySelector('#layoutContainer')))
				.clickOutsideToClose(true)
				.title(text)
				.textContent('I\'m sorry, Dave. I\'m afraid I can\'t do that.')
				.ariaLabel(text)
				.ok('Shit!')
				.targetEvent(ev)
		);
	};

	$scope.createChannel = function(ev) {
		// Appending dialog to document.body to cover sidenav in docs app
		var confirm = $mdDialog.prompt()
			.title('Join a new Channel')
			.textContent('How is the channel called?')
			.placeholder('MyChannel')
			.ariaLabel('Channel Name')
			.initialValue('')
			.targetEvent(ev)
			.ok('Join!')
			.cancel('Close');

		$mdDialog.show(confirm).then(function(result) {
			$scope.channels.push(result);
			$scope.currentChannel = result;
			$scope.sendMessage("has joined the channel.")

		}, function() {
			// Do nothing
		});
	};

	$scope.sendMessage = function(message) {
		// Clear line
		if (!message) {
			message = $filter('emojify')($scope.chatInput);
			$scope.chatInput = null;
		}
		// POST it
		$http.post($scope.endpoint + $scope.currentChannel,
			JSON.stringify({
				"message": message,
				"user": $scope.userName,
				"meta": "Sent with the Chaotic Crappy Chat Program (СССР)"
			}),
			{
				headers: {
					'Content-Type': 'application/json'
				}
			}).then(response => {
			$scope.messages = response.data;
		}, response => {
			console.error('An error occured. Server responded: ' + response.status.toString() + ' ' + response.statusText);
		});
	};
	
	$scope.colorUser = function(userName) {
		return userName.hashCode().toString(16).slice(0,6);
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
	};

	$scope.fetchMessages = function() {
		if ($scope.locked) {
			return;
		}
		$http.get($scope.endpoint + $scope.currentChannel).then(response => {
			if($scope.messages.length > 0) { // only show notification when we haven't just switched to that channel
				$scope.notfiyOnNewMessage(response.data);
			}
			$scope.messages = response.data;
			return response.data;
		}, response => {
			console.error('An error occured. Server responded: ' + response.status.toString() + ' ' + response.statusText);
		});
	};

	$scope.fetchChannels = function() {
		if ($scope.locked) {
			return;
		}
		$http.get($scope.endpoint).then(response => {
			$scope.channels = response.data;
			return response.data;
		}, response => {
			console.error('An error occured. Server responded: ' + response.status.toString() + ' ' + response.statusText);
		});
	};

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
	};

	$scope.fetchUsers = function() {
		if ($scope.locked) {
			return;
		}
		$http.get($scope.endpoint + $scope.currentChannel + "/users").then(response => {
			$scope.users = response.data;
			return response.data;
		}, response => {
			console.error('An error occured. Server responded: ' + response.status.toString() + ' ' + response.statusText);
		});
	};

	$scope.logout = function() {
		// Let the cookie monster do some work
		$scope.locked = true;
		$scope.userName = "";
		$scope.apiUser = "";
		$scope.apiPassword = "";
		clearInterval($scope.fetchMessageInterval);
		clearInterval($scope.fetchUserInterval);
		clearInterval($scope.fetchChannelInterval);
		$http.defaults.headers.common.Authorization = '';
		$cookies.remove('crappyLogin'); // Nom Nom Nom COOKIES
	}

	// check whether we are allowed to send notifications
	if (Notification.permission !== 'granted') {
		Notification.requestPermission();
	}

	function DialogController($scope, $mdDialog) {
		$scope.hide = function() {
			$mdDialog.hide();
		};
		$scope.cancel = function() {
			$mdDialog.cancel();
		};
		$scope.answer = function(userName, apiUser, apiPassword) {
			var result = {};
			result.userName = userName;
			result.apiUser = apiUser;
			result.apiPassword = apiPassword;
			$mdDialog.hide(result);
		};
	}

	function checkApiCredentials() {
		$http.get($scope.endpoint).then(response => {
			$scope.locked = false;
			// Poll Messages
			$scope.fetchMessages();
			$scope.fetchMessageInterval = setInterval($scope.fetchMessages, 1000);
			// Poll channels
			$scope.fetchChannels();
			$scope.fetchChannelInterval = setInterval($scope.fetchChannels, 5000);
			// Poll users
			$scope.fetchUsers();
			$scope.fetchUserInterval = setInterval($scope.fetchUsers, 1000);
			$cookies.put("crappyLogin", $http.defaults.headers.common.Authorization);
			$cookies.put("crappyUserName", $scope.userName);
		}, response => {
			console.error('An error occured. Server responded: ' + response.status.toString() + ' ' + response.statusText);
			$scope.showLoginAlert('Login Error');
		});
	}
}]);
