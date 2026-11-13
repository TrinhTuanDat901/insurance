package com.motorbike.insurance.ai.cnn_engine.analyzers;

import com.motorbike.insurance.ai.cnn_engine.model.CnnInferenceRunner;
import com.motorbike.insurance.ai.config.CnnModelConfig;
import com.motorbike.insurance.ai.domain.cnn_diagnostics.CnnFeatureExtractionResult;
import com.motorbike.insurance.ai.domain.input.ResearchInputRequest;
import org.springframework.stereotype.Component;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Extracts structured CNN feature activations from a single user ResearchInputRequest.
 */
@Component
public class InputFeatureExtractor {

    private final CnnInferenceRunner inferenceRunner;
    private final CnnModelConfig config;

    public InputFeatureExtractor(CnnInferenceRunner inferenceRunner, CnnModelConfig config) {
        this.inferenceRunner = inferenceRunner;
        this.config = config;
    }

    public CnnFeatureExtractionResult analyzeInput(ResearchInputRequest request) {
        var output = inferenceRunner.runInference(request.rawInputSignal());
        Map<String, Double> topFilters = new LinkedHashMap<>();
        double[] acts = output.pooledActivations();
        for (int i = 0; i < Math.min(acts.length, 4); i++) {
            topFilters.put("Conv1_Filter_" + i + "_EdgePool", acts[i]);
        }

        boolean isAnomaly = output.confidence() < config.confidenceThreshold();
        String summary = String.format(
                "Kernel %dx1 stride %d captured peak activation %.4f with Shannon entropy %.4f",
                config.kernelSize(), config.stride(),
                acts.length > 0 ? acts[0] : 0.0,
                output.entropy()
        );

        return new CnnFeatureExtractionResult(
                request.requestId(),
                output.predictedLabel(),
                output.confidence(),
                isAnomaly,
                topFilters,
                output.embeddingVector(),
                summary
        );
    }
}
