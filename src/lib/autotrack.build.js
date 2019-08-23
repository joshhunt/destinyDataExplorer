/* eslint-disable */

(function() {
  var f =
      "function" == typeof Object.defineProperties
        ? Object.defineProperty
        : function(a, b, c) {
            if (c.get || c.set)
              throw new TypeError("ES3 does not support getters and setters.");
            a != Array.prototype && a != Object.prototype && (a[b] = c.value);
          },
    g =
      "undefined" != typeof window && window === this
        ? this
        : "undefined" != typeof global && null != global
        ? global
        : this;
  function h() {
    h = function() {};
    g.Symbol || (g.Symbol = k);
  }
  var l = 0;
  function k(a) {
    return "jscomp_symbol_" + (a || "") + l++;
  }
  function m() {
    h();
    var a = g.Symbol.iterator;
    a || (a = g.Symbol.iterator = g.Symbol("iterator"));
    "function" != typeof Array.prototype[a] &&
      f(Array.prototype, a, {
        configurable: !0,
        writable: !0,
        value: function() {
          return n(this);
        }
      });
    m = function() {};
  }
  function n(a) {
    var b = 0;
    return p(function() {
      return b < a.length ? { done: !1, value: a[b++] } : { done: !0 };
    });
  }
  function p(a) {
    m();
    a = { next: a };
    a[g.Symbol.iterator] = function() {
      return this;
    };
    return a;
  }
  function r(a) {
    m();
    h();
    m();
    var b = a[Symbol.iterator];
    return b ? b.call(a) : n(a);
  }
  function t(a) {
    if (!(a instanceof Array)) {
      a = r(a);
      for (var b, c = []; !(b = a.next()).done; ) c.push(b.value);
      a = c;
    }
    return a;
  }
  var u = /:(80|443)$/,
    v = document.createElement("a"),
    w = {};
  function y(a) {
    a = a && "." != a ? a : location.href;
    if (w[a]) return w[a];
    v.href = a;
    if ("." == a.charAt(0) || "/" == a.charAt(0)) return y(v.href);
    var b = "80" == v.port || "443" == v.port ? "" : v.port,
      b = "0" == b ? "" : b,
      c = v.host.replace(u, "");
    return (w[a] = {
      hash: v.hash,
      host: c,
      hostname: v.hostname,
      href: v.href,
      origin: v.origin ? v.origin : v.protocol + "//" + c,
      pathname: "/" == v.pathname.charAt(0) ? v.pathname : "/" + v.pathname,
      port: b,
      protocol: v.protocol,
      search: v.search
    });
  }
  var z = [];
  function A(a, b) {
    var c = this;
    this.context = a;
    this.h = b;
    this.f = (this.c = /Task$/.test(b)) ? a.get(b) : a[b];
    this.b = [];
    this.a = [];
    this.g = function(a) {
      for (var b = [], d = 0; d < arguments.length; ++d)
        b[d - 0] = arguments[d];
      return c.a[c.a.length - 1].apply(null, [].concat(t(b)));
    };
    this.c ? a.set(b, this.g) : (a[b] = this.g);
  }
  function B(a, b) {
    a.b.push(b);
    C(a);
  }
  function D(a, b) {
    b = a.b.indexOf(b);
    -1 < b &&
      (a.b.splice(b, 1),
      0 < a.b.length
        ? C(a)
        : ((b = z.indexOf(a)),
          -1 < b &&
            (z.splice(b, 1),
            a.c ? a.context.set(a.h, a.f) : (a.context[a.h] = a.f))));
  }
  function C(a) {
    a.a = [];
    for (var b, c = 0; (b = a.b[c]); c++) {
      var d = a.a[c - 1] || a.f.bind(a.context);
      a.a.push(b(d));
    }
  }
  function E(a, b) {
    var c = z.filter(function(c) {
      return c.context == a && c.h == b;
    })[0];
    c || ((c = new A(a, b)), z.push(c));
    return c;
  }
  function F(a, b, c) {
    var d = { transport: "beacon" };
    if ("function" == typeof c) {
      var e = b.get("buildHitTask");
      return {
        buildHitTask: function(b) {
          b.set(d, null, !0);
          b.set(a, null, !0);
          c(b, void 0, void 0);
          e(b);
        }
      };
    }
    return G({}, d, a);
  }
  var G =
    Object.assign ||
    function(a, b) {
      for (var c = [], d = 1; d < arguments.length; ++d)
        c[d - 1] = arguments[d];
      for (var d = 0, e = c.length; d < e; d++) {
        var x = Object(c[d]),
          q;
        for (q in x)
          Object.prototype.hasOwnProperty.call(x, q) && (a[q] = x[q]);
      }
      return a;
    };
  function H(a, b) {
    var c = window.GoogleAnalyticsObject || "ga";
    window[c] =
      window[c] ||
      function(a) {
        for (var b = [], d = 0; d < arguments.length; ++d)
          b[d - 0] = arguments[d];
        (window[c].q = window[c].q || []).push(b);
      };
    window.gaDevIds = window.gaDevIds || [];
    0 > window.gaDevIds.indexOf("i5iSjo") && window.gaDevIds.push("i5iSjo");
    window[c]("provide", a, b);
    window.gaplugins = window.gaplugins || {};
    window.gaplugins[a.charAt(0).toUpperCase() + a.slice(1)] = b;
  }
  var I = { j: 1, m: 2, o: 3, u: 4, v: 5, w: 6, A: 7, B: 8, l: 9, s: 10 },
    J = Object.keys(I).length;
  function K(a, b) {
    var c = a.get("\x26_au"),
      c = parseInt(c || "0", 16).toString(2);
    if (c.length < J) for (var d = J - c.length; d; ) (c = "0" + c), d--;
    b = J - b;
    c = c.substr(0, b) + 1 + c.substr(b + 1);
    a.set("\x26_au", parseInt(c || "0", 2).toString(16));
  }
  function L(a, b) {
    var c = I.j;
    a.set("\x26_av", "2.4.1");
    K(a, c);
    this.a = G({}, b);
    this.g = a;
    this.b =
      this.a.stripQuery && this.a.queryDimensionIndex
        ? "dimension" + this.a.queryDimensionIndex
        : null;
    this.f = this.f.bind(this);
    this.c = this.c.bind(this);
    b = this.f;
    B(E(a, "get"), b);
    b = this.c;
    B(E(a, "buildHitTask"), b);
  }
  L.prototype.f = function(a) {
    var b = this;
    return function(c) {
      if ("page" == c || c == b.b) {
        var d = { location: a("location"), page: a("page") };
        return M(b, d)[c];
      }
      return a(c);
    };
  };
  L.prototype.c = function(a) {
    var b = this;
    return function(c) {
      var d = M(b, { location: c.get("location"), page: c.get("page") });
      c.set(d, null, !0);
      a(c);
    };
  };
  function M(a, b) {
    var c = y(b.page || b.location),
      d = c.pathname;
    if (a.a.indexFilename) {
      var e = d.split("/");
      a.a.indexFilename == e[e.length - 1] &&
        ((e[e.length - 1] = ""), (d = e.join("/")));
    }
    "remove" == a.a.trailingSlash
      ? (d = d.replace(/\/+$/, ""))
      : "add" == a.a.trailingSlash &&
        (/\.\w+$/.test(d) || "/" == d.substr(-1) || (d += "/"));
    d = { page: d + (a.a.stripQuery ? N(a, c.search) : c.search) };
    b.location && (d.location = b.location);
    a.b && (d[a.b] = c.search.slice(1) || "(not set)");
    return "function" == typeof a.a.urlFieldsFilter
      ? ((b = a.a.urlFieldsFilter(d, y)),
        (c = {
          page: b.page,
          location: b.location
        }),
        a.b && (c[a.b] = b[a.b]),
        c)
      : d;
  }
  function N(a, b) {
    if (Array.isArray(a.a.queryParamsWhitelist)) {
      var c = [];
      b.slice(1)
        .split("\x26")
        .forEach(function(b) {
          var d = r(b.split("\x3d"));
          b = d.next().value;
          d = d.next().value;
          -1 < a.a.queryParamsWhitelist.indexOf(b) && d && c.push([b, d]);
        });
      return c.length
        ? "?" +
            c
              .map(function(a) {
                return a.join("\x3d");
              })
              .join("\x26")
        : "";
    }
    return "";
  }
  L.prototype.remove = function() {
    var a = this.f;
    D(E(this.g, "get"), a);
    a = this.c;
    D(E(this.g, "buildHitTask"), a);
  };
  H("cleanUrlTracker", L);
  function O(a, b) {
    var c = I.l;
    a.set("\x26_av", "2.4.1");
    K(a, c);
    history.pushState &&
      window.addEventListener &&
      ((this.a = G(
        {
          shouldTrackUrlChange: this.shouldTrackUrlChange,
          trackReplaceState: !1,
          fieldsObj: {},
          hitFilter: null
        },
        b
      )),
      (this.g = a),
      (this.i = location.pathname + location.search),
      (this.c = this.c.bind(this)),
      (this.f = this.f.bind(this)),
      (this.b = this.b.bind(this)),
      (a = this.c),
      B(E(history, "pushState"), a),
      (a = this.f),
      B(E(history, "replaceState"), a),
      window.addEventListener("popstate", this.b));
  }
  O.prototype.c = function(a) {
    var b = this;
    return function(c) {
      for (var d = [], e = 0; e < arguments.length; ++e)
        d[e - 0] = arguments[e];
      a.apply(null, [].concat(t(d)));
      P(b, !0);
    };
  };
  O.prototype.f = function(a) {
    var b = this;
    return function(c) {
      for (var d = [], e = 0; e < arguments.length; ++e)
        d[e - 0] = arguments[e];
      a.apply(null, [].concat(t(d)));
      P(b, !1);
    };
  };
  O.prototype.b = function() {
    P(this, !0);
  };
  function P(a, b) {
    setTimeout(function() {
      var c = a.i,
        d = location.pathname + location.search;
      c != d &&
        a.a.shouldTrackUrlChange.call(a, d, c) &&
        ((a.i = d),
        a.g.set({ page: d, title: document.title }),
        (b || a.a.trackReplaceState) &&
          a.g.send("pageview", F(a.a.fieldsObj, a.g, a.a.hitFilter)));
    }, 0);
  }
  O.prototype.shouldTrackUrlChange = function(a, b) {
    return !(!a || !b);
  };
  O.prototype.remove = function() {
    var a = this.c;
    D(E(history, "pushState"), a);
    a = this.f;
    D(E(history, "replaceState"), a);
    window.removeEventListener("popstate", this.b);
  };
  H("urlChangeTracker", O);
})();
//# sourceMappingURL=autotrack.build.js.map
