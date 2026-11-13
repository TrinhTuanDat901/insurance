package com.motorbike.insurance.ai.agents.actions;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import com.embabel.agent.api.annotation.Action;
import com.embabel.agent.api.common.OperationContext;

import com.motorbike.insurance.ai.cnn_engine.analyzers.DevSetEvaluator;
import com.motorbike.insurance.ai.cnn_engine.analyzers.DistributionShiftDetector;
import com.motorbike.insurance.ai.cnn_engine.analyzers.TrainSetProfiler;
import com.motorbike.insurance.ai.config.AgentPlatformConfig;
import com.motorbike.insurance.ai.domain.cnn_diagnostics.DatasetSplitMetrics;
import com.motorbike.insurance.ai.domain.cnn_diagnostics.HardNegativeSamples;
import com.motorbike.insurance.ai.domain.cnn_diagnostics.TrainDevDriftReport;
import com.motorbike.insurance.ai.domain.input.ResearchInputRequest;

@Component
public class ProfileTrainAndDevSetsAction {

    private static final Logger logger = LoggerFactory.getLogger(ProfileTrainAndDevSetsAction.class);

    private final TrainSetProfiler trainSetProfiler;
    private final DevSetEvaluator devSetEvaluator;
    private final DistributionShiftDetector shiftDetector;
    private final AgentPlatformConfig config;

    public ProfileTrainAndDevSetsAction(
            TrainSetProfiler trainSetProfiler,
            DevSetEvaluator devSetEvaluator,
            DistributionShiftDetector shiftDetector,
            AgentPlatformConfig config
    ) {
        this.trainSetProfiler = trainSetProfiler;
        this.devSetEvaluator = devSetEvaluator;
        this.shiftDetector = shiftDetector;
        this.config = config;
    }

    @Action
    public TrainDevDriftReport profileTrainAndDevSets(
            ResearchInputRequest request,
            OperationContext context
    ) {
        var datasetRef = request.datasetReference();
        logger.info("Profiling train_set and dev_set in parallel (maxConcurrency={})...", config.maxConcurrency());

        List<String> splitsToProfile = List.of("train_set", "dev_set");

        List<DatasetSplitMetrics> splitMetrics = context.parallelMap(
                splitsToProfile,
                config.maxConcurrency(),
                splitName -> "train_set".equals(splitName)
                        ? trainSetProfiler.profileTrainSet(datasetRef)
                        : devSetEvaluator.evaluateDevSet(datasetRef)
        );

        DatasetSplitMetrics trainMetrics = splitMetrics.get(0);
        DatasetSplitMetrics devMetrics = splitMetrics.get(1);
        HardNegativeSamples hardNegatives = devSetEvaluator.extractHardNegatives(datasetRef);

        return shiftDetector.compareTrainAndDev(trainMetrics, devMetrics, hardNegatives);
    }
}
