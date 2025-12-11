"use strict";
/**
 * Log inspection helper.
 *
 * This tool retrieve a log entry and compare it to provided test object.
 *
 * If an entry is found and has at least the same properties than the provided test object,
 * execution ends with a success message and a "0" exit code.
 *
 * If no entry is found, execution ends with and error message and a "3" exit code
 *
 * If an entry is found but does not have all properties from provided test object,
 * execution ends with an error message and a "4" exit code.
 *
 * Usage:
 *
 * > ts-node parse-business-log.ts '/path/to/file.log' '{"JSON": "string", "test": "object"}'
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = require("fs");
var loadLog = function (path) { return __awaiter(void 0, void 0, void 0, function () {
    var rawData;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, fs_1.promises.readFile(path, 'utf8')];
            case 1:
                rawData = _a.sent();
                return [2 /*return*/, rawData
                        .split('\n')
                        .filter(Boolean)
                        .map(function (row) { return JSON.parse(row); })
                        .reverse()];
        }
    });
}); };
var interactionHasEvent = function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
    var logs, testEvent_1, foundEvent, differences, error_1;
    var logFile = _b[0], stringifiedTestEvent = _b[1];
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 2, , 3]);
                return [4 /*yield*/, loadLog(logFile)];
            case 1:
                logs = _c.sent();
                testEvent_1 = JSON.parse(stringifiedTestEvent);
                foundEvent = logs.find(function (log) { return log.event === testEvent_1.event; });
                if (!foundEvent) {
                    // eslint-disable-next-line no-console
                    console.error('Event not found');
                    process.exit(3);
                }
                differences = getDifferences(testEvent_1, foundEvent);
                if (differences.length > 0) {
                    // eslint-disable-next-line no-console
                    console.error("\n        Event mismatch\n        Diff: ".concat(JSON.stringify(differences), "\n        Found event: ").concat(JSON.stringify(foundEvent), "\n        Test event: ").concat(JSON.stringify(testEvent_1), "\n        "));
                    process.exit(4);
                }
                // eslint-disable-next-line no-console
                console.log('Event found and ok');
                process.exit(0);
                return [3 /*break*/, 3];
            case 2:
                error_1 = _c.sent();
                // eslint-disable-next-line no-console
                console.error(error_1);
                process.exit(1);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * Compares a test LogEvent (with validation expectations) to a source LogEvent
 * Values in the test object are by default compared to the ones of the source object using a strict equal comparison (===).
 * It is possible to use a regular expression for the comparison by providing a string starting with "RegExp:"
 * @param test object containing the key/value expectations
 * @param source LogEvent object to verify
 * @returns an array with the [key, value] from the source object not matching the test object expectations
 */
var getDifferences = function (test, source) {
    var REG_EXP_PREFIX = 'RegExp:';
    var isRegExpPattern = function (value) {
        return typeof value === 'string' && value.startsWith(REG_EXP_PREFIX);
    };
    var assertions = Object.entries(test).filter(function (_a) {
        var key = _a[0], value = _a[1];
        if (isRegExpPattern(value)) {
            var regExp = new RegExp(value.replace(REG_EXP_PREFIX, ''));
            return !regExp.test(source[key]);
        }
        return source[key] !== value;
    });
    return assertions;
};
interactionHasEvent(process.argv.slice(2));
