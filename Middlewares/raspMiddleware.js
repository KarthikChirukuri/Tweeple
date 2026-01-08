// // raspMiddleware.js

// const logger = require("../logger");

// const rules = [
//   { name: "XSS", pattern: /<script.*?>/i, message: "XSS Attack detected" },
//   { name: "Path Traversal", pattern: /\.\.\//, message: "Path Traversal attempt detected" },
//   { name: "SQL Injection", pattern: /('|--|;|union|select|insert|drop|update)/i, message: "SQL Injection detected" },
//   { name: "Command Injection", pattern: /(&&|\|\||;|`)/, message: "Command Injection detected" }
// ];

// function checkPayload(payload) {
//   for (let rule of rules) {
//     if (rule.pattern.test(payload)) {
//       return rule;
//     }
//   }
//   return null;
// }

// module.exports = function (req, res, next) {
//   const data = JSON.stringify({ body: req.body, query: req.query, params: req.params });
//   const result = checkPayload(data);

//   if (result) {
//     console.log(`[RASP] Blocked ${result.name} - ${result.message}`);
//     logger.logAttack(req, result.name, result.message);
//     // return res.status(403).send("Blocked by Node Security Shield ");
//     return res.status(403).render("raspBlocked");
//   }

//   console.log(`[RASP] ${req.method} ${req.url}`);
//   next();
// };


// Middlewares/raspMiddleware.js
const logger = require("../logger");
const { v4: uuidv4 } = require("uuid");

const rules = [
  // ---------------------- XSS ATTACKS ----------------------
  { name: "XSS Script Tag", pattern: /<script\b[^>]*>(.*?)<\/script>/i, message: "Detected script tag - possible XSS attack" },
  { name: "Inline JS XSS", pattern: /\bon\w+\s*=/i, message: "Detected inline JS event attribute" },
  { name: "JS URL XSS", pattern: /javascript:/i, message: "Detected JavaScript URL injection" },
  { name: "IMG SVG XSS", pattern: /<(img|svg)\b[^>]*(onerror|onload)=/i, message: "Detected XSS via image or SVG" },
  { name: "DOM XSS", pattern: /(document\.cookie|window\.location)/i, message: "Detected DOM-based XSS attempt" },

  // ---------------------- PATH TRAVERSAL ----------------------
  { name: "Path Traversal", pattern: /(\.\.\/|\.\.\\)/, message: "Detected path traversal attempt" },
  { name: "Absolute Path Attempt", pattern: /(\/etc\/|c:\\windows)/i, message: "Detected absolute system path access" },

  // ---------------------- SQL INJECTION ----------------------
  { name: "SQL Keywords", pattern: /\b(select|union|insert|drop|update|delete|where|from)\b\s*/i, message: "Detected SQL injection keywords" },
  { name: "Blind SQL Injection", pattern: /sleep\s*\(|benchmark\s*\(/i, message: "Detected time-based blind SQL injection" },
  { name: "SQL Boolean Injection", pattern: /('|")\s*or\s*('|")?\d+=\d+/i, message: "Detected boolean SQL injection" },

  // ---------------------- NoSQL / MONGO INJECTION ----------------------
  { name: "NoSQL Operator Injection", pattern: /\$(ne|gt|lt|in|regex|where|nin|exists|all|size)/i, message: "Detected NoSQL operator injection" },
  { name: "MongoDB Query Selector Abuse", pattern: /\{.*\$(and|or|not|eq).*:.*\}/i, message: "Detected advanced MongoDB query operator abuse" },
  { name: "MongoDB Projection Abuse", pattern: /\$(slice|elemMatch|meta)/i, message: "Detected MongoDB projection injection" },
  { name: "MongoDB $where JavaScript Exec", pattern: /\$where\s*:/i, message: "Detected MongoDB JavaScript execution injection" },
  { name: "Regex DoS Injection", pattern: /\(\?\:|\(\?=|\(\?!|\{\d{4,}\}/, message: "Detected Regex-based NoSQL DoS attempt" },

  // ---------------------- COMMAND INJECTION ----------------------
  { name: "OS Command Injection", pattern: /(\|\||&&|`[^`]*`|;\s*\w+)/, message: "Detected OS command injection attempt" },
  { name: "Piping Injection", pattern: /(\||>|>>)/, message: "Detected command piping" },
  { name: "Chaining Commands", pattern: /(curl|wget|nc|ncat)\b.*http/i, message: "Detected command execution attempt via curl/wget" },

  // ---------------------- RCE / CODE EXECUTION ----------------------
  { name: "Remote Code Execution", pattern: /\b(require|child_process|process\.mainModule|exec|spawn)\b/i, message: "Detected possible RCE usage" },
  { name: "Eval Injection", pattern: /\beval\s*\(/i, message: "Detected eval() injection attempt" },
  { name: "Function Constructor Abuse", pattern: /new Function/i, message: "Detected dynamic function creation" },

  // ---------------------- SSRF ----------------------
  { name: "SSRF Localhost", pattern: /(http:\/\/(localhost|127\.0\.0\.1)|169\.254\.\d+\.\d+)/i, message: "Detected SSRF toward internal network" },
  { name: "AWS Metadata SSRF", pattern: /169\.254\.169\.254/, message: "Detected AWS metadata SSRF attempt" },

  // ---------------------- FILE INCLUSION ----------------------
  { name: "File Inclusion", pattern: /(etc\/passwd|boot\.ini|\/proc\/)/i, message: "Detected file inclusion attempt" },
  { name: "File Upload Abuse", pattern: /\.(exe|sh|bat|js|php|jsp|asp)$/i, message: "Detected malicious file upload attempt" },

  // ---------------------- HTML Injection ----------------------
  { name: "HTML Tag Injection", pattern: /<[^>]+>/i, message: "Detected unauthorized HTML tag" },

  // ---------------------- LDAP INJECTION ----------------------
  { name: "LDAP Injection", pattern: /(\(objectClass=\*|\)|\(|\|\|)/i, message: "Detected LDAP injection" },

  // ---------------------- XXE ----------------------
  { name: "XML External Entity", pattern: /<!ENTITY\s+\w+\s+SYSTEM/i, message: "Detected XML external entity attack" },

  // ---------------------- CRLF ----------------------
  { name: "CRLF Injection", pattern: /(%0d|%0a|\r|\n)/i, message: "Detected CRLF header injection" },

  // ---------------------- DIRECTORY ENUMERATION ----------------------
  { name: "Directory Bruteforce", pattern: /(admin|config|backup|\.git|\.env)/i, message: "Detected suspicious directory scanning" },

  // ---------------------- JSON / PARAMETER POLLUTION ----------------------
  { name: "Parameter Pollution", pattern: /\b(\w+)=.*\b\1=/i, message: "Detected repeated parameters" },

  // ---------------------- PAYLOAD FLOOD (DoS) ----------------------
  { name: "Payload Flooding", pattern: /.{5000,}/, message: "Detected oversized payload" },

  // ---------------------- PROTOTYPE POLLUTION ----------------------
  { name: "Prototype Pollution", pattern: /__proto__|constructor|prototype/i, message: "Detected prototype pollution attempt" },

  // ---------------------- JWT / AUTH ABUSE ----------------------
  { name: "JWT Manipulation", pattern: /(eyJhbGciOi|payload|signature)/i, message: "Detected suspicious JWT tampering" },

  // ---------------------- GraphQL Attacks ----------------------
  { name: "GraphQL Introspection", pattern: /__schema|__type/i, message: "Detected GraphQL introspection probing" },

  // ---------------------- URL Fuzzing / Scanning ----------------------
  { name: "Fuzzing Attempt", pattern: /(sqlmap|acunetix|nessus|nikto)/i, message: "Detected automated scanner/fuzzer" },

  // ---------------------- CSP Bypass ----------------------
  { name: "CSP Bypass via Data URI", pattern: /data:text\/html/i, message: "Detected CSP bypass attempt" }
];



function checkPayload(payload) {
  for (let rule of rules) {
    if (rule.pattern.test(payload)) {
      return rule;
    }
  }
  return null;
}

// Make middleware async so we can await logger
module.exports = async function (req, res, next) {
  try {
    const data = JSON.stringify({ body: req.body, query: req.query, params: req.params }).toLowerCase();
    const result = checkPayload(data);

    if (result) {
      console.log(`[RASP] Blocked ${result.name} - ${result.message}`);

      // Save log and get saved document
      const saved = await logger.logAttack(req, "rule-violation", result.name, result.message);

      // Prepare safe display info
      const incidentId = saved ? saved._id : uuidv4();
      const when = saved ? saved.createdAt : new Date();
      const ip = saved ? saved.ip : (req.ip || "unknown");
      const payloadSnippet = saved ? saved.payload : "(no snippet)";

      // Render the friendly blocked page with details
      return res.status(403).render("raspBlocked", {
        incidentId,
        rule: result.name,
        message: result.message,
        time: when,
        ip,
        payloadSnippet
      });
    }

    // normal log (optional)
    console.log(`[RASP] ${req.method} ${req.originalUrl}`);
    next();
  } catch (err) {
    console.error("[raspMiddleware] error:", err);
    // if logging fails, still fail safe: allow request or block? here we allow to avoid accidental DoS
    next();
  }
};
