import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../apiConfig";
import Navigation from "../components/Navigation";

const PURPLE = "#7C3AED";
const BG = "#F4F4F6";

// ─── Types ────────────────────────────────────────────────────────────────────

type QuestionType = "MCQ" | "CODING" | "SCENARIO" | "REAL_WORLD";

interface Question {
  id: number;
  type: QuestionType;
  topic: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  question: string;
  options?: string[];
  correctAnswer?: string;
  expectedConcepts: string[];
}

interface MistakeAnalysisItem {
  questionId: number;
  questionNumber: number;
  topic: string;
  questionType: string;
  score: number;
  mistake: string;
  expectedApproach: string;
  improvementSuggestion: string;
}

interface AssessmentReport {
  skill: string;
  skillId: string;
  score: number;
  level: string;
  interviewReadiness: number;
  strengths: string[];
  weakAreas: string[];
  mistakeAnalysis: MistakeAnalysisItem[];
  questionResults: any[];
  completedAt: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SKILLS = [
  { id: "python",    label: "Python",                       icon: "🐍", category: "Technical",     color: "#3B82F6" },
  { id: "java",      label: "Java",                         icon: "☕", category: "Technical",     color: "#F59E0B" },
  { id: "sql",       label: "SQL",                          icon: "🗄️", category: "Technical",     color: "#10B981" },
  { id: "dsa",       label: "Data Structures & Algorithms", icon: "🧩", category: "Technical",     color: "#EF4444" },
  { id: "react",     label: "React",                        icon: "⚛️", category: "Technical",     color: "#06B6D4" },
  { id: "nodejs",    label: "Node.js",                      icon: "🟢", category: "Technical",     color: "#84CC16" },
  { id: "uiux",      label: "UI/UX",                        icon: "🎨", category: "Non-Technical", color: "#EC4899" },
  { id: "marketing", label: "Marketing",                    icon: "📣", category: "Non-Technical", color: "#F97316" },
  { id: "pm",        label: "Product Management",           icon: "📋", category: "Non-Technical", color: "#8B5CF6" },
];

const typeColors: Record<QuestionType, { bg: string; text: string; label: string }> = {
  MCQ:        { bg: "#EFF6FF", text: "#2563EB", label: "MCQ" },
  CODING:     { bg: "#F5F3FF", text: PURPLE,    label: "CODING" },
  SCENARIO:   { bg: "#FFFBEB", text: "#92400E", label: "SCENARIO" },
  REAL_WORLD: { bg: "#FFF1F2", text: "#BE123C", label: "REAL-WORLD" },
};

const QUESTION_BANK: Record<string, Question[]> = {
  python: [
    { id: 1,  type: "MCQ",        topic: "Python Basics",              difficulty: "EASY",
      question: "Which of the following is used to handle exceptions in Python?",
      options: ["try/catch", "try/except", "try/error", "handle/except"],
      correctAnswer: "try/except",
      expectedConcepts: ["exception handling", "try/except syntax"] },
    { id: 2,  type: "MCQ",        topic: "Data Structures",            difficulty: "MEDIUM",
      question: "What is the time complexity of accessing an element in a Python dictionary?",
      options: ["O(n)", "O(log n)", "O(1) average", "O(n²)"],
      correctAnswer: "O(1) average",
      expectedConcepts: ["hash table", "O(1) average", "hash collision"] },
    { id: 3,  type: "MCQ",        topic: "OOP",                        difficulty: "MEDIUM",
      question: "Which method is called when a new instance of a class is created?",
      options: ["__start__", "__create__", "__init__", "__new__"],
      correctAnswer: "__init__",
      expectedConcepts: ["__init__", "constructor", "instance creation"] },
    { id: 4,  type: "CODING",     topic: "Functions & Recursion",      difficulty: "MEDIUM",
      question: "Write a Python function `flatten(lst)` that takes a nested list of arbitrary depth and returns a single flat list.",
      expectedConcepts: ["recursion", "isinstance", "list iteration", "base case"] },
    { id: 5,  type: "CODING",     topic: "File Handling",              difficulty: "MEDIUM",
      question: "Write a Python function `word_count(filepath)` that reads a text file and returns a dictionary of word frequencies. Handle missing file gracefully.",
      expectedConcepts: ["open()", "try/except", "FileNotFoundError", "split()", "dictionary"] },
    { id: 6,  type: "CODING",     topic: "API Integration",            difficulty: "HARD",
      question: "Write a Python function `fetch_user(user_id)` that calls jsonplaceholder, handles HTTP errors and timeouts, and returns a typed dict.",
      expectedConcepts: ["requests library", "error handling", "timeout", "response.json()", "type hints"] },
    { id: 7,  type: "SCENARIO",   topic: "Error Handling",             difficulty: "MEDIUM",
      question: "Your colleague's code catches all exceptions with a bare `except:` clause and silently logs them. Production has silent failures. How do you fix this?",
      expectedConcepts: ["specific exception types", "logging levels", "re-raise", "monitoring", "bare except anti-pattern"] },
    { id: 8,  type: "SCENARIO",   topic: "Performance Optimization",   difficulty: "HARD",
      question: "A Python data pipeline processing 10 million records takes 6 hours. Reduce it to 30 minutes. Walk through your approach.",
      expectedConcepts: ["profiling", "vectorization", "multiprocessing", "generators", "pandas", "numpy"] },
    { id: 9,  type: "REAL_WORLD", topic: "System Design",              difficulty: "HARD",
      question: "Design a Python-based URL shortener. Define the data model, shortening algorithm, and how to handle 10,000 redirect requests per second.",
      expectedConcepts: ["hashing", "base62", "Redis cache", "database design", "scalability"] },
    { id: 10, type: "REAL_WORLD", topic: "Practical Problem Solving",  difficulty: "HARD",
      question: "Build a Python script that monitors a directory for new CSV files, validates schema, transforms data, and loads into PostgreSQL in near real-time.",
      expectedConcepts: ["watchdog", "pandas validation", "psycopg2", "error queuing", "idempotency"] },
  ],
  react: [
    { id: 1,  type: "MCQ",        topic: "Hooks",                      difficulty: "EASY",
      question: "Which hook runs a side effect after every render?",
      options: ["useState", "useCallback", "useEffect", "useMemo"],
      correctAnswer: "useEffect",
      expectedConcepts: ["useEffect", "lifecycle", "side effects"] },
    { id: 2,  type: "MCQ",        topic: "Performance",                difficulty: "MEDIUM",
      question: "What does React.memo do?",
      options: ["Memoizes a function's return value", "Prevents re-renders if props haven't changed", "Creates a memoized selector", "Caches API responses"],
      correctAnswer: "Prevents re-renders if props haven't changed",
      expectedConcepts: ["memoization", "shallow comparison", "re-render optimization"] },
    { id: 3,  type: "MCQ",        topic: "State Management",           difficulty: "MEDIUM",
      question: "When should you prefer useReducer over useState?",
      options: ["When state is a string", "When state logic involves multiple sub-values or next state depends on previous", "When you need async state", "Always"],
      correctAnswer: "When state logic involves multiple sub-values or next state depends on previous",
      expectedConcepts: ["complex state", "predictable updates", "action dispatch"] },
    { id: 4,  type: "CODING",     topic: "Custom Hooks",               difficulty: "MEDIUM",
      question: "Write a custom hook `useFetch(url)` that fetches data, returns { data, loading, error }, and cleans up on unmount.",
      expectedConcepts: ["useEffect", "useState", "AbortController", "cleanup", "async/await"] },
    { id: 5,  type: "CODING",     topic: "Component Design",           difficulty: "MEDIUM",
      question: "Build a reusable <Pagination> component accepting total, perPage, currentPage props with onPageChange callback.",
      expectedConcepts: ["Math.ceil", "Array.from", "controlled component", "prop types", "accessibility"] },
    { id: 6,  type: "CODING",     topic: "Context & State",            difficulty: "HARD",
      question: "Implement a ThemeProvider using React Context supporting light/dark themes, persisting to localStorage, exposing useTheme(). Avoid unnecessary re-renders.",
      expectedConcepts: ["createContext", "useContext", "localStorage", "useMemo", "provider pattern"] },
    { id: 7,  type: "SCENARIO",   topic: "Performance Debugging",      difficulty: "HARD",
      question: "A React dashboard re-renders every component on every keystroke in a search box. 50+ items. Debug and fix.",
      expectedConcepts: ["React DevTools", "React.memo", "useCallback", "useMemo", "debouncing", "virtualization"] },
    { id: 8,  type: "SCENARIO",   topic: "Architecture",               difficulty: "HARD",
      question: "Migrate a 3-year-old class-based React codebase (50+ components) to functional components. Describe your strategy.",
      expectedConcepts: ["incremental migration", "testing", "codemods", "backwards compatibility", "lifecycle mapping"] },
    { id: 9,  type: "REAL_WORLD", topic: "System Design",              difficulty: "HARD",
      question: "Design the frontend for a real-time collaborative document editor like Google Docs. Address state sync, conflict resolution, offline support.",
      expectedConcepts: ["OT/CRDT", "WebSockets", "optimistic updates", "IndexedDB", "service worker"] },
    { id: 10, type: "REAL_WORLD", topic: "Micro-frontend",             difficulty: "HARD",
      question: "Your React monolith causes deployment bottlenecks for 8 teams. Propose a micro-frontend architecture.",
      expectedConcepts: ["Module Federation", "Webpack 5", "shared dependencies", "design system", "single-spa"] },
  ],
  java: [
    { id: 1,  type: "MCQ",        topic: "Java Basics",                difficulty: "EASY",
      question: "Which keyword is used to prevent a class from being inherited in Java?",
      options: ["static", "final", "private", "abstract"],
      correctAnswer: "final",
      expectedConcepts: ["final keyword", "inheritance restriction", "class modifiers"] },
    { id: 2,  type: "MCQ",        topic: "OOP Concepts",               difficulty: "MEDIUM",
      question: "What is the main difference between an abstract class and an interface in Java (pre-Java 8)?",
      options: ["Abstract classes can have constructors, interfaces cannot", "Interfaces can have fields, abstract classes cannot", "Abstract classes cannot have methods", "There is no difference"],
      correctAnswer: "Abstract classes can have constructors, interfaces cannot",
      expectedConcepts: ["abstract class", "interface", "constructors", "multiple inheritance"] },
    { id: 3,  type: "MCQ",        topic: "Collections",                difficulty: "MEDIUM",
      question: "Which collection class would you use to maintain insertion order while ensuring no duplicate elements?",
      options: ["HashSet", "LinkedHashSet", "TreeSet", "ArrayList"],
      correctAnswer: "LinkedHashSet",
      expectedConcepts: ["LinkedHashSet", "insertion order", "Set uniqueness", "collection hierarchy"] },
    { id: 4,  type: "CODING",     topic: "Collections & Generics",     difficulty: "MEDIUM",
      question: "Write a Java method `groupByLength(List<String> words)` that returns a `Map<Integer, List<String>>` grouping words by their length.",
      expectedConcepts: ["generics", "HashMap", "computeIfAbsent", "iteration", "List manipulation"] },
    { id: 5,  type: "CODING",     topic: "Multithreading",             difficulty: "HARD",
      question: "Write a Java class `Counter` with a thread-safe `increment()` method and a `getValue()` method, ensuring correct behavior when accessed by multiple threads.",
      expectedConcepts: ["synchronized", "AtomicInteger", "thread safety", "race conditions", "volatile"] },
    { id: 6,  type: "CODING",     topic: "Exception Handling",         difficulty: "MEDIUM",
      question: "Write a Java method `readNumberFromFile(String path)` that reads an integer from a file, handling `FileNotFoundException` and `NumberFormatException` appropriately, and returns -1 if parsing fails.",
      expectedConcepts: ["try/catch/finally", "custom exceptions", "FileNotFoundException", "NumberFormatException", "resource management"] },
    { id: 7,  type: "SCENARIO",   topic: "Memory Management",          difficulty: "HARD",
      question: "Your Java application's heap usage grows steadily and eventually throws OutOfMemoryError after running for several hours. How would you diagnose and fix this?",
      expectedConcepts: ["memory leaks", "heap dump analysis", "garbage collection", "profiling tools", "object references"] },
    { id: 8,  type: "SCENARIO",   topic: "Design Patterns",            difficulty: "MEDIUM",
      question: "You're building a configuration manager that should have exactly one instance shared across the application, and must be thread-safe in a multi-threaded environment. How would you design this?",
      expectedConcepts: ["Singleton pattern", "thread safety", "lazy initialization", "double-checked locking", "enum singleton"] },
    { id: 9,  type: "REAL_WORLD", topic: "System Design",              difficulty: "HARD",
      question: "Design a Java-based inventory management backend that handles concurrent stock updates from multiple warehouses without overselling. Discuss data structures, concurrency control, and persistence.",
      expectedConcepts: ["optimistic/pessimistic locking", "transactions", "JPA/Hibernate", "concurrency", "database design"] },
    { id: 10, type: "REAL_WORLD", topic: "Spring Boot Application",    difficulty: "HARD",
      question: "Design a Spring Boot REST API for a library management system supporting book checkout, returns, and overdue fine calculation. Describe your layered architecture, key entities, and how you'd handle concurrent checkouts.",
      expectedConcepts: ["Spring Boot", "REST controllers", "service layer", "JPA entities", "concurrency handling", "scheduled tasks"] },
  ],
  sql: [
    { id: 1,  type: "MCQ",        topic: "SQL Basics",                 difficulty: "EASY",
      question: "Which SQL clause is used to filter groups after aggregation?",
      options: ["WHERE", "GROUP BY", "HAVING", "ORDER BY"],
      correctAnswer: "HAVING",
      expectedConcepts: ["HAVING clause", "aggregation", "GROUP BY", "filtering groups"] },
    { id: 2,  type: "MCQ",        topic: "Joins",                      difficulty: "MEDIUM",
      question: "Which join returns all rows from the left table and matched rows from the right table, with NULLs for non-matches?",
      options: ["INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "CROSS JOIN"],
      correctAnswer: "LEFT JOIN",
      expectedConcepts: ["LEFT JOIN", "join types", "NULL handling", "table relationships"] },
    { id: 3,  type: "MCQ",        topic: "Indexes",                    difficulty: "MEDIUM",
      question: "What is a primary downside of adding too many indexes to a table?",
      options: ["SELECT queries become slower", "INSERT/UPDATE/DELETE operations become slower", "Tables can no longer have foreign keys", "Indexes increase the need for joins"],
      correctAnswer: "INSERT/UPDATE/DELETE operations become slower",
      expectedConcepts: ["index overhead", "write performance", "index maintenance", "trade-offs"] },
    { id: 4,  type: "CODING",     topic: "Aggregation & Grouping",     difficulty: "MEDIUM",
      question: "Write a SQL query to find the department with the highest average salary, given a table `employees(id, name, department, salary)`. Return the department name and average salary.",
      expectedConcepts: ["GROUP BY", "AVG()", "ORDER BY", "LIMIT", "aggregation"] },
    { id: 5,  type: "CODING",     topic: "Window Functions",           difficulty: "HARD",
      question: "Write a SQL query using a window function to find the second-highest salary in each department from a table `employees(id, name, department, salary)`.",
      expectedConcepts: ["RANK()", "DENSE_RANK()", "PARTITION BY", "window functions", "subqueries"] },
    { id: 6,  type: "CODING",     topic: "Subqueries & CTEs",          difficulty: "HARD",
      question: "Write a SQL query using a CTE to find customers who placed orders in every month of 2024, given tables `orders(id, customer_id, order_date)` and `customers(id, name)`.",
      expectedConcepts: ["CTE (WITH clause)", "EXTRACT/MONTH", "COUNT DISTINCT", "HAVING", "set-based thinking"] },
    { id: 7,  type: "SCENARIO",   topic: "Query Optimization",         difficulty: "HARD",
      question: "A query joining a 50-million row `orders` table with a `customers` table on `customer_id` takes 30 seconds. Walk through how you would diagnose and optimize this query.",
      expectedConcepts: ["EXPLAIN/EXPLAIN ANALYZE", "indexing foreign keys", "query plan analysis", "table statistics", "denormalization"] },
    { id: 8,  type: "SCENARIO",   topic: "Data Integrity",             difficulty: "MEDIUM",
      question: "Your application allows two users to update the same row in a `bank_accounts` table simultaneously, occasionally causing incorrect balances. How would you fix this at the database level?",
      expectedConcepts: ["transactions", "ACID properties", "row-level locking", "isolation levels", "optimistic concurrency"] },
    { id: 9,  type: "REAL_WORLD", topic: "Database Design",            difficulty: "HARD",
      question: "Design a normalized database schema for an e-commerce platform supporting products, categories, orders, order items, and customer reviews. Describe tables, keys, and relationships.",
      expectedConcepts: ["normalization (3NF)", "primary/foreign keys", "many-to-many relationships", "schema design", "indexing strategy"] },
    { id: 10, type: "REAL_WORLD", topic: "Analytics & Reporting",      difficulty: "HARD",
      question: "Design a SQL-based reporting solution that generates monthly revenue trends, top-selling products, and customer retention rates for a SaaS company, given raw transactional tables. Describe your query strategy and any supporting structures.",
      expectedConcepts: ["aggregate queries", "materialized views", "date functions", "cohort analysis", "performance considerations"] },
  ],
  dsa: [
    { id: 1,  type: "MCQ",        topic: "Arrays & Complexity",        difficulty: "EASY",
      question: "What is the time complexity of inserting an element at the beginning of an array of size n?",
      options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
      correctAnswer: "O(n)",
      expectedConcepts: ["array shifting", "time complexity", "Big-O notation"] },
    { id: 2,  type: "MCQ",        topic: "Trees",                      difficulty: "MEDIUM",
      question: "In a balanced binary search tree with n nodes, what is the time complexity of search, insert, and delete operations?",
      options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
      correctAnswer: "O(log n)",
      expectedConcepts: ["binary search tree", "balanced tree", "logarithmic complexity", "tree height"] },
    { id: 3,  type: "MCQ",        topic: "Graphs",                     difficulty: "MEDIUM",
      question: "Which algorithm is most appropriate for finding the shortest path in an unweighted graph?",
      options: ["Depth-First Search", "Breadth-First Search", "Dijkstra's Algorithm", "Bellman-Ford Algorithm"],
      correctAnswer: "Breadth-First Search",
      expectedConcepts: ["BFS", "shortest path", "unweighted graphs", "graph traversal"] },
    { id: 4,  type: "CODING",     topic: "Linked Lists",               difficulty: "MEDIUM",
      question: "Write a function `reverseLinkedList(head)` that reverses a singly linked list in place and returns the new head.",
      expectedConcepts: ["pointer manipulation", "iterative reversal", "linked list traversal", "in-place algorithms"] },
    { id: 5,  type: "CODING",     topic: "Dynamic Programming",        difficulty: "HARD",
      question: "Write a function `longestCommonSubsequence(s1, s2)` that returns the length of the longest common subsequence between two strings using dynamic programming.",
      expectedConcepts: ["dynamic programming", "2D DP table", "subsequence vs substring", "memoization", "time complexity O(m*n)"] },
    { id: 6,  type: "CODING",     topic: "Trees & Recursion",          difficulty: "MEDIUM",
      question: "Write a function `levelOrderTraversal(root)` that returns the level-order traversal of a binary tree as a list of lists, one list per level.",
      expectedConcepts: ["BFS", "queue", "binary tree traversal", "level grouping"] },
    { id: 7,  type: "SCENARIO",   topic: "Algorithm Design",           difficulty: "HARD",
      question: "You're given a stream of numbers and need to efficiently find the median at any point in time. Describe the data structure and algorithm you would use, and analyze its complexity.",
      expectedConcepts: ["two heaps approach", "min-heap/max-heap", "balancing heaps", "amortized complexity", "streaming algorithms"] },
    { id: 8,  type: "SCENARIO",   topic: "Graph Algorithms",           difficulty: "HARD",
      question: "You need to detect whether a directed graph representing task dependencies contains a cycle (which would indicate a deadlock in scheduling). How would you approach this, and what would you do if a cycle is found?",
      expectedConcepts: ["cycle detection", "DFS with recursion stack", "topological sort", "directed graphs", "dependency resolution"] },
    { id: 9,  type: "REAL_WORLD", topic: "System Design with DSA",     difficulty: "HARD",
      question: "Design an autocomplete system that suggests the top 5 most relevant search queries as a user types, supporting millions of queries. Discuss the data structures you would use and how you'd update them in real-time.",
      expectedConcepts: ["Trie data structure", "top-K with heaps", "frequency counting", "caching", "real-time updates"] },
    { id: 10, type: "REAL_WORLD", topic: "Practical Problem Solving",  difficulty: "HARD",
      question: "A ride-sharing app needs to match riders to the nearest available drivers in real-time across a city. Describe the data structures and algorithms you would use to efficiently find nearby drivers.",
      expectedConcepts: ["spatial indexing", "quadtrees/geohashing", "nearest-neighbor search", "priority queues", "scalability"] },
  ],
  nodejs: [
    { id: 1,  type: "MCQ",        topic: "Node.js Basics",             difficulty: "EASY",
      question: "What is the primary mechanism Node.js uses to handle asynchronous, non-blocking I/O operations?",
      options: ["Multi-threading", "The Event Loop", "Forking processes for each request", "Synchronous I/O with callbacks"],
      correctAnswer: "The Event Loop",
      expectedConcepts: ["event loop", "non-blocking I/O", "single-threaded model", "asynchronous programming"] },
    { id: 2,  type: "MCQ",        topic: "Modules & Packages",         difficulty: "EASY",
      question: "Which file is used to define a Node.js project's dependencies, scripts, and metadata?",
      options: ["index.js", "package.json", "node_modules.json", "config.js"],
      correctAnswer: "package.json",
      expectedConcepts: ["package.json", "npm", "dependency management", "project metadata"] },
    { id: 3,  type: "MCQ",        topic: "Express Middleware",         difficulty: "MEDIUM",
      question: "In Express.js, what does calling `next()` inside a middleware function do?",
      options: ["Ends the request-response cycle", "Passes control to the next middleware in the stack", "Restarts the server", "Sends an error response"],
      correctAnswer: "Passes control to the next middleware in the stack",
      expectedConcepts: ["middleware", "next() function", "request pipeline", "Express.js"] },
    { id: 4,  type: "CODING",     topic: "REST API Development",       difficulty: "MEDIUM",
      question: "Write an Express.js route handler for `GET /users/:id` that fetches a user from a database (assume an async `findUserById(id)` function exists), returns 404 if not found, and handles errors with proper status codes.",
      expectedConcepts: ["Express routing", "async/await", "error handling middleware", "HTTP status codes", "try/catch"] },
    { id: 5,  type: "CODING",     topic: "Streams",                    difficulty: "HARD",
      question: "Write a Node.js script that reads a large CSV file using streams, transforms each row (e.g., uppercase a column), and writes the result to a new file, without loading the entire file into memory.",
      expectedConcepts: ["fs.createReadStream", "Transform streams", "pipe()", "backpressure", "memory efficiency"] },
    { id: 6,  type: "CODING",     topic: "Authentication",             difficulty: "HARD",
      question: "Write Express.js middleware `verifyToken(req, res, next)` that validates a JWT from the Authorization header, attaches the decoded user to `req.user`, and returns 401 for invalid or missing tokens.",
      expectedConcepts: ["JWT verification", "Authorization header parsing", "middleware pattern", "error responses", "jsonwebtoken library"] },
    { id: 7,  type: "SCENARIO",   topic: "Performance & Scaling",      difficulty: "HARD",
      question: "Your Node.js API server's CPU usage spikes to 100% under moderate load, causing all requests to slow down, even simple ones. How would you diagnose and fix this?",
      expectedConcepts: ["event loop blocking", "CPU profiling", "worker threads", "offloading heavy computation", "clustering"] },
    { id: 8,  type: "SCENARIO",   topic: "Error Handling & Reliability", difficulty: "MEDIUM",
      question: "An unhandled promise rejection in one of your route handlers occasionally crashes the entire Node.js process. How would you prevent this and make the application more resilient?",
      expectedConcepts: ["unhandledRejection handler", "global error middleware", "process management (PM2)", "async error wrapping", "graceful shutdown"] },
    { id: 9,  type: "REAL_WORLD", topic: "System Design",              difficulty: "HARD",
      question: "Design a Node.js backend for a real-time chat application supporting multiple rooms, message persistence, and online presence indicators for thousands of concurrent users.",
      expectedConcepts: ["WebSockets/Socket.io", "horizontal scaling", "Redis pub/sub", "message persistence", "presence tracking"] },
    { id: 10, type: "REAL_WORLD", topic: "Microservices Architecture", difficulty: "HARD",
      question: "Your Node.js monolith handling user management, payments, and notifications has become difficult to maintain and deploy. Propose a microservices architecture and describe how the services would communicate.",
      expectedConcepts: ["service decomposition", "API gateway", "message queues", "inter-service communication", "data consistency"] },
  ],
  uiux: [
    { id: 1,  type: "MCQ",        topic: "Design Fundamentals",        difficulty: "EASY",
      question: "What is the primary purpose of a 'wireframe' in the design process?",
      options: ["To finalize color schemes", "To represent the layout and structure of a page without visual design details", "To write production code", "To test server performance"],
      correctAnswer: "To represent the layout and structure of a page without visual design details",
      expectedConcepts: ["wireframing", "low-fidelity design", "layout structure", "design process"] },
    { id: 2,  type: "MCQ",        topic: "Usability Principles",       difficulty: "MEDIUM",
      question: "Which usability heuristic refers to the idea that users should always know where they are and how to get back?",
      options: ["Consistency and standards", "Visibility of system status", "Error prevention", "User control and freedom"],
      correctAnswer: "User control and freedom",
      expectedConcepts: ["Nielsen's heuristics", "user control and freedom", "navigation", "usability principles"] },
    { id: 3,  type: "MCQ",        topic: "Accessibility",              difficulty: "MEDIUM",
      question: "According to WCAG guidelines, what is the minimum recommended contrast ratio for normal body text against its background?",
      options: ["2:1", "3:1", "4.5:1", "10:1"],
      correctAnswer: "4.5:1",
      expectedConcepts: ["WCAG", "contrast ratio", "accessibility standards", "AA compliance"] },
    { id: 4,  type: "CODING",     topic: "User Research",              difficulty: "MEDIUM",
      question: "You're designing a new onboarding flow for a fitness app. Outline a user research plan: what methods would you use, who would you recruit, and what questions would you ask to validate your design assumptions?",
      expectedConcepts: ["user interviews", "usability testing", "recruitment criteria", "research questions", "validation methods"] },
    { id: 5,  type: "CODING",     topic: "Wireframing & Prototyping",  difficulty: "MEDIUM",
      question: "Describe step-by-step how you would create a clickable prototype for a 'forgot password' flow (email entry, verification, new password, confirmation) using a tool like Figma, including key states and transitions.",
      expectedConcepts: ["screen flow mapping", "interactive prototyping", "error and success states", "Figma components", "user flow diagrams"] },
    { id: 6,  type: "CODING",     topic: "Design Systems",             difficulty: "HARD",
      question: "Your team is building a design system for a multi-product company. Describe the core components, tokens, and documentation you would include, and how you'd ensure consistency across teams.",
      expectedConcepts: ["design tokens", "component libraries", "style guides", "versioning", "cross-team adoption"] },
    { id: 7,  type: "SCENARIO",   topic: "Usability Problems",         difficulty: "HARD",
      question: "Analytics show that 60% of users abandon your e-commerce checkout flow at the payment step. How would you investigate the cause and redesign the flow to reduce drop-off?",
      expectedConcepts: ["funnel analysis", "usability testing", "friction reduction", "trust signals", "form design best practices"] },
    { id: 8,  type: "SCENARIO",   topic: "Design Critique",            difficulty: "MEDIUM",
      question: "A stakeholder insists on adding a large promotional banner to the homepage that conflicts with your user research findings on clutter and load time. How would you handle this disagreement?",
      expectedConcepts: ["stakeholder management", "data-driven design decisions", "A/B testing", "communication", "balancing business and user needs"] },
    { id: 9,  type: "REAL_WORLD", topic: "End-to-End Design Process",  difficulty: "HARD",
      question: "Walk through your end-to-end design process for creating a mobile banking app's transaction history screen, from research to final handoff to developers.",
      expectedConcepts: ["research", "information architecture", "wireframing", "visual design", "developer handoff", "iteration based on feedback"] },
    { id: 10, type: "REAL_WORLD", topic: "Cross-Platform Design",      difficulty: "HARD",
      question: "Design a consistent user experience for a productivity app that works across mobile, tablet, and desktop. Discuss how layouts, navigation patterns, and interactions would adapt across these platforms.",
      expectedConcepts: ["responsive design", "platform-specific patterns", "navigation adaptation", "touch vs pointer interactions", "consistency vs platform conventions"] },
  ],
  marketing: [
    { id: 1,  type: "MCQ",        topic: "Marketing Fundamentals",     difficulty: "EASY",
      question: "What does 'CAC' stand for in marketing metrics?",
      options: ["Customer Acquisition Cost", "Conversion Average Calculation", "Customer Activity Cycle", "Channel Allocation Cost"],
      correctAnswer: "Customer Acquisition Cost",
      expectedConcepts: ["CAC", "marketing metrics", "acquisition cost", "ROI measurement"] },
    { id: 2,  type: "MCQ",        topic: "Digital Marketing Channels", difficulty: "MEDIUM",
      question: "Which metric best measures how effectively an email campaign converts recipients into customers?",
      options: ["Open rate", "Click-through rate", "Conversion rate", "Bounce rate"],
      correctAnswer: "Conversion rate",
      expectedConcepts: ["conversion rate", "email marketing metrics", "funnel measurement", "campaign performance"] },
    { id: 3,  type: "MCQ",        topic: "SEO",                        difficulty: "MEDIUM",
      question: "What is the primary purpose of building high-quality backlinks to a website?",
      options: ["To increase page load speed", "To improve the site's domain authority and search ranking", "To reduce bounce rate", "To increase ad revenue directly"],
      correctAnswer: "To improve the site's domain authority and search ranking",
      expectedConcepts: ["backlinks", "domain authority", "SEO ranking factors", "off-page SEO"] },
    { id: 4,  type: "CODING",     topic: "Campaign Planning",          difficulty: "MEDIUM",
      question: "You're launching a new productivity app targeting freelancers. Create an outline of a go-to-market campaign: target audience, key channels, messaging, and success metrics for the first 90 days.",
      expectedConcepts: ["target audience definition", "channel selection", "messaging strategy", "KPIs", "campaign timeline"] },
    { id: 5,  type: "CODING",     topic: "Content Strategy",           difficulty: "MEDIUM",
      question: "Design a content calendar outline for one month for a B2B SaaS company's blog and LinkedIn page, aimed at generating leads. Include content types, themes, and posting frequency.",
      expectedConcepts: ["content calendar", "B2B content strategy", "lead generation content", "channel-specific formats", "thematic planning"] },
    { id: 6,  type: "CODING",     topic: "Performance Marketing",      difficulty: "HARD",
      question: "Your paid social campaign has a CTR of 3% but a conversion rate of only 0.5%, well below the 2% target. Outline the steps you would take to diagnose and improve the conversion rate.",
      expectedConcepts: ["landing page optimization", "A/B testing", "audience targeting", "funnel analysis", "ad-to-landing-page message match"] },
    { id: 7,  type: "SCENARIO",   topic: "Budget Allocation",          difficulty: "HARD",
      question: "You have a $50,000 quarterly marketing budget split across paid search, social media, content marketing, and email. Sales has flagged that lead quality from paid social is poor. How would you reallocate the budget and measure the impact?",
      expectedConcepts: ["budget allocation", "channel ROI analysis", "lead quality metrics", "attribution modeling", "iterative reallocation"] },
    { id: 8,  type: "SCENARIO",   topic: "Brand Crisis Management",    difficulty: "HARD",
      question: "A viral social media post is criticizing your company's product for a bug that affected customer data. How would you respond from a marketing and communications perspective in the first 24 hours and beyond?",
      expectedConcepts: ["crisis communication", "transparency", "stakeholder messaging", "social listening", "reputation management"] },
    { id: 9,  type: "REAL_WORLD", topic: "Growth Strategy",            difficulty: "HARD",
      question: "Design a 6-month growth marketing strategy for an early-stage startup with a $20,000/month budget aiming to scale from 1,000 to 10,000 monthly active users. Cover channels, experiments, and measurement.",
      expectedConcepts: ["growth loops", "experimentation framework", "channel mix", "budget pacing", "metrics and milestones"] },
    { id: 10, type: "REAL_WORLD", topic: "Marketing Analytics",        difficulty: "HARD",
      question: "Your marketing team relies on gut feeling for decisions and lacks a measurement framework. Propose an analytics setup (tools, dashboards, and key metrics) to enable data-driven marketing decisions across channels.",
      expectedConcepts: ["analytics tooling", "attribution models", "dashboard design", "key marketing metrics (CAC, LTV, ROAS)", "data-driven culture"] },
  ],
  pm: [
    { id: 1,  type: "MCQ",        topic: "Product Management Basics", difficulty: "EASY",
      question: "What is the primary purpose of a Product Requirements Document (PRD)?",
      options: ["To track engineering bugs", "To define what a feature should do, why, and for whom, guiding the team's work", "To document the company's financial reports", "To replace user research"],
      correctAnswer: "To define what a feature should do, why, and for whom, guiding the team's work",
      expectedConcepts: ["PRD", "product requirements", "alignment", "documentation"] },
    { id: 2,  type: "MCQ",        topic: "Prioritization Frameworks",  difficulty: "MEDIUM",
      question: "In the RICE prioritization framework, what does the 'C' stand for?",
      options: ["Cost", "Confidence", "Complexity", "Customer"],
      correctAnswer: "Confidence",
      expectedConcepts: ["RICE framework", "Reach Impact Confidence Effort", "prioritization", "scoring models"] },
    { id: 3,  type: "MCQ",        topic: "Metrics & OKRs",             difficulty: "MEDIUM",
      question: "Which of the following is the best example of a 'North Star Metric' for a music streaming app?",
      options: ["Total revenue", "Number of employees", "Weekly listening hours per active user", "Number of app downloads"],
      correctAnswer: "Weekly listening hours per active user",
      expectedConcepts: ["North Star Metric", "leading vs lagging indicators", "product metrics", "user engagement"] },
    { id: 4,  type: "CODING",     topic: "Writing a PRD",              difficulty: "MEDIUM",
      question: "Write a concise PRD outline for a new 'Saved Items' feature in a shopping app, including problem statement, goals, user stories, success metrics, and out-of-scope items.",
      expectedConcepts: ["problem statement", "user stories", "success metrics", "scope definition", "PRD structure"] },
    { id: 5,  type: "CODING",     topic: "Roadmapping",                difficulty: "MEDIUM",
      question: "You're a PM for a project management tool with 4 competing feature requests (mobile app, integrations, reporting dashboard, team permissions) but capacity for only 2 this quarter. Walk through how you would prioritize and structure your roadmap.",
      expectedConcepts: ["prioritization frameworks", "stakeholder input", "roadmap structuring", "trade-off analysis", "capacity planning"] },
    { id: 6,  type: "CODING",     topic: "A/B Testing",                difficulty: "HARD",
      question: "You want to test whether a new onboarding flow increases activation rate. Describe how you would design this A/B test, including hypothesis, sample size considerations, success metrics, and how you'd interpret results.",
      expectedConcepts: ["hypothesis formulation", "A/B test design", "statistical significance", "activation metrics", "result interpretation"] },
    { id: 7,  type: "SCENARIO",   topic: "Stakeholder Management",     difficulty: "HARD",
      question: "Engineering says a highly requested feature will take 3 months, but sales has promised it to a major client in 6 weeks. How would you handle this situation?",
      expectedConcepts: ["expectation management", "scope negotiation", "cross-functional communication", "MVP scoping", "trade-off transparency"] },
    { id: 8,  type: "SCENARIO",   topic: "Product Metrics Decline",    difficulty: "HARD",
      question: "Your app's Day-7 retention dropped from 40% to 25% after the last release, which included several UI changes and a new pricing model. How would you investigate the cause?",
      expectedConcepts: ["root cause analysis", "cohort analysis", "feature flagging", "segmentation", "rollback decisions"] },
    { id: 9,  type: "REAL_WORLD", topic: "Product Strategy",           difficulty: "HARD",
      question: "You're the PM for a B2B SaaS tool with strong adoption in small businesses but struggling to break into mid-market and enterprise segments. Define a product strategy to address this.",
      expectedConcepts: ["market segmentation", "enterprise feature gaps", "pricing strategy", "competitive analysis", "go-to-market alignment"] },
    { id: 10, type: "REAL_WORLD", topic: "Zero-to-One Product",        difficulty: "HARD",
      question: "You're tasked with launching a brand-new feature: an AI-powered writing assistant inside a note-taking app. Walk through your process from discovery to launch, including how you'd validate demand and measure success post-launch.",
      expectedConcepts: ["discovery and validation", "MVP definition", "success metrics", "launch planning", "post-launch iteration"] },
  ],
};

const getQuestions = (skillId: string): Question[] =>
  QUESTION_BANK[skillId] || QUESTION_BANK["python"];

// ─── Score helpers ────────────────────────────────────────────────────────────

const getLevel = (score: number): string => {
  if (score >= 90) return "Expert";
  if (score >= 70) return "Advanced";
  if (score >= 40) return "Intermediate";
  return "Beginner";
};

const getLevelStyle = (score: number) => {
  if (score >= 90) return { color: "#10B981", bg: "#ECFDF5" };
  if (score >= 70) return { color: PURPLE,    bg: "#F5F3FF" };
  if (score >= 40) return { color: "#F59E0B", bg: "#FFFBEB" };
  return              { color: "#EF4444", bg: "#FEF2F2" };
};

const getReadinessStatus = (score: number) => {
  if (score >= 80) return { label: "Interview Ready", color: "#10B981" };
  if (score >= 60) return { label: "Nearly Ready",    color: "#F59E0B" };
  return              { label: "Needs Practice",   color: "#EF4444" };
};

const verdictColor = (v: string) =>
  ({ "STRONG PASS": "#10B981", PASS: "#10B981", BORDERLINE: "#F59E0B", FAIL: "#EF4444" }[v] ?? PURPLE);

// ─── AI response helpers ──────────────────────────────────────────────────────

const fallbackFeedback = () => ({
  score: 0,
  verdict: "FAIL" as const,
  strengths: [] as string[],
  gaps: ["Evaluation could not be parsed. Please retry."],
  ideal_approach: "",
  interviewReadiness: 0,
});

const parseAIResponse = (rawResponse: any): any => {
  try {
    const textBlock = rawResponse?.content?.[0]?.text;
    const source: string | null =
      textBlock ?? (typeof rawResponse === "string" ? rawResponse : null);

    if (source) {
      const stripped = source
        .replace(/```json\s*/gi, "")
        .replace(/```\s*/g, "")
        .trim();
      const match = stripped.match(/\{[\s\S]*\}/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        if (typeof parsed.score === "number") return parsed;
      }
    }

    if (rawResponse && typeof rawResponse.score === "number") return rawResponse;

    console.error("[parseAIResponse] Unrecognised shape:", rawResponse);
    return fallbackFeedback();
  } catch (e) {
    console.error("[parseAIResponse] Parse error:", e);
    return fallbackFeedback();
  }
};

// ─── Interview readiness (weighted) ──────────────────────────────────────────

const computeInterviewReadiness = (
  fb: Record<number, any>,
  questions: Question[]
): number => {
  const weights: Record<QuestionType, number> = {
    MCQ:        0.40,
    CODING:     0.40,
    SCENARIO:   0.30,
    REAL_WORLD: 0.30,
  };
  let weightedSum = 0;
  let totalWeight = 0;
  Object.entries(fb).forEach(([idxStr, f]) => {
    const idx = parseInt(idxStr);
    const q = questions[idx];
    if (!q || typeof f?.score !== "number") return;
    const w = weights[q.type] ?? 0.33;
    weightedSum += f.score * w;
    totalWeight += w;
  });
  return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
};

// ─── Report builder ───────────────────────────────────────────────────────────

const buildReport = (
  fb: Record<number, any>,
  questions: Question[],
  skill: { id: string; label: string }
): AssessmentReport => {
  const entries = Object.entries(fb)
    .map(([idxStr, f]) => ({ idx: parseInt(idxStr), f }))
    .filter(({ f }) => f && typeof f.score === "number");

  const avgScore =
    entries.length
      ? Math.round(entries.reduce((a, { f }) => a + f.score, 0) / entries.length)
      : 0;

  const irScore = computeInterviewReadiness(fb, questions);

  // Frequency-rank strengths and weakAreas
  const strengthFreq: Record<string, number> = {};
  const gapFreq: Record<string, number> = {};
  entries.forEach(({ f }) => {
    (f.strengths || []).forEach((s: string) => {
      strengthFreq[s] = (strengthFreq[s] ?? 0) + 1;
    });
    (f.gaps || []).forEach((g: string) => {
      gapFreq[g] = (gapFreq[g] ?? 0) + 1;
    });
  });

  const strengths = Object.entries(strengthFreq)
    .sort((a, b) => b[1] - a[1])
    .map(([s]) => s)
    .slice(0, 5);

  const weakAreas = Object.entries(gapFreq)
    .sort((a, b) => b[1] - a[1])
    .map(([g]) => g)
    .slice(0, 5);

  // Mistake analysis: questions scoring below 70
  const mistakeAnalysis: MistakeAnalysisItem[] = entries
    .filter(({ f }) => f.score < 70)
    .map(({ idx, f }) => {
      const q = questions[idx];
      // MCQ questions get structured selected/correct answer display
      if (q.type === "MCQ") {
        return {
          questionId:            q.id,
          questionNumber:        idx + 1,
          topic:                 q.topic,
          questionType:          q.type,
          score:                 f.score,
          mistake:               `Selected Option: ${f.selectedAnswer}`,
          expectedApproach:      `Correct Answer: ${f.correctAnswer}`,
          improvementSuggestion: `Review ${q.topic} concepts and practice similar questions.`,
        };
      }
      // Non-MCQ: original AI-driven analysis
      return {
        questionId:            q.id,
        questionNumber:        idx + 1,
        topic:                 q.topic,
        questionType:          q.type,
        score:                 f.score,
        mistake:               (f.gaps || []).join(". ") || "Answer was incomplete or incorrect.",
        expectedApproach:      f.ideal_approach || `Review ${q.topic} concepts and practice similar problems.`,
        improvementSuggestion: `Focus on ${q.expectedConcepts.slice(0, 3).join(", ")}.`,
      };
    });

  const questionResults = questions.map((q, idx) => {
    const f = fb[idx] || {};
    return {
      questionId:         q.id,
      questionType:       q.type,
      topic:              q.topic,
      score:              typeof f.score === "number" ? f.score : 0,
      verdict:            f.verdict || "FAIL",
      answer:             f._answer || "",
      strengths:          f.strengths || [],
      gaps:               f.gaps || [],
      idealApproach:      f.ideal_approach || "",
      interviewReadiness: typeof f.interviewReadiness === "number" ? f.interviewReadiness : 0,
    };
  });

  return {
    skill:             skill.label,
    skillId:           skill.id,
    score:             avgScore,
    level:             getLevel(avgScore),
    interviewReadiness: irScore,
    strengths,
    weakAreas,
    mistakeAnalysis,
    questionResults,
    completedAt:       new Date().toISOString(),
  };
};

// ─── localStorage helpers ─────────────────────────────────────────────────────

const STORAGE_KEY = "skillAssessmentHistory";

const safeLoadHistory = (): AssessmentReport[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveToHistory = (report: AssessmentReport): void => {
  try {
    const existing = safeLoadHistory();
    existing.unshift(report);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing.slice(0, 100)));
  } catch (e) {
    console.error("[SkillAssessment] localStorage save error:", e);
  }
};

// ─── SCREEN 1: Skill Select ───────────────────────────────────────────────────

export function SkillSelectScreen({ onSelect }: { onSelect: (skillId: string) => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

  const handleStart = () => {
    if (!selected) return;
    setStarting(true);
    setTimeout(() => onSelect(selected), 1200);
  };

  const technical    = SKILLS.filter(s => s.category === "Technical");
  const nonTechnical = SKILLS.filter(s => s.category === "Non-Technical");

  return (
    <div className="flex flex-col lg:flex-row bg-[#F4F4F6] px-6 py-8 sm:px-10 sm:py-10 lg:px-16 lg:py-12 gap-12 lg:gap-24 mt-20 items-start justify-center min-h-[calc(100vh-80px)]">
      <div className="flex flex-col justify-start">
        <div className="inline-flex items-center gap-2 bg-[rgba(124,58,237,0.1)] border border-[rgba(124,58,237,0.3)] rounded-2xl px-3.5 py-1.5 mb-7 w-fit">
          <span className="text-[#7C3AED] font-bold text-[11px] tracking-[2px]">🎯 SKILL ASSESSMENT ENGINE V2.0</span>
        </div>
        <div className="text-4xl font-[900] leading-[1.05] text-transparent bg-clip-text bg-gradient-to-r from-[#6C4DFF] via-[#EC4899] to-[#FF5B5B] inline-block uppercase">KNOW YOUR</div>
        <div className="text-4xl font-[900] leading-[1.05] italic mb-6 text-transparent bg-clip-text bg-gradient-to-r from-[#6C4DFF] via-[#EC4899] to-[#FF5B5B] inline-block uppercase">TRUE LEVEL.</div>
        <p className="text-[#666] text-sm leading-relaxed max-w-[340px]">
          Select a skill. Our AI will generate a <span className="text-[#7C3AED] font-semibold">10-question adaptive assessment</span> — MCQs, coding challenges, scenarios, and real-world problems.
        </p>
        <div className="mt-10 grid grid-cols-2 gap-4 max-w-[340px]">
          {[
            { label: "Questions",      value: "10" },
            { label: "Question Types", value: "4 formats" },
            { label: "AI Scoring",     value: "5 criteria" },
            { label: "Report",         value: "Instant" },
          ].map(card => (
            <div key={card.label} className="rounded-2xl border border-white bg-white/80 p-5 shadow-[0_6px_24px_rgba(0,0,0,0.05)]">
              <div className="text-[10px] font-black uppercase tracking-[2px] text-gray-400">{card.label}</div>
              <div className="mt-3 text-lg font-black text-[#111827]">{card.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full max-w-[440px] bg-white rounded-3xl p-6 sm:p-8 shadow-[0_15px_50px_rgba(0,0,0,0.08)] flex flex-col gap-6">
        <div>
          <div className="text-[10px] font-bold tracking-[2px] text-gray-400 mb-4 uppercase">Technical Skills</div>
          <div className="grid grid-cols-2 gap-3">
            {technical.map(skill => (
              <button key={skill.id} onClick={() => setSelected(skill.id)}
                className="flex items-center gap-3 rounded-xl border-2 p-3 text-left transition-all duration-150"
                style={{ borderColor: selected === skill.id ? skill.color : "#f3f4f6", background: selected === skill.id ? skill.color + "08" : "white", boxShadow: selected === skill.id ? `0 0 0 3px ${skill.color}15` : "none" }}>
                <span className="text-xl">{skill.icon}</span>
                <div>
                  <div className="text-[11px] font-black text-gray-800 leading-tight uppercase tracking-tight">{skill.label}</div>
                  <div className="text-[8px] text-gray-400 font-bold tracking-widest mt-0.5">10 QUESTIONS</div>
                </div>
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className="text-[10px] font-bold tracking-[2px] text-gray-400 mb-4 uppercase">Non-Technical Skills</div>
          <div className="grid grid-cols-2 gap-3">
            {nonTechnical.map(skill => (
              <button key={skill.id} onClick={() => setSelected(skill.id)}
                className="flex items-center gap-3 rounded-xl border-2 p-3 text-left transition-all duration-150"
                style={{ borderColor: selected === skill.id ? skill.color : "#f3f4f6", background: selected === skill.id ? skill.color + "08" : "white", boxShadow: selected === skill.id ? `0 0 0 3px ${skill.color}15` : "none" }}>
                <span className="text-xl">{skill.icon}</span>
                <div>
                  <div className="text-[11px] font-black text-gray-800 leading-tight uppercase tracking-tight">{skill.label}</div>
                  <div className="text-[8px] text-gray-400 font-bold tracking-widest mt-0.5">10 QUESTIONS</div>
                </div>
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <button onClick={handleStart} disabled={!selected || starting}
            style={{ background: !selected || starting ? "#e5e7eb" : PURPLE }}
            className={`text-white border-none rounded-xl py-4 font-black text-[11px] tracking-[2px] flex items-center justify-center gap-2 transition-all shadow-lg ${!selected || starting ? "text-gray-400 shadow-none" : "hover:scale-[1.01] active:scale-[0.98]"}`}>
            {starting ? "GENERATING ASSESSMENT..." : selected ? `START ${SKILLS.find(s => s.id === selected)?.label.toUpperCase()} ASSESSMENT →` : "SELECT A SKILL TO BEGIN"}
          </button>
          <div className="text-center text-[9px] text-gray-300 font-bold tracking-widest">
            AI-POWERED · ADAPTIVE DIFFICULTY · INSTANT REPORT
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SCREEN 2: Sync ───────────────────────────────────────────────────────────

function SyncScreen({ skill, onStart }: { skill: any; onStart: () => void }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 2500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: BG, padding: 40, textAlign: "center" }}>
      <div style={{ width: 80, height: 80, background: PURPLE, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, marginBottom: 28, boxShadow: "0 8px 30px rgba(124,58,237,0.4)" }}>{skill.icon}</div>
      <h1 style={{ fontSize: 44, fontWeight: 900, color: "#1a1a2e", margin: 0, textTransform: "uppercase" }}>
        ASSESSMENT <span style={{ color: PURPLE }}>READY.</span>
      </h1>
      <p style={{ color: "#555", fontSize: 16, marginTop: 16, marginBottom: 40 }}>
        A <strong>10-question adaptive assessment</strong> for <strong>{skill.label}</strong> is ready. Answer honestly — this measures your real level.
      </p>
      <button onClick={() => ready && onStart()}
        style={{ background: ready ? PURPLE : "#aaa", color: "white", border: "none", borderRadius: 8, padding: "12px 28px", fontWeight: 700, fontSize: 11, cursor: ready ? "pointer" : "not-allowed", letterSpacing: 1 }}>
        {ready ? "BEGIN ASSESSMENT →" : "PREPARING..."}
      </button>
    </div>
  );
}

// ─── SCREEN 3: Question ───────────────────────────────────────────────────────

function Timer({ start }: { start: number }) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setElapsed(p => p + 1), 1000);
    return () => clearInterval(t);
  }, [start]);
  const remaining = Math.max(0, 240 - elapsed);
  const color = remaining < 30 ? "#EF4444" : remaining < 60 ? "#F59E0B" : PURPLE;
  return <span style={{ color, fontWeight: 700, fontSize: 12 }}>⏱ {remaining}s</span>;
}

function QuestionScreen({
  skill,
  questions,
  onComplete,
}: {
  skill: any;
  questions: Question[];
  onComplete: (feedback: Record<number, any>, answers: Record<number, string>) => void;
}) {
  const [qIdx, setQIdx]           = useState(0);
  const [answers, setAnswers]     = useState<Record<number, string>>({});
  const [answeredIdx, setAnswered] = useState<Record<number, boolean>>({});
  const [feedback, setFeedback]   = useState<Record<number, any>>({});
  const [loading, setLoading]     = useState(false);

  const feedbackRef = useRef<Record<number, any>>({});

  const q          = questions[qIdx];
  const tc         = typeColors[q.type];
  const isMCQ      = q.type === "MCQ";
  const isAnswered = answeredIdx[qIdx] === true;
  const isLast     = qIdx === questions.length - 1;
  const curAnswer  = answers[qIdx] || "";

  const handleSubmit = async () => {
    if (!curAnswer.trim()) return;

    // ── MCQ: evaluate entirely on the frontend, no API call ──────────────────
    if (isMCQ) {
      const isCorrect = curAnswer === q.correctAnswer;
      const mcqFeedback = {
        score:           isCorrect ? 100 : 0,
        verdict:         isCorrect ? "PASS" : "FAIL",
        strengths:       isCorrect ? ["Correct answer selected"] : [],
        gaps:            !isCorrect ? [`Selected "${curAnswer}" instead of "${q.correctAnswer}"`] : [],
        ideal_approach:  `Correct Answer: ${q.correctAnswer}`,
        interviewReadiness: isCorrect ? 100 : 0,
        selectedAnswer:  curAnswer,
        correctAnswer:   q.correctAnswer,
        _answer:         curAnswer,
        _questionId:     q.id,
        _questionType:   q.type,
        _topic:          q.topic,
      };
      const updated = { ...feedbackRef.current, [qIdx]: mcqFeedback };
      feedbackRef.current = updated;
      setFeedback(updated);
      setAnswered(p => ({ ...p, [qIdx]: true }));
      return;
    }

    // ── Non-MCQ: call AI evaluation endpoint ──────────────────────────────────
    setLoading(true);

    const evalPrompt = `You are a senior ${skill.label} expert evaluating a skill assessment.
Question type: ${q.type}, Difficulty: ${q.difficulty}
Topic: ${q.topic}
Question: "${q.question}"
Expected concepts: ${q.expectedConcepts.join(", ")}
Student answer: "${curAnswer}"

Score across 5 criteria: Accuracy, Concept Clarity, Problem Solving, Practical Knowledge, Communication.
Respond ONLY with a valid JSON object (no markdown, no backticks):
{"score": <0-100>, "verdict": "<STRONG PASS|PASS|BORDERLINE|FAIL>", "strengths": ["<specific strength 1>", "<specific strength 2>"], "gaps": ["<specific gap 1>", "<specific gap 2>"], "ideal_approach": "<2-3 sentence model answer explaining the correct approach>", "interviewReadiness": <0-100>}`;

    let parsedFeedback: any;
    try {
      const res = await fetch(`${API_BASE_URL}/api/ai/evaluate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: evalPrompt }],
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const raw = await res.json();
      parsedFeedback = parseAIResponse(raw);
    } catch (e) {
      console.error("[QuestionScreen] Evaluation failed:", e);
      parsedFeedback = fallbackFeedback();
    }

    parsedFeedback._answer       = curAnswer;
    parsedFeedback._questionId   = q.id;
    parsedFeedback._questionType = q.type;
    parsedFeedback._topic        = q.topic;

    const updated = { ...feedbackRef.current, [qIdx]: parsedFeedback };
    feedbackRef.current = updated;
    setFeedback(updated);
    setAnswered(p => ({ ...p, [qIdx]: true }));
    setLoading(false);
  };

  const handleNext = () => {
    if (isLast) {
      onComplete(feedbackRef.current, answers);
    } else {
      setQIdx(p => p + 1);
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: BG, padding: "32px 40px", gap: 24, marginTop: 80 }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ background: tc.bg, color: tc.text, borderRadius: 6, padding: "3px 8px", fontSize: 9, fontWeight: 800, letterSpacing: 1 }}>{tc.label}</span>
            <span style={{ fontSize: 11, color: "#888", fontWeight: 600, letterSpacing: 1 }}>{q.topic}</span>
            <span style={{ fontSize: 10, color: "#bbb", fontWeight: 600, letterSpacing: 1 }}>{q.difficulty}</span>
          </div>
          {!isAnswered && <Timer start={qIdx} />}
        </div>

        {/* Progress */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[10px] font-black uppercase tracking-[2px] text-gray-400">Question {qIdx + 1} of {questions.length}</div>
            <div className="text-[10px] font-black uppercase tracking-[2px]" style={{ color: tc.text }}>{tc.label}</div>
          </div>
          <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{ width: `${Math.round(((qIdx + 1) / questions.length) * 100)}%`, background: PURPLE }} />
          </div>
        </div>

        {/* Question card */}
        <div style={{ background: "white", borderRadius: 12, padding: 24, boxShadow: "0 4px 20px rgba(0,0,0,0.06)", flex: 1 }}>
          <p style={{ fontSize: 16, fontWeight: 800, color: "#1a1a2e", lineHeight: 1.5, margin: "0 0 20px" }}>{q.question}</p>

          {!isAnswered ? (
            <>
              {isMCQ ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {q.options!.map(opt => (
                    <button key={opt} onClick={() => setAnswers(p => ({ ...p, [qIdx]: opt }))}
                      style={{ border: `2px solid ${curAnswer === opt ? PURPLE : "#e5e7eb"}`, background: curAnswer === opt ? "#F5F3FF" : "white", borderRadius: 10, padding: "12px 16px", textAlign: "left", fontSize: 13, fontWeight: curAnswer === opt ? 700 : 400, color: curAnswer === opt ? PURPLE : "#374151", cursor: "pointer", transition: "all 0.1s" }}>
                      {opt}
                    </button>
                  ))}
                </div>
              ) : (
                <textarea value={curAnswer} onChange={e => setAnswers(p => ({ ...p, [qIdx]: e.target.value }))}
                  placeholder={q.type === "CODING" ? "Write your code solution here..." : "Describe your approach in detail..."}
                  style={{ width: "100%", minHeight: q.type === "CODING" ? 160 : 120, border: "1.5px solid #e0e0e0", borderRadius: 8, padding: 12, fontSize: 12, fontFamily: q.type === "CODING" ? "monospace" : "inherit", resize: "vertical", outline: "none", boxSizing: "border-box", color: "#333", lineHeight: 1.6 }} />
              )}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16 }}>
                <span style={{ fontSize: 9, color: "#bbb", letterSpacing: 1 }}>
                  {isMCQ ? "SELECT ONE OPTION" : q.type === "CODING" ? "CODE OR PSEUDOCODE ACCEPTED" : "BE SPECIFIC AND STRUCTURED"}
                </span>
                <button onClick={handleSubmit} disabled={loading || !curAnswer.trim()}
                  style={{ background: loading || !curAnswer.trim() ? "#d1d5db" : PURPLE, color: "white", border: "none", borderRadius: 8, padding: "10px 24px", fontWeight: 800, fontSize: 10, cursor: loading || !curAnswer.trim() ? "not-allowed" : "pointer", letterSpacing: 1 }}>
                  {loading ? "EVALUATING..." : "SUBMIT ANSWER →"}
                </button>
              </div>
            </>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* MCQ result: show correct/incorrect inline */}
              {isMCQ && feedback[qIdx] && (
                <div style={{
                  background: feedback[qIdx].score === 100 ? "#ECFDF5" : "#FEF2F2",
                  border: `1.5px solid ${feedback[qIdx].score === 100 ? "#10B981" : "#EF4444"}`,
                  borderRadius: 10,
                  padding: 16,
                }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: feedback[qIdx].score === 100 ? "#10B981" : "#EF4444", marginBottom: 8 }}>
                    {feedback[qIdx].score === 100 ? "✓ Correct!" : "✗ Incorrect"}
                  </div>
                  <div style={{ fontSize: 12, color: "#374151", marginBottom: 4 }}>
                    <span style={{ fontWeight: 600 }}>Your answer: </span>{feedback[qIdx].selectedAnswer}
                  </div>
                  {feedback[qIdx].score !== 100 && (
                    <div style={{ fontSize: 12, color: "#374151" }}>
                      <span style={{ fontWeight: 600 }}>Correct answer: </span>
                      <span style={{ color: "#10B981", fontWeight: 700 }}>{feedback[qIdx].correctAnswer}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Non-MCQ submitted state */}
              {!isMCQ && (
                <>
                  <div style={{ background: "#F5F3FF", borderRadius: 10, padding: 16, display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 20, color: PURPLE }}>✓</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: PURPLE }}>Answer submitted</div>
                      <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>Your response has been recorded. Full feedback appears in the report.</div>
                    </div>
                  </div>
                  <div style={{ background: "#F9FAFB", borderRadius: 10, padding: 14, border: "1px solid #e5e7eb" }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: "#9CA3AF", letterSpacing: 1, marginBottom: 6 }}>YOUR ANSWER</div>
                    <div style={{ fontSize: 12, color: "#374151", lineHeight: 1.6, fontFamily: q.type === "CODING" ? "monospace" : "inherit", whiteSpace: "pre-wrap", maxHeight: 120, overflow: "hidden" }}>{curAnswer}</div>
                  </div>
                </>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button onClick={handleNext}
                  style={{ background: PURPLE, color: "white", border: "none", borderRadius: 8, padding: "10px 24px", fontWeight: 800, fontSize: 10, cursor: "pointer", letterSpacing: 1 }}>
                  {isLast ? "FINISH ASSESSMENT →" : "NEXT QUESTION →"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Progress dots */}
        <div style={{ display: "flex", gap: 6 }}>
          {questions.map((_, i) => (
            <div key={i}
              style={{ height: 6, flex: 1, borderRadius: 3, background: answeredIdx[i] ? "#10B981" : i === qIdx ? PURPLE : "#e5e7eb", transition: "background 0.3s" }} />
          ))}
        </div>
      </div>

      {/* Sidebar */}
      <div style={{ width: 240, display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ background: "#0f0a1a", borderRadius: 16, padding: 24, boxShadow: "0 8px 30px rgba(0,0,0,0.3)" }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: "#666", marginBottom: 16 }}>QUESTION NAVIGATOR</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6 }}>
            {questions.map((_, i) => (
              <div key={i} style={{ width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, background: answeredIdx[i] ? "#10B981" : i === qIdx ? PURPLE : "#1a1a2e", color: i === qIdx || answeredIdx[i] ? "white" : "#555", border: i === qIdx ? `2px solid ${PURPLE}` : "2px solid transparent" }}>
                {i + 1}
              </div>
            ))}
          </div>
        </div>
        <div style={{ background: "white", borderRadius: 16, padding: 20, boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: "#999", marginBottom: 12 }}>SKILL PROFILE</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <span style={{ fontSize: 24 }}>{skill.icon}</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#1a1a2e" }}>{skill.label}</div>
              <div style={{ fontSize: 10, color: "#888" }}>{skill.category}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SCREEN 4: Report ─────────────────────────────────────────────────────────

function ReportScreen({
  report,
  skill,
  questions,
  onRestart,
}: {
  report: AssessmentReport;
  skill: any;
  questions: Question[];
  onRestart: () => void;
}) {
  const navigate    = useNavigate();
  const levelStyle  = getLevelStyle(report.score);
  const readiness   = getReadinessStatus(report.interviewReadiness);

  const RECOMMENDATIONS: Record<string, string[]> = {
    python:    ["Complete Python Advanced Module", "Build File Management Project", "Build REST API Project", "Practice Python Mock Interview"],
    react:     ["Complete React Advanced Patterns Module", "Build Full-Stack Project with React", "Practice Frontend Mock Interview", "Study Core Web Vitals"],
    java:      ["Complete Java Collections & Generics Module", "Implement Data Structures in Java", "Practice Backend Mock Interview", "Study Design Patterns"],
    sql:       ["Complete SQL Window Functions Module", "Practice Query Optimization", "Build Data Analysis Project", "Practice Data Analyst Mock Interview"],
    dsa:       ["Complete Graph Algorithms Module", "Solve 30 LeetCode Medium Problems", "Practice DSA Mock Interview", "Review Big-O Complexity"],
    nodejs:    ["Complete Node.js Advanced Module", "Build REST API Project", "Practice Backend Mock Interview", "Study Event Loop & Streams"],
    uiux:      ["Complete UX Research Module", "Build 3 Case Studies", "Practice Product Mock Interview", "Study Figma Advanced"],
    marketing: ["Complete Digital Marketing Module", "Run Campaign Analysis Project", "Practice Marketing Mock Interview", "Study Marketing Analytics"],
    pm:        ["Complete Product Strategy Module", "Write 2 PRDs", "Practice PM Mock Interview", "Study Metrics & OKRs"],
  };
  const recs = RECOMMENDATIONS[report.skillId] || RECOMMENDATIONS["python"];

  return (
    <div className="min-h-screen bg-[#F4F4F6] p-6 sm:p-10 lg:p-20 mt-20">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="text-5xl mb-4">{skill.icon}</div>
        <h1 className="text-3xl sm:text-4xl font-black text-[#1a1a2e] m-0 uppercase">
          SKILL REPORT <span style={{ color: PURPLE }}>COMPLETE.</span>
        </h1>
        <p className="text-[#666] mt-3">
          {report.skill} Assessment · {new Date(report.completedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      {/* Top metric cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-8">
        {[
          { label: "Skill Score",          value: `${report.score}%`,              color: PURPLE },
          { label: "Level",                value: report.level,                    color: levelStyle.color },
          { label: "Interview Readiness",  value: `${report.interviewReadiness}%`, color: readiness.color },
          { label: "Questions Answered",   value: `${report.questionResults.length}/10`, color: "#0EA5E9" },
        ].map(card => (
          <div key={card.label} className="bg-white rounded-2xl p-6 shadow-[0_4px_16px_rgba(0,0,0,0.06)] border border-gray-100">
            <div className="text-[9px] text-[#999] tracking-widest uppercase font-bold">{card.label}</div>
            <div className="mt-2 text-3xl font-black" style={{ color: card.color }}>{card.value}</div>
          </div>
        ))}
      </div>

      {/* Score / Level / Readiness badges */}
      <div className="flex flex-col sm:flex-row gap-5 justify-center mb-8">
        <div className="bg-white rounded-2xl p-6 text-center min-w-[140px] shadow-[0_4px_16px_rgba(0,0,0,0.06)]"
          style={{ borderTop: `4px solid ${report.score >= 70 ? "#10B981" : report.score >= 40 ? "#F59E0B" : "#EF4444"}` }}>
          <div className="text-3xl font-black" style={{ color: PURPLE }}>{report.score}</div>
          <div className="text-[10px] text-[#999] tracking-widest mt-1 uppercase font-bold">OVERALL SCORE</div>
        </div>
        <div className="rounded-2xl p-6 text-center min-w-[140px] flex flex-col justify-center"
          style={{ backgroundColor: levelStyle.bg, border: `2px solid ${levelStyle.color}` }}>
          <div className="text-xl font-black uppercase" style={{ color: levelStyle.color }}>{report.level}</div>
          <div className="text-[10px] tracking-widest mt-1.5 uppercase font-bold" style={{ color: levelStyle.color + "99" }}>SKILL LEVEL</div>
        </div>
        <div className="rounded-2xl p-6 text-center min-w-[140px] flex flex-col justify-center"
          style={{ backgroundColor: readiness.color + "15", border: `2px solid ${readiness.color}` }}>
          <div className="text-2xl font-black" style={{ color: readiness.color }}>{report.interviewReadiness}%</div>
          <div className="text-[10px] tracking-widest mt-1 uppercase font-bold" style={{ color: readiness.color + "99" }}>INTERVIEW READY</div>
          <div className="text-[9px] mt-1 font-bold uppercase" style={{ color: readiness.color }}>{readiness.label}</div>
        </div>
      </div>

      {/* Strengths / Weak Areas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div style={{ background: "white", borderRadius: 16, padding: 24, boxShadow: "0 4px 16px rgba(0,0,0,0.05)" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#10B981", letterSpacing: 1, marginBottom: 14 }}>✅ STRENGTH AREAS</div>
          {report.strengths.length > 0
            ? report.strengths.map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 10 }}>
                  <span style={{ color: "#10B981", fontWeight: 900, fontSize: 14 }}>✓</span>
                  <span style={{ fontSize: 13, color: "#374151", lineHeight: 1.5 }}>{s}</span>
                </div>
              ))
            : <div style={{ fontSize: 13, color: "#9CA3AF" }}>Complete more questions to identify strengths.</div>
          }
        </div>
        <div style={{ background: "white", borderRadius: 16, padding: 24, boxShadow: "0 4px 16px rgba(0,0,0,0.05)" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#EF4444", letterSpacing: 1, marginBottom: 14 }}>✗ WEAK AREAS</div>
          {report.weakAreas.length > 0
            ? report.weakAreas.map((g, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 10 }}>
                  <span style={{ color: "#EF4444", fontWeight: 900, fontSize: 14 }}>✗</span>
                  <span style={{ fontSize: 13, color: "#374151", lineHeight: 1.5 }}>{g}</span>
                </div>
              ))
            : <div style={{ fontSize: 13, color: "#9CA3AF" }}>No significant weak areas identified.</div>
          }
        </div>
      </div>

      {/* Mistake Analysis */}
      {report.mistakeAnalysis.length > 0 && (
        <div style={{ background: "white", borderRadius: 16, padding: 28, marginBottom: 24, boxShadow: "0 4px 16px rgba(0,0,0,0.05)" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#EF4444", letterSpacing: 1, marginBottom: 18 }}>🔍 MISTAKE ANALYSIS</div>
          {report.mistakeAnalysis.map((m, i) => (
            <div key={i} style={{ borderLeft: "3px solid #EF4444", paddingLeft: 16, marginBottom: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <span style={{ background: "#FEF2F2", color: "#EF4444", borderRadius: 6, padding: "2px 8px", fontSize: 10, fontWeight: 800 }}>Q{m.questionNumber}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#374151" }}>{m.topic}</span>
                <span style={{ fontSize: 10, color: "#9CA3AF" }}>Score: {m.score}/100</span>
                {m.questionType === "MCQ" && (
                  <span style={{ background: "#EFF6FF", color: "#2563EB", borderRadius: 6, padding: "2px 8px", fontSize: 9, fontWeight: 800 }}>MCQ</span>
                )}
              </div>
              <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#9CA3AF", letterSpacing: 1, marginBottom: 4 }}>MISTAKE</div>
                <div style={{ fontSize: 13, color: "#374151", lineHeight: 1.6 }}>{m.mistake}</div>
              </div>
              <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#10B981", letterSpacing: 1, marginBottom: 4 }}>
                  {m.questionType === "MCQ" ? "CORRECT ANSWER" : "EXPECTED APPROACH"}
                </div>
                <div style={{ fontSize: 13, color: m.questionType === "MCQ" ? "#10B981" : "#374151", lineHeight: 1.6, fontStyle: m.questionType === "MCQ" ? "normal" : "italic", fontWeight: m.questionType === "MCQ" ? 700 : 400 }}>{m.expectedApproach}</div>
              </div>
              <div style={{ background: "#F5F3FF", borderRadius: 8, padding: "10px 14px" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: PURPLE, letterSpacing: 1, marginBottom: 4 }}>IMPROVEMENT</div>
                <div style={{ fontSize: 12, color: "#374151", lineHeight: 1.5 }}>{m.improvementSuggestion}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Question-by-question breakdown */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#999", letterSpacing: 1, marginBottom: 14 }}>QUESTION-BY-QUESTION BREAKDOWN</div>
        {questions.map((q, idx) => {
          const fb = report.questionResults[idx];
          if (!fb || !fb.verdict) return null;
          const tc = typeColors[q.type as QuestionType];
          return (
            <div key={idx} style={{ background: "white", borderRadius: 16, padding: 24, marginBottom: 12, boxShadow: "0 4px 16px rgba(0,0,0,0.05)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ background: tc.bg, color: tc.text, borderRadius: 6, padding: "3px 8px", fontSize: 9, fontWeight: 800, letterSpacing: 1 }}>Q{idx + 1} {tc.label}</span>
                  <span style={{ fontSize: 11, color: "#888" }}>{q.topic}</span>
                </div>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <span style={{ fontWeight: 800, fontSize: 18, color: verdictColor(fb.verdict) }}>{fb.score}/100</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: verdictColor(fb.verdict) }}>{fb.verdict}</span>
                </div>
              </div>
              {fb.idealApproach && (
                <div style={{ fontSize: 12, color: "#555", fontStyle: "italic", lineHeight: 1.5, borderLeft: `3px solid ${tc.text}`, paddingLeft: 12 }}>{fb.idealApproach}</div>
              )}
            </div>
          );
        })}
      </div>

      {/* Recommended Path */}
      <div style={{ background: "white", borderRadius: 16, padding: 28, marginBottom: 24, boxShadow: "0 4px 16px rgba(0,0,0,0.05)" }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: PURPLE, letterSpacing: 1, marginBottom: 18 }}>🗺️ RECOMMENDED LEARNING PATH</div>
        {recs.map((rec, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: i === 0 ? PURPLE : "#F5F3FF", color: i === 0 ? "white" : PURPLE, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, flexShrink: 0 }}>{i + 1}</div>
            <span style={{ fontSize: 13, color: "#374151", fontWeight: i === 0 ? 700 : 400 }}>{rec}</span>
            {i === 0 && <span style={{ marginLeft: "auto", background: PURPLE, color: "white", fontSize: 9, fontWeight: 800, borderRadius: 4, padding: "2px 6px", letterSpacing: 1 }}>START HERE</span>}
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div style={{ textAlign: "center", display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", paddingBottom: 40 }}>
        <button onClick={onRestart}
          style={{ background: PURPLE, color: "white", border: "none", borderRadius: 12, padding: "16px 40px", fontWeight: 800, fontSize: 13, cursor: "pointer", letterSpacing: 1, boxShadow: "0 4px 20px rgba(124,58,237,0.4)" }}>
          TAKE ANOTHER ASSESSMENT →
        </button>
        <button onClick={() => navigate("/skill-assessment/history")}
          style={{ background: "white", color: PURPLE, border: `2px solid ${PURPLE}`, borderRadius: 12, padding: "16px 40px", fontWeight: 800, fontSize: 13, cursor: "pointer", letterSpacing: 1 }}>
          VIEW HISTORY →
        </button>
        <button onClick={() => navigate("/job-prep/mock-interview")}
          style={{ background: "white", color: "#374151", border: "2px solid #e5e7eb", borderRadius: 12, padding: "16px 40px", fontWeight: 800, fontSize: 13, cursor: "pointer", letterSpacing: 1 }}>
          PRACTICE MOCK INTERVIEW →
        </button>
      </div>
    </div>
  );
}

// ─── ROOT EXPORT ──────────────────────────────────────────────────────────────

export default function SkillAssessment() {
  const [screen,    setScreen]    = useState<"select" | "sync" | "test" | "report">("select");
  const [skill,     setSkill]     = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [report,    setReport]    = useState<AssessmentReport | null>(null);

  const handleSelect = (skillId: string) => {
    const found = SKILLS.find(s => s.id === skillId)!;
    setSkill(found);
    setQuestions(getQuestions(skillId));
    setScreen("sync");
  };

  const handleComplete = (fb: Record<number, any>, rawAnswers: Record<number, string>) => {
    const builtReport = buildReport(fb, questions, skill);
    setReport(builtReport);
    setScreen("report");
    saveToHistory(builtReport);
  };

  const handleRestart = () => {
    setSkill(null);
    setQuestions([]);
    setReport(null);
    setScreen("select");
  };

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Poppins', sans-serif" }}>
      <Navigation />
      {screen === "select" && <SkillSelectScreen onSelect={handleSelect} />}
      {screen === "sync"   && <SyncScreen skill={skill} onStart={() => setScreen("test")} />}
      {screen === "test"   && <QuestionScreen skill={skill} questions={questions} onComplete={handleComplete} />}
      {screen === "report" && report && (
        <ReportScreen report={report} skill={skill} questions={questions} onRestart={handleRestart} />
      )}
    </div>
  );
}