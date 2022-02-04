/* eslint-disable no-undef */
const domFixer = require("../index");

const domFixerTest = new domFixer();

describe("domFixer should be a function", function() {
	it("", function() {
		let received = domFixer;
		let expected = "function";
		expect(typeof received).toBe(expected);
	});
});

describe("domFixer core behavior", function() {
	it("run reads before writes", function() {
		let spy1 = jest.spyOn(domFixerTest, "reads");
		let spy2 = jest.spyOn(domFixerTest, "writes");
		domFixerTest.reads(jest.fn());
		domFixerTest.writes(jest.fn());
		expect(spy1).toHaveBeenCalledBefore(spy2);
	});
});
