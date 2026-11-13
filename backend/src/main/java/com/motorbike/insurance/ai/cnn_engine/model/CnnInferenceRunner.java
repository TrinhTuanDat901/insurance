package com.motorbike.insurance.ai.cnn_engine.model;

import com.motorbike.insurance.ai.config.CnnModelConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Executes CNN forward passes and encapsulates label resolution and entropy calculations.
 */
@Component
public class CnnInferenceRunner {

    private static final Logger logger = LoggerFactory.getLogger(CnnInferenceRunner.class);
    private static final String[] CLASS_LABELS = {"NORMAL_PATTERN", "HIGH_FREQ_SPIKE", "SENSOR_DROPOUT"};

    private final CnnArchitecture architecture;
    private final CnnModelConfig config;

    public CnnInferenceRunner(CnnArchitecture architecture, CnnModelConfig config) {
        this.architecture = architecture;
        this.config = config;
    }

    public record RawInferenceOutput(
            String predictedLabel,
            double confidence,
            double entropy,
            double[] pooledActivations,
            List<Double> embeddingVector
    ) {}

    public RawInferenceOutput runInference(List<Double> signal) {
        logger.debug("Running CNN inference using architecture {}", config.architectureName());
        double[] activations = architecture.forwardConvAndPool(signal);
        double[] probs = architecture.computeClassProbabilities(activations);

        int bestIdx = 0;
        double entropy = 0.0;
        for (int i = 0; i < probs.length; i++) {
            if (probs[i] > probs[bestIdx]) {
                bestIdx = i;
            }
            if (probs[i] > 1e-9) {
                entropy -= probs[i] * Math.log(probs[i]);
            }
        }

        return new RawInferenceOutput(
                CLASS_LABELS[bestIdx],
                probs[bestIdx],
                entropy,
                activations,
                architecture.toEmbeddingVector(activations)
        );
    }
}
