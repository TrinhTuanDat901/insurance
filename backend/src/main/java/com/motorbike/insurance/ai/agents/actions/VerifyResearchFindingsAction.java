package com.motorbike.insurance.ai.agents.actions;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import com.embabel.agent.api.annotation.Action;
import com.embabel.agent.api.common.OperationContext;

import com.motorbike.insurance.ai.config.AgentPlatformConfig;
import com.motorbike.insurance.ai.domain.state.DatasetRefinementState;
import com.motorbike.insurance.ai.domain.state.HypothesisEvaluationState;
import com.motorbike.insurance.ai.rag_and_tools.search_operations.KnowledgeBaseRagTool;

@Component
public class VerifyResearchFindingsAction {

    private static final Logger logger = LoggerFactory.getLogger(VerifyResearchFindingsAction.class);

    private final AgentPlatformConfig config;
    private final KnowledgeBaseRagTool ragTool;

    public VerifyResearchFindingsAction(AgentPlatformConfig config, KnowledgeBaseRagTool ragTool) {
        this.config = config;
        this.ragTool = ragTool;
    }

    @Action
    public DatasetRefinementState verifyFindings(
            HypothesisEvaluationState evaluationState,
            OperationContext context
    ) {
        logger.info("Verifying research hypothesis state at iteration {}", evaluationState.iterationCount());
        return evaluationState.evaluateOrRefine(config, ragTool, context);
    }
}
