(function(Hogan) {

  // Get a hold of Underscore.js.
  var _ = null;
  if (typeof window !== 'undefined') {
      _ = window._;
  }
  if (!_) {
      _ = require('underscore');
  }


  // Empty constructor.
  var ctor = function() {};

  // Create a Bogus namespace that inherits from Hogan.
  ctor.prototype = Hogan;
  var Bogus = new ctor();
  if (typeof module !== 'undefined') {
    module.exports = Bogus;
  }
  else {
    this.Bogus = Bogus;
  }

  // Override the compiler's generate method to create Bogus templates.
  Bogus.generate = function (tree, text, options) {
    var code = Hogan.generate(tree, text, { asString: true });
    if (options.asString) {
        return code;
    }

    // FIXME: This is hacky, but otherwise requires support from Hogan.js.
    code = code.slice(16, -2);

    return new Bogus.Template(new Function('c', 'p', 'i', code),
                              text, Bogus, options);
  };


  // Template class that inherits from Hogan.Template.
  Bogus.Template = function() {
      Hogan.Template.apply(this, arguments);
  };
  ctor.prototype = Hogan.Template.prototype;
  var proto = Bogus.Template.prototype = new ctor();

  // Value helper.
  var getValue = function(obj, key) {
    if (obj && typeof obj === 'object') {
      if (obj.attributes) {
        obj = obj.attributes;
      }
      if (key in obj) {
        return { val: obj[key], found: true };
      }
    }
    return { val: false, found: false };
  };

  // render a section
  proto.rs = function(context, partials, section) {
    var _this = this,
        tail = context[context.length - 1];

    function iter(obj) {
      context.push(obj);
      section(context, partials, _this);
      context.pop();
    }

    if (tail.forEach) {
      tail.forEach(iter);
    }
    else if (_.isArray(tail)) {
      _.each(tail, iter);
    }
    else {
      section(context, partials, this);
    }
  };

  // maybe start a section
  proto.s = function(val, ctx, partials, inverted, start, end, tags) {
    var pass;

    if (typeof val === 'object' && val.length === 0) {
      return false;
    }

    if (typeof val === 'function') {
      val = this.ls(val, ctx, partials, inverted, start, end, tags);
    }

    pass = (val === '') || !!val;

    if (!inverted && pass && ctx) {
      ctx.push((typeof val === 'object') ? val : ctx[ctx.length - 1]);
    }

    return pass;
  };

  // find values with dotted names
  proto.d = function(key, ctx, partials, returnFound) {
    var names = null,
        val = null,
        result = null,
        cx = null;

    if (key === '.') {
      return ctx[ctx.length - 1];
    }

    names = key.split('.');
    val = this.f(names[0], ctx, partials, returnFound);
    for (var i = 1; i < names.length; i++) {
      result = getValue(val, names[i]);
      if (result.found) {
        cx = val;
        val = result.val;
      }
      else {
        val = '';
        break;
      }
    }

    if (returnFound && !val) {
      return false;
    }

    if (!returnFound && typeof val === 'function') {
      ctx.push(cx);
      val = this.lv(val, ctx, partials);
      ctx.pop();
    }

    return val;
  };

  // find values with normal names
  proto.f = function(key, ctx, partials, returnFound) {
    var val = false,
        result = null,
        found = false;

    for (var i = ctx.length - 1; i >= 0; i--) {
      result = getValue(ctx[i], key);
      if (result.found) {
        found = true;
        val = result.val;
        break;
      }
    }

    if (!found) {
      return (returnFound) ? false : "";
    }

    if (!returnFound && typeof val === 'function') {
      val = this.lv(val, ctx, partials);
    }

    return val;
  };


// Require Hogan.js if we need to.
})(typeof require === 'function' ? require('hogan.js') : Hogan);
