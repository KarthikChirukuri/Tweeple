# Node Security Shield (NSS)

Node Security Shield (NSS) is a lightweight Runtime Application Self-Protection (RASP) framework designed to secure Node.js applications from runtime attacks such as SQL Injection, XSS, NoSQL Injection, Command Injection, and Path Traversal. The system operates from inside the application runtime, enabling real-time detection, blocking, and logging of malicious activities with minimal performance overhead.

---

## Abstract

Modern web applications are increasingly vulnerable to runtime security attacks that traditional perimeter-based security solutions fail to detect. Node Security Shield addresses this challenge by embedding security mechanisms directly inside Node.js applications. The framework intercepts incoming HTTP requests, analyzes user-controlled inputs, monitors dangerous runtime APIs, blocks malicious payloads, and logs security incidents in real time. By combining rule-based detection and runtime hooks, NSS provides effective protection while maintaining low latency and high performance.

---

## Introduction

Node.js has become a popular platform for developing scalable and high-performance web applications. However, its dynamic nature and extensive use of third-party dependencies introduce significant security risks. Traditional security tools such as Web Application Firewalls (WAFs) and static scanners operate outside the application and lack visibility into runtime behavior. Node Security Shield introduces an internal security layer that enables applications to defend themselves during execution, making runtime protection practical, lightweight, and effective.

---

## Problem Statement

Most Node.js applications rely on external security tools and basic input validation, which are insufficient to detect runtime attacks and internal misuse of dangerous APIs. Attacks such as NoSQL injection, command execution through compromised dependencies, and runtime payload manipulation can bypass traditional defenses. There is a need for a lightweight, runtime-based security solution that can detect, prevent, and log malicious activities from within the application without degrading performance.

---

## Objectives

- Detect malicious user inputs at runtime  
- Block SQL Injection, XSS, NoSQL Injection, Command Injection, and Path Traversal attacks  
- Monitor sensitive Node.js runtime APIs  
- Log attack metadata for analysis and auditing  
- Provide an admin dashboard for real-time visibility  
- Maintain low performance overhead  

---

## Proposed Methodology

The system intercepts all incoming HTTP requests using middleware. Request payloads, query parameters, and route parameters are analyzed using a rule-based detection engine. Suspicious patterns are blocked immediately before reaching the application logic. Runtime hooks monitor dangerous APIs such as eval() and child_process.exec(). All detected incidents are logged into MongoDB and visualized through an admin dashboard.

---

## Architecture Design

Client Request
↓
RASP Middleware
↓
Rule Engine
↓
Runtime Hooks
↓
Application Routes
↓
Logger → MongoDB
↓
Admin Dashboard

---

## Modules Description

### RASP Middleware
Intercepts HTTP requests and applies security rules to detect malicious inputs.

### Rule Engine
Uses optimized regular expressions to identify known attack signatures.

### Runtime Hooks
Overrides dangerous Node.js APIs to prevent command execution and code injection.

### Logger
Stores attack details such as IP address, payload snippet, timestamp, and URL.

### Admin Dashboard
Displays attack logs in real time for monitoring and analysis.

---

## Attacks Detected

- SQL Injection  
- NoSQL Injection  
- Cross-Site Scripting (XSS)  
- Path Traversal  
- Command Injection  
- Prototype Pollution  
- Remote Code Execution  
- Server-Side Request Forgery (SSRF)  
- File Inclusion  
- Payload Flooding  

---

## Demo Endpoints (Educational Use Only)

GET /demo/seed-testusers
GET /demo/list-testusers
POST /demo/vulnerable-delete
GET /admin/rasp-logs


⚠️ These endpoints are strictly for demonstration and ethical testing purposes.

---

## Results and Performance

### Detection Accuracy

| Attack Type | Accuracy |
|------------|----------|
| SQL Injection | 100% |
| XSS | 98% |
| NoSQL Injection | 96% |
| Path Traversal | 100% |

### Performance Overhead

| Metric | Without RASP | With RASP | Overhead |
|------|--------------|-----------|----------|
| Average Request Time | 45 ms | 48 ms | 6.6% |
| CPU Usage | 12% | 13% | 8.3% |
| Memory Usage | 220 MB | 232 MB | 5.4% |

---

## Project Structure

node-security-shield/
│
├── Middlewares/
│ └── raspMiddleware.js
├── models/
│ ├── log.js
│ ├── post.js
│ └── testUser.js
├── views/
│ ├── raspBlocked.ejs
│ └── raspLogs.ejs
├── raspHook.js
├── logger.js
├── index.js
├── .env
└── README.md

---

## Installation & Setup

git clone https://github.com/KarthikChirukuri/Tweeple.git
cd Tweeple
npm install
npm start

---

## Project Level

Difficulty Level: Medium to Hard
This project involves backend security, runtime monitoring, middleware design, and secure Node.js development.

---

## Author

Karthik Chirukuri
B.Tech – Computer Science & Engineering
Specialization: IoT, Cyber Security & Blockchain

---

## License

This project is intended for academic and educational purposes only.
