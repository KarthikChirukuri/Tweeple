// // logger.js
// const Log = require("./models/log");

// async function safePayload(req) {
//   try {
//     // create a short snippet of payload with no secrets
//     const body = req.body ? JSON.stringify(req.body) : "";
//     const query = req.query ? JSON.stringify(req.query) : "";
//     // mask common secrets
//     const masked = (body + " " + query).replace(/(authorization|token|password)\s*[:=]\s*["']?[^"']+/gi, "$1:***");
//     // limit length
//     return masked.length > 500 ? masked.slice(0, 500) + "..." : masked;
//   } catch (e) {
//     return "";
//   }
// }

// module.exports.logAttack = async function (req, type, message, extra = {}) {
//   try {
//     const payload = await safePayload(req);
//     const userId = (req.user && req.user._id) ? String(req.user._id) : extra.userId || null;

//     await Log.create({
//       type: type || "rule-violation",
//       rule: message || "",
//       message: message || "",
//       ip: (req.ip || req.connection?.remoteAddress || "").toString(),
//       userId,
//       url: req.originalUrl || req.url || extra.url || "",
//       payload
//     });
//   } catch (err) {
//     // keep server safe even if logging fails
//     console.error("[logger] error saving attack log:", err.message || err);
//   }
// };


// logger.js
const Log = require("./models/log");

/** Mask obvious secrets and create a short snippet */
async function safePayloadSnippet(req) {
  try {
    const body = req.body ? JSON.stringify(req.body) : "";
    const query = req.query ? JSON.stringify(req.query) : "";
    let combined = (body + " " + query).trim();

    // Mask common secrets (basic)
    combined = combined.replace(/(authorization|token|password)\s*[:=]\s*["']?[^"'\s]+/gi, "$1:***");

    // Remove long values, keep only first 300 chars
    if (combined.length > 300) combined = combined.slice(0, 300) + "...";

    return combined || "";
  } catch (e) {
    return "";
  }
}

module.exports.logAttack = async function (req, type, rule, message, extra = {}) {
  try {
    const payload = await safePayloadSnippet(req);
    const userId = (req.user && req.user._id) ? String(req.user._id) : (extra.userId || null);

    const doc = await Log.create({
      type: type || "rule-violation",
      rule: rule || "",
      message: message || "",
      ip: (req.ip || req.connection?.remoteAddress || "").toString(),
      userId,
      url: req.originalUrl || req.url || extra.url || "",
      payload
    });

    // return created document so middleware can show incident id
    return doc;
  } catch (err) {
    console.error("[logger] error saving attack log:", err && err.message ? err.message : err);
    return null;
  }
};
