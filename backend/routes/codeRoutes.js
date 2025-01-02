import express from "express";
import { exec } from "child_process";
import util from "util";
import fs from "fs/promises";
import Code from "../models/code.js";
import * as acorn from "acorn";

const router = express.Router();
const execPromise = util.promisify(exec);

// Configuration
const EXECUTION_TIMEOUT = 5000; // 5 seconds
const MEMORY_LIMIT = 50 * 1024 * 1024; // 50MB

// Syntax validation functions
const validateCode = (code, language) => {
  try {
    switch (language) {
      case "javascript":
        acorn.parse(code, { ecmaVersion: "latest" });
        return { valid: true };
      case "python":
        // Basic Python syntax check
        if (!code.trim()) {
          return { valid: false, error: "Empty code" };
        }
        return { valid: true };
      case "java":
        // Basic Java structure validation
        if (
          !code.includes("class") ||
          !code.includes("public static void main")
        ) {
          return { valid: false, error: "Invalid Java class structure" };
        }
        return { valid: true };
      default:
        return { valid: false, error: "Unsupported language" };
    }
  } catch (error) {
    return { valid: false, error: error.message };
  }
};

// Execute with timeout and memory limit
const executeWithLimits = async (command, options = {}) => {
  return new Promise(async (resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error("Execution timeout exceeded"));
    }, EXECUTION_TIMEOUT);

    try {
      const process = await execPromise(command, {
        ...options,
        maxBuffer: MEMORY_LIMIT,
      });
      clearTimeout(timeout);
      resolve(process);
    } catch (error) {
      clearTimeout(timeout);
      reject(error);
    }
  });
};

router.post("/save", async (req, res) => {
  const { content, language } = req.body;

  try {
    const code = new Code({ content, language });
    await code.save();
    res.status(201).json({ id: code._id });
  } catch (error) {
    res.status(500).json({ error: "Failed to save code" });
  }
});

router.post("/execute", async (req, res) => {
  const { code, language } = req.body;
  console.log("Received execution request:", { code, language });

  // Validate syntax first
  const validationResult = validateCode(code, language);
  if (!validationResult.valid) {
    return res
      .status(400)
      .json({ output: `Syntax error: ${validationResult.error}` });
  }

  switch (language) {
    case "javascript": {
      const tempFile = "temp.js";
      const wrappedCode = `
        const startMemory = process.memoryUsage().heapUsed;
        const startTime = process.hrtime();
        
        ${code}
        
        const endTime = process.hrtime(startTime);
        const endMemory = process.memoryUsage().heapUsed;
        console.log(\`Execution time: \${endTime[0]}s \${endTime[1]/1000000}ms\`);
        console.log(\`Memory used: \${(endMemory - startMemory) / 1024 / 1024} MB\`);
      `;

      await fs.writeFile(tempFile, wrappedCode);

      try {
        const { stdout, stderr } = await executeWithLimits(`node ${tempFile}`);
        await fs.unlink(tempFile);
        res.json({ output: stdout || stderr });
      } catch (error) {
        await fs.unlink(tempFile);
        res.json({ output: error.message });
      }
      break;
    }

    case "python": {
      const tempFile = "temp.py";
      const wrappedCode = `
import time, os
import psutil
start_time = time.time()
process = psutil.Process(os.getpid())
start_memory = process.memory_info().rss

${code}

end_time = time.time()
end_memory = process.memory_info().rss
print(f"Execution time: {end_time - start_time:.3f} seconds")
print(f"Memory used: {(end_memory - start_memory) / 1024 / 1024:.2f} MB")
      `;

      await fs.writeFile(tempFile, wrappedCode);

      try {
        const { stdout, stderr } = await executeWithLimits(
          `python ${tempFile}`
        );
        await fs.unlink(tempFile);
        res.json({ output: stdout || stderr });
      } catch (error) {
        await fs.unlink(tempFile);
        res.json({ output: error.message });
      }
      break;
    }

    case "java": {
      const className = "Main";
      const javaCode = `
        public class ${className} {
            public static void main(String[] args) {
                long startTime = System.nanoTime();
                Runtime runtime = Runtime.getRuntime();
                long startMemory = runtime.totalMemory() - runtime.freeMemory();
                
                ${code}
                
                long endMemory = runtime.totalMemory() - runtime.freeMemory();
                long endTime = System.nanoTime();
                System.out.println("Execution time: " + (endTime - startTime)/1e9 + " seconds");
                System.out.println("Memory used: " + (endMemory - startMemory)/1024/1024 + " MB");
            }
        }`;

      await fs.writeFile(`${className}.java`, javaCode);

      try {
        await executeWithLimits(`javac ${className}.java`);
        const { stdout, stderr } = await executeWithLimits(`java ${className}`);
        await fs.unlink(`${className}.java`);
        await fs.unlink(`${className}.class`);
        res.json({ output: stdout || stderr });
      } catch (error) {
        await fs.unlink(`${className}.java`).catch(() => {});
        await fs.unlink(`${className}.class`).catch(() => {});
        res.json({ output: error.message });
      }
      break;
    }

    default:
      res.status(400).json({ output: "Unsupported language" });
  }
});

router.get("/config", (req, res) => {
  res.json({
    supportedLanguages: ["javascript", "python", "java"],
    executionTimeout: EXECUTION_TIMEOUT / 1000,
    memoryLimit: MEMORY_LIMIT / (1024 * 1024),
  });
});

export default router;
