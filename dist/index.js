"use strict";

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

(function (globalContext, domFixer) {
  // eslint-disable-next-line no-undef
  if (typeof define === "function" && define.amd) {
    // eslint-disable-next-line no-undef
    define(domFixer.bind(globalContext));
  } else if ((typeof exports === "undefined" ? "undefined" : _typeof(exports)) === "object") {
    // eslint-disable-next-line no-undef
    module.exports = domFixer(globalContext);
  } else {
    globalContext.domFixer = domFixer(globalContext);
  } // eslint-disable-next-line no-global-assign

})(window = window || void 0, function (globalContext) {
  var getPerformanceNumber = function getPerformanceNumber() {}; // TODO: Add resource loader


  var DomFixer = function DomFixer(configs) {
    var self = this;
    self.readingWorks = [];
    self.writingWorks = [];
    self.requestAnimationFrame = window.requestAnimationFrame.bind(globalContext);
    self.configs = configs || {};
    self.configs["debugger"] = self.configs["debugger"] ? console.log.bind(console, "[DomPerformanceFixer]") : function () {};
    self.configs.onError = self.configs.onError || null;

    if (self.configs.performanceMetricsEnabled) {
      self.performanceMetrics = [];
      getPerformanceNumber = performance.now.bind(performance);
    }
  };

  DomFixer.prototype.constructor = DomFixer;

  DomFixer.prototype.reads = function (cb, context) {
    var work = context ? cb.bind(context) : cb;
    var self = this;
    self.readingWorks.push(work);

    _planBuild(self);

    self.configs["debugger"]("Function : reads", "work: ", work, "cb param: ", cb, "context param: ", context);
    return work;
  };

  DomFixer.prototype.writes = function (cb, context) {
    var work = context ? cb.bind(context) : cb;
    var self = this;
    self.writingWorks.push(work);

    _planBuild(self);

    self.configs["debugger"]("Function : writes", "work: ", work, "cb param: ", cb, "context param: ", context);
    return work;
  };

  DomFixer.prototype.worksDispatcher = function (works) {
    var _iterator = _createForOfIteratorHelper(works),
        _step;

    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var fn = _step.value;
        var self = this;
        var startTime = void 0;
        var endTime = void 0;
        works.shift();
        startTime = getPerformanceNumber();
        fn();
        endTime = getPerformanceNumber();
        self.performanceMetrics.push({
          work: fn,
          time: endTime - startTime
        });
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }
  };

  DomFixer.prototype.removeWork = function (work) {
    var self = this;
    var arr = self.readingWorks.includes(work) ? self.readingWorks : self.writingWorks;
    return arr.filter(function (el) {
      return el !== work;
    });
  };

  function _build(domFixerClass) {
    var writingWorks = domFixerClass.writingWorks;
    var readingWorks = domFixerClass.readingWorks;
    var onError = domFixerClass.configs.onError;
    var error;

    try {
      domFixerClass.worksDispatcher(readingWorks);
      domFixerClass.worksDispatcher(writingWorks);
    } catch (e) {
      error = e;
    }

    domFixerClass.plannedTask = false;
    (readingWorks.length || writingWorks.length) && _planBuild(domFixerClass);

    if (error) {
      onError && onError(error);
      if (!onError) throw error;
    }
  }

  function _planBuild(domFixerClass) {
    if (domFixerClass.plannedTask) return {
      stillWorking: true
    };
    domFixerClass.plannedTask = true;
    domFixerClass.requestAnimationFrame(_build.bind(null, domFixerClass));
  }

  return DomFixer;
});