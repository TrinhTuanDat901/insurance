package com.motorbike.insurance.ai.domain.state;

import java.util.List;
import java.util.Map;

import org.springframework.lang.NonNull;

import com.embabel.agent.api.annotation.Action;
import com.embabel.agent.api.annotation.Provided;
import com.embabel.agent.api.annotation.State;
import com.embabel.agent.api.common.OperationContext;
import com.embabel.common.ai.prompt.PromptContributor;

import com.motorbike.insurance.ai.config.AgentPlatformConfig;
import com.motorbike.insurance.ai.domain.cnn_diagnostics.CnnFeatureExtractionResult;
import com.motorbike.insurance.ai.domain.cnn_diagnostics.TrainDevDriftReport;
import com.motorbike.insurance.ai.domain.input.ResearchInputRequest;
import com.motorbike.insurance.ai.rag_and_tools.search_operations.KnowledgeBaseRagTool;

/**
 * Embabel 1.5.4 @State record using com.embabel.agent.api.annotation.State
 * and com.embabel.agent.api.annotation.Provided.
 */
@State
public record HypothesisEvaluationState(
        ResearchInputRequest request,
        CnnFeatureExtractionResult inputFeatures,
        TrainDevDriftReport driftReport,
        String literatureFindings,
        List<String> citations,
        int iterationCount,
        boolean evidenceSufficient
) implements PromptContributor {

    @NonNull
    @Override
    public String contribution() {
        return """
                Current Research Hypothesis Evaluation State (Iteration %d):
                - Evidence Sufficient Flag: %s
                - Literature Findings Summary: %s
                - Grounded Citations Count: %d (%s)
                """.formatted(iterationCount, evidenceSufficient, literatureFindings, citations.size(), citations);
    }

    @Action
    public DatasetRefinementState evaluateOrRefine(
            @Provided AgentPlatformConfig config,
            @Provided KnowledgeBaseRagTool ragTool,
            OperationContext context
    ) {
        if (evidenceSufficient || iterationCount >= 2) {
            return context.ai()
                    .withLlm(config.diagnosticianLlm())
                    .withPromptContributor(config.diagnosticianPersona())
                    .withPromptContributor(request)
                    .withPromptContributor(inputFeatures)
                    .withPromptContributor(driftReport)
                    .withPromptContributor(this)
                    .rendering("objectives/evaluate_train_dev_split")
                    .createObject(
                            DatasetRefinementState.class,
                            Map.of(
                                    "request", request,
                                    "driftReport", driftReport
                            )
                    );
        }

        var runner = context.ai()
                .withLlm(config.researcherLlm())
                .withPromptContributor(config.researcherPersona())
                .withPromptContributor(driftReport)
                .withPromptContributor(this)
                .withToolObject(ragTool);

        if (ragTool.asToolishRagIfAvailable() != null) {
            runner = runner.withReference(ragTool.asToolishRagIfAvailable());
        }

        return runner.createObject(
                """
                The previous research iteration lacked sufficient citations for the observed
                KL-divergence drift (%.4f) and vulnerable classes %s.
                Run targeted searches to retrieve concrete mitigation evidence.
                """.formatted(driftReport.klDivergenceScore(), driftReport.vulnerableClasses()),
                DatasetRefinementState.class
        );
    }
}
