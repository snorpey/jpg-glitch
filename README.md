image glitch experiment
===

this is an experiment for the web browser. it corrupts jpg images so that they appear "glitched".

[![triangulation experiment screen shot](http://dl.dropboxusercontent.com/u/1098704/Screenshots/github-glitch.png)](http://snorpey.github.io/jpg-glitch/)

[online demo](http://snorpey.github.io/jpg-glitch/)

this experiment is very much based on the [smack my glitch up js](https://github.com/Hugosslade/smackmyglitchupjs) script.

minification / build
---
the [requirejs optimizer](http://requirejs.org/docs/optimization.html) is used to minify both javascript and css files.

to minify javascript, run ```r.js -o name=main out=main.min.js``` in the terminal from the ```scripts``` folder.

to minify css, run ```r.js -o cssIn=global.css out=global.min.css optimizeCss=default``` from the ```styles``` folder.

third party code used in this experiment
---
* [html5slider](http://frankyan.com/labs/html5slider/) by [fryn](https://github.com/fryn), MIT license
* [js signals](http://millermedeiros.github.io/js-signals/) by [millermedeiros](https://github.com/millermedeiros), MIT license
* [require js](http://requirejs.org/), by [jrburke](jrburke), BSD & MIT license
* [raf js](https://gist.github.com/paulirish/1579671), by [paulirish](https://github.com/paulirish), MIT license

license
---
[MIT License](LICENSE)
