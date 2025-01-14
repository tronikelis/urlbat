import urlbat from "../src/index.js";

// credits to https://github.com/balazsbotond/urlcat for these test suites
describe("urlbat", () => {
    it("skips dot in path segment", () => {
        const expected = "foo/1.html..";
        const actual = urlbat("foo/:id.html..", { id: 1 });
        expect(actual).toBe(expected);
    });

    it("Concatenates the base URL and the path if no params are passed", () => {
        const expected = "http://example.com/path";
        const actual = urlbat("http://example.com", "path");
        expect(actual).toBe(expected);
    });

    it("Uses exactly one slash for joining even if the base URL has a trailing slash", () => {
        const expected = "http://example.com/path";
        const actual = urlbat("http://example.com/", "path");
        expect(actual).toBe(expected);
    });

    it("Uses exactly one slash for joining even if the path has a leading slash", () => {
        const expected = "http://example.com/path";
        const actual = urlbat("http://example.com", "/path");
        expect(actual).toBe(expected);
    });

    it("Uses exactly one slash for joining even if the base URL and the path both have a slash at the boundary", () => {
        const expected = "http://example.com/path";
        const actual = urlbat("http://example.com/", "/path");
        expect(actual).toBe(expected);
    });

    it("Substitutes path parameters", () => {
        const expected = "http://example.com/path/1";
        const actual = urlbat("http://example.com/", "/path/:p", { p: 1 });
        expect(actual).toBe(expected);
    });

    it("Allows path parameters at the beginning of the path", () => {
        const expected = "http://example.com/1";
        const actual = urlbat("http://example.com/", ":p", { p: 1 });
        expect(actual).toBe(expected);
    });

    it("Parameters that are missing from the path become query parameters", () => {
        const expected = "http://example.com/path/1?q=2";
        const actual = urlbat("http://example.com/", "/path/:p", {
            p: 1,
            q: 2,
        });
        expect(actual).toBe(expected);
    });

    it("If a parameter appears twice in the path, it is substituted twice", () => {
        const expected = "http://example.com/path/a/b/a/r";
        const actual = urlbat("http://example.com/", "/path/:p1/:p2/:p1/r", {
            p1: "a",
            p2: "b",
        });
        expect(actual).toBe(expected);
    });

    it("Escapes both path and query parameters", () => {
        const expected = "http://example.com/path/a%20b?q=b+c";
        const actual = urlbat("http://example.com/", "/path/:p", {
            p: "a b",
            q: "b c",
        });
        expect(actual).toBe(expected);
    });

    it("Can handle complex URL's", () => {
        const expected =
            "http://example.com/users/123/posts/987/comments?authorId=456&limit=10&offset=120";
        const actual = urlbat("http://example.com/", "/users/:userId/posts/:postId/comments", {
            userId: 123,
            postId: 987,
            authorId: 456,
            limit: 10,
            offset: 120,
        });
        expect(actual).toBe(expected);
    });

    it("Provides an overload (baseUrl, pathTemplate) that works correctly", () => {
        const expected = "http://example.com/path";
        const actual = urlbat("http://example.com/", "/path");
        expect(actual).toBe(expected);
    });

    it('Handles "//" path correctly', () => {
        const expected = "http://example.com//";
        const actual = urlbat("http://example.com/", "//");
        expect(actual).toBe(expected);
    });

    it("Provides an overload (baseTemplate, params) that works correctly", () => {
        const expected = "http://example.com/path/a%20b?q=b+c";
        const actual = urlbat("http://example.com/path/:p", {
            p: "a b",
            q: "b c",
        });
        expect(actual).toBe(expected);
    });

    it("Renders boolean (true) path params", () => {
        const expected = "http://example.com/path/true";
        const actual = urlbat("http://example.com/path/:p", { p: true });
        expect(actual).toBe(expected);
    });

    it("Renders boolean (false) path params", () => {
        const expected = "http://example.com/path/false";
        const actual = urlbat("http://example.com/path/:p", { p: false });
        expect(actual).toBe(expected);
    });

    it("Renders number path params", () => {
        const expected = "http://example.com/path/456";
        const actual = urlbat("http://example.com/path/:p", { p: 456 });
        expect(actual).toBe(expected);
    });

    it("Renders string path params", () => {
        const expected = "http://example.com/path/test";
        const actual = urlbat("http://example.com/path/:p", { p: "test" });
        expect(actual).toBe(expected);
    });

    it("Ignores entirely numeric path params", () => {
        const expected = "http://localhost:3000/path/test";
        const actual = urlbat("http://localhost:3000/path/:p", { p: "test" });
        expect(actual).toBe(expected);
    });

    it("Allows port numbers in path params", () => {
        expect(urlbat("http://example.com:8080/path/:p", { p: 1 })).toBe(
            "http://example.com:8080/path/1"
        );
    });

    it("Throws on falsy segments", () => {
        expect(() => urlbat("/base/", "/:user", { user: undefined })).toThrowError();
        expect(() => urlbat("/base/", "/:user", { user: null })).toThrowError();
    });

    it("Removes falsy values, except 0 & booleans", () => {
        expect(urlbat("/base", { foo: null, bar: undefined, boolean: true, zero: 0 })).toBe(
            "/base?boolean=true&zero=0"
        );
    });

    it("Handles unusual case", () => {
        expect(urlbat("https://example.com", "", { test: "abc" })).toBe(
            "https://example.com?test=abc"
        );
    });

    it("Sorts query params alphabetically", () => {
        expect(
            urlbat("https://example.com", {
                b: 1,
                a: 1,
                c: 1,
            })
        ).toBe("https://example.com?a=1&b=1&c=1");

        expect(
            urlbat("/aa", {
                C: "C",
                B: "B",
                A: "A",
                a: "a",
                b: "b",
                c: "c",
            })
        ).toBe("/aa?A=A&B=B&C=C&a=a&b=b&c=c");
    });

    it("Deals with empty values", () => {
        expect(urlbat("", "nice")).toEqual("nice");
        expect(urlbat("nice", "")).toEqual("nice");

        expect(urlbat("", "/nice")).toEqual("/nice");
        expect(urlbat("/nice", "")).toEqual("/nice");

        expect(urlbat("", "/nice/")).toEqual("/nice/");
        expect(urlbat("/nice/", "")).toEqual("/nice/");
    });

    it("deals with '/'", () => {
        expect(urlbat("/", "")).toEqual("/");
        expect(urlbat("", "/")).toEqual("/");

        expect(urlbat("yep/", "/")).toEqual("yep/");
        expect(urlbat("yep", "/")).toEqual("yep/");

        expect(urlbat("/yep", "/")).toEqual("/yep/");
        expect(urlbat("/yep/", "/")).toEqual("/yep/");
    });

    it("Ignores path segments if params don't exist", () => {
        const url = "/:a/b/:c";

        expect(urlbat(url, "")).toEqual(url);
        expect(urlbat(url, url)).toEqual(url + url);
        expect(urlbat(url, "/")).toEqual(url + "/");
    });
});
