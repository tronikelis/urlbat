import joinParts from "./joinParts.js";

export interface Opts {
    /**
     * @default "repeat"
     */
    array?: "comma" | "repeat" | "stringify";
}

export type Params = Record<string, any>;

const assert = (item: any) => {
    if (item === 0 || typeof item === "boolean") return true;
    return !!item;
};

const defOpts: Opts = { array: "repeat" };

const urlbat = (
    base: string,
    segments: string | Params,
    params?: Params | Opts,
    opts?: Opts
) => {
    const FROZEN_SEGMENTS = typeof segments === "string" ? joinParts(base, segments) : base;

    const FROZEN_PARAMS: Params =
        typeof segments === "string" ? { ...params } : { ...segments };

    const FROZEN_SETTINGS: Opts = (typeof segments === "string" ? opts : params) || defOpts;

    // params that will be used in the dynamic segments => user/:id/name => [id]
    const usedParams: string[] = [];

    let url = FROZEN_SEGMENTS;

    // generate a valid url without the query
    if (Object.values(FROZEN_PARAMS).length > 0) {
        url = url
            .split("/")
            .map(seg => {
                if (seg[0] === ":") {
                    let dotIdx = seg.indexOf(".");
                    if (dotIdx === -1) {
                        dotIdx = seg.length;
                    }

                    const key = seg.slice(1, dotIdx);
                    const value = FROZEN_PARAMS[key] as unknown;

                    if (!assert(value)) {
                        throw new Error("path segments can't be falsy, got " + String(value));
                    }

                    usedParams.push(key);
                    return encodeURIComponent(String(value)) + seg.slice(dotIdx);
                }

                return seg;
            })
            .join("/");
    }

    // delete already used params to avoid them in the querystring
    usedParams.forEach(key => {
        delete FROZEN_PARAMS[key];
    });

    const query = new URLSearchParams({});

    Object.entries(FROZEN_PARAMS)
        // removes null, undefined
        .filter(([, param]) => assert(param))

        // sort the params that will be in the querystring
        .sort(([a], [b]) => {
            if (a > b) return 1;
            if (a < b) return -1;
            return 0;
        })

        .forEach(([key, value]) => {
            if (Array.isArray(value)) {
                switch (FROZEN_SETTINGS.array) {
                    case "comma":
                        query.append(key, value.join(","));
                        break;
                    case "stringify":
                        query.append(key, JSON.stringify(value));
                        break;
                    default:
                        value.forEach(item => query.append(key, item));
                        break;
                }
                return;
            }

            if (typeof value === "object") {
                query.append(key, JSON.stringify(value));
                return;
            }

            query.append(key, String(value));
        });

    if (!query.toString()) {
        return url;
    }

    return url + "?" + query.toString();
};

export default urlbat;
export { joinParts, urlbat };
