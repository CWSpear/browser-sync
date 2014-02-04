"use strict";

var index = require("../../lib/index");
var messages = require("../../lib/messages");
var ansiTrim = require("cli-color/lib/trim");

var assert = require("chai").assert;


describe("Messages module", function () {
    it("can be loaded", function () {
        assert.isDefined(messages);
    });
});

describe("Update Checks", function () {
    it("should output prompt to update", function () {
        var expected = "\n\n[BS] ----------------------------------------\n";
        expected    += "[BS] Update Available: 1.2.2 (current: 1.0.0)\n";
        expected    += "[BS] Run npm update -g browser-sync to update\n";
        expected    += "[BS] ----------------------------------------\n\n";
        var actual = ansiTrim(messages.update.prompt("1.2.2", "1.0.0"));
        assert.equal(actual, expected);
    });
    it("should confirm using latest", function () {
        var expected = "[BS] We checked - you're running the latest version of BrowserSync :)\n";
        expected    += "[BS] (You can disable this check in the options)\n";
        var actual = ansiTrim(messages.update.confirm());
        assert.equal(actual, expected);
    });
});

describe("No server or Proxy output", function () {
    it("should output the", function () {
        var expected = "\n[BS] Copy the following snippet into your website, just before the closing </body> tag";
        expected    += "\n\n<script src='//192.168.0.4:3000/socket.io/socket.io.js'></script>\n";
        expected    += "<script>var ___socket___ = io.connect('http://192.168.0.4:3000');</script>\n";
        expected    += "<script src='//192.168.0.4:3001/client/browser-sync-client.min.js'></script>\n";

        var actual   = ansiTrim(messages.init("192.168.0.4", {socket: 3000, controlPanel: 3001}));
        assert.equal(actual, expected);
    });
});

describe("Server Output", function () {
    it("Can confirm the server is running", function () {
        var expected = "[BS] Server running. Use this URL: http://0.0.0.0:8000\n";
        expected    += "[BS] Serving files from: /users/shakyshane/app/files";
        var actual = ansiTrim(messages.initServer("0.0.0.0", 8000, "/users/shakyshane/app/files"));
        assert.equal(actual, expected);
    });
    it("can fail when both server & proxy supplied", function () {
        var expected = "[BS] Invalid config. You cannot specify both a server & proxy option.";
        var actual   = ansiTrim(messages.server.withProxy());
        assert.equal(actual, expected);
    });
});

describe("Proxy Output", function () {

    var ports, host;

    beforeEach(function () {
        ports = [3000, 3001, 3002];
        host = "192.168.0.3";
    });
    it("can output a message about proxy (1)", function () {
        var expected = "[BS] Proxy running. Use this URL: http://192.168.0.3:3002";
        var actual   = ansiTrim(messages.initProxy(host, ports[2]));
        assert.equal(actual, expected);
    });
    it("can output a message about proxy (2)", function () {
        var expected = "[BS] Proxy running. Use this URL: http://192.168.0.3:3001";
        var actual   = ansiTrim(messages.initProxy(host, ports[1]));
        assert.equal(actual, expected);
    });
});

describe("Creating URLS", function () {
    it("can return a full URL with ports", function () {
        var expected = "http://192.168.0.4:3001";
        var actual   = messages._makeUrl("192.168.0.4", 3001, "http:");
        assert.equal(actual, expected);
    });
});

describe("Port Errors", function () {
    it("can print a error msg before killing process", function () {
        var expected = "[BS] Invalid port range! - At least 3 required!";
        var actual   = ansiTrim(messages.ports.invalid(3));
        assert.equal(actual, expected);
    });
});

describe("Outputting script tags", function () {
    var ports;
    before(function () {
        ports = {
            socket: 3000,
            controlPanel: 3001
        };
    });
    it("can output Socket.io & Client Scripts correctly", function () {
        var expected = "<script src='//192.168.0.4:3000/socket.io/socket.io.js'></script>\n";
        expected    += "<script>var ___socket___ = io.connect('http://192.168.0.4:3000');</script>\n";
        expected    += "<script src='//192.168.0.4:3001/client/browser-sync-client.min.js'></script>\n";

        var actual = messages.scriptTags("192.168.0.4", ports, {});
        assert.equal(actual, expected);
    });
    it("can output Socket.io & Control Panel Script correctly", function () {
        var expected = "<script src='//192.168.0.4:3000/socket.io/socket.io.js'></script>\n";
        expected    += "<script>var ___socket___ = io.connect('http://192.168.0.4:3000');</script>\n";
        expected    += "<script src='//192.168.0.4:3001/js/app.js'></script>\n";

        var actual = messages.scriptTags("192.168.0.4", ports, {}, "controlPanel");
        assert.equal(actual, expected);
    });
});

describe("outputting the client Script", function () {
    it("should default to the uglified file", function () {
        var expected = "/client/browser-sync-client.min.js";
        var actual   = messages.clientScript();
        assert.equal(actual, expected);
    });
    it("should output the dev file if devmode activated in options", function () {
        var expected = "/client/browser-sync-client.js";
        var actual   = messages.clientScript({ devMode:true });
        assert.equal(actual, expected);
    });
});

describe("Outputting shims JS", function () {
    it("should return the client-shim js file", function () {
        var expected = "/client/client-shims.js";
        var actual   = messages.client.shims;
        assert.equal(actual, expected);
    });
});

describe("Outputting App JS", function () {
    it("should return the app js file", function () {
        var expected = "/js/app.js";
        var actual   = messages.controlPanel.jsFile;
        assert.equal(actual, expected);
    });
});

describe("Outputting the config created message", function () {
    it("should accept the params and print the correct message", function () {
        var expected  = "[BS] Config file created (bs-config.js)\n";
            expected += "[BS] To use it, in the same directory run: browser-sync";
        var actual    = ansiTrim(messages.config.confirm("/users/shakyshane/app/bs-config.js"));
        assert.equal(actual, expected);
    });
    it("should accept the params and print the correct message (2)", function () {
        var expected  = "[BS] Config file created (bs-config.js)\n";
            expected += "[BS] To use it, in the same directory run: browser-sync";
        var actual    = ansiTrim(messages.config.confirm("/app/bs-config.js"));
        assert.equal(actual, expected);
    });
});

describe("Outputting generic messages", function () {
    it("should output browser connected correctly", function () {
        var expected = "[BS] Browser Connected! (Chrome, version: 21.222)";
        var actual = ansiTrim(messages.browser.connection({name: "Chrome", version: "21.222"}));
        assert.equal(actual, expected);
    });
    it("should output invalid base dir message", function () {
        var expected = "[BS] Invalid Base Directory path for server. Should be like this ( baseDir: 'path/to/app' )";
        var actual = ansiTrim(messages.invalidBaseDir());
        assert.equal(actual, expected);
    });
});

describe("Outputting file watching messages", function () {
    it("should output warning if no files watched", function () {
        var expected = "[BS] Not watching any files...";
        var actual = ansiTrim(messages.files.watching([]));
        assert.equal(actual, expected);
    });
    it("should output a file-watching message", function () {
        var expected = "[BS] Watching files...";
        var actual = ansiTrim(messages.files.watching(["**/*.css"]));
        assert.equal(actual, expected);
    });
    it("should notify when a file is changed (1)", function () {
        var expected = "[BS] File Changed: file.js";
        var actual   = ansiTrim(messages.files.changed("/users/shane/file.js"));
        assert.equal(actual, expected);
    });
    it("should notify when a file is changed (2)", function () {
        var expected = "[BS] File Changed: file.js";
        var actual   = ansiTrim(messages.files.changed("/file.js"));
        assert.equal(actual, expected);
    });
    it("should notify when a file is changed & should be reloaded", function () {
        var expected = "[BS] Reloading all connected browsers...";
        var actual   = ansiTrim(messages.browser.reload());
        assert.equal(actual, expected);
    });
    it("should notify when a file is changed & should be injected", function () {
        var expected = "[BS] Injecting file into all connected browsers...";
        var actual   = ansiTrim(messages.browser.inject());
        assert.equal(actual, expected);
    });
    it("should notify when changing location", function () {
        var expected = "[BS] Link clicked! Redirecting all browsers to http://local.dev/forms.html";
        var actual   = ansiTrim(messages.location("http://local.dev/forms.html"));
        assert.equal(actual, expected);
    });
    it("should output the socket connector", function () {
        var expected = "var ___socket___ = io.connect('http://0.0.0.0:3001');";
        var actual   = messages.socketConnector("0.0.0.0", 3001);
        assert.equal(actual, expected);
    });
});
