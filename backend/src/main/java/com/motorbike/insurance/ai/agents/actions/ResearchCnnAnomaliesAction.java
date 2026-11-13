package com.motorbike.insurance.ai.agents.actions;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import com.embabel.agent.api.annotation.Action;
import com.embabel.agent.api.common.OperationContext;
import com.embabel.agent.core.CoreToolGroups;

import com.motorbike.insurance.ai.config.AgentPlatformConfig;
import com.motorbike.insurance.ai.domain.cnn_diagnostics.CnnFeatureExtractionResult;
import com.motorbike.insurance.ai.domain.cnn_diagnostics.TrainDevDriftReport;
import com.motorbike.insurance.ai.domain.input.ResearchInputRequest;
import com.motorbike.insurance.ai.domain.state.HypothesisEvaluationState;
import com.motorbike.insurance.ai.rag_and_tools.agentic_tools.DeepLiteratureSearchTool;
import com.motorbike.insurance.ai.rag_and_tools.search_operations.ExternalWebResearchTool;
import com.motorbike.insurance.ai.rag_and_tools.search_operations.KnowledgeBaseRagTool;

@Component
public class ResearchCnnAnomaliesAction {

    private static final Logger logger = LoggerFactory.getLogger(ResearchCnnAnomaliesAction.class);

    private final AgentPlatformConfig config;
    private final KnowledgeBaseRagTool ragTool;
    private final ExternalWebResearchTool webResearchTool;
    private final DeepLiteratureSearchTool deepLiteratureSearchTool;

    public ResearchCnnAnomaliesAction(
            AgentPlatformConfig config,
            KnowledgeBaseRagTool ragTool,
            ExternalWebResearchTool webResearchTool,
            DeepLiteratureSearchTool deepLiteratureSearchTool
    ) {
        this.config = config;
        this.ragTool = ragTool;
        this.webResearchTool = webResearchTool;
        this.deepLiteratureSearchTool = deepLiteratureSearchTool;
    }

    @Action
    public HypothesisEvaluationState researchCnnAnomalies(
            ResearchInputRequest request,
            CnnFeatureExtractionResult inputFeatures,
            TrainDevDriftReport driftReport,
            OperationContext context
    ) {
        logger.info("Executing Agentic RAG research for KL-Divergence={} and vulnerable classes={}",
                driftReport.klDivergenceScore(), driftReport.vulnerableClasses());

        var runner = context.ai()
                .withLlm(config.researcherLlm())
                .withTool(deepLiteratureSearchTool.buildAgenticTool())
                .withToolObject(ragTool)
                .withToolObject(webResearchTool)
                .withToolGroup(CoreToolGroups.WEB)
                .withPromptContributor(config.researcherPersona())
                .withPromptContributor(request)
                .withPromptContributor(inputFeatures)
                .withPromptContributor(driftReport);

        if (ragTool.asToolishRagIfAvailable() != null) {
            runner = runner.withReference(ragTool.asToolishRagIfAvailable());
        }

        return runner.createObject(
                """
                Investigate the generalization gap between train_set and dev_set and the hard-negative
                samples using the provided RAG and literature tools. Populate HypothesisEvaluationState
                with grounded literature findings and exact source citations.
                """,
                HypothesisEvaluationState.class
        );
    }
}
