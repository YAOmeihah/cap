import { Elysia } from "elysia";

import { db } from "./db.js";
import { enforceCorsForSiteKey, handleCorsPreflightForSiteKey } from "./settings-cache.js";

export const siteverifyServer = new Elysia({
  detail: {
    tags: ["Challenges"],
  },
})
  .options("/siteverify", ({ request, set }) =>
    handleCorsPreflightForSiteKey(request, set, null),
  )
  .options("/:siteKey/siteverify", ({ request, set, params }) =>
    handleCorsPreflightForSiteKey(request, set, params.siteKey),
  )
  .post("/:siteKey?/siteverify", async ({ body, set, params, request }) => {
    const sitekeyraw = params.siteKey || false;
    const { secret, response } = body;
    let sitekey = false;
    if (response.split(":").length != 3) {
      set.status = 400;
      return { success: false, error: "Missing required parameters" };
    }
    if (sitekeyraw) {
      sitekey = sitekeyraw; //Overwrite if given as a parameter
    } else {
      sitekey = response.split(":")[0]
    }
    if (sitekeyraw && !response.startsWith(sitekeyraw)) {
      set.status = 404;
      return { success: false, error: "Invalid site key or secret" };
    }
    if (!secret || !response) {
      set.status = 400;
      return { success: false, error: "Missing required parameters" };
    }

    if (!(await enforceCorsForSiteKey(request, set, sitekey))) {
      set.status = 403;
      return { success: false, error: "Origin not allowed" };
    }

    const secretHash = await db.hget(`key:${sitekey}`, "secretHash");

    if (!secretHash || !secret) {
      set.status = 404;
      return { success: false, error: "Invalid site key or secret" };
    }

    const isValidSecret = await Bun.password.verify(secret, secretHash);

    if (!isValidSecret) {
      set.status = 403;
      return { success: false, error: "Invalid site key or secret" };
    }

    const tokenKey = `token:${response}`;
    const expires = await db.getdel(tokenKey);

    if (!expires) {
      set.status = 404;
      return { success: false, error: "Token not found" };
    }

    if (Number(expires) < Date.now()) {
      set.status = 403;
      return { success: false, error: "Token expired" };
    }

    return { success: true };
  });
