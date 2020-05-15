// Copyright Titanium I.T. LLC.
"use strict";

const assert = require("../util/assert");
const commandLine = require("./command_line");
const childProcess = require("child_process");
const path = require("path");

describe("CommandLine", function() {

	it("provides command-line arguments", async function() {
		const args = [ "my arg 1", "my arg 2" ];
		const { stdout } = await runModule("./_command_line_test_args_runner.js", { args });
		assert.equal(stdout, '["my arg 1","my arg 2"]');
	});

	it("writes output", async function() {
		const { stdout, stderr } = await runModule("./_command_line_test_output_runner.js");
		assert.equal(stdout, "my output", "stdout");
		assert.equal(stderr, "", "stderr");
	});

	it("writes error output", async function() {
		const { stdout, stderr } = await runModule("./_command_line_test_output_error_runner.js", { failOnError: false });
		assert.equal(stderr, "my error output", "stderr");
		assert.equal(stdout, "", "stdout");
	});

	it("exits with no error", async function() {
		const { code } = await runModule("./_command_line_test_exit_without_error_runner.js");
		assert.equal(code, 0);
	});

	it("exits with 'bad command line' error", async function() {
		const { code } = await runModule("./command_line_test_exit_with_command_line_error_runner.js");
		assert.equal(code, 1);
	});

});

function runModule(relativeModulePath, { args, failOnError = true } = {}) {
	return new Promise((resolve, reject) => {
		const absolutePath = path.resolve(__dirname, relativeModulePath);
		const options = {
			stdio: "pipe",
		};
		const child = childProcess.fork(absolutePath, args, options);

		let stdout = "";
		let stderr = "";
		child.stdout.on("data", (data) => {
			stdout += data;
		});
		child.stderr.on("data", (data) => {
			stderr += data;
		});

		child.on("exit", (code) => {
			if (failOnError && stderr !== "") {
				console.log(stderr);
				return reject(new Error("Runner failed"));
			}
			else {
				return resolve({ code, stdout, stderr });
			}
		});
	});
}
