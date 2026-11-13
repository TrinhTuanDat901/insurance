package com.motorbike.insurance.ai.domain.cnn_diagnostics;

import java.util.List;
import java.util.Map;

import org.springframework.lang.NonNull;

import com.embabel.common.ai.prompt.PromptContributor;

public record DatasetSplitMetrics(
        String splitName,
        int sampleCount,
        double accuracy,
        double crossEntropyLoss,
        double meanActivationEntropy,
        List<Double> centroidFeatureVector,
        Map<String, Integer> classCounts,
        Map<String, Double> perClassF1Score
) implements PromptContributor {

    @NonNull
    @Override
    public String contribution() {
        return """
                Dataset Split Metrics [%s]:
                - Total Evaluated Samples: %d
                - Split Accuracy: %.2f%% | Cross-Entropy Loss: %.4f | Mean Activation Entropy: %.4f
                - Class Distribution: %s
                - Per-Class F1 Scores: %s
                """.formatted(
                splitName,
                sampleCount,
                accuracy * 100.0,
                crossEntropyLoss,
                meanActivationEntropy,
                classCounts,
                perClassF1Score
        );
    }
}
