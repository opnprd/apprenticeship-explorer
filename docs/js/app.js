(function (React$1, ReactDOM) {
	'use strict';

	var React$1__default = 'default' in React$1 ? React$1['default'] : React$1;
	ReactDOM = ReactDOM && ReactDOM.hasOwnProperty('default') ? ReactDOM['default'] : ReactDOM;

	function createCommonjsModule(fn, module) {
		return module = { exports: {} }, fn(module, module.exports), module.exports;
	}

	var runtime_1 = createCommonjsModule(function (module) {
	/**
	 * Copyright (c) 2014-present, Facebook, Inc.
	 *
	 * This source code is licensed under the MIT license found in the
	 * LICENSE file in the root directory of this source tree.
	 */

	var runtime = (function (exports) {

	  var Op = Object.prototype;
	  var hasOwn = Op.hasOwnProperty;
	  var undefined$1; // More compressible than void 0.
	  var $Symbol = typeof Symbol === "function" ? Symbol : {};
	  var iteratorSymbol = $Symbol.iterator || "@@iterator";
	  var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
	  var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

	  function wrap(innerFn, outerFn, self, tryLocsList) {
	    // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
	    var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
	    var generator = Object.create(protoGenerator.prototype);
	    var context = new Context(tryLocsList || []);

	    // The ._invoke method unifies the implementations of the .next,
	    // .throw, and .return methods.
	    generator._invoke = makeInvokeMethod(innerFn, self, context);

	    return generator;
	  }
	  exports.wrap = wrap;

	  // Try/catch helper to minimize deoptimizations. Returns a completion
	  // record like context.tryEntries[i].completion. This interface could
	  // have been (and was previously) designed to take a closure to be
	  // invoked without arguments, but in all the cases we care about we
	  // already have an existing method we want to call, so there's no need
	  // to create a new function object. We can even get away with assuming
	  // the method takes exactly one argument, since that happens to be true
	  // in every case, so we don't have to touch the arguments object. The
	  // only additional allocation required is the completion record, which
	  // has a stable shape and so hopefully should be cheap to allocate.
	  function tryCatch(fn, obj, arg) {
	    try {
	      return { type: "normal", arg: fn.call(obj, arg) };
	    } catch (err) {
	      return { type: "throw", arg: err };
	    }
	  }

	  var GenStateSuspendedStart = "suspendedStart";
	  var GenStateSuspendedYield = "suspendedYield";
	  var GenStateExecuting = "executing";
	  var GenStateCompleted = "completed";

	  // Returning this object from the innerFn has the same effect as
	  // breaking out of the dispatch switch statement.
	  var ContinueSentinel = {};

	  // Dummy constructor functions that we use as the .constructor and
	  // .constructor.prototype properties for functions that return Generator
	  // objects. For full spec compliance, you may wish to configure your
	  // minifier not to mangle the names of these two functions.
	  function Generator() {}
	  function GeneratorFunction() {}
	  function GeneratorFunctionPrototype() {}

	  // This is a polyfill for %IteratorPrototype% for environments that
	  // don't natively support it.
	  var IteratorPrototype = {};
	  IteratorPrototype[iteratorSymbol] = function () {
	    return this;
	  };

	  var getProto = Object.getPrototypeOf;
	  var NativeIteratorPrototype = getProto && getProto(getProto(values([])));
	  if (NativeIteratorPrototype &&
	      NativeIteratorPrototype !== Op &&
	      hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
	    // This environment has a native %IteratorPrototype%; use it instead
	    // of the polyfill.
	    IteratorPrototype = NativeIteratorPrototype;
	  }

	  var Gp = GeneratorFunctionPrototype.prototype =
	    Generator.prototype = Object.create(IteratorPrototype);
	  GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
	  GeneratorFunctionPrototype.constructor = GeneratorFunction;
	  GeneratorFunctionPrototype[toStringTagSymbol] =
	    GeneratorFunction.displayName = "GeneratorFunction";

	  // Helper for defining the .next, .throw, and .return methods of the
	  // Iterator interface in terms of a single ._invoke method.
	  function defineIteratorMethods(prototype) {
	    ["next", "throw", "return"].forEach(function(method) {
	      prototype[method] = function(arg) {
	        return this._invoke(method, arg);
	      };
	    });
	  }

	  exports.isGeneratorFunction = function(genFun) {
	    var ctor = typeof genFun === "function" && genFun.constructor;
	    return ctor
	      ? ctor === GeneratorFunction ||
	        // For the native GeneratorFunction constructor, the best we can
	        // do is to check its .name property.
	        (ctor.displayName || ctor.name) === "GeneratorFunction"
	      : false;
	  };

	  exports.mark = function(genFun) {
	    if (Object.setPrototypeOf) {
	      Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
	    } else {
	      genFun.__proto__ = GeneratorFunctionPrototype;
	      if (!(toStringTagSymbol in genFun)) {
	        genFun[toStringTagSymbol] = "GeneratorFunction";
	      }
	    }
	    genFun.prototype = Object.create(Gp);
	    return genFun;
	  };

	  // Within the body of any async function, `await x` is transformed to
	  // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
	  // `hasOwn.call(value, "__await")` to determine if the yielded value is
	  // meant to be awaited.
	  exports.awrap = function(arg) {
	    return { __await: arg };
	  };

	  function AsyncIterator(generator) {
	    function invoke(method, arg, resolve, reject) {
	      var record = tryCatch(generator[method], generator, arg);
	      if (record.type === "throw") {
	        reject(record.arg);
	      } else {
	        var result = record.arg;
	        var value = result.value;
	        if (value &&
	            typeof value === "object" &&
	            hasOwn.call(value, "__await")) {
	          return Promise.resolve(value.__await).then(function(value) {
	            invoke("next", value, resolve, reject);
	          }, function(err) {
	            invoke("throw", err, resolve, reject);
	          });
	        }

	        return Promise.resolve(value).then(function(unwrapped) {
	          // When a yielded Promise is resolved, its final value becomes
	          // the .value of the Promise<{value,done}> result for the
	          // current iteration.
	          result.value = unwrapped;
	          resolve(result);
	        }, function(error) {
	          // If a rejected Promise was yielded, throw the rejection back
	          // into the async generator function so it can be handled there.
	          return invoke("throw", error, resolve, reject);
	        });
	      }
	    }

	    var previousPromise;

	    function enqueue(method, arg) {
	      function callInvokeWithMethodAndArg() {
	        return new Promise(function(resolve, reject) {
	          invoke(method, arg, resolve, reject);
	        });
	      }

	      return previousPromise =
	        // If enqueue has been called before, then we want to wait until
	        // all previous Promises have been resolved before calling invoke,
	        // so that results are always delivered in the correct order. If
	        // enqueue has not been called before, then it is important to
	        // call invoke immediately, without waiting on a callback to fire,
	        // so that the async generator function has the opportunity to do
	        // any necessary setup in a predictable way. This predictability
	        // is why the Promise constructor synchronously invokes its
	        // executor callback, and why async functions synchronously
	        // execute code before the first await. Since we implement simple
	        // async functions in terms of async generators, it is especially
	        // important to get this right, even though it requires care.
	        previousPromise ? previousPromise.then(
	          callInvokeWithMethodAndArg,
	          // Avoid propagating failures to Promises returned by later
	          // invocations of the iterator.
	          callInvokeWithMethodAndArg
	        ) : callInvokeWithMethodAndArg();
	    }

	    // Define the unified helper method that is used to implement .next,
	    // .throw, and .return (see defineIteratorMethods).
	    this._invoke = enqueue;
	  }

	  defineIteratorMethods(AsyncIterator.prototype);
	  AsyncIterator.prototype[asyncIteratorSymbol] = function () {
	    return this;
	  };
	  exports.AsyncIterator = AsyncIterator;

	  // Note that simple async functions are implemented on top of
	  // AsyncIterator objects; they just return a Promise for the value of
	  // the final result produced by the iterator.
	  exports.async = function(innerFn, outerFn, self, tryLocsList) {
	    var iter = new AsyncIterator(
	      wrap(innerFn, outerFn, self, tryLocsList)
	    );

	    return exports.isGeneratorFunction(outerFn)
	      ? iter // If outerFn is a generator, return the full iterator.
	      : iter.next().then(function(result) {
	          return result.done ? result.value : iter.next();
	        });
	  };

	  function makeInvokeMethod(innerFn, self, context) {
	    var state = GenStateSuspendedStart;

	    return function invoke(method, arg) {
	      if (state === GenStateExecuting) {
	        throw new Error("Generator is already running");
	      }

	      if (state === GenStateCompleted) {
	        if (method === "throw") {
	          throw arg;
	        }

	        // Be forgiving, per 25.3.3.3.3 of the spec:
	        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
	        return doneResult();
	      }

	      context.method = method;
	      context.arg = arg;

	      while (true) {
	        var delegate = context.delegate;
	        if (delegate) {
	          var delegateResult = maybeInvokeDelegate(delegate, context);
	          if (delegateResult) {
	            if (delegateResult === ContinueSentinel) continue;
	            return delegateResult;
	          }
	        }

	        if (context.method === "next") {
	          // Setting context._sent for legacy support of Babel's
	          // function.sent implementation.
	          context.sent = context._sent = context.arg;

	        } else if (context.method === "throw") {
	          if (state === GenStateSuspendedStart) {
	            state = GenStateCompleted;
	            throw context.arg;
	          }

	          context.dispatchException(context.arg);

	        } else if (context.method === "return") {
	          context.abrupt("return", context.arg);
	        }

	        state = GenStateExecuting;

	        var record = tryCatch(innerFn, self, context);
	        if (record.type === "normal") {
	          // If an exception is thrown from innerFn, we leave state ===
	          // GenStateExecuting and loop back for another invocation.
	          state = context.done
	            ? GenStateCompleted
	            : GenStateSuspendedYield;

	          if (record.arg === ContinueSentinel) {
	            continue;
	          }

	          return {
	            value: record.arg,
	            done: context.done
	          };

	        } else if (record.type === "throw") {
	          state = GenStateCompleted;
	          // Dispatch the exception by looping back around to the
	          // context.dispatchException(context.arg) call above.
	          context.method = "throw";
	          context.arg = record.arg;
	        }
	      }
	    };
	  }

	  // Call delegate.iterator[context.method](context.arg) and handle the
	  // result, either by returning a { value, done } result from the
	  // delegate iterator, or by modifying context.method and context.arg,
	  // setting context.delegate to null, and returning the ContinueSentinel.
	  function maybeInvokeDelegate(delegate, context) {
	    var method = delegate.iterator[context.method];
	    if (method === undefined$1) {
	      // A .throw or .return when the delegate iterator has no .throw
	      // method always terminates the yield* loop.
	      context.delegate = null;

	      if (context.method === "throw") {
	        // Note: ["return"] must be used for ES3 parsing compatibility.
	        if (delegate.iterator["return"]) {
	          // If the delegate iterator has a return method, give it a
	          // chance to clean up.
	          context.method = "return";
	          context.arg = undefined$1;
	          maybeInvokeDelegate(delegate, context);

	          if (context.method === "throw") {
	            // If maybeInvokeDelegate(context) changed context.method from
	            // "return" to "throw", let that override the TypeError below.
	            return ContinueSentinel;
	          }
	        }

	        context.method = "throw";
	        context.arg = new TypeError(
	          "The iterator does not provide a 'throw' method");
	      }

	      return ContinueSentinel;
	    }

	    var record = tryCatch(method, delegate.iterator, context.arg);

	    if (record.type === "throw") {
	      context.method = "throw";
	      context.arg = record.arg;
	      context.delegate = null;
	      return ContinueSentinel;
	    }

	    var info = record.arg;

	    if (! info) {
	      context.method = "throw";
	      context.arg = new TypeError("iterator result is not an object");
	      context.delegate = null;
	      return ContinueSentinel;
	    }

	    if (info.done) {
	      // Assign the result of the finished delegate to the temporary
	      // variable specified by delegate.resultName (see delegateYield).
	      context[delegate.resultName] = info.value;

	      // Resume execution at the desired location (see delegateYield).
	      context.next = delegate.nextLoc;

	      // If context.method was "throw" but the delegate handled the
	      // exception, let the outer generator proceed normally. If
	      // context.method was "next", forget context.arg since it has been
	      // "consumed" by the delegate iterator. If context.method was
	      // "return", allow the original .return call to continue in the
	      // outer generator.
	      if (context.method !== "return") {
	        context.method = "next";
	        context.arg = undefined$1;
	      }

	    } else {
	      // Re-yield the result returned by the delegate method.
	      return info;
	    }

	    // The delegate iterator is finished, so forget it and continue with
	    // the outer generator.
	    context.delegate = null;
	    return ContinueSentinel;
	  }

	  // Define Generator.prototype.{next,throw,return} in terms of the
	  // unified ._invoke helper method.
	  defineIteratorMethods(Gp);

	  Gp[toStringTagSymbol] = "Generator";

	  // A Generator should always return itself as the iterator object when the
	  // @@iterator function is called on it. Some browsers' implementations of the
	  // iterator prototype chain incorrectly implement this, causing the Generator
	  // object to not be returned from this call. This ensures that doesn't happen.
	  // See https://github.com/facebook/regenerator/issues/274 for more details.
	  Gp[iteratorSymbol] = function() {
	    return this;
	  };

	  Gp.toString = function() {
	    return "[object Generator]";
	  };

	  function pushTryEntry(locs) {
	    var entry = { tryLoc: locs[0] };

	    if (1 in locs) {
	      entry.catchLoc = locs[1];
	    }

	    if (2 in locs) {
	      entry.finallyLoc = locs[2];
	      entry.afterLoc = locs[3];
	    }

	    this.tryEntries.push(entry);
	  }

	  function resetTryEntry(entry) {
	    var record = entry.completion || {};
	    record.type = "normal";
	    delete record.arg;
	    entry.completion = record;
	  }

	  function Context(tryLocsList) {
	    // The root entry object (effectively a try statement without a catch
	    // or a finally block) gives us a place to store values thrown from
	    // locations where there is no enclosing try statement.
	    this.tryEntries = [{ tryLoc: "root" }];
	    tryLocsList.forEach(pushTryEntry, this);
	    this.reset(true);
	  }

	  exports.keys = function(object) {
	    var keys = [];
	    for (var key in object) {
	      keys.push(key);
	    }
	    keys.reverse();

	    // Rather than returning an object with a next method, we keep
	    // things simple and return the next function itself.
	    return function next() {
	      while (keys.length) {
	        var key = keys.pop();
	        if (key in object) {
	          next.value = key;
	          next.done = false;
	          return next;
	        }
	      }

	      // To avoid creating an additional object, we just hang the .value
	      // and .done properties off the next function object itself. This
	      // also ensures that the minifier will not anonymize the function.
	      next.done = true;
	      return next;
	    };
	  };

	  function values(iterable) {
	    if (iterable) {
	      var iteratorMethod = iterable[iteratorSymbol];
	      if (iteratorMethod) {
	        return iteratorMethod.call(iterable);
	      }

	      if (typeof iterable.next === "function") {
	        return iterable;
	      }

	      if (!isNaN(iterable.length)) {
	        var i = -1, next = function next() {
	          while (++i < iterable.length) {
	            if (hasOwn.call(iterable, i)) {
	              next.value = iterable[i];
	              next.done = false;
	              return next;
	            }
	          }

	          next.value = undefined$1;
	          next.done = true;

	          return next;
	        };

	        return next.next = next;
	      }
	    }

	    // Return an iterator with no values.
	    return { next: doneResult };
	  }
	  exports.values = values;

	  function doneResult() {
	    return { value: undefined$1, done: true };
	  }

	  Context.prototype = {
	    constructor: Context,

	    reset: function(skipTempReset) {
	      this.prev = 0;
	      this.next = 0;
	      // Resetting context._sent for legacy support of Babel's
	      // function.sent implementation.
	      this.sent = this._sent = undefined$1;
	      this.done = false;
	      this.delegate = null;

	      this.method = "next";
	      this.arg = undefined$1;

	      this.tryEntries.forEach(resetTryEntry);

	      if (!skipTempReset) {
	        for (var name in this) {
	          // Not sure about the optimal order of these conditions:
	          if (name.charAt(0) === "t" &&
	              hasOwn.call(this, name) &&
	              !isNaN(+name.slice(1))) {
	            this[name] = undefined$1;
	          }
	        }
	      }
	    },

	    stop: function() {
	      this.done = true;

	      var rootEntry = this.tryEntries[0];
	      var rootRecord = rootEntry.completion;
	      if (rootRecord.type === "throw") {
	        throw rootRecord.arg;
	      }

	      return this.rval;
	    },

	    dispatchException: function(exception) {
	      if (this.done) {
	        throw exception;
	      }

	      var context = this;
	      function handle(loc, caught) {
	        record.type = "throw";
	        record.arg = exception;
	        context.next = loc;

	        if (caught) {
	          // If the dispatched exception was caught by a catch block,
	          // then let that catch block handle the exception normally.
	          context.method = "next";
	          context.arg = undefined$1;
	        }

	        return !! caught;
	      }

	      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
	        var entry = this.tryEntries[i];
	        var record = entry.completion;

	        if (entry.tryLoc === "root") {
	          // Exception thrown outside of any try block that could handle
	          // it, so set the completion value of the entire function to
	          // throw the exception.
	          return handle("end");
	        }

	        if (entry.tryLoc <= this.prev) {
	          var hasCatch = hasOwn.call(entry, "catchLoc");
	          var hasFinally = hasOwn.call(entry, "finallyLoc");

	          if (hasCatch && hasFinally) {
	            if (this.prev < entry.catchLoc) {
	              return handle(entry.catchLoc, true);
	            } else if (this.prev < entry.finallyLoc) {
	              return handle(entry.finallyLoc);
	            }

	          } else if (hasCatch) {
	            if (this.prev < entry.catchLoc) {
	              return handle(entry.catchLoc, true);
	            }

	          } else if (hasFinally) {
	            if (this.prev < entry.finallyLoc) {
	              return handle(entry.finallyLoc);
	            }

	          } else {
	            throw new Error("try statement without catch or finally");
	          }
	        }
	      }
	    },

	    abrupt: function(type, arg) {
	      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
	        var entry = this.tryEntries[i];
	        if (entry.tryLoc <= this.prev &&
	            hasOwn.call(entry, "finallyLoc") &&
	            this.prev < entry.finallyLoc) {
	          var finallyEntry = entry;
	          break;
	        }
	      }

	      if (finallyEntry &&
	          (type === "break" ||
	           type === "continue") &&
	          finallyEntry.tryLoc <= arg &&
	          arg <= finallyEntry.finallyLoc) {
	        // Ignore the finally entry if control is not jumping to a
	        // location outside the try/catch block.
	        finallyEntry = null;
	      }

	      var record = finallyEntry ? finallyEntry.completion : {};
	      record.type = type;
	      record.arg = arg;

	      if (finallyEntry) {
	        this.method = "next";
	        this.next = finallyEntry.finallyLoc;
	        return ContinueSentinel;
	      }

	      return this.complete(record);
	    },

	    complete: function(record, afterLoc) {
	      if (record.type === "throw") {
	        throw record.arg;
	      }

	      if (record.type === "break" ||
	          record.type === "continue") {
	        this.next = record.arg;
	      } else if (record.type === "return") {
	        this.rval = this.arg = record.arg;
	        this.method = "return";
	        this.next = "end";
	      } else if (record.type === "normal" && afterLoc) {
	        this.next = afterLoc;
	      }

	      return ContinueSentinel;
	    },

	    finish: function(finallyLoc) {
	      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
	        var entry = this.tryEntries[i];
	        if (entry.finallyLoc === finallyLoc) {
	          this.complete(entry.completion, entry.afterLoc);
	          resetTryEntry(entry);
	          return ContinueSentinel;
	        }
	      }
	    },

	    "catch": function(tryLoc) {
	      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
	        var entry = this.tryEntries[i];
	        if (entry.tryLoc === tryLoc) {
	          var record = entry.completion;
	          if (record.type === "throw") {
	            var thrown = record.arg;
	            resetTryEntry(entry);
	          }
	          return thrown;
	        }
	      }

	      // The context.catch method must only be called with a location
	      // argument that corresponds to a known catch block.
	      throw new Error("illegal catch attempt");
	    },

	    delegateYield: function(iterable, resultName, nextLoc) {
	      this.delegate = {
	        iterator: values(iterable),
	        resultName: resultName,
	        nextLoc: nextLoc
	      };

	      if (this.method === "next") {
	        // Deliberately forget the last sent value so that we don't
	        // accidentally pass it on to the delegate.
	        this.arg = undefined$1;
	      }

	      return ContinueSentinel;
	    }
	  };

	  // Regardless of whether this script is executing as a CommonJS module
	  // or not, return the runtime object so that we can declare the variable
	  // regeneratorRuntime in the outer scope, which allows this module to be
	  // injected easily by `bin/regenerator --include-runtime script.js`.
	  return exports;

	}(
	  // If this script is executing as a CommonJS module, use module.exports
	  // as the regeneratorRuntime namespace. Otherwise create a new empty
	  // object. Either way, the resulting object will be used to initialize
	  // the regeneratorRuntime variable at the top of this file.
	   module.exports 
	));

	try {
	  regeneratorRuntime = runtime;
	} catch (accidentalStrictMode) {
	  // This module should not be running in strict mode, so the above
	  // assignment should always work unless something is misconfigured. Just
	  // in case runtime.js accidentally runs in strict mode, we can escape
	  // strict mode using a global Function call. This could conceivably fail
	  // if a Content Security Policy forbids using Function, but in that case
	  // the proper solution is to fix the accidental strict mode problem. If
	  // you've misconfigured your bundler to force strict mode and applied a
	  // CSP to forbid Function, and you're not willing to fix either of those
	  // problems, please detail your unique predicament in a GitHub issue.
	  Function("r", "regeneratorRuntime = r")(runtime);
	}
	});

	var regenerator = runtime_1;

	function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
	  try {
	    var info = gen[key](arg);
	    var value = info.value;
	  } catch (error) {
	    reject(error);
	    return;
	  }

	  if (info.done) {
	    resolve(value);
	  } else {
	    Promise.resolve(value).then(_next, _throw);
	  }
	}

	function _asyncToGenerator(fn) {
	  return function () {
	    var self = this,
	        args = arguments;
	    return new Promise(function (resolve, reject) {
	      var gen = fn.apply(self, args);

	      function _next(value) {
	        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
	      }

	      function _throw(err) {
	        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
	      }

	      _next(undefined);
	    });
	  };
	}

	var asyncToGenerator = _asyncToGenerator;

	function _classCallCheck(instance, Constructor) {
	  if (!(instance instanceof Constructor)) {
	    throw new TypeError("Cannot call a class as a function");
	  }
	}

	var classCallCheck = _classCallCheck;

	function _defineProperties(target, props) {
	  for (var i = 0; i < props.length; i++) {
	    var descriptor = props[i];
	    descriptor.enumerable = descriptor.enumerable || false;
	    descriptor.configurable = true;
	    if ("value" in descriptor) descriptor.writable = true;
	    Object.defineProperty(target, descriptor.key, descriptor);
	  }
	}

	function _createClass(Constructor, protoProps, staticProps) {
	  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
	  if (staticProps) _defineProperties(Constructor, staticProps);
	  return Constructor;
	}

	var createClass = _createClass;

	var _typeof_1 = createCommonjsModule(function (module) {
	function _typeof2(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof2 = function _typeof2(obj) { return typeof obj; }; } else { _typeof2 = function _typeof2(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof2(obj); }

	function _typeof(obj) {
	  if (typeof Symbol === "function" && _typeof2(Symbol.iterator) === "symbol") {
	    module.exports = _typeof = function _typeof(obj) {
	      return _typeof2(obj);
	    };
	  } else {
	    module.exports = _typeof = function _typeof(obj) {
	      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : _typeof2(obj);
	    };
	  }

	  return _typeof(obj);
	}

	module.exports = _typeof;
	});

	function _assertThisInitialized(self) {
	  if (self === void 0) {
	    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
	  }

	  return self;
	}

	var assertThisInitialized = _assertThisInitialized;

	function _possibleConstructorReturn(self, call) {
	  if (call && (_typeof_1(call) === "object" || typeof call === "function")) {
	    return call;
	  }

	  return assertThisInitialized(self);
	}

	var possibleConstructorReturn = _possibleConstructorReturn;

	var getPrototypeOf = createCommonjsModule(function (module) {
	function _getPrototypeOf(o) {
	  module.exports = _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
	    return o.__proto__ || Object.getPrototypeOf(o);
	  };
	  return _getPrototypeOf(o);
	}

	module.exports = _getPrototypeOf;
	});

	var setPrototypeOf = createCommonjsModule(function (module) {
	function _setPrototypeOf(o, p) {
	  module.exports = _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
	    o.__proto__ = p;
	    return o;
	  };

	  return _setPrototypeOf(o, p);
	}

	module.exports = _setPrototypeOf;
	});

	function _inherits(subClass, superClass) {
	  if (typeof superClass !== "function" && superClass !== null) {
	    throw new TypeError("Super expression must either be null or a function");
	  }

	  subClass.prototype = Object.create(superClass && superClass.prototype, {
	    constructor: {
	      value: subClass,
	      writable: true,
	      configurable: true
	    }
	  });
	  if (superClass) setPrototypeOf(subClass, superClass);
	}

	var inherits = _inherits;

	function TagCloud(props) {
	  var tags = props.value.map(function (_, i) {
	    return React$1__default.createElement("li", {
	      key: i
	    }, _);
	  });
	  return React$1__default.createElement("ul", {
	    className: "tag-cloud"
	  }, tags);
	}

	var onsData = [
		{
			code: "E47000001",
			name: "Greater Manchester",
			fid: 1,
			prefix: "CAUTH18",
			refs: [
			]
		},
		{
			code: "E47000002",
			name: "Sheffield City Region",
			fid: 2,
			prefix: "CAUTH18",
			refs: [
			]
		},
		{
			code: "E47000003",
			name: "West Yorkshire",
			fid: 3,
			prefix: "CAUTH18",
			refs: [
			]
		},
		{
			code: "E47000004",
			name: "Liverpool City Region",
			fid: 4,
			prefix: "CAUTH18",
			refs: [
			]
		},
		{
			code: "E47000006",
			name: "Tees Valley",
			fid: 5,
			prefix: "CAUTH18",
			refs: [
			]
		},
		{
			code: "E47000007",
			name: "West Midlands",
			fid: 6,
			prefix: "CAUTH18",
			refs: [
			]
		},
		{
			code: "E47000008",
			name: "Cambridgeshire and Peterborough",
			fid: 7,
			prefix: "CAUTH18",
			refs: [
			]
		},
		{
			code: "E47000009",
			name: "West of England",
			fid: 8,
			prefix: "CAUTH18",
			refs: [
			]
		},
		{
			code: "E47000010",
			name: "North East",
			fid: 9,
			prefix: "CAUTH18",
			refs: [
			]
		},
		{
			code: "E47000011",
			name: "North of Tyne",
			fid: 10,
			prefix: "CAUTH18",
			refs: [
			]
		},
		{
			code: "E10000002",
			name: "Buckinghamshire",
			fid: 1,
			prefix: "CTY18",
			refs: [
			]
		},
		{
			code: "E10000003",
			name: "Cambridgeshire",
			fid: 2,
			prefix: "CTY18",
			refs: [
			]
		},
		{
			code: "E10000006",
			name: "Cumbria",
			fid: 3,
			prefix: "CTY18",
			refs: [
			]
		},
		{
			code: "E10000007",
			name: "Derbyshire",
			fid: 4,
			prefix: "CTY18",
			refs: [
			]
		},
		{
			code: "E10000008",
			name: "Devon",
			fid: 5,
			prefix: "CTY18",
			refs: [
			]
		},
		{
			code: "E10000009",
			name: "Dorset",
			fid: 6,
			prefix: "CTY18",
			refs: [
			]
		},
		{
			code: "E10000011",
			name: "East Sussex",
			fid: 7,
			prefix: "CTY18",
			refs: [
			]
		},
		{
			code: "E10000012",
			name: "Essex",
			fid: 8,
			prefix: "CTY18",
			refs: [
			]
		},
		{
			code: "E10000013",
			name: "Gloucestershire",
			fid: 9,
			prefix: "CTY18",
			refs: [
			]
		},
		{
			code: "E10000014",
			name: "Hampshire",
			fid: 10,
			prefix: "CTY18",
			refs: [
			]
		},
		{
			code: "E10000015",
			name: "Hertfordshire",
			fid: 11,
			prefix: "CTY18",
			refs: [
			]
		},
		{
			code: "E10000016",
			name: "Kent",
			fid: 12,
			prefix: "CTY18",
			refs: [
			]
		},
		{
			code: "E10000017",
			name: "Lancashire",
			fid: 13,
			prefix: "CTY18",
			refs: [
			]
		},
		{
			code: "E10000018",
			name: "Leicestershire",
			fid: 14,
			prefix: "CTY18",
			refs: [
			]
		},
		{
			code: "E10000019",
			name: "Lincolnshire",
			fid: 15,
			prefix: "CTY18",
			refs: [
			]
		},
		{
			code: "E10000020",
			name: "Norfolk",
			fid: 16,
			prefix: "CTY18",
			refs: [
			]
		},
		{
			code: "E10000021",
			name: "Northamptonshire",
			fid: 17,
			prefix: "CTY18",
			refs: [
			]
		},
		{
			code: "E10000023",
			name: "North Yorkshire",
			fid: 18,
			prefix: "CTY18",
			refs: [
			]
		},
		{
			code: "E10000024",
			name: "Nottinghamshire",
			fid: 19,
			prefix: "CTY18",
			refs: [
			]
		},
		{
			code: "E10000025",
			name: "Oxfordshire",
			fid: 20,
			prefix: "CTY18",
			refs: [
			]
		},
		{
			code: "E10000027",
			name: "Somerset",
			fid: 21,
			prefix: "CTY18",
			refs: [
			]
		},
		{
			code: "E10000028",
			name: "Staffordshire",
			fid: 22,
			prefix: "CTY18",
			refs: [
			]
		},
		{
			code: "E10000029",
			name: "Suffolk",
			fid: 23,
			prefix: "CTY18",
			refs: [
			]
		},
		{
			code: "E10000030",
			name: "Surrey",
			fid: 24,
			prefix: "CTY18",
			refs: [
			]
		},
		{
			code: "E10000031",
			name: "Warwickshire",
			fid: 25,
			prefix: "CTY18",
			refs: [
			]
		},
		{
			code: "E10000032",
			name: "West Sussex",
			fid: 26,
			prefix: "CTY18",
			refs: [
			]
		},
		{
			code: "E10000034",
			name: "Worcestershire",
			fid: 27,
			prefix: "CTY18",
			refs: [
			]
		},
		{
			code: "E07000140",
			name: "South Holland",
			namew: null,
			fid: 1,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000019",
					type: "CTY18CD"
				},
				{
					target: "E12000004",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "N09000011",
			name: "Ards and North Down",
			namew: null,
			fid: 2,
			prefix: "LAD18",
			refs: [
			]
		},
		{
			code: "E07000141",
			name: "South Kesteven",
			namew: null,
			fid: 3,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000019",
					type: "CTY18CD"
				},
				{
					target: "E12000004",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000142",
			name: "West Lindsey",
			namew: null,
			fid: 4,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000019",
					type: "CTY18CD"
				},
				{
					target: "E12000004",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000143",
			name: "Breckland",
			namew: null,
			fid: 5,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000020",
					type: "CTY18CD"
				},
				{
					target: "E12000006",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "S12000005",
			name: "Clackmannanshire",
			namew: null,
			fid: 6,
			prefix: "LAD18",
			refs: [
			]
		},
		{
			code: "S12000006",
			name: "Dumfries and Galloway",
			namew: null,
			fid: 7,
			prefix: "LAD18",
			refs: [
			]
		},
		{
			code: "E07000144",
			name: "Broadland",
			namew: null,
			fid: 8,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000020",
					type: "CTY18CD"
				},
				{
					target: "E12000006",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000145",
			name: "Great Yarmouth",
			namew: null,
			fid: 9,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000020",
					type: "CTY18CD"
				},
				{
					target: "E12000006",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "S12000008",
			name: "East Ayrshire",
			namew: null,
			fid: 10,
			prefix: "LAD18",
			refs: [
			]
		},
		{
			code: "S12000010",
			name: "East Lothian",
			namew: null,
			fid: 11,
			prefix: "LAD18",
			refs: [
			]
		},
		{
			code: "E07000146",
			name: "King's Lynn and West Norfolk",
			namew: null,
			fid: 12,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000020",
					type: "CTY18CD"
				},
				{
					target: "E12000006",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000147",
			name: "North Norfolk",
			namew: null,
			fid: 13,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000020",
					type: "CTY18CD"
				},
				{
					target: "E12000006",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "S12000011",
			name: "East Renfrewshire",
			namew: null,
			fid: 14,
			prefix: "LAD18",
			refs: [
			]
		},
		{
			code: "E07000207",
			name: "Elmbridge",
			namew: null,
			fid: 15,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000030",
					type: "CTY18CD"
				},
				{
					target: "E12000008",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "S12000013",
			name: "Na h-Eileanan Siar",
			namew: null,
			fid: 16,
			prefix: "LAD18",
			refs: [
			]
		},
		{
			code: "E06000001",
			name: "Hartlepool",
			namew: null,
			fid: 17,
			prefix: "LAD18",
			refs: [
				{
					target: "E47000006",
					type: "CAUTH18CD"
				},
				{
					target: "E12000001",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000148",
			name: "Norwich",
			namew: null,
			fid: 18,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000020",
					type: "CTY18CD"
				},
				{
					target: "E12000006",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000149",
			name: "South Norfolk",
			namew: null,
			fid: 19,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000020",
					type: "CTY18CD"
				},
				{
					target: "E12000006",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "S12000014",
			name: "Falkirk",
			namew: null,
			fid: 20,
			prefix: "LAD18",
			refs: [
			]
		},
		{
			code: "E06000002",
			name: "Middlesbrough",
			namew: null,
			fid: 21,
			prefix: "LAD18",
			refs: [
				{
					target: "E47000006",
					type: "CAUTH18CD"
				},
				{
					target: "E12000001",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000208",
			name: "Epsom and Ewell",
			namew: null,
			fid: 22,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000030",
					type: "CTY18CD"
				},
				{
					target: "E12000008",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000209",
			name: "Guildford",
			namew: null,
			fid: 23,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000030",
					type: "CTY18CD"
				},
				{
					target: "E12000008",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000150",
			name: "Corby",
			namew: null,
			fid: 24,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000021",
					type: "CTY18CD"
				},
				{
					target: "E12000004",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E06000003",
			name: "Redcar and Cleveland",
			namew: null,
			fid: 25,
			prefix: "LAD18",
			refs: [
				{
					target: "E47000006",
					type: "CAUTH18CD"
				},
				{
					target: "E12000001",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "S12000017",
			name: "Highland",
			namew: null,
			fid: 26,
			prefix: "LAD18",
			refs: [
			]
		},
		{
			code: "S12000018",
			name: "Inverclyde",
			namew: null,
			fid: 27,
			prefix: "LAD18",
			refs: [
			]
		},
		{
			code: "E06000004",
			name: "Stockton-on-Tees",
			namew: null,
			fid: 28,
			prefix: "LAD18",
			refs: [
				{
					target: "E47000006",
					type: "CAUTH18CD"
				},
				{
					target: "E12000001",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000151",
			name: "Daventry",
			namew: null,
			fid: 29,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000021",
					type: "CTY18CD"
				},
				{
					target: "E12000004",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000210",
			name: "Mole Valley",
			namew: null,
			fid: 30,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000030",
					type: "CTY18CD"
				},
				{
					target: "E12000008",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000211",
			name: "Reigate and Banstead",
			namew: null,
			fid: 31,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000030",
					type: "CTY18CD"
				},
				{
					target: "E12000008",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E06000005",
			name: "Darlington",
			namew: null,
			fid: 32,
			prefix: "LAD18",
			refs: [
				{
					target: "E47000006",
					type: "CAUTH18CD"
				},
				{
					target: "E12000001",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "S12000019",
			name: "Midlothian",
			namew: null,
			fid: 33,
			prefix: "LAD18",
			refs: [
			]
		},
		{
			code: "E07000152",
			name: "East Northamptonshire",
			namew: null,
			fid: 34,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000021",
					type: "CTY18CD"
				},
				{
					target: "E12000004",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000153",
			name: "Kettering",
			namew: null,
			fid: 35,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000021",
					type: "CTY18CD"
				},
				{
					target: "E12000004",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "S12000020",
			name: "Moray",
			namew: null,
			fid: 36,
			prefix: "LAD18",
			refs: [
			]
		},
		{
			code: "E06000006",
			name: "Halton",
			namew: null,
			fid: 37,
			prefix: "LAD18",
			refs: [
				{
					target: "E47000004",
					type: "CAUTH18CD"
				},
				{
					target: "E12000002",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000212",
			name: "Runnymede",
			namew: null,
			fid: 38,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000030",
					type: "CTY18CD"
				},
				{
					target: "E12000008",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000213",
			name: "Spelthorne",
			namew: null,
			fid: 39,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000030",
					type: "CTY18CD"
				},
				{
					target: "E12000008",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E06000007",
			name: "Warrington",
			namew: null,
			fid: 40,
			prefix: "LAD18",
			refs: [
				{
					target: "E12000002",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "S12000021",
			name: "North Ayrshire",
			namew: null,
			fid: 41,
			prefix: "LAD18",
			refs: [
			]
		},
		{
			code: "E07000154",
			name: "Northampton",
			namew: null,
			fid: 42,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000021",
					type: "CTY18CD"
				},
				{
					target: "E12000004",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000155",
			name: "South Northamptonshire",
			namew: null,
			fid: 43,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000021",
					type: "CTY18CD"
				},
				{
					target: "E12000004",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "S12000023",
			name: "Orkney Islands",
			namew: null,
			fid: 44,
			prefix: "LAD18",
			refs: [
			]
		},
		{
			code: "E06000008",
			name: "Blackburn with Darwen",
			namew: null,
			fid: 45,
			prefix: "LAD18",
			refs: [
				{
					target: "E12000002",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000214",
			name: "Surrey Heath",
			namew: null,
			fid: 46,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000030",
					type: "CTY18CD"
				},
				{
					target: "E12000008",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000215",
			name: "Tandridge",
			namew: null,
			fid: 47,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000030",
					type: "CTY18CD"
				},
				{
					target: "E12000008",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E06000009",
			name: "Blackpool",
			namew: null,
			fid: 48,
			prefix: "LAD18",
			refs: [
				{
					target: "E12000002",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000156",
			name: "Wellingborough",
			namew: null,
			fid: 49,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000021",
					type: "CTY18CD"
				},
				{
					target: "E12000004",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "S12000026",
			name: "Scottish Borders",
			namew: null,
			fid: 50,
			prefix: "LAD18",
			refs: [
			]
		},
		{
			code: "S12000027",
			name: "Shetland Islands",
			namew: null,
			fid: 51,
			prefix: "LAD18",
			refs: [
			]
		},
		{
			code: "E06000010",
			name: "Kingston upon Hull, City of",
			namew: null,
			fid: 52,
			prefix: "LAD18",
			refs: [
				{
					target: "E12000003",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000216",
			name: "Waverley",
			namew: null,
			fid: 53,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000030",
					type: "CTY18CD"
				},
				{
					target: "E12000008",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000163",
			name: "Craven",
			namew: null,
			fid: 54,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000023",
					type: "CTY18CD"
				},
				{
					target: "E12000003",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000164",
			name: "Hambleton",
			namew: null,
			fid: 55,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000023",
					type: "CTY18CD"
				},
				{
					target: "E12000003",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000217",
			name: "Woking",
			namew: null,
			fid: 56,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000030",
					type: "CTY18CD"
				},
				{
					target: "E12000008",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E06000011",
			name: "East Riding of Yorkshire",
			namew: null,
			fid: 57,
			prefix: "LAD18",
			refs: [
				{
					target: "E12000003",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "S12000028",
			name: "South Ayrshire",
			namew: null,
			fid: 58,
			prefix: "LAD18",
			refs: [
			]
		},
		{
			code: "S12000029",
			name: "South Lanarkshire",
			namew: null,
			fid: 59,
			prefix: "LAD18",
			refs: [
			]
		},
		{
			code: "E07000165",
			name: "Harrogate",
			namew: null,
			fid: 60,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000023",
					type: "CTY18CD"
				},
				{
					target: "E12000003",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E06000012",
			name: "North East Lincolnshire",
			namew: null,
			fid: 61,
			prefix: "LAD18",
			refs: [
				{
					target: "E12000003",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000218",
			name: "North Warwickshire",
			namew: null,
			fid: 62,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000031",
					type: "CTY18CD"
				},
				{
					target: "E12000005",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000219",
			name: "Nuneaton and Bedworth",
			namew: null,
			fid: 63,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000031",
					type: "CTY18CD"
				},
				{
					target: "E12000005",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E06000013",
			name: "North Lincolnshire",
			namew: null,
			fid: 64,
			prefix: "LAD18",
			refs: [
				{
					target: "E12000003",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000166",
			name: "Richmondshire",
			namew: null,
			fid: 65,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000023",
					type: "CTY18CD"
				},
				{
					target: "E12000003",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "S12000030",
			name: "Stirling",
			namew: null,
			fid: 66,
			prefix: "LAD18",
			refs: [
			]
		},
		{
			code: "S12000033",
			name: "Aberdeen City",
			namew: null,
			fid: 67,
			prefix: "LAD18",
			refs: [
			]
		},
		{
			code: "E06000014",
			name: "York",
			namew: null,
			fid: 68,
			prefix: "LAD18",
			refs: [
				{
					target: "E12000003",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000220",
			name: "Rugby",
			namew: null,
			fid: 69,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000031",
					type: "CTY18CD"
				},
				{
					target: "E12000005",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000167",
			name: "Ryedale",
			namew: null,
			fid: 70,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000023",
					type: "CTY18CD"
				},
				{
					target: "E12000003",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000168",
			name: "Scarborough",
			namew: null,
			fid: 71,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000023",
					type: "CTY18CD"
				},
				{
					target: "E12000003",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "S12000034",
			name: "Aberdeenshire",
			namew: null,
			fid: 72,
			prefix: "LAD18",
			refs: [
			]
		},
		{
			code: "E07000221",
			name: "Stratford-on-Avon",
			namew: null,
			fid: 73,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000031",
					type: "CTY18CD"
				},
				{
					target: "E12000005",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E06000015",
			name: "Derby",
			namew: null,
			fid: 74,
			prefix: "LAD18",
			refs: [
				{
					target: "E12000004",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E06000016",
			name: "Leicester",
			namew: null,
			fid: 75,
			prefix: "LAD18",
			refs: [
				{
					target: "E12000004",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "S12000035",
			name: "Argyll and Bute",
			namew: null,
			fid: 76,
			prefix: "LAD18",
			refs: [
			]
		},
		{
			code: "E07000169",
			name: "Selby",
			namew: null,
			fid: 77,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000023",
					type: "CTY18CD"
				},
				{
					target: "E12000003",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000222",
			name: "Warwick",
			namew: null,
			fid: 78,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000031",
					type: "CTY18CD"
				},
				{
					target: "E12000005",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "S12000036",
			name: "City of Edinburgh",
			namew: null,
			fid: 79,
			prefix: "LAD18",
			refs: [
			]
		},
		{
			code: "E07000170",
			name: "Ashfield",
			namew: null,
			fid: 80,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000024",
					type: "CTY18CD"
				},
				{
					target: "E12000004",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E06000017",
			name: "Rutland",
			namew: null,
			fid: 81,
			prefix: "LAD18",
			refs: [
				{
					target: "E12000004",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000223",
			name: "Adur",
			namew: null,
			fid: 82,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000032",
					type: "CTY18CD"
				},
				{
					target: "E12000008",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "S12000038",
			name: "Renfrewshire",
			namew: null,
			fid: 83,
			prefix: "LAD18",
			refs: [
			]
		},
		{
			code: "E07000171",
			name: "Bassetlaw",
			namew: null,
			fid: 84,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000024",
					type: "CTY18CD"
				},
				{
					target: "E12000004",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E06000018",
			name: "Nottingham",
			namew: null,
			fid: 85,
			prefix: "LAD18",
			refs: [
				{
					target: "E12000004",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "S12000039",
			name: "West Dunbartonshire",
			namew: null,
			fid: 86,
			prefix: "LAD18",
			refs: [
			]
		},
		{
			code: "E07000224",
			name: "Arun",
			namew: null,
			fid: 87,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000032",
					type: "CTY18CD"
				},
				{
					target: "E12000008",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000172",
			name: "Broxtowe",
			namew: null,
			fid: 88,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000024",
					type: "CTY18CD"
				},
				{
					target: "E12000004",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "S12000040",
			name: "West Lothian",
			namew: null,
			fid: 89,
			prefix: "LAD18",
			refs: [
			]
		},
		{
			code: "E06000019",
			name: "Herefordshire, County of",
			namew: null,
			fid: 90,
			prefix: "LAD18",
			refs: [
				{
					target: "E12000005",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000225",
			name: "Chichester",
			namew: null,
			fid: 91,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000032",
					type: "CTY18CD"
				},
				{
					target: "E12000008",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000173",
			name: "Gedling",
			namew: null,
			fid: 92,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000024",
					type: "CTY18CD"
				},
				{
					target: "E12000004",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "S12000041",
			name: "Angus",
			namew: null,
			fid: 93,
			prefix: "LAD18",
			refs: [
			]
		},
		{
			code: "E06000020",
			name: "Telford and Wrekin",
			namew: null,
			fid: 94,
			prefix: "LAD18",
			refs: [
				{
					target: "E12000005",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000174",
			name: "Mansfield",
			namew: null,
			fid: 95,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000024",
					type: "CTY18CD"
				},
				{
					target: "E12000004",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000226",
			name: "Crawley",
			namew: null,
			fid: 96,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000032",
					type: "CTY18CD"
				},
				{
					target: "E12000008",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "S12000042",
			name: "Dundee City",
			namew: null,
			fid: 97,
			prefix: "LAD18",
			refs: [
			]
		},
		{
			code: "E07000175",
			name: "Newark and Sherwood",
			namew: null,
			fid: 98,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000024",
					type: "CTY18CD"
				},
				{
					target: "E12000004",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E06000021",
			name: "Stoke-on-Trent",
			namew: null,
			fid: 99,
			prefix: "LAD18",
			refs: [
				{
					target: "E12000005",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000227",
			name: "Horsham",
			namew: null,
			fid: 100,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000032",
					type: "CTY18CD"
				},
				{
					target: "E12000008",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "S12000044",
			name: "North Lanarkshire",
			namew: null,
			fid: 101,
			prefix: "LAD18",
			refs: [
			]
		},
		{
			code: "E07000176",
			name: "Rushcliffe",
			namew: null,
			fid: 102,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000024",
					type: "CTY18CD"
				},
				{
					target: "E12000004",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E06000022",
			name: "Bath and North East Somerset",
			namew: null,
			fid: 103,
			prefix: "LAD18",
			refs: [
				{
					target: "E47000009",
					type: "CAUTH18CD"
				},
				{
					target: "E12000009",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "S12000045",
			name: "East Dunbartonshire",
			namew: null,
			fid: 104,
			prefix: "LAD18",
			refs: [
			]
		},
		{
			code: "E07000228",
			name: "Mid Sussex",
			namew: null,
			fid: 105,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000032",
					type: "CTY18CD"
				},
				{
					target: "E12000008",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000177",
			name: "Cherwell",
			namew: null,
			fid: 106,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000025",
					type: "CTY18CD"
				},
				{
					target: "E12000008",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "S12000046",
			name: "Glasgow City",
			namew: null,
			fid: 107,
			prefix: "LAD18",
			refs: [
			]
		},
		{
			code: "E06000023",
			name: "Bristol, City of",
			namew: null,
			fid: 108,
			prefix: "LAD18",
			refs: [
				{
					target: "E47000009",
					type: "CAUTH18CD"
				},
				{
					target: "E12000009",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000229",
			name: "Worthing",
			namew: null,
			fid: 109,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000032",
					type: "CTY18CD"
				},
				{
					target: "E12000008",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000178",
			name: "Oxford",
			namew: null,
			fid: 110,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000025",
					type: "CTY18CD"
				},
				{
					target: "E12000008",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "S12000047",
			name: "Fife",
			namew: null,
			fid: 111,
			prefix: "LAD18",
			refs: [
			]
		},
		{
			code: "S12000048",
			name: "Perth and Kinross",
			namew: null,
			fid: 112,
			prefix: "LAD18",
			refs: [
			]
		},
		{
			code: "W06000001",
			name: "Isle of Anglesey",
			namew: "Ynys Môn",
			fid: 113,
			prefix: "LAD18",
			refs: [
			]
		},
		{
			code: "W06000002",
			name: "Gwynedd",
			namew: "Gwynedd",
			fid: 114,
			prefix: "LAD18",
			refs: [
			]
		},
		{
			code: "W06000003",
			name: "Conwy",
			namew: "Conwy",
			fid: 115,
			prefix: "LAD18",
			refs: [
			]
		},
		{
			code: "W06000004",
			name: "Denbighshire",
			namew: "Sir Ddinbych",
			fid: 116,
			prefix: "LAD18",
			refs: [
			]
		},
		{
			code: "W06000005",
			name: "Flintshire",
			namew: "Sir y Fflint",
			fid: 117,
			prefix: "LAD18",
			refs: [
			]
		},
		{
			code: "W06000006",
			name: "Wrexham",
			namew: "Wrecsam",
			fid: 118,
			prefix: "LAD18",
			refs: [
			]
		},
		{
			code: "W06000008",
			name: "Ceredigion",
			namew: "Ceredigion",
			fid: 119,
			prefix: "LAD18",
			refs: [
			]
		},
		{
			code: "W06000009",
			name: "Pembrokeshire",
			namew: "Sir Benfro",
			fid: 120,
			prefix: "LAD18",
			refs: [
			]
		},
		{
			code: "W06000010",
			name: "Carmarthenshire",
			namew: "Sir Gaerfyrddin",
			fid: 121,
			prefix: "LAD18",
			refs: [
			]
		},
		{
			code: "W06000011",
			name: "Swansea",
			namew: "Abertawe",
			fid: 122,
			prefix: "LAD18",
			refs: [
			]
		},
		{
			code: "W06000012",
			name: "Neath Port Talbot",
			namew: "Castell-nedd Port Talbot",
			fid: 123,
			prefix: "LAD18",
			refs: [
			]
		},
		{
			code: "W06000013",
			name: "Bridgend",
			namew: "Pen-y-bont ar Ogwr",
			fid: 124,
			prefix: "LAD18",
			refs: [
			]
		},
		{
			code: "W06000014",
			name: "Vale of Glamorgan",
			namew: "Bro Morgannwg",
			fid: 125,
			prefix: "LAD18",
			refs: [
			]
		},
		{
			code: "W06000015",
			name: "Cardiff",
			namew: "Caerdydd",
			fid: 126,
			prefix: "LAD18",
			refs: [
			]
		},
		{
			code: "W06000016",
			name: "Rhondda Cynon Taf",
			namew: "Rhondda Cynon Taf",
			fid: 127,
			prefix: "LAD18",
			refs: [
			]
		},
		{
			code: "W06000018",
			name: "Caerphilly",
			namew: "Caerffili",
			fid: 128,
			prefix: "LAD18",
			refs: [
			]
		},
		{
			code: "W06000019",
			name: "Blaenau Gwent",
			namew: "Blaenau Gwent",
			fid: 129,
			prefix: "LAD18",
			refs: [
			]
		},
		{
			code: "W06000020",
			name: "Torfaen",
			namew: "Torfaen",
			fid: 130,
			prefix: "LAD18",
			refs: [
			]
		},
		{
			code: "W06000021",
			name: "Monmouthshire",
			namew: "Sir Fynwy",
			fid: 131,
			prefix: "LAD18",
			refs: [
			]
		},
		{
			code: "W06000022",
			name: "Newport",
			namew: "Casnewydd",
			fid: 132,
			prefix: "LAD18",
			refs: [
			]
		},
		{
			code: "W06000023",
			name: "Powys",
			namew: "Powys",
			fid: 133,
			prefix: "LAD18",
			refs: [
			]
		},
		{
			code: "W06000024",
			name: "Merthyr Tydfil",
			namew: "Merthyr Tudful",
			fid: 134,
			prefix: "LAD18",
			refs: [
			]
		},
		{
			code: "E07000004",
			name: "Aylesbury Vale",
			namew: null,
			fid: 135,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000002",
					type: "CTY18CD"
				},
				{
					target: "E12000008",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E06000024",
			name: "North Somerset",
			namew: null,
			fid: 136,
			prefix: "LAD18",
			refs: [
				{
					target: "E12000009",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E06000025",
			name: "South Gloucestershire",
			namew: null,
			fid: 137,
			prefix: "LAD18",
			refs: [
				{
					target: "E47000009",
					type: "CAUTH18CD"
				},
				{
					target: "E12000009",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E06000026",
			name: "Plymouth",
			namew: null,
			fid: 138,
			prefix: "LAD18",
			refs: [
				{
					target: "E12000009",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000179",
			name: "South Oxfordshire",
			namew: null,
			fid: 139,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000025",
					type: "CTY18CD"
				},
				{
					target: "E12000008",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E06000027",
			name: "Torbay",
			namew: null,
			fid: 140,
			prefix: "LAD18",
			refs: [
				{
					target: "E12000009",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000180",
			name: "Vale of White Horse",
			namew: null,
			fid: 141,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000025",
					type: "CTY18CD"
				},
				{
					target: "E12000008",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000234",
			name: "Bromsgrove",
			namew: null,
			fid: 142,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000034",
					type: "CTY18CD"
				},
				{
					target: "E12000005",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000005",
			name: "Chiltern",
			namew: null,
			fid: 143,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000002",
					type: "CTY18CD"
				},
				{
					target: "E12000008",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E06000028",
			name: "Bournemouth",
			namew: null,
			fid: 144,
			prefix: "LAD18",
			refs: [
				{
					target: "E12000009",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000181",
			name: "West Oxfordshire",
			namew: null,
			fid: 145,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000025",
					type: "CTY18CD"
				},
				{
					target: "E12000008",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000235",
			name: "Malvern Hills",
			namew: null,
			fid: 146,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000034",
					type: "CTY18CD"
				},
				{
					target: "E12000005",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000006",
			name: "South Bucks",
			namew: null,
			fid: 147,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000002",
					type: "CTY18CD"
				},
				{
					target: "E12000008",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E06000029",
			name: "Poole",
			namew: null,
			fid: 148,
			prefix: "LAD18",
			refs: [
				{
					target: "E12000009",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000187",
			name: "Mendip",
			namew: null,
			fid: 149,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000027",
					type: "CTY18CD"
				},
				{
					target: "E12000009",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000236",
			name: "Redditch",
			namew: null,
			fid: 150,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000034",
					type: "CTY18CD"
				},
				{
					target: "E12000005",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000007",
			name: "Wycombe",
			namew: null,
			fid: 151,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000002",
					type: "CTY18CD"
				},
				{
					target: "E12000008",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E06000030",
			name: "Swindon",
			namew: null,
			fid: 152,
			prefix: "LAD18",
			refs: [
				{
					target: "E12000009",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000188",
			name: "Sedgemoor",
			namew: null,
			fid: 153,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000027",
					type: "CTY18CD"
				},
				{
					target: "E12000009",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000237",
			name: "Worcester",
			namew: null,
			fid: 154,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000034",
					type: "CTY18CD"
				},
				{
					target: "E12000005",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000008",
			name: "Cambridge",
			namew: null,
			fid: 155,
			prefix: "LAD18",
			refs: [
				{
					target: "E47000008",
					type: "CAUTH18CD"
				},
				{
					target: "E10000003",
					type: "CTY18CD"
				},
				{
					target: "E12000006",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E06000031",
			name: "Peterborough",
			namew: null,
			fid: 156,
			prefix: "LAD18",
			refs: [
				{
					target: "E47000008",
					type: "CAUTH18CD"
				},
				{
					target: "E12000006",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000189",
			name: "South Somerset",
			namew: null,
			fid: 157,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000027",
					type: "CTY18CD"
				},
				{
					target: "E12000009",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000238",
			name: "Wychavon",
			namew: null,
			fid: 158,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000034",
					type: "CTY18CD"
				},
				{
					target: "E12000005",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000009",
			name: "East Cambridgeshire",
			namew: null,
			fid: 159,
			prefix: "LAD18",
			refs: [
				{
					target: "E47000008",
					type: "CAUTH18CD"
				},
				{
					target: "E10000003",
					type: "CTY18CD"
				},
				{
					target: "E12000006",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E06000032",
			name: "Luton",
			namew: null,
			fid: 160,
			prefix: "LAD18",
			refs: [
				{
					target: "E12000006",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000190",
			name: "Taunton Deane",
			namew: null,
			fid: 161,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000027",
					type: "CTY18CD"
				},
				{
					target: "E12000009",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000239",
			name: "Wyre Forest",
			namew: null,
			fid: 162,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000034",
					type: "CTY18CD"
				},
				{
					target: "E12000005",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000010",
			name: "Fenland",
			namew: null,
			fid: 163,
			prefix: "LAD18",
			refs: [
				{
					target: "E47000008",
					type: "CAUTH18CD"
				},
				{
					target: "E10000003",
					type: "CTY18CD"
				},
				{
					target: "E12000006",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E06000033",
			name: "Southend-on-Sea",
			namew: null,
			fid: 164,
			prefix: "LAD18",
			refs: [
				{
					target: "E12000006",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000191",
			name: "West Somerset",
			namew: null,
			fid: 165,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000027",
					type: "CTY18CD"
				},
				{
					target: "E12000009",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000240",
			name: "St Albans",
			namew: null,
			fid: 166,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000015",
					type: "CTY18CD"
				},
				{
					target: "E12000006",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000011",
			name: "Huntingdonshire",
			namew: null,
			fid: 167,
			prefix: "LAD18",
			refs: [
				{
					target: "E47000008",
					type: "CAUTH18CD"
				},
				{
					target: "E10000003",
					type: "CTY18CD"
				},
				{
					target: "E12000006",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E06000034",
			name: "Thurrock",
			namew: null,
			fid: 168,
			prefix: "LAD18",
			refs: [
				{
					target: "E12000006",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000192",
			name: "Cannock Chase",
			namew: null,
			fid: 169,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000028",
					type: "CTY18CD"
				},
				{
					target: "E12000005",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000241",
			name: "Welwyn Hatfield",
			namew: null,
			fid: 170,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000015",
					type: "CTY18CD"
				},
				{
					target: "E12000006",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000012",
			name: "South Cambridgeshire",
			namew: null,
			fid: 171,
			prefix: "LAD18",
			refs: [
				{
					target: "E47000008",
					type: "CAUTH18CD"
				},
				{
					target: "E10000003",
					type: "CTY18CD"
				},
				{
					target: "E12000006",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E06000035",
			name: "Medway",
			namew: null,
			fid: 172,
			prefix: "LAD18",
			refs: [
				{
					target: "E12000008",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000193",
			name: "East Staffordshire",
			namew: null,
			fid: 173,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000028",
					type: "CTY18CD"
				},
				{
					target: "E12000005",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000242",
			name: "East Hertfordshire",
			namew: null,
			fid: 174,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000015",
					type: "CTY18CD"
				},
				{
					target: "E12000006",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000026",
			name: "Allerdale",
			namew: null,
			fid: 175,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000006",
					type: "CTY18CD"
				},
				{
					target: "E12000002",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E06000036",
			name: "Bracknell Forest",
			namew: null,
			fid: 176,
			prefix: "LAD18",
			refs: [
				{
					target: "E12000008",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000194",
			name: "Lichfield",
			namew: null,
			fid: 177,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000028",
					type: "CTY18CD"
				},
				{
					target: "E12000005",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000243",
			name: "Stevenage",
			namew: null,
			fid: 178,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000015",
					type: "CTY18CD"
				},
				{
					target: "E12000006",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000027",
			name: "Barrow-in-Furness",
			namew: null,
			fid: 179,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000006",
					type: "CTY18CD"
				},
				{
					target: "E12000002",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E06000037",
			name: "West Berkshire",
			namew: null,
			fid: 180,
			prefix: "LAD18",
			refs: [
				{
					target: "E12000008",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000195",
			name: "Newcastle-under-Lyme",
			namew: null,
			fid: 181,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000028",
					type: "CTY18CD"
				},
				{
					target: "E12000005",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E08000001",
			name: "Bolton",
			namew: null,
			fid: 182,
			prefix: "LAD18",
			refs: [
				{
					target: "E47000001",
					type: "CAUTH18CD"
				},
				{
					target: "E11000001",
					type: "CTY18CD"
				},
				{
					target: "E12000002",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000028",
			name: "Carlisle",
			namew: null,
			fid: 183,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000006",
					type: "CTY18CD"
				},
				{
					target: "E12000002",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E06000038",
			name: "Reading",
			namew: null,
			fid: 184,
			prefix: "LAD18",
			refs: [
				{
					target: "E12000008",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000196",
			name: "South Staffordshire",
			namew: null,
			fid: 185,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000028",
					type: "CTY18CD"
				},
				{
					target: "E12000005",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E08000002",
			name: "Bury",
			namew: null,
			fid: 186,
			prefix: "LAD18",
			refs: [
				{
					target: "E47000001",
					type: "CAUTH18CD"
				},
				{
					target: "E11000001",
					type: "CTY18CD"
				},
				{
					target: "E12000002",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000029",
			name: "Copeland",
			namew: null,
			fid: 187,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000006",
					type: "CTY18CD"
				},
				{
					target: "E12000002",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E06000039",
			name: "Slough",
			namew: null,
			fid: 188,
			prefix: "LAD18",
			refs: [
				{
					target: "E12000008",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000197",
			name: "Stafford",
			namew: null,
			fid: 189,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000028",
					type: "CTY18CD"
				},
				{
					target: "E12000005",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E08000003",
			name: "Manchester",
			namew: null,
			fid: 190,
			prefix: "LAD18",
			refs: [
				{
					target: "E47000001",
					type: "CAUTH18CD"
				},
				{
					target: "E11000001",
					type: "CTY18CD"
				},
				{
					target: "E12000002",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000030",
			name: "Eden",
			namew: null,
			fid: 191,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000006",
					type: "CTY18CD"
				},
				{
					target: "E12000002",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E06000040",
			name: "Windsor and Maidenhead",
			namew: null,
			fid: 192,
			prefix: "LAD18",
			refs: [
				{
					target: "E12000008",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000198",
			name: "Staffordshire Moorlands",
			namew: null,
			fid: 193,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000028",
					type: "CTY18CD"
				},
				{
					target: "E12000005",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E08000004",
			name: "Oldham",
			namew: null,
			fid: 194,
			prefix: "LAD18",
			refs: [
				{
					target: "E47000001",
					type: "CAUTH18CD"
				},
				{
					target: "E11000001",
					type: "CTY18CD"
				},
				{
					target: "E12000002",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000031",
			name: "South Lakeland",
			namew: null,
			fid: 195,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000006",
					type: "CTY18CD"
				},
				{
					target: "E12000002",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E06000041",
			name: "Wokingham",
			namew: null,
			fid: 196,
			prefix: "LAD18",
			refs: [
				{
					target: "E12000008",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000199",
			name: "Tamworth",
			namew: null,
			fid: 197,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000028",
					type: "CTY18CD"
				},
				{
					target: "E12000005",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E08000005",
			name: "Rochdale",
			namew: null,
			fid: 198,
			prefix: "LAD18",
			refs: [
				{
					target: "E47000001",
					type: "CAUTH18CD"
				},
				{
					target: "E11000001",
					type: "CTY18CD"
				},
				{
					target: "E12000002",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000032",
			name: "Amber Valley",
			namew: null,
			fid: 199,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000007",
					type: "CTY18CD"
				},
				{
					target: "E12000004",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E06000042",
			name: "Milton Keynes",
			namew: null,
			fid: 200,
			prefix: "LAD18",
			refs: [
				{
					target: "E12000008",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000200",
			name: "Babergh",
			namew: null,
			fid: 201,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000029",
					type: "CTY18CD"
				},
				{
					target: "E12000006",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E08000006",
			name: "Salford",
			namew: null,
			fid: 202,
			prefix: "LAD18",
			refs: [
				{
					target: "E47000001",
					type: "CAUTH18CD"
				},
				{
					target: "E11000001",
					type: "CTY18CD"
				},
				{
					target: "E12000002",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000033",
			name: "Bolsover",
			namew: null,
			fid: 203,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000007",
					type: "CTY18CD"
				},
				{
					target: "E12000004",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E06000043",
			name: "Brighton and Hove",
			namew: null,
			fid: 204,
			prefix: "LAD18",
			refs: [
				{
					target: "E12000008",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000201",
			name: "Forest Heath",
			namew: null,
			fid: 205,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000029",
					type: "CTY18CD"
				},
				{
					target: "E12000006",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E08000007",
			name: "Stockport",
			namew: null,
			fid: 206,
			prefix: "LAD18",
			refs: [
				{
					target: "E47000001",
					type: "CAUTH18CD"
				},
				{
					target: "E11000001",
					type: "CTY18CD"
				},
				{
					target: "E12000002",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000034",
			name: "Chesterfield",
			namew: null,
			fid: 207,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000007",
					type: "CTY18CD"
				},
				{
					target: "E12000004",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E06000044",
			name: "Portsmouth",
			namew: null,
			fid: 208,
			prefix: "LAD18",
			refs: [
				{
					target: "E12000008",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000202",
			name: "Ipswich",
			namew: null,
			fid: 209,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000029",
					type: "CTY18CD"
				},
				{
					target: "E12000006",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E08000008",
			name: "Tameside",
			namew: null,
			fid: 210,
			prefix: "LAD18",
			refs: [
				{
					target: "E47000001",
					type: "CAUTH18CD"
				},
				{
					target: "E11000001",
					type: "CTY18CD"
				},
				{
					target: "E12000002",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000035",
			name: "Derbyshire Dales",
			namew: null,
			fid: 211,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000007",
					type: "CTY18CD"
				},
				{
					target: "E12000004",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E06000045",
			name: "Southampton",
			namew: null,
			fid: 212,
			prefix: "LAD18",
			refs: [
				{
					target: "E12000008",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000203",
			name: "Mid Suffolk",
			namew: null,
			fid: 213,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000029",
					type: "CTY18CD"
				},
				{
					target: "E12000006",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000080",
			name: "Forest of Dean",
			namew: null,
			fid: 214,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000013",
					type: "CTY18CD"
				},
				{
					target: "E12000009",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E08000009",
			name: "Trafford",
			namew: null,
			fid: 215,
			prefix: "LAD18",
			refs: [
				{
					target: "E47000001",
					type: "CAUTH18CD"
				},
				{
					target: "E11000001",
					type: "CTY18CD"
				},
				{
					target: "E12000002",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E08000010",
			name: "Wigan",
			namew: null,
			fid: 216,
			prefix: "LAD18",
			refs: [
				{
					target: "E47000001",
					type: "CAUTH18CD"
				},
				{
					target: "E11000001",
					type: "CTY18CD"
				},
				{
					target: "E12000002",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E08000011",
			name: "Knowsley",
			namew: null,
			fid: 217,
			prefix: "LAD18",
			refs: [
				{
					target: "E47000004",
					type: "CAUTH18CD"
				},
				{
					target: "E11000002",
					type: "CTY18CD"
				},
				{
					target: "E12000002",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E08000012",
			name: "Liverpool",
			namew: null,
			fid: 218,
			prefix: "LAD18",
			refs: [
				{
					target: "E47000004",
					type: "CAUTH18CD"
				},
				{
					target: "E11000002",
					type: "CTY18CD"
				},
				{
					target: "E12000002",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E08000013",
			name: "St. Helens",
			namew: null,
			fid: 219,
			prefix: "LAD18",
			refs: [
				{
					target: "E47000004",
					type: "CAUTH18CD"
				},
				{
					target: "E11000002",
					type: "CTY18CD"
				},
				{
					target: "E12000002",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E08000014",
			name: "Sefton",
			namew: null,
			fid: 220,
			prefix: "LAD18",
			refs: [
				{
					target: "E47000004",
					type: "CAUTH18CD"
				},
				{
					target: "E11000002",
					type: "CTY18CD"
				},
				{
					target: "E12000002",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E08000015",
			name: "Wirral",
			namew: null,
			fid: 221,
			prefix: "LAD18",
			refs: [
				{
					target: "E47000004",
					type: "CAUTH18CD"
				},
				{
					target: "E11000002",
					type: "CTY18CD"
				},
				{
					target: "E12000002",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E08000016",
			name: "Barnsley",
			namew: null,
			fid: 222,
			prefix: "LAD18",
			refs: [
				{
					target: "E47000002",
					type: "CAUTH18CD"
				},
				{
					target: "E11000003",
					type: "CTY18CD"
				},
				{
					target: "E12000003",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E08000017",
			name: "Doncaster",
			namew: null,
			fid: 223,
			prefix: "LAD18",
			refs: [
				{
					target: "E47000002",
					type: "CAUTH18CD"
				},
				{
					target: "E11000003",
					type: "CTY18CD"
				},
				{
					target: "E12000003",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E08000018",
			name: "Rotherham",
			namew: null,
			fid: 224,
			prefix: "LAD18",
			refs: [
				{
					target: "E47000002",
					type: "CAUTH18CD"
				},
				{
					target: "E11000003",
					type: "CTY18CD"
				},
				{
					target: "E12000003",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E08000019",
			name: "Sheffield",
			namew: null,
			fid: 225,
			prefix: "LAD18",
			refs: [
				{
					target: "E47000002",
					type: "CAUTH18CD"
				},
				{
					target: "E11000003",
					type: "CTY18CD"
				},
				{
					target: "E12000003",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E08000021",
			name: "Newcastle upon Tyne",
			namew: null,
			fid: 226,
			prefix: "LAD18",
			refs: [
				{
					target: "E47000011",
					type: "CAUTH18CD"
				},
				{
					target: "E11000007",
					type: "CTY18CD"
				},
				{
					target: "E12000001",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E08000022",
			name: "North Tyneside",
			namew: null,
			fid: 227,
			prefix: "LAD18",
			refs: [
				{
					target: "E47000011",
					type: "CAUTH18CD"
				},
				{
					target: "E11000007",
					type: "CTY18CD"
				},
				{
					target: "E12000001",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E08000023",
			name: "South Tyneside",
			namew: null,
			fid: 228,
			prefix: "LAD18",
			refs: [
				{
					target: "E47000010",
					type: "CAUTH18CD"
				},
				{
					target: "E11000007",
					type: "CTY18CD"
				},
				{
					target: "E12000001",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E08000024",
			name: "Sunderland",
			namew: null,
			fid: 229,
			prefix: "LAD18",
			refs: [
				{
					target: "E47000010",
					type: "CAUTH18CD"
				},
				{
					target: "E11000007",
					type: "CTY18CD"
				},
				{
					target: "E12000001",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000081",
			name: "Gloucester",
			namew: null,
			fid: 230,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000013",
					type: "CTY18CD"
				},
				{
					target: "E12000009",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000036",
			name: "Erewash",
			namew: null,
			fid: 231,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000007",
					type: "CTY18CD"
				},
				{
					target: "E12000004",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000204",
			name: "St Edmundsbury",
			namew: null,
			fid: 232,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000029",
					type: "CTY18CD"
				},
				{
					target: "E12000006",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000082",
			name: "Stroud",
			namew: null,
			fid: 233,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000013",
					type: "CTY18CD"
				},
				{
					target: "E12000009",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000037",
			name: "High Peak",
			namew: null,
			fid: 234,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000007",
					type: "CTY18CD"
				},
				{
					target: "E12000004",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000205",
			name: "Suffolk Coastal",
			namew: null,
			fid: 235,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000029",
					type: "CTY18CD"
				},
				{
					target: "E12000006",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000083",
			name: "Tewkesbury",
			namew: null,
			fid: 236,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000013",
					type: "CTY18CD"
				},
				{
					target: "E12000009",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000038",
			name: "North East Derbyshire",
			namew: null,
			fid: 237,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000007",
					type: "CTY18CD"
				},
				{
					target: "E12000004",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000206",
			name: "Waveney",
			namew: null,
			fid: 238,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000029",
					type: "CTY18CD"
				},
				{
					target: "E12000006",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000084",
			name: "Basingstoke and Deane",
			namew: null,
			fid: 239,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000014",
					type: "CTY18CD"
				},
				{
					target: "E12000008",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000039",
			name: "South Derbyshire",
			namew: null,
			fid: 240,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000007",
					type: "CTY18CD"
				},
				{
					target: "E12000004",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000085",
			name: "East Hampshire",
			namew: null,
			fid: 241,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000014",
					type: "CTY18CD"
				},
				{
					target: "E12000008",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000040",
			name: "East Devon",
			namew: null,
			fid: 242,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000008",
					type: "CTY18CD"
				},
				{
					target: "E12000009",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000086",
			name: "Eastleigh",
			namew: null,
			fid: 243,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000014",
					type: "CTY18CD"
				},
				{
					target: "E12000008",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000041",
			name: "Exeter",
			namew: null,
			fid: 244,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000008",
					type: "CTY18CD"
				},
				{
					target: "E12000009",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000087",
			name: "Fareham",
			namew: null,
			fid: 245,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000014",
					type: "CTY18CD"
				},
				{
					target: "E12000008",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000042",
			name: "Mid Devon",
			namew: null,
			fid: 246,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000008",
					type: "CTY18CD"
				},
				{
					target: "E12000009",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000088",
			name: "Gosport",
			namew: null,
			fid: 247,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000014",
					type: "CTY18CD"
				},
				{
					target: "E12000008",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E06000046",
			name: "Isle of Wight",
			namew: null,
			fid: 248,
			prefix: "LAD18",
			refs: [
				{
					target: "E12000008",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000043",
			name: "North Devon",
			namew: null,
			fid: 249,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000008",
					type: "CTY18CD"
				},
				{
					target: "E12000009",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000089",
			name: "Hart",
			namew: null,
			fid: 250,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000014",
					type: "CTY18CD"
				},
				{
					target: "E12000008",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E06000047",
			name: "County Durham",
			namew: null,
			fid: 251,
			prefix: "LAD18",
			refs: [
				{
					target: "E47000010",
					type: "CAUTH18CD"
				},
				{
					target: "E12000001",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000044",
			name: "South Hams",
			namew: null,
			fid: 252,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000008",
					type: "CTY18CD"
				},
				{
					target: "E12000009",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000090",
			name: "Havant",
			namew: null,
			fid: 253,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000014",
					type: "CTY18CD"
				},
				{
					target: "E12000008",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E06000049",
			name: "Cheshire East",
			namew: null,
			fid: 254,
			prefix: "LAD18",
			refs: [
				{
					target: "E12000002",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000045",
			name: "Teignbridge",
			namew: null,
			fid: 255,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000008",
					type: "CTY18CD"
				},
				{
					target: "E12000009",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000091",
			name: "New Forest",
			namew: null,
			fid: 256,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000014",
					type: "CTY18CD"
				},
				{
					target: "E12000008",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E06000050",
			name: "Cheshire West and Chester",
			namew: null,
			fid: 257,
			prefix: "LAD18",
			refs: [
				{
					target: "E12000002",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000046",
			name: "Torridge",
			namew: null,
			fid: 258,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000008",
					type: "CTY18CD"
				},
				{
					target: "E12000009",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000092",
			name: "Rushmoor",
			namew: null,
			fid: 259,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000014",
					type: "CTY18CD"
				},
				{
					target: "E12000008",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E06000051",
			name: "Shropshire",
			namew: null,
			fid: 260,
			prefix: "LAD18",
			refs: [
				{
					target: "E12000005",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000047",
			name: "West Devon",
			namew: null,
			fid: 261,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000008",
					type: "CTY18CD"
				},
				{
					target: "E12000009",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000093",
			name: "Test Valley",
			namew: null,
			fid: 262,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000014",
					type: "CTY18CD"
				},
				{
					target: "E12000008",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E06000052",
			name: "Cornwall",
			namew: null,
			fid: 263,
			prefix: "LAD18",
			refs: [
				{
					target: "E12000009",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000048",
			name: "Christchurch",
			namew: null,
			fid: 264,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000009",
					type: "CTY18CD"
				},
				{
					target: "E12000009",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000094",
			name: "Winchester",
			namew: null,
			fid: 265,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000014",
					type: "CTY18CD"
				},
				{
					target: "E12000008",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E06000053",
			name: "Isles of Scilly",
			namew: null,
			fid: 266,
			prefix: "LAD18",
			refs: [
				{
					target: "E12000009",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000049",
			name: "East Dorset",
			namew: null,
			fid: 267,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000009",
					type: "CTY18CD"
				},
				{
					target: "E12000009",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000095",
			name: "Broxbourne",
			namew: null,
			fid: 268,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000015",
					type: "CTY18CD"
				},
				{
					target: "E12000006",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E06000054",
			name: "Wiltshire",
			namew: null,
			fid: 269,
			prefix: "LAD18",
			refs: [
				{
					target: "E12000009",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000050",
			name: "North Dorset",
			namew: null,
			fid: 270,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000009",
					type: "CTY18CD"
				},
				{
					target: "E12000009",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000096",
			name: "Dacorum",
			namew: null,
			fid: 271,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000015",
					type: "CTY18CD"
				},
				{
					target: "E12000006",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E06000055",
			name: "Bedford",
			namew: null,
			fid: 272,
			prefix: "LAD18",
			refs: [
				{
					target: "E12000006",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000051",
			name: "Purbeck",
			namew: null,
			fid: 273,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000009",
					type: "CTY18CD"
				},
				{
					target: "E12000009",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000098",
			name: "Hertsmere",
			namew: null,
			fid: 274,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000015",
					type: "CTY18CD"
				},
				{
					target: "E12000006",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E06000056",
			name: "Central Bedfordshire",
			namew: null,
			fid: 275,
			prefix: "LAD18",
			refs: [
				{
					target: "E12000006",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000052",
			name: "West Dorset",
			namew: null,
			fid: 276,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000009",
					type: "CTY18CD"
				},
				{
					target: "E12000009",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000099",
			name: "North Hertfordshire",
			namew: null,
			fid: 277,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000015",
					type: "CTY18CD"
				},
				{
					target: "E12000006",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E06000057",
			name: "Northumberland",
			namew: null,
			fid: 278,
			prefix: "LAD18",
			refs: [
				{
					target: "E47000011",
					type: "CAUTH18CD"
				},
				{
					target: "E12000001",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000053",
			name: "Weymouth and Portland",
			namew: null,
			fid: 279,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000009",
					type: "CTY18CD"
				},
				{
					target: "E12000009",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000102",
			name: "Three Rivers",
			namew: null,
			fid: 280,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000015",
					type: "CTY18CD"
				},
				{
					target: "E12000006",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000061",
			name: "Eastbourne",
			namew: null,
			fid: 281,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000011",
					type: "CTY18CD"
				},
				{
					target: "E12000008",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000103",
			name: "Watford",
			namew: null,
			fid: 282,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000015",
					type: "CTY18CD"
				},
				{
					target: "E12000006",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000062",
			name: "Hastings",
			namew: null,
			fid: 283,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000011",
					type: "CTY18CD"
				},
				{
					target: "E12000008",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000105",
			name: "Ashford",
			namew: null,
			fid: 284,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000016",
					type: "CTY18CD"
				},
				{
					target: "E12000008",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000063",
			name: "Lewes",
			namew: null,
			fid: 285,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000011",
					type: "CTY18CD"
				},
				{
					target: "E12000008",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000106",
			name: "Canterbury",
			namew: null,
			fid: 286,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000016",
					type: "CTY18CD"
				},
				{
					target: "E12000008",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000064",
			name: "Rother",
			namew: null,
			fid: 287,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000011",
					type: "CTY18CD"
				},
				{
					target: "E12000008",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000107",
			name: "Dartford",
			namew: null,
			fid: 288,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000016",
					type: "CTY18CD"
				},
				{
					target: "E12000008",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000065",
			name: "Wealden",
			namew: null,
			fid: 289,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000011",
					type: "CTY18CD"
				},
				{
					target: "E12000008",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000108",
			name: "Dover",
			namew: null,
			fid: 290,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000016",
					type: "CTY18CD"
				},
				{
					target: "E12000008",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000066",
			name: "Basildon",
			namew: null,
			fid: 291,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000012",
					type: "CTY18CD"
				},
				{
					target: "E12000006",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000109",
			name: "Gravesham",
			namew: null,
			fid: 292,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000016",
					type: "CTY18CD"
				},
				{
					target: "E12000008",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000067",
			name: "Braintree",
			namew: null,
			fid: 293,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000012",
					type: "CTY18CD"
				},
				{
					target: "E12000006",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000110",
			name: "Maidstone",
			namew: null,
			fid: 294,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000016",
					type: "CTY18CD"
				},
				{
					target: "E12000008",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000068",
			name: "Brentwood",
			namew: null,
			fid: 295,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000012",
					type: "CTY18CD"
				},
				{
					target: "E12000006",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000111",
			name: "Sevenoaks",
			namew: null,
			fid: 296,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000016",
					type: "CTY18CD"
				},
				{
					target: "E12000008",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000069",
			name: "Castle Point",
			namew: null,
			fid: 297,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000012",
					type: "CTY18CD"
				},
				{
					target: "E12000006",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000112",
			name: "Folkestone and Hythe",
			namew: null,
			fid: 298,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000016",
					type: "CTY18CD"
				},
				{
					target: "E12000008",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000070",
			name: "Chelmsford",
			namew: null,
			fid: 299,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000012",
					type: "CTY18CD"
				},
				{
					target: "E12000006",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000113",
			name: "Swale",
			namew: null,
			fid: 300,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000016",
					type: "CTY18CD"
				},
				{
					target: "E12000008",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000071",
			name: "Colchester",
			namew: null,
			fid: 301,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000012",
					type: "CTY18CD"
				},
				{
					target: "E12000006",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000114",
			name: "Thanet",
			namew: null,
			fid: 302,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000016",
					type: "CTY18CD"
				},
				{
					target: "E12000008",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000072",
			name: "Epping Forest",
			namew: null,
			fid: 303,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000012",
					type: "CTY18CD"
				},
				{
					target: "E12000006",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000115",
			name: "Tonbridge and Malling",
			namew: null,
			fid: 304,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000016",
					type: "CTY18CD"
				},
				{
					target: "E12000008",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000073",
			name: "Harlow",
			namew: null,
			fid: 305,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000012",
					type: "CTY18CD"
				},
				{
					target: "E12000006",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000116",
			name: "Tunbridge Wells",
			namew: null,
			fid: 306,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000016",
					type: "CTY18CD"
				},
				{
					target: "E12000008",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000074",
			name: "Maldon",
			namew: null,
			fid: 307,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000012",
					type: "CTY18CD"
				},
				{
					target: "E12000006",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000117",
			name: "Burnley",
			namew: null,
			fid: 308,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000017",
					type: "CTY18CD"
				},
				{
					target: "E12000002",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000075",
			name: "Rochford",
			namew: null,
			fid: 309,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000012",
					type: "CTY18CD"
				},
				{
					target: "E12000006",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000118",
			name: "Chorley",
			namew: null,
			fid: 310,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000017",
					type: "CTY18CD"
				},
				{
					target: "E12000002",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000076",
			name: "Tendring",
			namew: null,
			fid: 311,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000012",
					type: "CTY18CD"
				},
				{
					target: "E12000006",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000119",
			name: "Fylde",
			namew: null,
			fid: 312,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000017",
					type: "CTY18CD"
				},
				{
					target: "E12000002",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000077",
			name: "Uttlesford",
			namew: null,
			fid: 313,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000012",
					type: "CTY18CD"
				},
				{
					target: "E12000006",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000120",
			name: "Hyndburn",
			namew: null,
			fid: 314,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000017",
					type: "CTY18CD"
				},
				{
					target: "E12000002",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000078",
			name: "Cheltenham",
			namew: null,
			fid: 315,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000013",
					type: "CTY18CD"
				},
				{
					target: "E12000009",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000121",
			name: "Lancaster",
			namew: null,
			fid: 316,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000017",
					type: "CTY18CD"
				},
				{
					target: "E12000002",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000079",
			name: "Cotswold",
			namew: null,
			fid: 317,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000013",
					type: "CTY18CD"
				},
				{
					target: "E12000009",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000122",
			name: "Pendle",
			namew: null,
			fid: 318,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000017",
					type: "CTY18CD"
				},
				{
					target: "E12000002",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000123",
			name: "Preston",
			namew: null,
			fid: 319,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000017",
					type: "CTY18CD"
				},
				{
					target: "E12000002",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000124",
			name: "Ribble Valley",
			namew: null,
			fid: 320,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000017",
					type: "CTY18CD"
				},
				{
					target: "E12000002",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000125",
			name: "Rossendale",
			namew: null,
			fid: 321,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000017",
					type: "CTY18CD"
				},
				{
					target: "E12000002",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000126",
			name: "South Ribble",
			namew: null,
			fid: 322,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000017",
					type: "CTY18CD"
				},
				{
					target: "E12000002",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000127",
			name: "West Lancashire",
			namew: null,
			fid: 323,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000017",
					type: "CTY18CD"
				},
				{
					target: "E12000002",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000128",
			name: "Wyre",
			namew: null,
			fid: 324,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000017",
					type: "CTY18CD"
				},
				{
					target: "E12000002",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000129",
			name: "Blaby",
			namew: null,
			fid: 325,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000018",
					type: "CTY18CD"
				},
				{
					target: "E12000004",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000130",
			name: "Charnwood",
			namew: null,
			fid: 326,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000018",
					type: "CTY18CD"
				},
				{
					target: "E12000004",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000131",
			name: "Harborough",
			namew: null,
			fid: 327,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000018",
					type: "CTY18CD"
				},
				{
					target: "E12000004",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000132",
			name: "Hinckley and Bosworth",
			namew: null,
			fid: 328,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000018",
					type: "CTY18CD"
				},
				{
					target: "E12000004",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000133",
			name: "Melton",
			namew: null,
			fid: 329,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000018",
					type: "CTY18CD"
				},
				{
					target: "E12000004",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000134",
			name: "North West Leicestershire",
			namew: null,
			fid: 330,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000018",
					type: "CTY18CD"
				},
				{
					target: "E12000004",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000135",
			name: "Oadby and Wigston",
			namew: null,
			fid: 331,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000018",
					type: "CTY18CD"
				},
				{
					target: "E12000004",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000136",
			name: "Boston",
			namew: null,
			fid: 332,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000019",
					type: "CTY18CD"
				},
				{
					target: "E12000004",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000137",
			name: "East Lindsey",
			namew: null,
			fid: 333,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000019",
					type: "CTY18CD"
				},
				{
					target: "E12000004",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000138",
			name: "Lincoln",
			namew: null,
			fid: 334,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000019",
					type: "CTY18CD"
				},
				{
					target: "E12000004",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E07000139",
			name: "North Kesteven",
			namew: null,
			fid: 335,
			prefix: "LAD18",
			refs: [
				{
					target: "E10000019",
					type: "CTY18CD"
				},
				{
					target: "E12000004",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E08000025",
			name: "Birmingham",
			namew: null,
			fid: 336,
			prefix: "LAD18",
			refs: [
				{
					target: "E47000007",
					type: "CAUTH18CD"
				},
				{
					target: "E11000005",
					type: "CTY18CD"
				},
				{
					target: "E12000005",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E08000026",
			name: "Coventry",
			namew: null,
			fid: 337,
			prefix: "LAD18",
			refs: [
				{
					target: "E47000007",
					type: "CAUTH18CD"
				},
				{
					target: "E11000005",
					type: "CTY18CD"
				},
				{
					target: "E12000005",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E08000027",
			name: "Dudley",
			namew: null,
			fid: 338,
			prefix: "LAD18",
			refs: [
				{
					target: "E47000007",
					type: "CAUTH18CD"
				},
				{
					target: "E11000005",
					type: "CTY18CD"
				},
				{
					target: "E12000005",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E08000028",
			name: "Sandwell",
			namew: null,
			fid: 339,
			prefix: "LAD18",
			refs: [
				{
					target: "E47000007",
					type: "CAUTH18CD"
				},
				{
					target: "E11000005",
					type: "CTY18CD"
				},
				{
					target: "E12000005",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E08000029",
			name: "Solihull",
			namew: null,
			fid: 340,
			prefix: "LAD18",
			refs: [
				{
					target: "E47000007",
					type: "CAUTH18CD"
				},
				{
					target: "E11000005",
					type: "CTY18CD"
				},
				{
					target: "E12000005",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E08000030",
			name: "Walsall",
			namew: null,
			fid: 341,
			prefix: "LAD18",
			refs: [
				{
					target: "E47000007",
					type: "CAUTH18CD"
				},
				{
					target: "E11000005",
					type: "CTY18CD"
				},
				{
					target: "E12000005",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E08000031",
			name: "Wolverhampton",
			namew: null,
			fid: 342,
			prefix: "LAD18",
			refs: [
				{
					target: "E47000007",
					type: "CAUTH18CD"
				},
				{
					target: "E11000005",
					type: "CTY18CD"
				},
				{
					target: "E12000005",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E08000032",
			name: "Bradford",
			namew: null,
			fid: 343,
			prefix: "LAD18",
			refs: [
				{
					target: "E47000003",
					type: "CAUTH18CD"
				},
				{
					target: "E11000006",
					type: "CTY18CD"
				},
				{
					target: "E12000003",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E08000033",
			name: "Calderdale",
			namew: null,
			fid: 344,
			prefix: "LAD18",
			refs: [
				{
					target: "E47000003",
					type: "CAUTH18CD"
				},
				{
					target: "E11000006",
					type: "CTY18CD"
				},
				{
					target: "E12000003",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E08000034",
			name: "Kirklees",
			namew: null,
			fid: 345,
			prefix: "LAD18",
			refs: [
				{
					target: "E47000003",
					type: "CAUTH18CD"
				},
				{
					target: "E11000006",
					type: "CTY18CD"
				},
				{
					target: "E12000003",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E08000035",
			name: "Leeds",
			namew: null,
			fid: 346,
			prefix: "LAD18",
			refs: [
				{
					target: "E47000003",
					type: "CAUTH18CD"
				},
				{
					target: "E11000006",
					type: "CTY18CD"
				},
				{
					target: "E12000003",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E08000036",
			name: "Wakefield",
			namew: null,
			fid: 347,
			prefix: "LAD18",
			refs: [
				{
					target: "E47000003",
					type: "CAUTH18CD"
				},
				{
					target: "E11000006",
					type: "CTY18CD"
				},
				{
					target: "E12000003",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E08000037",
			name: "Gateshead",
			namew: null,
			fid: 348,
			prefix: "LAD18",
			refs: [
				{
					target: "E47000010",
					type: "CAUTH18CD"
				},
				{
					target: "E11000007",
					type: "CTY18CD"
				},
				{
					target: "E12000001",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E09000001",
			name: "City of London",
			namew: null,
			fid: 349,
			prefix: "LAD18",
			refs: [
				{
					target: "E13000001",
					type: "CTY18CD"
				},
				{
					target: "E12000007",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E09000002",
			name: "Barking and Dagenham",
			namew: null,
			fid: 350,
			prefix: "LAD18",
			refs: [
				{
					target: "E13000002",
					type: "CTY18CD"
				},
				{
					target: "E12000007",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E09000003",
			name: "Barnet",
			namew: null,
			fid: 351,
			prefix: "LAD18",
			refs: [
				{
					target: "E13000002",
					type: "CTY18CD"
				},
				{
					target: "E12000007",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E09000004",
			name: "Bexley",
			namew: null,
			fid: 352,
			prefix: "LAD18",
			refs: [
				{
					target: "E13000002",
					type: "CTY18CD"
				},
				{
					target: "E12000007",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E09000005",
			name: "Brent",
			namew: null,
			fid: 353,
			prefix: "LAD18",
			refs: [
				{
					target: "E13000002",
					type: "CTY18CD"
				},
				{
					target: "E12000007",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E09000006",
			name: "Bromley",
			namew: null,
			fid: 354,
			prefix: "LAD18",
			refs: [
				{
					target: "E13000002",
					type: "CTY18CD"
				},
				{
					target: "E12000007",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E09000007",
			name: "Camden",
			namew: null,
			fid: 355,
			prefix: "LAD18",
			refs: [
				{
					target: "E13000001",
					type: "CTY18CD"
				},
				{
					target: "E12000007",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E09000008",
			name: "Croydon",
			namew: null,
			fid: 356,
			prefix: "LAD18",
			refs: [
				{
					target: "E13000002",
					type: "CTY18CD"
				},
				{
					target: "E12000007",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E09000009",
			name: "Ealing",
			namew: null,
			fid: 357,
			prefix: "LAD18",
			refs: [
				{
					target: "E13000002",
					type: "CTY18CD"
				},
				{
					target: "E12000007",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E09000010",
			name: "Enfield",
			namew: null,
			fid: 358,
			prefix: "LAD18",
			refs: [
				{
					target: "E13000002",
					type: "CTY18CD"
				},
				{
					target: "E12000007",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E09000011",
			name: "Greenwich",
			namew: null,
			fid: 359,
			prefix: "LAD18",
			refs: [
				{
					target: "E13000002",
					type: "CTY18CD"
				},
				{
					target: "E12000007",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E09000012",
			name: "Hackney",
			namew: null,
			fid: 360,
			prefix: "LAD18",
			refs: [
				{
					target: "E13000001",
					type: "CTY18CD"
				},
				{
					target: "E12000007",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E09000013",
			name: "Hammersmith and Fulham",
			namew: null,
			fid: 361,
			prefix: "LAD18",
			refs: [
				{
					target: "E13000001",
					type: "CTY18CD"
				},
				{
					target: "E12000007",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E09000014",
			name: "Haringey",
			namew: null,
			fid: 362,
			prefix: "LAD18",
			refs: [
				{
					target: "E13000001",
					type: "CTY18CD"
				},
				{
					target: "E12000007",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E09000015",
			name: "Harrow",
			namew: null,
			fid: 363,
			prefix: "LAD18",
			refs: [
				{
					target: "E13000002",
					type: "CTY18CD"
				},
				{
					target: "E12000007",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E09000016",
			name: "Havering",
			namew: null,
			fid: 364,
			prefix: "LAD18",
			refs: [
				{
					target: "E13000002",
					type: "CTY18CD"
				},
				{
					target: "E12000007",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E09000017",
			name: "Hillingdon",
			namew: null,
			fid: 365,
			prefix: "LAD18",
			refs: [
				{
					target: "E13000002",
					type: "CTY18CD"
				},
				{
					target: "E12000007",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E09000018",
			name: "Hounslow",
			namew: null,
			fid: 366,
			prefix: "LAD18",
			refs: [
				{
					target: "E13000002",
					type: "CTY18CD"
				},
				{
					target: "E12000007",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E09000019",
			name: "Islington",
			namew: null,
			fid: 367,
			prefix: "LAD18",
			refs: [
				{
					target: "E13000001",
					type: "CTY18CD"
				},
				{
					target: "E12000007",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E09000020",
			name: "Kensington and Chelsea",
			namew: null,
			fid: 368,
			prefix: "LAD18",
			refs: [
				{
					target: "E13000001",
					type: "CTY18CD"
				},
				{
					target: "E12000007",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E09000021",
			name: "Kingston upon Thames",
			namew: null,
			fid: 369,
			prefix: "LAD18",
			refs: [
				{
					target: "E13000002",
					type: "CTY18CD"
				},
				{
					target: "E12000007",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E09000022",
			name: "Lambeth",
			namew: null,
			fid: 370,
			prefix: "LAD18",
			refs: [
				{
					target: "E13000001",
					type: "CTY18CD"
				},
				{
					target: "E12000007",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E09000023",
			name: "Lewisham",
			namew: null,
			fid: 371,
			prefix: "LAD18",
			refs: [
				{
					target: "E13000001",
					type: "CTY18CD"
				},
				{
					target: "E12000007",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E09000024",
			name: "Merton",
			namew: null,
			fid: 372,
			prefix: "LAD18",
			refs: [
				{
					target: "E13000002",
					type: "CTY18CD"
				},
				{
					target: "E12000007",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E09000025",
			name: "Newham",
			namew: null,
			fid: 373,
			prefix: "LAD18",
			refs: [
				{
					target: "E13000001",
					type: "CTY18CD"
				},
				{
					target: "E12000007",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E09000026",
			name: "Redbridge",
			namew: null,
			fid: 374,
			prefix: "LAD18",
			refs: [
				{
					target: "E13000002",
					type: "CTY18CD"
				},
				{
					target: "E12000007",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E09000027",
			name: "Richmond upon Thames",
			namew: null,
			fid: 375,
			prefix: "LAD18",
			refs: [
				{
					target: "E13000002",
					type: "CTY18CD"
				},
				{
					target: "E12000007",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E09000028",
			name: "Southwark",
			namew: null,
			fid: 376,
			prefix: "LAD18",
			refs: [
				{
					target: "E13000001",
					type: "CTY18CD"
				},
				{
					target: "E12000007",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E09000029",
			name: "Sutton",
			namew: null,
			fid: 377,
			prefix: "LAD18",
			refs: [
				{
					target: "E13000002",
					type: "CTY18CD"
				},
				{
					target: "E12000007",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E09000030",
			name: "Tower Hamlets",
			namew: null,
			fid: 378,
			prefix: "LAD18",
			refs: [
				{
					target: "E13000001",
					type: "CTY18CD"
				},
				{
					target: "E12000007",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E09000031",
			name: "Waltham Forest",
			namew: null,
			fid: 379,
			prefix: "LAD18",
			refs: [
				{
					target: "E13000002",
					type: "CTY18CD"
				},
				{
					target: "E12000007",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E09000032",
			name: "Wandsworth",
			namew: null,
			fid: 380,
			prefix: "LAD18",
			refs: [
				{
					target: "E13000001",
					type: "CTY18CD"
				},
				{
					target: "E12000007",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "E09000033",
			name: "Westminster",
			namew: null,
			fid: 381,
			prefix: "LAD18",
			refs: [
				{
					target: "E13000001",
					type: "CTY18CD"
				},
				{
					target: "E12000007",
					type: "RGN18CD"
				}
			]
		},
		{
			code: "N09000001",
			name: "Antrim and Newtownabbey",
			namew: null,
			fid: 382,
			prefix: "LAD18",
			refs: [
			]
		},
		{
			code: "N09000002",
			name: "Armagh City, Banbridge and Craigavon",
			namew: null,
			fid: 383,
			prefix: "LAD18",
			refs: [
			]
		},
		{
			code: "N09000003",
			name: "Belfast",
			namew: null,
			fid: 384,
			prefix: "LAD18",
			refs: [
			]
		},
		{
			code: "N09000004",
			name: "Causeway Coast and Glens",
			namew: null,
			fid: 385,
			prefix: "LAD18",
			refs: [
			]
		},
		{
			code: "N09000005",
			name: "Derry City and Strabane",
			namew: null,
			fid: 386,
			prefix: "LAD18",
			refs: [
			]
		},
		{
			code: "N09000006",
			name: "Fermanagh and Omagh",
			namew: null,
			fid: 387,
			prefix: "LAD18",
			refs: [
			]
		},
		{
			code: "N09000007",
			name: "Lisburn and Castlereagh",
			namew: null,
			fid: 388,
			prefix: "LAD18",
			refs: [
			]
		},
		{
			code: "N09000008",
			name: "Mid and East Antrim",
			namew: null,
			fid: 389,
			prefix: "LAD18",
			refs: [
			]
		},
		{
			code: "N09000009",
			name: "Mid Ulster",
			namew: null,
			fid: 390,
			prefix: "LAD18",
			refs: [
			]
		},
		{
			code: "N09000010",
			name: "Newry, Mourne and Down",
			namew: null,
			fid: 391,
			prefix: "LAD18",
			refs: [
			]
		},
		{
			code: "N09000001",
			name: "Antrim and Newtownabbey",
			fid: 1,
			prefix: "LGD18",
			refs: [
			]
		},
		{
			code: "N09000002",
			name: "Armagh City, Banbridge and Craigavon",
			fid: 2,
			prefix: "LGD18",
			refs: [
			]
		},
		{
			code: "N09000003",
			name: "Belfast",
			fid: 3,
			prefix: "LGD18",
			refs: [
			]
		},
		{
			code: "N09000004",
			name: "Causeway Coast and Glens",
			fid: 4,
			prefix: "LGD18",
			refs: [
			]
		},
		{
			code: "N09000005",
			name: "Derry City and Strabane",
			fid: 5,
			prefix: "LGD18",
			refs: [
			]
		},
		{
			code: "N09000006",
			name: "Fermanagh and Omagh",
			fid: 6,
			prefix: "LGD18",
			refs: [
			]
		},
		{
			code: "N09000007",
			name: "Lisburn and Castlereagh",
			fid: 7,
			prefix: "LGD18",
			refs: [
			]
		},
		{
			code: "N09000008",
			name: "Mid and East Antrim",
			fid: 8,
			prefix: "LGD18",
			refs: [
			]
		},
		{
			code: "N09000009",
			name: "Mid Ulster",
			fid: 9,
			prefix: "LGD18",
			refs: [
			]
		},
		{
			code: "N09000010",
			name: "Newry, Mourne and Down",
			fid: 10,
			prefix: "LGD18",
			refs: [
			]
		},
		{
			code: "N09000011",
			name: "Ards and North Down",
			fid: 11,
			prefix: "LGD18",
			refs: [
			]
		},
		{
			code: "E12000001",
			name: "North East",
			namew: "Gogledd Ddwyrain",
			fid: 1,
			prefix: "RGN18",
			refs: [
			]
		},
		{
			code: "E12000002",
			name: "North West",
			namew: "Gogledd Orllewin",
			fid: 2,
			prefix: "RGN18",
			refs: [
			]
		},
		{
			code: "E12000003",
			name: "Yorkshire and The Humber",
			namew: "Swydd Efrog a Humber",
			fid: 3,
			prefix: "RGN18",
			refs: [
			]
		},
		{
			code: "E12000004",
			name: "East Midlands",
			namew: "Dwyrain y Canolbarth",
			fid: 4,
			prefix: "RGN18",
			refs: [
			]
		},
		{
			code: "E12000005",
			name: "West Midlands",
			namew: "Gorllewin y Canolbarth",
			fid: 5,
			prefix: "RGN18",
			refs: [
			]
		},
		{
			code: "E12000006",
			name: "East of England",
			namew: "Dwyrain Lloegr",
			fid: 6,
			prefix: "RGN18",
			refs: [
			]
		},
		{
			code: "E12000007",
			name: "London",
			namew: "Llundain",
			fid: 7,
			prefix: "RGN18",
			refs: [
			]
		},
		{
			code: "E12000008",
			name: "South East",
			namew: "De Ddwyrain",
			fid: 8,
			prefix: "RGN18",
			refs: [
			]
		},
		{
			code: "E12000009",
			name: "South West",
			namew: "De Orllewin",
			fid: 9,
			prefix: "RGN18",
			refs: [
			]
		}
	];

	var regions = onsData.filter(function (_) {
	  return _.prefix === 'RGN18';
	}).map(function (_) {
	  return {
	    name: _.name,
	    value: _.code
	  };
	});

	var sectors = [{
	  name: 'Agriculture, Horticulture and Animal Care',
	  value: 'Agriculture, Horticulture and Animal Care'
	}, {
	  name: 'Construction, Planning and the Built Environment',
	  value: 'Construction, Planning and the Built Environment'
	}, {
	  name: 'Engineering and Manufacturing Technologies',
	  value: 'Engineering and Manufacturing Technologies'
	}];

	function lookupOne(data, key, value) {
	  return data.filter(function (_) {
	    return _[key] === value;
	  })[0];
	}

	function valueToName(reference) {
	  return function (value) {
	    return lookupOne(reference, 'value', value).name;
	  };
	}

	function Selector(props) {
	  var options = props.options.map(function (_, i) {
	    return React$1__default.createElement("option", {
	      key: i,
	      value: _.value
	    }, _.name);
	  });
	  return React$1__default.createElement("select", {
	    name: props.name,
	    multiple: true,
	    value: props.value,
	    onChange: props.handler
	  }, options);
	}

	function FilterBlock(props) {
	  var valueNames = props.value.map(valueToName(props.options));
	  return React$1__default.createElement("fieldset", {
	    id: props.name,
	    className: "filter-block"
	  }, React$1__default.createElement("label", {
	    htmlFor: props.name
	  }, props.title), React$1__default.createElement(Selector, {
	    name: props.name,
	    value: props.value,
	    options: props.options,
	    handler: props.handler
	  }), React$1__default.createElement(TagCloud, {
	    value: valueNames
	  }));
	}

	var Filter =
	/*#__PURE__*/
	function (_Component) {
	  inherits(Filter, _Component);

	  function Filter(props) {
	    var _this;

	    classCallCheck(this, Filter);

	    _this = possibleConstructorReturn(this, getPrototypeOf(Filter).call(this, props));
	    _this.handleFilterChange = _this.handleFilterChange.bind(assertThisInitialized(_this));
	    return _this;
	  }

	  createClass(Filter, [{
	    key: "handleFilterChange",
	    value: function handleFilterChange(reference) {
	      var _this2 = this;

	      return function (e) {
	        var newState = {};
	        var newValue = Array.from(e.target.selectedOptions, function (option) {
	          return option.value;
	        });
	        newState[reference] = newValue;

	        _this2.props.handler(newState);
	      };
	    }
	  }, {
	    key: "render",
	    value: function render() {
	      return React$1__default.createElement("section", {
	        id: "filter"
	      }, React$1__default.createElement("h2", null, "Filter data"), React$1__default.createElement("form", null, React$1__default.createElement(FilterBlock, {
	        title: "Region",
	        name: "region",
	        options: regions,
	        value: this.props.selected.region,
	        handler: this.handleFilterChange('regionFilter')
	      }), React$1__default.createElement(FilterBlock, {
	        title: "Sector",
	        name: "sector",
	        options: sectors,
	        value: this.props.selected.sector,
	        handler: this.handleFilterChange('sectorFilter')
	      })));
	    }
	  }]);

	  return Filter;
	}(React$1.Component);

	function BlobTitle(props) {
	  if (!props.title) return null;
	  return React.createElement("h2", null, props.title);
	}

	function Blob(props) {
	  return React.createElement(React.Fragment, null, React.createElement("article", {
	    className: "blob"
	  }, React.createElement(BlobTitle, props), React.createElement("div", {
	    className: "value"
	  }, props.value)));
	}

	function Drilldown(props) {
	  var data = props.data,
	      dimension = props.dimension,
	      category = props.category,
	      aggregator = props.aggregator;
	  var fData = data.filter(function (_) {
	    return _[dimension] === category;
	  });
	  var value = aggregator({
	    data: fData
	  });
	  var title = category;
	  return React.createElement(Blob, {
	    value: value,
	    title: title
	  });
	}

	function summariser(data) {
	  return function (acc, curr) {
	    data.forEach(function (key) {
	      if (!acc[key]) acc[key] = 0;
	      acc[key] += Number.parseInt(curr[key]) || 0;
	    });
	    return acc;
	  };
	}

	function getKeys(_ref) {
	  var data = _ref.data,
	      _ref$index = _ref.index,
	      index = _ref$index === void 0 ? 0 : _ref$index;
	  return Object.keys(data[index]).filter(function (_) {
	    return _.match(/\d{4}.*_(Starts|Achievements)/);
	  });
	}

	function sumKeys(_ref2) {
	  var data = _ref2.data,
	      keys = _ref2.keys;
	  return keys.reduce(function (acc, key) {
	    return acc + Number.parseFloat(data[key]);
	  }, 0);
	}
	function starts(_ref3) {
	  var data = _ref3.data,
	      _ref3$year = _ref3.year,
	      year = _ref3$year === void 0 ? '1718' : _ref3$year;
	  if (data.length === 0) return;
	  var yearly = data.reduce(summariser(getKeys({
	    data: data
	  })), {});
	  return sumKeys({
	    data: yearly,
	    keys: ["".concat(year, "_Starts")]
	  });
	}

	function loadJson(_x) {
	  return _loadJson.apply(this, arguments);
	}

	function _loadJson() {
	  _loadJson = asyncToGenerator(
	  /*#__PURE__*/
	  regenerator.mark(function _callee(_ref) {
	    var url, response;
	    return regenerator.wrap(function _callee$(_context) {
	      while (1) {
	        switch (_context.prev = _context.next) {
	          case 0:
	            url = _ref.url;
	            _context.next = 3;
	            return fetch(url);

	          case 3:
	            response = _context.sent;
	            return _context.abrupt("return", response.json());

	          case 5:
	          case "end":
	            return _context.stop();
	        }
	      }
	    }, _callee);
	  }));
	  return _loadJson.apply(this, arguments);
	}

	var heading = "<p>The <strong>Apprenticeship Explorer</strong> allows you to delve into the\n<a href=\"https://www.gov.uk/government/statistics/apprenticeships-and-traineeships-july-2019\">Apprenticeship data</a>\npublished by The Department for Education. It&#39;s a work in progress at present, so\n<a href=\"https://github.com/opnprd/apprenticeship-explorer/issues/new\">feedback is welcomed</a> (free GitHub account\nrequired).</p>\n";

	function onlyUnique(value, index, self) {
	  return self.indexOf(value) === index;
	}

	function getDrillTexts(_ref) {
	  var drill = _ref.drill,
	      data = _ref.data;
	  return data.map(function (_) {
	    return _[drill];
	  }).filter(onlyUnique);
	}

	function generateFilter(_ref2) {
	  var filter = _ref2.filter,
	      key = _ref2.key;
	  return function (record) {
	    return filter && filter.length > 0 ? filter.includes(record[key]) : true;
	  };
	}

	function multiFilter(filters) {
	  return function (record) {
	    return filters.reduce(function (accumulator, current) {
	      return accumulator && current(record);
	    }, true);
	  };
	}

	function filterData(_ref3) {
	  var state = _ref3.state,
	      data = _ref3.data;
	  var filter = [generateFilter({
	    filter: state.regionFilter,
	    key: 'onsRegion'
	  }), generateFilter({
	    filter: state.sectorFilter,
	    key: 'SSA T1'
	  }), generateFilter({
	    filter: state.genderFilter,
	    key: 'Gender'
	  })];
	  return data.filter(multiFilter(filter));
	}

	var Explorer =
	/*#__PURE__*/
	function (_Component) {
	  inherits(Explorer, _Component);

	  function Explorer(props) {
	    var _this;

	    classCallCheck(this, Explorer);

	    _this = possibleConstructorReturn(this, getPrototypeOf(Explorer).call(this, props));
	    _this.state = {
	      data: [],
	      filteredData: [],
	      drill: null,
	      regionFilter: ['E12000003'],
	      sectorFilter: [],
	      genderFilter: [],
	      aggregator: starts
	    };
	    _this.setFilter = _this.setFilter.bind(assertThisInitialized(_this));
	    return _this;
	  }

	  createClass(Explorer, [{
	    key: "setDrill",
	    value: function setDrill(drill) {
	      this.setState(function () {
	        return {
	          drill: drill
	        };
	      });
	    }
	  }, {
	    key: "setFilter",
	    value: function setFilter(filterSpec) {
	      this.setState(function () {
	        return filterSpec;
	      });
	      this.setState(function (state) {
	        return {
	          filteredData: filterData({
	            state: state,
	            data: state.data
	          })
	        };
	      });
	    }
	  }, {
	    key: "render",
	    value: function render() {
	      var _this2 = this;

	      var aggregator = this.state.aggregator;
	      var oneNumber = aggregator({
	        data: this.state.filteredData
	      });
	      var drillDown = null;

	      if (this.state.drill) {
	        var names = getDrillTexts({
	          data: this.state.filteredData,
	          drill: this.state.drill
	        });
	        var drills = names.map(function (drillName, i) {
	          return React$1__default.createElement(Drilldown, {
	            key: i,
	            data: _this2.state.filteredData,
	            dimension: _this2.state.drill,
	            category: drillName,
	            aggregator: aggregator
	          });
	        });
	        drillDown = React$1__default.createElement("section", {
	          id: "drilldown"
	        }, drills);
	      }

	      return React$1__default.createElement(React$1__default.Fragment, null, React$1__default.createElement("header", null, React$1__default.createElement("h1", null, "Apprenticeship Explorer")), React$1__default.createElement("article", {
	        id: "blurb",
	        dangerouslySetInnerHTML: {
	          __html: heading
	        }
	      }), React$1__default.createElement("section", {
	        id: "summary"
	      }, React$1__default.createElement(Blob, {
	        value: oneNumber
	      })), React$1__default.createElement(Filter, {
	        selected: {
	          region: this.state.regionFilter,
	          sector: this.state.sectorFilter
	        },
	        handler: this.setFilter
	      }), React$1__default.createElement("section", {
	        id: "control"
	      }, React$1__default.createElement("p", null, "Show by:"), React$1__default.createElement("button", {
	        onClick: function onClick() {
	          return _this2.setDrill('SSA T1');
	        }
	      }, "Sector"), React$1__default.createElement("button", {
	        onClick: function onClick() {
	          return _this2.setDrill('LAD');
	        }
	      }, "Local Authority"), React$1__default.createElement("button", {
	        onClick: function onClick() {
	          return _this2.setDrill('Gender');
	        }
	      }, "Gender"), React$1__default.createElement("button", {
	        onClick: function onClick() {
	          return _this2.setDrill('Level');
	        }
	      }, "Level"), React$1__default.createElement("button", {
	        onClick: function onClick() {
	          return _this2.setDrill(null);
	        }
	      }, "Clear")), drillDown);
	    }
	  }, {
	    key: "loadReport",
	    value: function () {
	      var _loadReport = asyncToGenerator(
	      /*#__PURE__*/
	      regenerator.mark(function _callee() {
	        var data, filteredData;
	        return regenerator.wrap(function _callee$(_context) {
	          while (1) {
	            switch (_context.prev = _context.next) {
	              case 0:
	                _context.next = 2;
	                return loadJson({
	                  url: this.props.url
	                });

	              case 2:
	                data = _context.sent;
	                filteredData = filterData({
	                  state: this.state,
	                  data: data
	                });
	                this.setState(function () {
	                  return {
	                    data: data,
	                    filteredData: filteredData
	                  };
	                });

	              case 5:
	              case "end":
	                return _context.stop();
	            }
	          }
	        }, _callee, this);
	      }));

	      function loadReport() {
	        return _loadReport.apply(this, arguments);
	      }

	      return loadReport;
	    }()
	  }, {
	    key: "componentDidMount",
	    value: function componentDidMount() {
	      this.loadReport(); // setInterval(() => this.loadReports(), 300000);
	    }
	  }]);

	  return Explorer;
	}(React$1.Component);

	var apprenticeData = './report.json';
	function Explorer$1(props) {
	  return React.createElement(Explorer, {
	    url: apprenticeData
	  });
	}

	function initialise() {
	  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
	      _ref$appRootId = _ref.appRootId,
	      appRootId = _ref$appRootId === void 0 ? 'app' : _ref$appRootId;

	  ReactDOM.render(React$1__default.createElement(Explorer$1, null), document.getElementById(appRootId));
	}

	initialise();

}(React, ReactDOM));
