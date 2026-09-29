package com.devopscopilot.service;

import com.devopscopilot.model.LogAnalysisResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LogAnalysisService {

 private final ChatClient chatClient;
 private final ObjectMapper objectMapper;

 public LogAnalysisService(
         ChatClient.Builder chatClientBuilder,
         ObjectMapper objectMapper
 ) {
  this.chatClient = chatClientBuilder.build();
  this.objectMapper = objectMapper;
 }

 public LogAnalysisResponse analyzeLog(String log) {

  if (log == null || log.trim().isEmpty()) {

   LogAnalysisResponse response = new LogAnalysisResponse(
           "Unknown Error",
           "LOW",
           "No log information was provided.",
           "Provide a valid application log for analysis.",
           "The system could not analyze the incident because the log was empty.",
           "VALIDATION"
   );

   response.setTroubleshootingSteps(
           List.of("Provide a valid application log.")
   );

   response.setImpact("No incident impact can be determined.");

   response.setPrevention(
           List.of("Always provide complete application logs.")
   );

   return response;
  }

  try {

   String response = chatClient.prompt()
           .system("""
                            You are DevOps Copilot, an expert software incident analysis assistant.

                            Analyze the application log carefully.
                            Do not invent facts.

                            Return ONLY valid JSON.
                            Do not use markdown.
                            Do not wrap the JSON in ```.

                            Return exactly these keys:

                            {
                              "errorType": "string",
                              "severity": "LOW | MEDIUM | HIGH | CRITICAL",
                              "possibleRootCause": "string",
                              "suggestedFix": "string",
                              "incidentSummary": "string",
                              "troubleshootingSteps": ["step 1", "step 2", "step 3"],
                              "impact": "string",
                              "prevention": ["prevention 1", "prevention 2"]
                            }

                            Rules:
                            - troubleshootingSteps must contain 3 to 5 practical steps.
                            - prevention must contain 2 to 4 practical prevention actions.
                            - Keep the response concise.
                            - Base conclusions only on the supplied log.
                            """)
           .user("Analyze this application log:\n\n" + log)
           .call()
           .content();

   String json = extractJson(response);

   LogAnalysisResponse result =
           objectMapper.readValue(json, LogAnalysisResponse.class);

   result.setAnalysisMode("LOCAL AI - OLLAMA");

   return result;

  } catch (Exception ex) {

   return fallbackAnalysis(log);
  }
 }

 private String extractJson(String response) {

  if (response == null) {
   throw new IllegalArgumentException("Empty AI response");
  }

  String cleaned = response.trim();

  if (cleaned.startsWith("```")) {

   cleaned = cleaned.replaceFirst(
           "^```(?:json)?\\s*",
           ""
   );

   cleaned = cleaned.replaceFirst(
           "\\s*```$",
           ""
   );
  }

  int start = cleaned.indexOf('{');
  int end = cleaned.lastIndexOf('}');

  if (start < 0 || end <= start) {
   throw new IllegalArgumentException(
           "AI did not return JSON"
   );
  }

  return cleaned.substring(start, end + 1);
 }

 private LogAnalysisResponse fallbackAnalysis(String log) {

  String lowerLog = log.toLowerCase();

  if (lowerLog.contains("database") ||
          lowerLog.contains("db connection") ||
          lowerLog.contains("sql") ||
          lowerLog.contains("connection timeout")) {

   LogAnalysisResponse response = new LogAnalysisResponse(
           "Database Connection Error",
           "HIGH",
           "The application may be unable to connect to the database or the database connection timed out.",
           "Check database availability, network connectivity, credentials, and connection pool configuration.",
           "The application encountered a database connectivity issue that may prevent normal request processing.",
           "RULE-BASED FALLBACK"
   );

   response.setTroubleshootingSteps(List.of(
           "Check database server health.",
           "Check active database connections.",
           "Review connection pool configuration.",
           "Verify network connectivity and credentials."
   ));

   response.setImpact(
           "Database-dependent application requests may fail."
   );

   response.setPrevention(List.of(
           "Monitor database connection pool usage.",
           "Configure connection timeout alerts.",
           "Review database capacity regularly."
   ));

   return response;
  }

  if (lowerLog.contains("500") ||
          lowerLog.contains("internal server error")) {

   LogAnalysisResponse response = new LogAnalysisResponse(
           "Internal Server Error",
           "HIGH",
           "The server encountered an unexpected error while processing the request.",
           "Check application logs, stack traces, recent deployments, and dependent services.",
           "The application returned HTTP 500, indicating an unexpected server-side failure.",
           "RULE-BASED FALLBACK"
   );

   response.setTroubleshootingSteps(List.of(
           "Review the complete stack trace.",
           "Check recent application deployments.",
           "Check dependent services.",
           "Review application metrics."
   ));

   response.setImpact(
           "Requests may fail and users may receive HTTP 500 responses."
   );

   response.setPrevention(List.of(
           "Add application error monitoring.",
           "Use automated health checks.",
           "Test deployments before production release."
   ));

   return response;
  }

  if (lowerLog.contains("nullpointerexception") ||
          lowerLog.contains("null pointer")) {

   LogAnalysisResponse response = new LogAnalysisResponse(
           "Null Pointer Error",
           "MEDIUM",
           "The application attempted to use an object that was null.",
           "Check the stack trace and validate objects before accessing their methods or properties.",
           "A null object reference caused the application operation to fail.",
           "RULE-BASED FALLBACK"
   );

   response.setTroubleshootingSteps(List.of(
           "Check the stack trace line number.",
           "Identify the null object.",
           "Validate the object before use.",
           "Add appropriate null handling."
   ));

   response.setImpact(
           "The affected application operation may fail."
   );

   response.setPrevention(List.of(
           "Add input validation.",
           "Use appropriate null handling.",
           "Add unit tests for null scenarios."
   ));

   return response;
  }

  if (lowerLog.contains("timeout") ||
          lowerLog.contains("timed out")) {

   LogAnalysisResponse response = new LogAnalysisResponse(
           "Timeout Error",
           "HIGH",
           "A service or operation did not respond within the expected time.",
           "Check network connectivity, downstream services, timeout configuration, and service performance.",
           "The application experienced a timeout while waiting for a response.",
           "RULE-BASED FALLBACK"
   );

   response.setTroubleshootingSteps(List.of(
           "Check the downstream service health.",
           "Check network latency.",
           "Review timeout configuration.",
           "Review service performance metrics."
   ));

   response.setImpact(
           "Requests waiting for the affected service may fail or become slow."
   );

   response.setPrevention(List.of(
           "Monitor service response times.",
           "Configure appropriate timeout alerts.",
           "Use resilient service communication patterns."
   ));

   return response;
  }

  LogAnalysisResponse response = new LogAnalysisResponse(
          "Application Error",
          "MEDIUM",
          "The log contains an application error that requires further investigation.",
          "Review the complete stack trace, recent code changes, application metrics, and dependent services.",
          "The incident requires additional investigation based on the provided application log.",
          "RULE-BASED FALLBACK"
  );

  response.setTroubleshootingSteps(List.of(
          "Review the complete application log.",
          "Check the stack trace.",
          "Review recent code changes.",
          "Check application and service metrics."
  ));

  response.setImpact(
          "The impact cannot be determined without additional incident information."
  );

  response.setPrevention(List.of(
          "Improve application monitoring.",
          "Add automated error alerts.",
          "Maintain detailed application logs."
  ));

  return response;
 }
}