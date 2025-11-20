// netlify/functions/test-attempts.ts
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
function getSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL || "https://your-project.supabase.co";
  const supabaseKey = process.env.SUPABASE_ANON_KEY || "your-anon-key";
  return createClient(supabaseUrl, supabaseKey);
}
var SimpleTestService = class {
  supabase = getSupabaseClient();
  async getTestAttempt(attemptId, userId) {
    let query = this.supabase.from("test_attempts").select("*").eq("id", attemptId);
    if (userId) {
      query = query.eq("user_id", userId);
    }
    const { data, error } = await query.single();
    if (error && error.code !== "PGRST116") {
      throw new Error(`Failed to fetch test attempt: ${error.message}`);
    }
    return data;
  }
  async getTestAnswersByAttemptId(attemptId) {
    const { data, error } = await this.supabase.from("test_answers").select("*").eq("attempt_id", attemptId).order("answered_at", { ascending: true });
    if (error) throw new Error(`Failed to fetch test answers: ${error.message}`);
    return data || [];
  }
  async getQuestionsByTestId(testId) {
    const { data, error } = await this.supabase.from("questions").select("*").eq("test_id", testId).order("order_index", { ascending: true });
    if (error) throw new Error(`Failed to fetch questions: ${error.message}`);
    return data || [];
  }
  async saveTestAnswer(answerData) {
    const { data, error } = await this.supabase.from("test_answers").upsert([answerData]).select().single();
    if (error) throw new Error(`Failed to save test answer: ${error.message}`);
    return data;
  }
  async calculateTestScore(attemptId) {
    const { data, error } = await this.supabase.from("test_answers").select(`
        is_correct,
        questions!inner(points)
      `).eq("attempt_id", attemptId);
    if (error) throw new Error(`Failed to calculate test score: ${error.message}`);
    const answers = data || [];
    const score = answers.filter((answer) => answer.is_correct).reduce(
      (sum, answer) => sum + answer.questions.points,
      0
    );
    const totalPoints = answers.reduce(
      (sum, answer) => sum + answer.questions.points,
      0
    );
    return { score, totalPoints };
  }
  async completeTestAttempt(attemptId, score, totalPoints) {
    const updates = {
      status: "completed",
      ended_at: (/* @__PURE__ */ new Date()).toISOString(),
      score,
      total_points: totalPoints
    };
    const { data, error } = await this.supabase.from("test_attempts").update(updates).eq("id", attemptId).select().single();
    if (error) throw new Error(`Failed to update test attempt: ${error.message}`);
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
    const path = event.path.replace("/.netlify/functions/test-attempts", "");
    const method = event.httpMethod;
    const body = parseBody(event.body);
    if (method === "GET" && path.match(/^\/[^\/]+$/)) {
      const user = await getUserFromAuth(event.headers.authorization);
      const attemptId = path.substring(1);
      const attempt = await testService.getTestAttempt(attemptId, user.id);
      if (!attempt) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: "Test attempt not found" })
        };
      }
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, data: attempt })
      };
    }
    if (method === "GET" && path.match(/^\/[^\/]+\/answers$/)) {
      const user = await getUserFromAuth(event.headers.authorization);
      const attemptId = path.split("/")[1];
      const attempt = await testService.getTestAttempt(attemptId, user.id);
      if (!attempt) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: "Test attempt not found" })
        };
      }
      const answers = await testService.getTestAnswersByAttemptId(attemptId);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, data: answers })
      };
    }
    if (method === "POST" && path.match(/^\/[^\/]+\/answers$/)) {
      const user = await getUserFromAuth(event.headers.authorization);
      const attemptId = path.split("/")[1];
      const saveAnswerSchema = z.object({
        question_id: z.string().uuid("Invalid question ID"),
        selected_option: z.number().min(0).max(3, "Selected option must be 0-3"),
        time_spent_seconds: z.number().min(0).optional()
      });
      const { question_id, selected_option, time_spent_seconds } = saveAnswerSchema.parse(body);
      const attempt = await testService.getTestAttempt(attemptId, user.id);
      if (!attempt) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: "Test attempt not found" })
        };
      }
      const questions = await testService.getQuestionsByTestId(attempt.test_id);
      const question = questions.find((q) => q.id === question_id);
      if (!question) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: "Question not found" })
        };
      }
      const answerData = {
        attempt_id: attemptId,
        question_id,
        selected_option,
        is_correct: selected_option === question.correct_option,
        time_spent_seconds
      };
      const answer = await testService.saveTestAnswer(answerData);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, data: answer })
      };
    }
    if (method === "POST" && path.match(/^\/[^\/]+\/submit$/)) {
      const user = await getUserFromAuth(event.headers.authorization);
      const attemptId = path.split("/")[1];
      const attempt = await testService.getTestAttempt(attemptId, user.id);
      if (!attempt) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: "Test attempt not found" })
        };
      }
      if (attempt.status !== "in_progress") {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: "Test attempt is not in progress" })
        };
      }
      const { score, totalPoints } = await testService.calculateTestScore(attemptId);
      const completedAttempt = await testService.completeTestAttempt(attemptId, score, totalPoints);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, data: completedAttempt })
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
