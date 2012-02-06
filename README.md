## Bogus.js = Hogan.js + Backbone.js [![Build Status](https://secure.travis-ci.org/AngryBytes/bogus.js.png)](http://travis-ci.org/AngryBytes/bogus.js)

Bogus.js extends [Hogan.js] with support for [Backbone.js] models. This means
that mustache `{{tags}}` will look for Backbone.Model attributes, and mustache
`{{#sections}}` will iterate over Backbone.Collections.

 [Hogan.js]: http://twitter.github.com/hogan.js/
 [Backbone.js]: http://documentcloud.github.com/backbone/

### From the browser

Bogus.js is tied to a specific version of Hogan.js, currently 1.0.5. You will
probably want one of the following builds:

 * [hogan-1.0.5.js]: Complete build.
 * [hogan-1.0.5.min.js]: Complete build, minified.
 * [template-1.0.5.js]: Just Hogan.Template.
 * [template-1.0.5.min.js]: Just Hogan.Template, minified.

Make sure Hogan.js and Bogus.js are included in your page in order:

    <script src="hogan.js"></script>
    <script src="bogus.js"></script>

(Of course, you also want Backbone and dependencies, but Bogus.js won't
actually fail without them.)

 [hogan-1.0.5.js]: https://raw.github.com/twitter/hogan.js/gh-pages/builds/1.0.5/hogan-1.0.5.js
 [hogan-1.0.5.min.js]: https://raw.github.com/twitter/hogan.js/gh-pages/builds/1.0.5/hogan-1.0.5.min.js
 [template-1.0.5.js]: https://raw.github.com/twitter/hogan.js/gh-pages/builds/1.0.5/template-1.0.5.js
 [template-1.0.5.min.js]: https://raw.github.com/twitter/hogan.js/gh-pages/builds/1.0.5/template-1.0.5.min.js

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
