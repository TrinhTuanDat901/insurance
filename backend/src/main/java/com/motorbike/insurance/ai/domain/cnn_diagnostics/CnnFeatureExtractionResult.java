package com.motorbike.insurance.ai.domain.cnn_diagnostics;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.lang.NonNull;

import com.embabel.common.ai.prompt.PromptContributor;

public record CnnFeatureExtractionResult(
        String sampleId,
        String predictedLabel,
        double confidenceScore,
        boolean outOfDistributionAnomaly,
        Map<String, Double> topFilterActivations,
        List<Double> pooledEmbeddingVector,
        String receptiveFieldSummary
) implements PromptContributor {

    @NonNull
    @Override
    public String contribution() {
        String activationsFormatted = topFilterActivations.entrySet().stream()
                .map(e -> "  * " + e.getKey() + ": " + String.format("%.4f", e.getValue()))
                .collect(Collectors.joining("\n"));

        return """
                CNN Input Feature Extraction Result [Sample: %s]:
                - Predicted Class Label: %s (Confidence: %.2f%%)
                - Out-of-Distribution (OOD) Anomaly Flag: %s
                - Receptive Field Summary: %s
                - Top Convolutional Filter Activations:
                %s
                """.formatted(
                sampleId,
                predictedLabel,
                confidenceScore * 100.0,
                outOfDistributionAnomaly ? "YES (Requires RAG Investigation)" : "NO (In-Distribution)",
                receptiveFieldSummary,
                activationsFormatted
        );
    }
}
