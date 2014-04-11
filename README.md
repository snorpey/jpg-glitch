image glitch experiment
===

this is an experiment for the web browser. it corrupts jpg images so that they appear "glitched".

[![glitch experiment screen shot](http://dl.dropboxusercontent.com/u/1098704/Screenshots/github-glitch.png)](http://snorpey.github.io/jpg-glitch/)

[online demo](http://snorpey.github.io/jpg-glitch/)

this experiment is very much based on the [smack my glitch up js](https://github.com/Hugosslade/smackmyglitchupjs) script.

build script
---
the build script takes care of concatenating and minifying all scripts and styles. it uses [gruntjs](http://gruntjs.com/).

please make sure that both [nodejs](http://nodejs.org/) and grunt-cli are [set up properly](http://gruntjs.com/getting-started) on your machine.

run ```npm install``` from within the ```build/``` folder to install the dependencies of the build script.

to build, run ```grunt production``` from within the ```build/``` folder. the optimized files will get copied to the ```production/``` folder.

glitch code
---
if you're a developer and just interested in the code for the glitch effect, there's a separate repository for that: [glitch-canvas](https://github.com/snorpey/glitch-canvas).

third party code used in this experiment
---
* [js signals](http://millermedeiros.github.io/js-signals/) by [millermedeiros](https://github.com/millermedeiros), MIT license
* [require js](http://requirejs.org/), by [jrburke](jrburke), BSD & MIT license
* [almond js](https://github.com/jrburke/almond), by [jrburke](jrburke), BSD & MIT license
* [raf js](https://gist.github.com/paulirish/1579671), by [paulirish](https://github.com/paulirish), MIT license
* [reqwest js](https://github.com/ded/reqwest/), by [ded](https://github.com/ded), MIT license
* [glitch-canvas js](https://github.com/snorpey/glitch-canvas/), by [snorpey](snorpey), MIT license

license
---
[MIT License](LICENSE)
