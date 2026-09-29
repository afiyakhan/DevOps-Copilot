package com.devopscopilot.model;

import java.util.List;

public class LogAnalysisResponse {

 private String errorType;
 private String severity;
 private String possibleRootCause;
 private String suggestedFix;
 private String incidentSummary;
 private String analysisMode;

 private List<String> troubleshootingSteps;
 private String impact;
 private List<String> prevention;

 public LogAnalysisResponse() {
 }

 public LogAnalysisResponse(
         String errorType,
         String severity,
         String possibleRootCause,
         String suggestedFix,
         String incidentSummary,
         String analysisMode
 ) {
  this.errorType = errorType;
  this.severity = severity;
  this.possibleRootCause = possibleRootCause;
  this.suggestedFix = suggestedFix;
  this.incidentSummary = incidentSummary;
  this.analysisMode = analysisMode;
 }

 public String getErrorType() {
  return errorType;
 }

 public void setErrorType(String errorType) {
  this.errorType = errorType;
 }

 public String getSeverity() {
  return severity;
 }

 public void setSeverity(String severity) {
  this.severity = severity;
 }

 public String getPossibleRootCause() {
  return possibleRootCause;
 }

 public void setPossibleRootCause(String possibleRootCause) {
  this.possibleRootCause = possibleRootCause;
 }

 public String getSuggestedFix() {
  return suggestedFix;
 }

 public void setSuggestedFix(String suggestedFix) {
  this.suggestedFix = suggestedFix;
 }

 public String getIncidentSummary() {
  return incidentSummary;
 }

 public void setIncidentSummary(String incidentSummary) {
  this.incidentSummary = incidentSummary;
 }

 public String getAnalysisMode() {
  return analysisMode;
 }

 public void setAnalysisMode(String analysisMode) {
  this.analysisMode = analysisMode;
 }

 public List<String> getTroubleshootingSteps() {
  return troubleshootingSteps;
 }

 public void setTroubleshootingSteps(List<String> troubleshootingSteps) {
  this.troubleshootingSteps = troubleshootingSteps;
 }

 public String getImpact() {
  return impact;
 }

 public void setImpact(String impact) {
  this.impact = impact;
 }

 public List<String> getPrevention() {
  return prevention;
 }

 public void setPrevention(List<String> prevention) {
  this.prevention = prevention;
 }
}