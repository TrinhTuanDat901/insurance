package com.motorbike.insurance.ai.agents.actions;

import com.motorbike.insurance.ai.cnn_engine.analyzers.InputFeatureExtractor;
import com.motorbike.insurance.ai.config.AgentPlatformConfig;
import com.motorbike.insurance.ai.domain.cnn_diagnostics.CnnFeatureExtractionResult;
import com.motorbike.insurance.ai.domain.input.ResearchInputRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import com.embabel.agent.api.annotation.Action;
import com.embabel.agent.api.common.OperationContext;


@Component
public class AnalyzeUserInputWithCnnAction {

    private static final Logger logger = LoggerFactory.getLogger(AnalyzeUserInputWithCnnAction.class);

    private final InputFeatureExtractor featureExtractor;
    private final AgentPlatformConfig config;

    public AnalyzeUserInputWithCnnAction(InputFeatureExtractor featureExtractor, AgentPlatformConfig config) {
        this.featureExtractor = featureExtractor;
        this.config = config;
    }

    @Action(costMethod = "cnnAnomalyExplorationCost")
    public CnnFeatureExtractionResult analyzeUserInput(
            ResearchInputRequest request,
            OperationContext context
    ) {
        logger.info("Executing CNN forward pass for request {}", request.requestId());
        CnnFeatureExtractionResult rawResult = featureExtractor.analyzeInput(request);

        return context.ai()
                .withLlm(config.diagnosticianLlm())
                .withPromptContributor(config.diagnosticianPersona())
                .withPromptContributor(request)
                .withPromptContributor(rawResult)
                .createObject(
                        """
                        Verify the CNN feature extraction result and refine the receptiveFieldSummary
                        with an exact technical interpretation of the top activated convolutional filters.
                        """,
                        CnnFeatureExtractionResult.class
                );
    }
}
