package com.devopscopilot.controller;
import com.devopscopilot.model.*; import com.devopscopilot.service.LogAnalysisService; import org.springframework.web.bind.annotation.*;
@RestController @CrossOrigin(origins="http://localhost:5173") @RequestMapping("/api")
public class LogAnalysisController { private final LogAnalysisService service; public LogAnalysisController(LogAnalysisService service){this.service=service;} @PostMapping("/analyze") public LogAnalysisResponse analyze(@RequestBody LogAnalysisRequest r){return service.analyzeLog(r.getLog());} }
