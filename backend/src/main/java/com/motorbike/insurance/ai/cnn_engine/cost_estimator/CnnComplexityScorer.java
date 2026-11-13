package com.motorbike.insurance.ai.cnn_engine.cost_estimator;

import org.springframework.lang.Nullable;
import org.springframework.stereotype.Component;

import com.embabel.agent.api.annotation.Cost;

import com.motorbike.insurance.ai.cnn_engine.model.CnnInferenceRunner;
import com.motorbike.insurance.ai.domain.input.ResearchInputRequest;

/**
 * Uses com.embabel.agent.api.annotation.Cost (Embabel 1.5.4).
 * Per Embabel 1.5.4 rules, domain parameters in @Cost methods must be @Nullable.
 */
@Component
public class CnnComplexityScorer {

    private final CnnInferenceRunner inferenceRunner;

    public CnnComplexityScorer(CnnInferenceRunner inferenceRunner) {
        this.inferenceRunner = inferenceRunner;
    }

    @Cost(name = "cnnAnomalyExplorationCost")
    public double computeExplorationCost(@Nullable ResearchInputRequest request) {
        if (request == null || request.rawInputSignal() == null) {
            return 0.5;
        }
        var inference = inferenceRunner.runInference(request.rawInputSignal());
        return Math.max(0.05, 1.0 - Math.min(0.95, inference.entropy()));
    }
}
