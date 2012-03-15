var fs = require('fs');
var tap = require('tap');
var Backbone = require('backbone');
var Bogus = require('./');


// Backbone.js-specific tests.

tap.test("Render With Model", function(test) {
  var text = "test {{foo}} test";
  var t = Bogus.compile(text);
  var m = new Backbone.Model({foo:'bar'});
  var s = t.render(m);
  test.equal(s, "test bar test", "basic variable substitution works.");
  test.end();
});

tap.test("Render With Nested Model", function(test) {
  var text = "test {{foo.bar}} test";
  var t = Bogus.compile(text);
  var m = new Backbone.Model({bar:'baz'});
  var s = t.render({foo:m});
  test.equal(s, "test baz test", "basic traversal works.");
  test.end();
});

tap.test("Render With Array Of Models", function(test) {
  var text = "test {{#list}}{{val}}{{/list}} test";
  var t = Bogus.compile(text);
  var m1 = new Backbone.Model({val:'foo'});
  var m2 = new Backbone.Model({val:'bar'});
  var s = t.render({list:[m1,m2]});
  test.equal(s, "test foobar test", "basic iteration works.");
  test.end();
});

tap.test("Render With Collection", function(test) {
  var text = "test {{#list}}foo {{val}} {{/list}}test";
  var t = Bogus.compile(text);
  var c = new Backbone.Collection([{val:'bar'}, {val:'baz'}]);
  var s = t.render({list:c});
  test.equal(s, "test foo bar foo baz test", "basic iteration works.");
  test.end();
});


// The following is taken from the Hogan.js test suite.

// Hogan.js uses QUnit. Perhaps we should too, but for now, this is the
// entire test suite converted to use TAP.

/*
 *  Copyright 2011 Twitter, Inc.
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

tap.test("Scan Text No Tags", function(test) {
  var text = "<h2>hi</h2>";
  var tokens = Bogus.scan(text);
  test.equal(tokens.length, 1, "One token");
  test.equal(tokens[0]+'', text, "text is equal to first token");
  test.end();
});

tap.test("Scan One Tag", function(test) {
  var text = "{{hmm}}";
  var tokens = Bogus.scan(text);
  test.equal(tokens.length, 1, "One token");
  test.equal(tokens[0].n, "hmm", "First token content is variable name.");
  test.end();
});

tap.test("Scan Multiple Tags", function(test) {
  var text = "asdf{{hmm}}asdf2{{hmm2}}asdf3";
  var tokens = Bogus.scan(text);
  test.equal(tokens.length, 5, "3 text tokens, 2 tag tokens.");
  test.equal(tokens[0]+'', "asdf", "first token is text");
  test.equal(tokens[1].n, "hmm", "second token is tag");
  test.equal(tokens[1].tag, "_v", "second token is a variable");
  test.equal(tokens[2]+'', "asdf2", "third token is text");
  test.equal(tokens[3].n, "hmm2", "fourth token is tag");
  test.equal(tokens[3].tag, "_v", "fourth token is a variable");
  test.equal(tokens[4]+'', "asdf3", "Fifth token is text");
  test.end();
});

tap.test("Scan Section Open", function(test) {
  var text = "{{#hmm}}";
  var tokens = Bogus.scan(text);
  test.equal(tokens.length, 1, "One token");
  test.equal(tokens[0].n, "hmm", "First token content is variable name.");
  test.equal(tokens[0].tag, "#", "First token is a section.");
  test.end();
});

tap.test("Scan Section Close", function(test) {
  var text = "{{/hmm}}";
  var tokens = Bogus.scan(text);
  test.equal(tokens.length, 1, "One token");
  test.equal(tokens[0].n, "hmm", "First token content is variable name.");
  test.equal(tokens[0].tag, "/", "First token is a section.");
  test.end();
});

tap.test("Scan Section", function(test) {
  var text = "{{#hmm}}{{/hmm}}";
  var tokens = Bogus.scan(text);
  test.equal(tokens.length, 2, "One token");
  test.equal(tokens[0].n, "hmm", "First token content is variable name.");
  test.equal(tokens[0].tag, "#", "First token is a section.");
  test.equal(tokens[1].n, "hmm", "Second token content is variable name.");
  test.equal(tokens[1].tag, "/", "Second token is a section.");
  test.end();
});

tap.test("Scan Section In Content", function(test) {
  var text = "abc{{#hmm}}def{{/hmm}}ghi";
  var tokens = Bogus.scan(text);
  test.equal(tokens.length, 5, "3 text tokens, 2 tag tokens.");
  test.equal(tokens[0]+'', "abc", "first token is text");
  test.equal(tokens[1].n, "hmm", "second token is tag");
  test.equal(tokens[1].tag, "#", "second token is a variable");
  test.equal(tokens[2]+'', "def", "third token is text");
  test.equal(tokens[3].n, "hmm", "fourth token is tag");
  test.equal(tokens[3].tag, "/", "fourth token is a variable");
  test.equal(tokens[4]+'', "ghi", "Fifth token is text");
  test.end();
});

tap.test("Scan Negative Section", function(test) {
  var text = "{{^hmm}}{{/hmm}}";
  var tokens = Bogus.scan(text);
  test.equal(tokens.length, 2, "One token");
  test.equal(tokens[0].n, "hmm", "First token content is variable name.");
  test.equal(tokens[0].tag, "^", "First token is a negative section.");
  test.equal(tokens[1].n, "hmm", "First token content is variable name.");
  test.equal(tokens[1].tag, "/", "Second token is a section.");
  test.end();
});

tap.test("Scan Partial", function(test) {
  var text = "{{>hmm}}";
  var tokens = Bogus.scan(text);
  test.equal(tokens.length, 1, "One token");
  test.equal(tokens[0].n, "hmm", "First token content is variable name.");
  test.equal(tokens[0].tag, ">", "First token is a partial.");
  test.end();
});

tap.test("Scan Backward Partial", function(test) {
  var text = "{{<hmm}}";
  var tokens = Bogus.scan(text);
  test.equal(tokens.length, 1, "One token");
  test.equal(tokens[0].n, "hmm", "First token content is variable name.");
  test.equal(tokens[0].tag, "<", "First token is a backward partial.");
  test.end();
});

tap.test("Scan Ampersand No Escape Tag", function(test) {
  var text = "{{&hmm}}";
  var tokens = Bogus.scan(text);
  test.equal(tokens.length, 1, "One token");
  test.equal(tokens[0].n, "hmm", "First token content is variable name.");
  test.equal(tokens[0].tag, "&", "First token is an ampersand no-escape.");
  test.end();
});

tap.test("Scan Triple Stache", function(test) {
  var text = "{{{hmm}}}";
  var tokens = Bogus.scan(text);
  test.equal(tokens.length, 1, "One token");
  test.equal(tokens[0].n, "hmm", "First token content is variable name.");
  test.equal(tokens[0].tag, "{", "First token is a triple-stache.");
  test.end();
});

tap.test("Scan Section With Triple Stache Inside", function(test) {
  var text = "a{{#yo}}b{{{hmm}}}c{{/yo}}d";
  var tokens = Bogus.scan(text);
  test.equal(tokens.length, 7, "One token");
  test.equal(tokens[0]+'', "a", "First token content is correct text.");
  test.equal(tokens[1].n, "yo", "Second token content is correct text.");
  test.equal(tokens[1].tag, "#", "Second token is a section.");
  test.equal(tokens[2]+'', "b", "Third token content is correct text.");
  test.equal(tokens[3].n, "hmm", "Fourth token content is correct text.");
  test.equal(tokens[3].tag, "{", "Fourth token is a triple stache.");
  test.equal(tokens[4]+'', "c", "Fifth token content is correct text.");
  test.equal(tokens[5].n, "yo", "Sixth token content is correct text.");
  test.equal(tokens[5].tag, "/", "Sixth token is a close.");
  test.equal(tokens[6]+'', "d", "Seventh token content is correct text.");
  test.end();
});

tap.test("Scan Set Delimiter", function(test) {
  var text = "a{{=<% %>=}}b";
  var tokens = Bogus.scan(text);
  test.equal(tokens.length, 2, "change delimiter doesn't appear as token.");
  test.equal(tokens[0]+'', "a", "text before change delimiter is processed.");
  test.equal(tokens[1]+'', "b", "text after change delimiter is processed.");
  test.end();
});

tap.test("Scan Reset Delimiter", function(test) {
  var text = "a{{=<% %>=}}b<%hmm%>c<%={{ }}=%>d{{hmm}}";
  var tokens = Bogus.scan(text);
  test.equal(tokens.length, 6, "8 tokens, delimiter changes don't count.");
  test.equal(tokens[0]+'', "a", "first token is correct.");
  test.equal(tokens[1]+'', "b", "third token is correct.");
  test.equal(tokens[2].tag, "_v", "third token is correct tag.");
  test.equal(tokens[2].n, "hmm", "third token is correct name.");
  test.equal(tokens[3]+'', "c", "fifth token is correct.");
  test.equal(tokens[4]+'', "d", "seventh token is correct.");
  test.equal(tokens[5].tag, "_v", "eighth token is correct tag.");
  test.equal(tokens[5].n, "hmm", "eighth token is correct name.");
  test.end();
});

tap.test("Single Char Delimiter", function(test) {
  var text = '({{foo}} {{=[ ]=}}[text])';
  var tokens = Bogus.scan(text);

  var t = Bogus.compile(text);
  s = t.render({foo: "bar", text: 'It worked!'});
  test.equal(s, '(bar It worked!)', "Bogus substitution worked after custom delimiters.");
  test.end();
});

tap.test("Set Delimiter With Whitespace", function(test) {
  var text = "{{= | | =}}|foo|";
  var t = Bogus.compile(text);
  s = t.render({foo: "bar"});
  test.equal(s, 'bar', "custom delimiters with whitespace works.")
  test.end();
});

tap.test("Parse Basic", function(test) {
  var text = "test";
  var tree = Bogus.parse(Bogus.scan(text));
  test.equal(tree.length, 1, "one parse node");
  test.equal(tree[0]+'', "test", "text is correct");
  test.end();
});

tap.test("Parse Variables", function(test) {
  var text = "test{{foo}}test!{{bar}}test!!{{baz}}test!!!";
  var tree = Bogus.parse(Bogus.scan(text));
  test.equal(tree.length, 7, "one parse node");
  test.equal(tree[0]+'', "test", "first text is correct");
  test.equal(tree[2]+'', "test!", "second text is correct")
  test.equal(tree[4]+'', "test!!", "third text is correct")
  test.equal(tree[6]+'', "test!!!", "last text is correct")
  test.equal(tree[1].n, "foo", "first var is correct");
  test.equal(tree[3].n, "bar", "second var is correct");
  test.equal(tree[5].n, "baz", "third var is correct");
  test.end();
});

tap.test("Parse Section", function(test) {
  var text = "a{{#foo}}b{{/foo}}c";
  var tree = Bogus.parse(Bogus.scan(text));
  test.equal(tree.length, 3, "three nodes at base");
  test.equal(tree[0]+'', "a", "correct text in first node");
  test.equal(tree[1].hasOwnProperty('nodes'), true, "second node is a section");
  test.equal(tree[1].tag, '#', "second node is a section");
  test.equal(tree[1].n, "foo", "correct name for section");
  test.equal(tree[1].nodes[0]+'', "b", "correct text in section");
  test.equal(tree[2]+'', "c", "correct text in last node");
  test.end();
});

tap.test("Parse Indexes", function(test) {
  var text = "abc{{#foo}}asdf{{bar}}asdf{{/foo}}def";
  var tree = Bogus.parse(Bogus.scan(text));
  test.equal(text.substring(tree[1].i, tree[1].end), "asdf{{bar}}asdf", "section text indexes are correct");
  test.end();
});

tap.test("Parse Negative Section", function(test) {
  var text = "a{{^foo}}b{{/foo}}c";
  var tree = Bogus.parse(Bogus.scan(text));

  test.equal(tree.length, 3, "three nodes at base");
  test.equal(tree[0]+'', "a", "correct text in first node");
  test.equal(tree[1].hasOwnProperty('nodes'), true, "second node is a section");
  test.equal(tree[1].tag, '^', "second node is a negative section");
  test.equal(tree[1].n, "foo", "correct name for section");
  test.equal(tree[1].nodes[0]+'', "b", "correct text in section");
  test.equal(tree[2]+'', "c", "correct text in last node");
  test.end();
});

tap.test("Parse Nested Sections", function(test) {
  var text = "{{#bar}}{{#foo}}c{{/foo}}{{/bar}}"
  var tree = Bogus.parse(Bogus.scan(text));

  test.equal(tree.length, 1, "one node at base");
  test.equal(tree[0].tag, "#", "open section is first node");
  test.equal(tree[0].n, "bar", "first section name is 'bar'");
  test.equal(tree[0].nodes.length, 1, "first section contains one node.");
  test.equal(tree[0].nodes[0].n, "foo", "correct name for nested section");
  test.equal(tree[0].nodes[0].nodes[0]+'', "c", "correct text in nested section");
  test.end();
});

tap.test("Missing Closing Tag", function(test) {
  var text = "a{{#foo}}bc";
  test.throws(function() {
    var tree = Bogus.parse(Bogus.scan(text));
  }, {
    name: "Error",
    message: "missing closing tag: foo"
  }, "Error is generated");
  test.end();
});

tap.test("Bad Nesting", function(test) {
  var text = "a{{#foo}}{{#bar}}b{{/foo}}{{/bar}}c";
  test.throws(function() {
    var tree = Bogus.parse(Bogus.scan(text));
  }, {
    name: "Error",
    message: "Nesting error: bar vs. foo"
  }, "Error is generated");
  test.end();
});

tap.test("Basic Output", function(test) {
  var text = "test";
  var t = Bogus.compile(text);
  test.equal(t.render(), text, "template renders one text node");
  test.end();
});

// FIXME: This test is disabled in 2.0.0.
/*
tap.test("Basic Output As String", function(test) {
  var text = "test";
  var textFunc = Bogus.compile(text, true);
  test.equal(textFunc, "function(context, partials){this.buffer.push('test');};", "template renders correct text function.");
  test.end();
});
 */

tap.test("One Variable", function(test) {
  var text = "test {{foo}} test";
  var t = Bogus.compile(text);
  var s = t.render({foo:'bar'});
  test.equal(s, "test bar test", "basic variable substitution works.");
  test.end();
});

// FIXME: This test is disabled in 2.0.0.
/*
tap.test("One Variable As String", function(test) {
  var text = "test {{foo}} test";
  var funcText = Bogus.compile(text, true);
  test.equal(funcText, "function(context, partials){this.buffer.push('test ');\nthis.buffer.push(this.find('foo', context));\nthis.buffer.push(' test');};",
     "Function text is correct with variable substitution.");
  test.end();
});
 */

tap.test("Render With Whitespace", function(test) {
  var text = "{{ string }}";
  var t = Bogus.compile(text);
  test.equal(t.render({string: "---" }), "---", "tags with whitespace render correctly.");
  test.end();
});

tap.test("Render With Whitespace Around Triple Stache", function(test) {
  var text = "  {{{string}}}\n";
  var t = Bogus.compile(text);
  test.equal(t.render({string: "---" }), "  ---\n", "triple stache surrounded by whitespace render correctly.");
  test.end();
});

tap.test("Render With Whitespace Around Ampersand", function(test) {
  var text = "  {{& string }}\n";
  var t = Bogus.compile(text);
  test.equal(t.render({string: "---" }), "  ---\n", "ampersand surrounded by whitespace render correctly.");
  test.end();
});

tap.test("Multiple Variables", function(test) {
  var text = "test {{foo}} test {{bar}} test {{baz}} test {{foo}} test";
  var t = Bogus.compile(text);
  var s = t.render({foo:'42', bar: '43', baz: '44'});
  test.equal(s, "test 42 test 43 test 44 test 42 test", "all variables render correctly.");
  test.end();
});

tap.test("Number Values", function(test) {
  var text = "integer: {{foo}} float: {{bar}} negative: {{baz}}";
  var t = Bogus.compile(text);
  var s = t.render({foo: 42, bar: 42.42, baz: -42});
  test.equal(s, "integer: 42 float: 42.42 negative: -42", "numbers render correctly");
  test.end();
});

tap.test("Object Render", function(test) {
  var text = "object: {{foo}}";
  var t = Bogus.compile(text);
  var s = t.render({foo: {}});
  test.equal(s, "object: [object Object]", "objects render default toString.");
  test.end();
});

tap.test("Object To String Render", function(test) {
  var text = "object: {{foo}}";
  var t = Bogus.compile(text);
  var s = t.render({foo: {toString: function(test){ return "yo!"}}});
  test.equal(s, "object: yo!", "objects render supplied toString.");
  test.end();
});

tap.test("Array Render", function(test) {
  var text = "array: {{foo}}";
  var t = Bogus.compile(text);
  var s = t.render({foo: ["a","b","c"]});
  test.equal(s, "array: a,b,c", "arrays render default toString.");
  test.end();
});

tap.test("Escaping", function(test) {
  var text = "{{foo}}";
  var t = Bogus.compile(text);
  var s = t.render();
  var s = t.render({foo: "< > <div> \' \" &"});
  test.equal(s, "&lt; &gt; &lt;div&gt; &#39; &quot; &amp;", "input correctly escaped.");

  var ec ={ "'": "&#39;", '"': "&quot;", "<": "&lt;", ">": "&gt;", "&": "&amp;"}
  for (var char in ec) {
    var s = t.render({foo: char + " just me"});
    test.equal(s, ec[char] + " just me", "input correctly escaped.");
  }
  test.end();
});

tap.test("Mustache Injection", function(test) {
  var text = "{{foo}}";
  var t = Bogus.compile(text);
  s = t.render({foo:"{{{<42}}}"})
  test.equal(s, "{{{&lt;42}}}", "Can't inject mustache");
  test.end();
});

tap.test("Triple Stache", function(test) {
  var text = "{{{foo}}}";
  var t = Bogus.compile(text);
  var s = t.render({foo: "< > <div> \' \" &"});
  test.equal(s, "< > <div> \' \" &", "input correctly not-escaped.");
  test.end();
});

tap.test("Amp No Escaping", function(test) {
  var text = "{{&foo}}";
  var t = Bogus.compile(text);
  var s = t.render({foo: "< > <div> \' \" &"});
  test.equal(s, "< > <div> \' \" &", "input correctly not-escaped.");
  test.end();
});

tap.test("Partial", function(test) {
  var partialText = "this is text from the partial--the magic number {{foo}} is from a variable";
  var p = Bogus.compile(partialText);

  var text = "This template contains a partial ({{>testPartial}})."
  var t = Bogus.compile(text);

  var s = t.render({foo: 42}, {testPartial: p});
  test.equal(s, "This template contains a partial (this is text from the partial--the magic number 42 is from a variable).", "partials work");
  test.end();
});

tap.test("Nested Partials", function(test) {
  var partialText = "this is text from the partial--the magic number {{foo}} is from a variable";
  var p = Bogus.compile(partialText);

  var partialText2 = "This template contains a partial ({{>testPartial}})."
  var p2 = Bogus.compile(partialText2);

  var text = "This template contains a partial that contains a partial [{{>testPartial2}}]."
  var t = Bogus.compile(text);

  var s = t.render({foo: 42}, {testPartial: p, testPartial2: p2});
  test.equal(s, "This template contains a partial that contains a partial [This template contains a partial (this is text from the partial--the magic number 42 is from a variable).].", "nested partials work");
  test.end();
});

tap.test("Negative Section", function(test) {
  var text = "This template {{^foo}}BOO {{/foo}}contains an inverted section."
  var t = Bogus.compile(text);
  var s = t.render();
  test.equal(s, "This template BOO contains an inverted section.", "inverted sections with no context work");

  s = t.render({foo:[]});
  test.equal(s, "This template BOO contains an inverted section.", "inverted sections with empty list context work");

  s = t.render({ foo:false });
  test.equal(s, "This template BOO contains an inverted section.", "inverted sections with false context work");

  s = t.render({foo:''});
  test.equal(s, "This template contains an inverted section.", "inverted sections with empty string context work");

  s = t.render({foo:true});
  test.equal(s, "This template contains an inverted section.", "inverted sections with true context work");

  s = t.render({foo: function() { return false; }});
  test.equal(s, "This template BOO contains an inverted section.", "inverted sections with false returning method in context work");
  test.end();
});

tap.test("Section Elision", function(test) {
  var text = "This template {{#foo}}BOO {{/foo}}contains a section."
  var t = Bogus.compile(text);
  var s = t.render();
  test.equal(s, "This template contains a section.", "sections with no context work");

  s = t.render({foo:[]});
  test.equal(s, "This template contains a section.", "sections with empty list context work");

  s = t.render({foo:false});
  test.equal(s, "This template contains a section.", "sections with false context work");
  test.end();
});

tap.test("Section Object Context", function(test) {
  var text = "This template {{#foo}}{{bar}} {{/foo}}contains a section."
  var t = Bogus.compile(text);
  var s = t.render({foo:{bar:42}});
  test.equal(s, "This template 42 contains a section.", "sections with object context work");
  test.end();
});

tap.test("Section Array Context", function(test) {
  var text = "This template {{#foo}}{{bar}} {{/foo}}contains a section."
  var t = Bogus.compile(text);
  var s = t.render({foo:[{bar:42}, {bar:43}, {bar:44}]});
  test.equal(s, "This template 42 43 44 contains a section.", "sections with object ctx and array values work");
  test.end();
});

tap.test("Falsy Variable No Render", function(test) {
  var text = "I ({{cannot}}) be seen!";
  var t = Bogus.compile(text);
  var s = t.render();
  test.equal(s, "I () be seen!", "missing value doesn't render.");
  test.end();
});

tap.test("Undefined Return Value From Lambda", function(test) {
  var text = "abc{{foo}}def";
  var t = Bogus.compile(text);
  var context = {
    foo: function(s) {
      return undefined;
    }
  }
  var s = t.render(context);
  test.equal(s, "abcdef", "deal with undefined return values from lambdas.")
  test.end();
});

tap.test("Section Extensions", function(test) {
  var text = "Test {{_//|__foo}}bar{{/foo}}";
  var options = {sectionTags:[{o:'_//|__foo', c:'foo'}]};
  var tree = Bogus.parse(Bogus.scan(text), text, options);
  test.equal(tree[1].tag, "#", "_//|__foo node transformed to section");
  test.equal(tree[1].n, "_//|__foo", "_//|__foo node transformed to section");

  var t = Bogus.compile(text, options );
  var s = t.render({'_//|__foo':true});
  test.equal(s, "Test bar", "Custom sections work");
  test.end();
});

tap.test("Misnested Section Extensions", function(test) {
  var text = "Test {{__foo}}bar{{/bar}}";
  var options = {sectionTags:[{o:'__foo', c:'foo'}, {o:'__bar', c:'bar'}]};
  test.throws(function() {
    var tree = Bogus.parse(Bogus.scan(text), text, options);
  }, {
    name: "Error",
    message: "Nesting error: __foo vs. bar"
  }, "Error is generated");
  test.end();
});

tap.test("Section Extensions In Higher Order Sections", function(test) {
  var text = "Test{{_foo}}bar{{/foo}}";
  var options = {sectionTags:[{o:'_foo', c:'foo'}, {o:'_baz', c:'baz'}]};
  var t = Bogus.compile(text, options);
  var context = {
    "_foo": function (s) {
      return "{{_baz}}" + s + "{{/baz}}";
    }
  }
  var s = t.render(context);
  test.equal(s, "Test", "unprocessed test");
  test.end();
});

tap.test("Section Extensions In Lambda Replace Variable", function(test) {
  var text = "Test{{foo}}";
  var options = {sectionTags:[{o:'_baz', c:'baz'}]};
  var t = Bogus.compile(text, options);
  var context = {
    "foo": function () {
      return function() { "{{_baz}}" + s + "{{/baz}}"; };
    }
  }
  var s = t.render(context);
  test.equal(s, "Test", "unprocessed test");
  test.end();
});

tap.test("Mustache not reprocessed for method calls in interpolations", function(test) {
  var text = "text with {{foo}} inside";
  var t = Bogus.compile(text);
  var context = {
    foo: function() {
      return "no processing of {{tags}}";
    }
  }
  var s = t.render(context);
  test.equal(s, "text with no processing of {{tags}} inside", "method calls should not be processed as mustache.");

  var text = "text with {{{foo}}} inside";
  var t = Bogus.compile(text);
  var s = t.render(context);
  test.equal(s, "text with no processing of {{tags}} inside", "method calls should not be processed as mustache in triple staches.");
  test.end();
});

tap.test("Mustache is reprocessed for lambdas in interpolations", function(test) {
  var text = "text with {{foo}} inside";
  var t = Bogus.compile(text);
  var context = {
    bar: "42",
    foo: function() {
      return function() {
        return "processing of {{bar}}";
      };
    }
  };
  var s = t.render(context);
  test.equal(s, "text with processing of 42 inside", "the return value of lambdas should be processed mustache.");
  test.end();
});

tap.test("Nested Section", function(test) {
  var text = "{{#foo}}{{#bar}}{{baz}}{{/bar}}{{/foo}}";
  var t = Bogus.compile(text);
  var s = t.render({foo: 42, bar: 42, baz:42});
  test.equal(s, "42", "can reach up context stack");
  test.end();
});

tap.test("Dotted Names", function(test) {
  var text = '"{{person.name}}" == "{{#person}}{{name}}{{/person}}"';
  var t = Bogus.compile(text);
  var s = t.render({person:{name:'Joe'}});
  test.equal(s, '"Joe" == "Joe"', "dotted names work");
  test.end();
});

tap.test("Implicit Iterator", function(test) {
  var text = '{{#stuff}} {{.}} {{/stuff}}';
  var t = Bogus.compile(text);
  var s = t.render({stuff:[42,43,44]});
  test.equal(s, " 42  43  44 ", "implicit iterators work");
  test.end();
});

tap.test("Partials And Delimiters", function(test) {
  var text = '{{>include}}*\n{{= | | =}}\n*|>include|';
  var partialText = ' .{{value}}. ';
  var partial = Bogus.compile(partialText);
  var t = Bogus.compile(text);
  var s = t.render({value:"yes"}, {'include':partial});
  test.equal(s, " .yes. *\n* .yes. ", "partials work around delimiters");
  test.end();
});

tap.test("String Partials", function(test) {
  var text = "foo{{>mypartial}}baz";
  var partialText = " bar ";
  var t = Bogus.compile(text);
  var s = t.render({}, {'mypartial': partialText});
  test.equal(s, "foo bar baz", "string partial works.");
  test.end();
});

tap.test("Missing Partials", function(test) {
  var text = "foo{{>mypartial}} bar";
  var t = Bogus.compile(text);
  var s = t.render({});
  test.equal(s, "foo bar", "missing partial works.");
  test.end();
});

tap.test("Indented Standalone Comment", function(test) {
  var text = 'Begin.\n {{! Indented Comment Block! }}\nEnd.';
  var t = Bogus.compile(text);
  var s = t.render();
  test.equal(s, 'Begin.\nEnd.', "Standalone comment blocks are removed.");
  test.end();
});

tap.test("New Line Between Delimiter Changes", function(test) {
  var data = { section: true, data: 'I got interpolated.' };
  var text = '\n{{#section}}\n {{data}}\n |data|\n{{/section}}x\n\n{{= | | =}}\n|#section|\n {{data}}\n |data|\n|/section|';
  var t = Bogus.compile(text);
  var s = t.render(data);
  test.equal(s, '\n I got interpolated.\n |data|\nx\n\n {{data}}\n I got interpolated.\n', 'render correct')
  test.end();
});

tap.test("Mustache JS Apostrophe", function(test) {
  var text = '{{apos}}{{control}}';
  var t = Bogus.compile(text);
  var s = t.render({'apos':"'", 'control':"X"});
  test.equal(s, '&#39;X', 'Apostrophe is escaped.');
  test.end();
});

tap.test("Mustache JS Array Of Implicit Partials", function(test) {
  var text = 'Here is some stuff!\n{{#numbers}}\n{{>partial}}\n{{/numbers}}\n';
  var partialText = '{{.}}\n';
  var t = Bogus.compile(text);
  var s = t.render({numbers:[1,2,3,4]}, {partial: partialText});
  test.equal(s, 'Here is some stuff!\n1\n2\n3\n4\n', 'Partials with implicit iterators work.');
  test.end();
});

tap.test("Mustache JS Array Of Partials", function(test) {
  var text = 'Here is some stuff!\n{{#numbers}}\n{{>partial}}\n{{/numbers}}\n';
  var partialText = '{{i}}\n';
  var t = Bogus.compile(text);
  var s = t.render({numbers:[{i:1},{i:2},{i:3},{i:4}]}, {partial: partialText});
  test.equal(s, 'Here is some stuff!\n1\n2\n3\n4\n', 'Partials with arrays work.');
  test.end();
});

tap.test("Mustache JS Array Of Strings", function(test) {
  var text = '{{#strings}}{{.}} {{/strings}}';
  var t = Bogus.compile(text);
  var s = t.render({strings:['foo', 'bar', 'baz']});
  test.equal(s, 'foo bar baz ', 'array of strings works with implicit iterators.');
  test.end();
});

tap.test("Mustache JS Undefined String", function(test) {
  var text = 'foo{{bar}}baz';
  var t = Bogus.compile(text);
  var s = t.render({bar:undefined});
  test.equal(s, 'foobaz', 'undefined value does not render.');
  test.end();
});

tap.test("Mustache JS Undefined Triple Stache", function(test) {
  var text = 'foo{{{bar}}}baz';
  var t = Bogus.compile(text);
  var s = t.render({bar:undefined});
  test.equal(s, 'foobaz', 'undefined value does not render in triple stache.');
  test.end();
});

tap.test("Mustache JS Null String", function(test) {
  var text = 'foo{{bar}}baz';
  var t = Bogus.compile(text);
  var s = t.render({bar:null});
  test.equal(s, 'foobaz', 'undefined value does not render.');
  test.end();
});

tap.test("Mustache JS Null Triple Stache", function(test) {
  var text = 'foo{{{bar}}}baz';
  var t = Bogus.compile(text);
  var s = t.render({bar:null});
  test.equal(s, 'foobaz', 'undefined value does not render in triple stache.');
  test.end();
});

tap.test("Mustache JS Triple Stache Alt Delimiter", function(test) {
  var text = '{{=<% %>=}}<% foo %> {{foo}} <%{bar}%> {{{bar}}}';
  var t = Bogus.compile(text);
  var s = t.render({foo:'yeah', bar:'hmm'});
  test.equal(s, 'yeah {{foo}} hmm {{{bar}}}', 'triple stache inside alternate delimiter works.');
  test.end();
});

/* Safety tests */

tap.test("Updates object state", function(test) {
  var text = '{{foo}} {{bar}} {{foo}}';
  var t = Bogus.compile(text);
  var s = t.render({foo: 1, bar: function() { this.foo++; return 42; } });
  test.equal(s, '1 42 2');
  test.end();
});

/* shootout benchmark tests */

tap.test("Shoot Out String", function(test) {
  var text = "Hello World!";
  var expected = "Hello World!"
  var t = Bogus.compile(text)
  var s = t.render({})
  test.equal(s, expected, "Shootout String compiled correctly");
  test.end();
});

tap.test("Shoot Out Replace", function(test) {
  var text = "Hello {{name}}! You have {{count}} new messages.";
  var expected = "Hello Mick! You have 30 new messages.";
  var t = Bogus.compile(text)
  var s = t.render({ name: "Mick", count: 30 })
  test.equal(s, expected, "Shootout Replace compiled correctly");
  test.end();
});

tap.test("Shoot Out Array", function(test) {
  var text = "{{#names}}{{name}}{{/names}}";
  var expected = "MoeLarryCurlyShemp";
  var t = Bogus.compile(text);
  var s = t.render({ names: [{name: "Moe"}, {name: "Larry"}, {name: "Curly"}, {name: "Shemp"}] })
  test.equal(s, expected, "Shootout Array compiled correctly");
  test.end();
});

tap.test("Shoot Out Object", function(test) {
  var text = "{{#person}}{{name}}{{age}}{{/person}}";
  var expected = "Larry45";
  var t = Bogus.compile(text)
  var s = t.render({ person: { name: "Larry", age: 45 } })
  test.equal(s, expected, "Shootout Object compiled correctly");
  test.end();
});

tap.test("Shoot Out Partial", function(test) {
  var text = "{{#peeps}}{{>replace}}{{/peeps}}";
  var t = Bogus.compile(text);
  var partial = Bogus.compile(" Hello {{name}}! You have {{count}} new messages.");
  var s = t.render({ peeps: [{name: "Moe", count: 15}, {name: "Larry", count: 5}, {name: "Curly", count: 2}] }, { replace: partial });
  var expected = " Hello Moe! You have 15 new messages. Hello Larry! You have 5 new messages. Hello Curly! You have 2 new messages.";
  test.equal(s, expected, "Shootout Partial compiled correctly");
  test.end();
});

tap.test("Shoot Out Recurse", function(test) {
  var text = "{{name}}{{#kids}}{{>recursion}}{{/kids}}";
  var t = Bogus.compile(text);
  var partial = Bogus.compile("{{name}}{{#kids}}{{>recursion}}{{/kids}}");
  var s = t.render({
                name: '1',
                kids: [
                  {
                    name: '1.1',
                    kids: [
                      { name: '1.1.1', kids: [] }
                    ]
                  }
                ]
              }, { recursion: partial });
  var expected = "11.11.1.1";
  test.equal(s, expected, "Shootout Recurse compiled correctly");
  test.end();
});

tap.test("Shoot Out Filter", function(test) {
  var text = "{{#filter}}foo {{bar}}{{/filter}}";
  var t = Bogus.compile(text);
  var s = t.render({
    filter: function() {
      return function(text) {
        return text.toUpperCase() + "{{bar}}";
      }
    },
    bar: "bar"
  });
  var expected = "FOO bar"
  test.equal(s, expected, "Shootout Filter compiled correctly");
  test.end();
});

tap.test("Shoot Out Complex", function(test) {
  var text =
    "<h1>{{header}}</h1>" +
    "{{#hasItems}}" +
    "<ul>" +
      "{{#items}}" +
        "{{#current}}" +
          "<li><strong>{{name}}</strong></li>" +
        "{{/current}}" +
        "{{^current}}" +
          "<li><a href=\"{{url}}\">{{name}}</a></li>" +
        "{{/current}}" +
      "{{/items}}" +
    "</ul>" +
    "{{/hasItems}}" +
    "{{^hasItems}}" +
      "<p>The list is empty.</p>" +
    "{{/hasItems}}";

  var expected = "<h1>Colors</h1><ul><li><strong>red</strong></li><li><a href=\"#Green\">green</a></li><li><a href=\"#Blue\">blue</a></li></ul>";
  var t = Bogus.compile(text)
  var s = t.render({
     header: function() {
       return "Colors";
     },
     items: [
       {name: "red", current: true, url: "#Red"},
       {name: "green", current: false, url: "#Green"},
       {name: "blue", current: false, url: "#Blue"}
     ],
     hasItems: function() {
       return this.items.length !== 0;
     },
     empty: function() {
       return this.items.length === 0;
     }
  })

  test.equal(s, expected, "Shootout Complex compiled correctly");
  test.end();
});

const HOGAN_TEST = './node_modules/hogan.js/test';
['list'].forEach(function(name) {
  tap.test("Render Output: " + name, function(test) {
    var tmpl = fs.readFileSync(HOGAN_TEST + '/templates/' + name + '.mustache', 'utf-8');
    var html = fs.readFileSync(HOGAN_TEST + '/html/' + name + '.html', 'utf-8');
    var r = Bogus.compile(tmpl).render({});
    test.equal(r, html, name + ': should correctly render html');
    test.end();
  });
});

tap.test("Default Render Impl", function(test) {
  var ht = new Bogus.Template();
  test.equal(ht.render() === '', true, 'default renderImpl returns an array.');
  test.end();
});
