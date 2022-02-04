(function (globalContext, domFixer) {
	// eslint-disable-next-line no-undef
	if (typeof define === "function" && define.amd) {
		// eslint-disable-next-line no-undef
		define(domFixer.bind(globalContext));
	} else if (typeof exports === "object") {
		// eslint-disable-next-line no-undef
		module.exports = domFixer(globalContext);
	} else {
		globalContext.domFixer = domFixer(globalContext);
	}
// eslint-disable-next-line no-global-assign
})((window = window || this), function(globalContext) {
	let getPerformanceNumber = function() {};
	// TODO: Add resource loader
	const DomFixer = function (configs) {
		const self = this;
		self.readingWorks = [];
		self.writingWorks = [];
		self.requestAnimationFrame = window.requestAnimationFrame.bind(
			globalContext
		);
		self.configs = configs || {};
		self.configs.debugger = self.configs.debugger
			? console.log.bind(console, "[DomPerformanceFixer]")
			: function() {};
		self.configs.onError = self.configs.onError || null;
		if (self.configs.performanceMetricsEnabled) {
			self.performanceMetrics = [];
			getPerformanceNumber = performance.now.bind(performance);
		}
	};

	DomFixer.prototype.constructor = DomFixer;

	DomFixer.prototype.reads = function (cb, context) {
		const work = context ? cb.bind(context) : cb;
		const self = this;
		self.readingWorks.push(work);
		_planBuild(self);
		self.configs.debugger(
			"Function : reads",
			"work: ",
			work,
			"cb param: ",
			cb,
			"context param: ",
			context
		);
		return work;
	};

	DomFixer.prototype.writes = function (cb, context) {
		const work = context ? cb.bind(context) : cb;
		const self = this;
		self.writingWorks.push(work);
		_planBuild(self);
		self.configs.debugger(
			"Function : writes",
			"work: ",
			work,
			"cb param: ",
			cb,
			"context param: ",
			context
		);
		return work;
	};

	DomFixer.prototype.worksDispatcher = function (works) {
		for (const fn of works) {
			const self = this;
			let startTime;
			let endTime;
			works.shift();
			startTime = getPerformanceNumber();
			fn();
			endTime = getPerformanceNumber();
			self.performanceMetrics.push({work: fn, time: endTime - startTime});
		}
	};

	DomFixer.prototype.removeWork = function (work) {
		const self = this;
		const arr = self.readingWorks.includes(work)
			? self.readingWorks
			: self.writingWorks;
		return arr.filter(function(el) {
			return el !== work;
		});
	};

	function _build (domFixerClass) {
		const { writingWorks } = domFixerClass;
		const { readingWorks } = domFixerClass;
		const { onError } = domFixerClass.configs;
		let error;
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

	function _planBuild (domFixerClass) {
		if (domFixerClass.plannedTask) return { stillWorking: true };
		domFixerClass.plannedTask = true;
		domFixerClass.requestAnimationFrame(_build.bind(null, domFixerClass));
	}

	return DomFixer;
});
