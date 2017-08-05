# Chaotic Crappy Chat Program

This is the Chaotic Crappy Chat Program, a client that is compatible to [https://github.com/Lhdang88/cloud_computing_ws](https://github.com/Lhdang88/cloud_computing_ws). It is written entirely in HTML, CSS, and JavaScript using AngularJS.

## How to start the client
The client won't just run from the local file system because of the strict security policies of modern browsers. You need a webserver to (statically) provide the files.

Simple Python webservers would be:
```shell
python2 -m SimpleHTTPServer 8080
```
```shell
python3 -m http.server 8080
```
One of these commands would have to executed inside the root directory of the client to start a local HTTP Server.

Then, you should be able to access it using a modern web browser (not IE!) by browsing to the link [http://localhost:8080](http://localhost:8080).

Currently the client is linked against a hosted version of the backend.

## External Projects
We have included a few external libraries. These were:

  * [angular-emoji-picker](https://github.com/GalochkinKirov/angular-emoji-picker)
  * [AngularJs](https://angularjs.org/)
  * [AngularMaterial](https://material.angularjs.org/latest/)
  * [angularjs-scroll-glue](https://github.com/Luegg/angularjs-scroll-glue)

## Additional features

  * We can create channels
  * When composing messages pressing the Tab-Key can help you autocompleting nicknames
  * The client is able to notify on certain keywords, which can be set in the settings menu.
  * Login data and settings are stored in cookies and so persisten through reloads
  * Converting smileys from words like :joy: to the unicode equivalents