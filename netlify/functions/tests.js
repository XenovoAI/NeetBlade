// netlify/functions/tests.ts
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
function getSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL || "https://your-project.supabase.co";
  const supabaseKey = process.env.SUPABASE_ANON_KEY || "your-anon-key";
  return createClient(supabaseUrl, supabaseKey);
}
var SimpleTestService = class {
  supabase = getSupabaseClient();
  async getTests(filters) {
    let query = this.supabase.from("tests").select("*");
    if (filters?.status) {
      query = query.eq("status", filters.status);
    }
    if (filters?.subject) {
      query = query.eq("subject", filters.subject);
    }
    const { data, error } = await query.order("scheduled_start", { ascending: true });
    if (error) throw new Error(`Failed to fetch tests: ${error.message}`);
    return data || [];
  }
  async getTestById(id) {
    const { data, error } = await this.supabase.from("tests").select("*").eq("id", id).single();
    if (error && error.code !== "PGRST116") {
      throw new Error(`Failed to fetch test: ${error.message}`);
    }
    return data;
  }
  async getQuestionsByTestId(testId) {
    const { data, error } = await this.supabase.from("questions").select("*").eq("test_id", testId).order("order_index", { ascending: true });
    if (error) throw new Error(`Failed to fetch questions: ${error.message}`);
    return data || [];
  }
  async getTestAttemptsByUserId(userId) {
    const { data, error } = await this.supabase.from("test_attempts").select("*").eq("user_id", userId).order("started_at", { ascending: false });
    if (error) throw new Error(`Failed to fetch user test attempts: ${error.message}`);
    return data || [];
  }
  async startTestAttempt(testId, userId) {
    const { data: existingAttempts } = await this.supabase.from("test_attempts").select("*").eq("test_id", testId).eq("user_id", userId).eq("status", "in_progress");
    if (existingAttempts && existingAttempts.length > 0) {
      return existingAttempts[0];
    }
    const attemptData = {
      test_id: testId,
      user_id: userId,
      status: "in_progress"
    };
    const { data, error } = await this.supabase.from("test_attempts").insert([attemptData]).select().single();
    if (error) throw new Error(`Failed to start test attempt: ${error.message}`);
    return data;
  }
  async createTest(testData) {
    const scheduledStart = new Date(testData.scheduled_start);
    const scheduledEnd = new Date(scheduledStart.getTime() + testData.duration_minutes * 60 * 1e3);
    const testWithEnd = {
      ...testData,
      scheduled_end: scheduledEnd.toISOString()
    };
    const { data, error } = await this.supabase.from("tests").insert([testWithEnd]).select().single();
    if (error) throw new Error(`Failed to create test: ${error.message}`);
    return data;
  }
};
var testService = new SimpleTestService();
var parseBody = (body) => {
  if (!body) return {};
  try {
    return JSON.parse(body);
  } catch {
    return {};
  }
};
async function getUserFromAuth(authHeader) {
  if (!authHeader?.startsWith("Bearer ")) {
    throw new Error("Missing or invalid authorization header");
  }
  const token = authHeader.substring(7);
  const { data: { user }, error } = await getSupabaseClient().auth.getUser(token);
  if (error || !user) {
    throw new Error("Invalid token");
  }
  return user;
}
async function isUserAdmin(userId) {
  const { data: userData } = await getSupabaseClient().from("users").select("is_admin").eq("id", userId).single();
  return userData?.is_admin || false;
}
var handler = async (event, context) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Content-Type": "application/json"
  };
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: ""
    };
  }
  try {
    console.log("Function called:", { path: event.path, method: event.httpMethod });
    const path = event.path.replace("/.netlify/functions/tests", "");
    const method = event.httpMethod;
    const body = parseBody(event.body);
    const query = event.queryStringParameters || {};
    console.log("Processed path:", path, "Method:", method);
    if (method === "GET" && path === "/health") {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, message: "Function is working" })
      };
    }
    if (method === "GET" && path === "") {
      console.log("Fetching tests with filters:", query);
      const { status, subject } = query;
      const filters = {};
      if (status) filters.status = status;
      if (subject) filters.subject = subject;
      const tests = await testService.getTests(filters);
      console.log("Found tests:", tests.length);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, data: tests })
      };
    }
    if (method === "GET" && path.match(/^\/[^\/]+$/)) {
      const id = path.substring(1);
      const test = await testService.getTestById(id);
      if (!test) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: "Test not found" })
        };
      }
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, data: test })
      };
    }
    if (method === "POST" && path === "") {
      const user = await getUserFromAuth(event.headers.authorization);
      const isAdmin = await isUserAdmin(user.id);
      if (!isAdmin) {
        return {
          statusCode: 403,
          headers,
          body: JSON.stringify({ error: "Admin access required" })
        };
      }
      const createTestSchema = z.object({
        title: z.string().min(1, "Title is required"),
        description: z.string().optional(),
        subject: z.string().min(1, "Subject is required"),
        duration_minutes: z.number().min(1, "Duration must be at least 1 minute"),
        scheduled_start: z.string().datetime("Invalid start time"),
        status: z.enum(["draft", "scheduled"]).default("draft")
      });
      const validatedData = createTestSchema.parse(body);
      const testData = { ...validatedData, created_by: user.id };
      const test = await testService.createTest(testData);
      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({ success: true, data: test })
      };
    }
    if (method === "GET" && path.match(/^\/[^\/]+\/questions$/)) {
      const id = path.split("/")[1];
      const questions = await testService.getQuestionsByTestId(id);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, data: questions })
      };
    }
    if (method === "GET" && path === "/user/attempts") {
      const user = await getUserFromAuth(event.headers.authorization);
      const attempts = await testService.getTestAttemptsByUserId(user.id);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, data: attempts })
      };
    }
    if (method === "POST" && path.match(/^\/[^\/]+\/start$/)) {
      const user = await getUserFromAuth(event.headers.authorization);
      const id = path.split("/")[1];
      const attempt = await testService.startTestAttempt(id, user.id);
      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({ success: true, data: attempt })
      };
    }
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: "Route not found" })
    };
  } catch (error) {
    console.error("Function error:", error);
    if (error instanceof z.ZodError) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Validation failed", details: error.errors })
      };
    }
    if (error instanceof Error && error.message.includes("authorization")) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: error.message })
      };
    }
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Internal server error" })
    };
  }
};
export {
  handler
};
