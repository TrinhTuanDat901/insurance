package com.motorbike.insurance.ai.domain.cnn_diagnostics;

import java.util.List;

import org.springframework.lang.NonNull;

import com.embabel.common.ai.prompt.PromptContributor;

public record TrainDevDriftReport(
        DatasetSplitMetrics trainMetrics,
        DatasetSplitMetrics devMetrics,
        double generalizationAccuracyGap,
        double klDivergenceScore,
        double featureCentroidCosineDistance,
        boolean significantOverfittingDetected,
        boolean covariateShiftDetected,
        List<String> vulnerableClasses,
        HardNegativeSamples hardNegatives
) implements PromptContributor {

    @NonNull
    @Override
    public String contribution() {
        return """
                === CNN TRAIN SET vs. DEV SET DIAGNOSTIC DRIFT REPORT ===
                %s
                %s
                Comparative Drift & Generalization Indicators:
                - Generalization Accuracy Gap (Train - Dev): %.2f%%
                - Feature Distribution KL-Divergence: %.4f
                - Centroid Feature Vector Cosine Distance: %.4f
                - Significant Overfitting Detected: %s
                - Covariate / Distribution Shift Detected: %s
                - Most Vulnerable Classes in Dev Set: %s
                %s
                """.formatted(
                trainMetrics.contribution(),
                devMetrics.contribution(),
                generalizationAccuracyGap * 100.0,
                klDivergenceScore,
                featureCentroidCosineDistance,
                significantOverfittingDetected ? "YES" : "NO",
                covariateShiftDetected ? "YES" : "NO",
                vulnerableClasses,
                hardNegatives.contribution()
        );
    }
}
