# webeng-chatclient

This is the Chaotic Crappy Chat Client, a client that is compatible to <https://github.com/Lhdang88/cloud_computing_ws>. It is written entirely in HTML, CSS, and JavaScript using AngularJS.

## How to start the client
The client won't just run from the local file system because of the strict security policies of modern browsers. You need a webserver to (statically) provide the files. For example, run
```shell
python -m SimpleHTTPServer 8080
```
with Python 2 or
```shell
python -m http.server 8080
```
with Python 3
inside the root directory of the client to start a local HTTP Server.
Then, you should be able to access it using a good web browser (not IE!) under the webpage <http://localhost:8080>.