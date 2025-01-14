
<h1 align="center">urlbat</h1>

<h3 align="center">Inspired by <a href="https://github.com/balazsbotond/urlcat">urlcat</a></h3>

<br />

<div align="center">

<img src="https://img.shields.io/badge/coverage-100%25-success?style=flat-square" />
<img src="https://img.shields.io/bundlephobia/minzip/urlbat?style=flat-square" />
<img src="https://img.shields.io/npm/v/urlbat?style=flat-square" />
<img src="https://img.shields.io/badge/dependencies-0-success?style=flat-square" />

</div>

<!--toc:start-->
- [What is this?](#what-is-this)
- [Why](#why)
- [Features](#features)
- [Simple example](#simple-example)
- [Install](#install)
- [Options](#options)
- [More on the array option](#more-on-the-array-option)
- [Path segments](#path-segments)
<!--toc:end-->

## What is this?

This package is meant to be a **faster and smaller** drop-in alternative for [urlcat](https://www.npmjs.com/package/urlcat).

## Why

For me, the urlcat package is very useful, but it lacks a few required features, for example, choosing how to format arrays in the querystring.

Also, the original project's last update was 2 years ago

## Features

-   750 bytes min + gzip
-   Typescript
-   0 Dependencies
-   Multiple formatters for arrays in querystrings
-   Stable, sorts the querystring

## Simple example

```javascript
const urlbat = require("urlbat").default;
import urlbat from "urlbat";

const url = urlbat("/user/:id/info", {
    id: "123",
    verbose: true,
    escaped: "/mid/",
    page: 1,
    count: 50,
});

console.log(url);
// /user/123/info?verbose=true&escaped=%2Fmid%2F&page=1&count=50
```

You can pass a base url also

```javascript
urlbat("https://example.com/", "/user/:id/info", {
    id: "123",
    nice: "yep",
});
// https://example.com/user/123/info?nice=yep
```

## Install

```bash
npm i urlbat
```

## Options

Options is the second non string object passed to the function, after parameters

-   `array`: specify which formatting behavior you want to use for arrays, default **repeat**

## More on the array option

Repeat the values:

```javascript
urlbat(
    "https://example.com/",
    "/user/:id/info",
    {
        id: "123",
        nice: ["a", "b", "c"],
    },
    { array: "repeat" }
);
// https://example.com/user/123/info?nice=a&nice=b&nice=c
```

Separate them with a comma

```javascript
urlbat(
    "https://example.com/",
    "/user/:id/info",
    {
        id: "123",
        nice: ["a", "b", "c"],
    },
    { array: "comma" }
);

// https://example.com/user/123/info?nice=a%2Cb%2Cc
```

Just JSON.stringify the thing

```javascript
const url = urlbat(
    "https://example.com/",
    "/user/:id/info",
    {
        id: "123",
        nice: ["a", "b", "c"],
    },
    { array: "stringify" }
);
// https://example.com/user/123/info?nice=%5B%22a%22%2C%22b%22%2C%22c%22%5D
```

## Path segments

From v5, the path segments are no longer just split by `/` but with `.` as well

v4:

```js
// path segment error, unknown key id.html
assert(urlbat("foo/:id.html", {id: 1}))
```

v5:

```js
assert(urlbat("foo/:id.html",{id: 1}), "foo/1.html")
```
