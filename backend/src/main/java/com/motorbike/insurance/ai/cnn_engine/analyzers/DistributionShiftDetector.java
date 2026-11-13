package com.motorbike.insurance.ai.cnn_engine.analyzers;

import com.motorbike.insurance.ai.config.CnnModelConfig;
import com.motorbike.insurance.ai.domain.cnn_diagnostics.DatasetSplitMetrics;
import com.motorbike.insurance.ai.domain.cnn_diagnostics.HardNegativeSamples;
import com.motorbike.insurance.ai.domain.cnn_diagnostics.TrainDevDriftReport;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * Computes statistical divergence (KL-Divergence, Feature Centroid Cosine Distance,
 * and Generalization Gap) between train_set and dev_set CNN profiles.
 */
@Component
public class DistributionShiftDetector {

    private final CnnModelConfig config;

    public DistributionShiftDetector(CnnModelConfig config) {
        this.config = config;
    }

    public TrainDevDriftReport compareTrainAndDev(
            DatasetSplitMetrics trainMetrics,
            DatasetSplitMetrics devMetrics,
            HardNegativeSamples hardNegatives
    ) {
        double accuracyGap = trainMetrics.accuracy() - devMetrics.accuracy();
        double cosineDistance = computeCosineDistance(
                trainMetrics.centroidFeatureVector(),
                devMetrics.centroidFeatureVector()
        );
        double klDivergence = computeClassDistributionKl(trainMetrics, devMetrics);

        boolean overfitting = accuracyGap > 0.10;
        boolean covariateShift = klDivergence > config.driftKlThreshold() || cosineDistance > 0.08;

        List<String> vulnerable = new ArrayList<>();
        devMetrics.perClassF1Score().forEach((cls, f1) -> {
            double trainF1 = trainMetrics.perClassF1Score().getOrDefault(cls, 1.0);
            if (trainF1 - f1 > 0.12) {
                vulnerable.add(cls + String.format(" (Train F1: %.2f -> Dev F1: %.2f)", trainF1, f1));
            }
        });

        return new TrainDevDriftReport(
                trainMetrics,
                devMetrics,
                accuracyGap,
                klDivergence,
                cosineDistance,
                overfitting,
                covariateShift,
                vulnerable,
                hardNegatives
        );
    }

    private double computeCosineDistance(List<Double> a, List<Double> b) {
        int len = Math.min(a.size(), b.size());
        double dot = 0.0, normA = 0.0, normB = 0.0;
        for (int i = 0; i < len; i++) {
            dot += a.get(i) * b.get(i);
            normA += a.get(i) * a.get(i);
            normB += b.get(i) * b.get(i);
        }
        if (normA == 0 || normB == 0) return 0.0;
        return 1.0 - (dot / (Math.sqrt(normA) * Math.sqrt(normB)));
    }

    private double computeClassDistributionKl(DatasetSplitMetrics train, DatasetSplitMetrics dev) {
        double kl = 0.0;
        for (String cls : train.classCounts().keySet()) {
            double p = (double) train.classCounts().getOrDefault(cls, 1) / train.sampleCount();
            double q = (double) dev.classCounts().getOrDefault(cls, 1) / dev.sampleCount();
            kl += p * Math.log(p / q);
        }
        return Math.abs(kl);
    }
}
