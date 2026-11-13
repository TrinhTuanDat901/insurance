package com.motorbike.insurance.ai.agents.actions;

import java.nio.file.Path;
import java.util.Map;

import com.motorbike.insurance.ai.config.AgentPlatformConfig;
import com.motorbike.insurance.ai.domain.cnn_diagnostics.CnnFeatureExtractionResult;
import com.motorbike.insurance.ai.domain.cnn_diagnostics.TrainDevDriftReport;
import com.motorbike.insurance.ai.domain.input.ResearchInputRequest;
import com.motorbike.insurance.ai.domain.output.ComprehensiveResearchReport;
import com.motorbike.insurance.ai.domain.state.DatasetRefinementState;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.embabel.agent.api.annotation.AchievesGoal;
import com.embabel.agent.api.annotation.Action;
import com.embabel.agent.api.annotation.Agent;
import com.embabel.agent.api.annotation.Export;
import com.embabel.agent.api.common.OperationContext;

/**
 * Embabel 1.5.4 @Agent class using exact annotations from com.embabel.agent.api.annotation.*
 * and Jinja template rendering via context.ai()...rendering("objectives/synthesize_research_plan").createObject(...).
 */
@Agent(description = "Analyze input signals and train_set/dev_set splits with a CNN, research anomalies via Agentic RAG, and produce a verified report")
public class GenerateFinalAnalysisAction {

    private static final Logger logger = LoggerFactory.getLogger(GenerateFinalAnalysisAction.class);

    private final AgentPlatformConfig config;
    private final AnalyzeUserInputWithCnnAction analyzeInputAction;
    private final ProfileTrainAndDevSetsAction profileSetsAction;
    private final ResearchCnnAnomaliesAction researchAnomaliesAction;
    private final VerifyResearchFindingsAction verifyFindingsAction;

    public GenerateFinalAnalysisAction(
            AgentPlatformConfig config,
            AnalyzeUserInputWithCnnAction analyzeInputAction,
            ProfileTrainAndDevSetsAction profileSetsAction,
            ResearchCnnAnomaliesAction researchAnomaliesAction,
            VerifyResearchFindingsAction verifyFindingsAction
    ) {
        this.config = config;
        this.analyzeInputAction = analyzeInputAction;
        this.profileSetsAction = profileSetsAction;
        this.researchAnomaliesAction = researchAnomaliesAction;
        this.verifyFindingsAction = verifyFindingsAction;
    }

    @Action(costMethod = "cnnAnomalyExplorationCost")
    public CnnFeatureExtractionResult step1AnalyzeInput(
            ResearchInputRequest request,
            OperationContext context
    ) {
        return analyzeInputAction.analyzeUserInput(request, context);
    }

    @Action
    public TrainDevDriftReport step2ProfileTrainAndDevSets(
            ResearchInputRequest request,
            OperationContext context
    ) {
        return profileSetsAction.profileTrainAndDevSets(request, context);
    }

    @Action
    public com.motorbike.insurance.ai.domain.state.HypothesisEvaluationState step3ResearchAnomalies(
            ResearchInputRequest request,
            CnnFeatureExtractionResult inputFeatures,
            TrainDevDriftReport driftReport,
            OperationContext context
    ) {
        return researchAnomaliesAction.researchCnnAnomalies(request, inputFeatures, driftReport, context);
    }

    @Action
    public DatasetRefinementState step4VerifyFindings(
            com.motorbike.insurance.ai.domain.state.HypothesisEvaluationState evaluationState,
            OperationContext context
    ) {
        return verifyFindingsAction.verifyFindings(evaluationState, context);
    }

    @AchievesGoal(
            description = "Comprehensive CNN input analysis and train_set/dev_set research report has been synthesized and saved",
            export = @Export(remote = true, name = "synthesizeAndPublishReport", startingInputTypes = {ResearchInputRequest.class})
    )
    @Action
    public ComprehensiveResearchReport synthesizeAndPublishReport(
            ResearchInputRequest request,
            CnnFeatureExtractionResult inputFeatures,
            TrainDevDriftReport driftReport,
            DatasetRefinementState refinementState,
            OperationContext context
    ) {
        logger.info("Synthesizing final ComprehensiveResearchReport for request {}", request.requestId());

        ComprehensiveResearchReport report = context.ai()
                .withLlm(config.synthesizerLlm())
                .withPromptContributor(config.diagnosticianPersona())
                .withPromptContributor(config.researcherPersona())
                .withPromptContributor(request)
                .withPromptContributor(inputFeatures)
                .withPromptContributor(driftReport)
                .withPromptContributor(refinementState)
                .rendering("objectives/synthesize_research_plan")
                .createObject(
                        ComprehensiveResearchReport.class,
                        Map.of(
                                "persona_name", "Dr. Kernel",
                                "request", request,
                                "inputFeatures", inputFeatures,
                                "driftReport", driftReport,
                                "refinementState", refinementState
                        )
                );

        Path savedPath = config.saveResearchReport(report);
        logger.info("Saved ComprehensiveResearchReport '{}' to {}", report.title(), savedPath);
        return report;
    }
}
