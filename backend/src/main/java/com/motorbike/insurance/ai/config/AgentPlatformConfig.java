package com.motorbike.insurance.ai.config;

import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

import org.springframework.boot.context.properties.ConfigurationProperties;

import com.embabel.agent.prompt.persona.RoleGoalBackstory;
import com.embabel.common.ai.model.LlmOptions;

import com.motorbike.insurance.ai.domain.output.ComprehensiveResearchReport;
import org.springframework.context.annotation.Configuration;

@ConfigurationProperties(prefix = "research.agent")
public record AgentPlatformConfig(
        int maxConcurrency,
        String outputDirectory,
        List<String> allowedOrigins,
        String diagnosticianModel,
        String researcherModel,
        String synthesizerModel,
        String diagnosticianRole,
        String diagnosticianGoal,
        String diagnosticianBackstory,
        String researcherRole,
        String researcherGoal,
        String researcherBackstory
) {
    public LlmOptions diagnosticianLlm() {
        return LlmOptions.withModel(diagnosticianModel != null ? diagnosticianModel : "gpt-4.1-mini")
                .withTemperature(0.2);
    }

    public LlmOptions researcherLlm() {
        return LlmOptions.withModel(researcherModel != null ? researcherModel : "gpt-4.1-nano")
                .withTemperature(0.4);
    }

    public LlmOptions synthesizerLlm() {
        return LlmOptions.withModel(synthesizerModel != null ? synthesizerModel : "gpt-4.1")
                .withTemperature(0.3);
    }

    public RoleGoalBackstory diagnosticianPersona() {
        return new RoleGoalBackstory(
                diagnosticianRole != null ? diagnosticianRole : "Senior ML & CNN Dataset Diagnostician",
                diagnosticianGoal != null ? diagnosticianGoal : "Analyze CNN feature activations and train_set vs dev_set drift",
                diagnosticianBackstory != null ? diagnosticianBackstory : "Expert deep learning engineer specializing in convolutional diagnostics"
        );
    }

    public RoleGoalBackstory researcherPersona() {
        return new RoleGoalBackstory(
                researcherRole != null ? researcherRole : "Principal AI Literature & Domain Researcher",
                researcherGoal != null ? researcherGoal : "Use ToolishRag to investigate root causes of CNN anomalies and dataset drift",
                researcherBackstory != null ? researcherBackstory : "Systematic researcher grounding explanations in retrieved evidence"
        );
    }

    public Path saveResearchReport(ComprehensiveResearchReport report) {
        try {
            var baseDir = outputDirectory != null ? outputDirectory : System.getProperty("user.dir") + File.separator + "outputs";
            Path dirPath = Path.of(baseDir);
            Files.createDirectories(dirPath);
            String safeFileName = report.title().replaceAll("[^a-zA-Z0-9-_]", "_").toLowerCase() + ".md";
            Path targetFile = dirPath.resolve(safeFileName);
            return Files.writeString(targetFile, report.toMarkdown(), StandardCharsets.UTF_8);
        } catch (IOException e) {
            throw new IllegalStateException("Failed to persist ComprehensiveResearchReport to disk", e);
        }
    }
}
