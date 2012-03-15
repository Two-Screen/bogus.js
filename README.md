## Bogus.js = Hogan.js + Backbone.js [![Build Status](https://secure.travis-ci.org/Two-Screen/bogus.js.png)](http://travis-ci.org/Two-Screen/bogus.js)

Bogus.js extends [Hogan.js] with support for [Backbone.js] models. This means
that mustache `{{tags}}` will look for Backbone.Model attributes, and mustache
`{{#sections}}` will iterate over Backbone.Collections.

 [Hogan.js]: http://twitter.github.com/hogan.js/
 [Backbone.js]: http://documentcloud.github.com/backbone/

### From the browser

Bogus.js is tied to a specific version of Hogan.js, currently 2.0.0. You will
probably want one of the following builds:

 * [hogan-2.0.0.js]: Complete build.
 * [hogan-2.0.0.min.js]: Complete build, minified.
 * [template-2.0.0.js]: Just Hogan.Template.
 * [template-2.0.0.min.js]: Just Hogan.Template, minified.

Make sure Hogan.js and Bogus.js are included in your page in order:

    <script src="underscore.js"></script>
    <script src="backbone.js"></script>
    <script src="hogan.js"></script>
    <script src="bogus.js"></script>

 [hogan-2.0.0.js]: https://raw.github.com/twitter/hogan.js/gh-pages/builds/2.0.0/hogan-2.0.0.js
 [hogan-2.0.0.min.js]: https://raw.github.com/twitter/hogan.js/gh-pages/builds/2.0.0/hogan-2.0.0.min.js
 [template-2.0.0.js]: https://raw.github.com/twitter/hogan.js/gh-pages/builds/2.0.0/template-2.0.0.js
 [template-2.0.0.min.js]: https://raw.github.com/twitter/hogan.js/gh-pages/builds/2.0.0/template-2.0.0.min.js

### From Node.js

Install using NPM:

    $ npm install bogus.js

Then simply:

    var Bogus = require('bogus.js');

### Usage

The `Bogus` namespace contains all the methods you'd normally find in the
`Hogan` namespace. This means you can simply:

    var data = new Backbone.Model({
      screenName: "ko_si_nus",
    });

    var template = Bogus.compile("Follow @{{screenName}}.");
    var output = template.render(data);

    // prints "Follow @ko_si_nus."
    console.log(output);
