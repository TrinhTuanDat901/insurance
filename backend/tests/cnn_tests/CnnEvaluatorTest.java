package cnn_tests;

import cnn_engine.analyzers.DevSetEvaluator;
import cnn_engine.analyzers.DistributionShiftDetector;
import cnn_engine.analyzers.InputFeatureExtractor;
import cnn_engine.analyzers.TrainSetProfiler;
import cnn_engine.model.CnnArchitecture;
import cnn_engine.model.CnnInferenceRunner;
import config.CnnModelConfig;
import domain.cnn_diagnostics.CnnFeatureExtractionResult;
import domain.cnn_diagnostics.TrainDevDriftReport;
import domain.input.DatasetReference;
import domain.input.ResearchInputRequest;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests verifying the native Java CNN forward pass, input feature extraction,
 * and train_set vs. dev_set distribution drift detection.
 */
class CnnEvaluatorTest {

    private final CnnModelConfig config = new CnnModelConfig(
            "ConvNet-1D-2D-Hybrid",
            "./datasets/artifacts/cnn.onnx",
            3, 8, 16, 3, 1, 1, 2, 8, 0.78, 0.15, 32
    );

    @Test
    void shouldExtractCnnFeaturesAndDetectTrainDevDrift() {
        var architecture = new CnnArchitecture(config);
        var runner = new CnnInferenceRunner(architecture, config);
        var extractor = new InputFeatureExtractor(runner, config);

        var datasetRef = new DatasetReference(
                "ds-01", "./datasets/train_set", "./datasets/dev_set", "Test Sensor Dataset"
        );
        var request = new ResearchInputRequest(
                "req-01",
                "Analyze edge anomaly",
                "Understand train_set and dev_set behavior",
                List.of(0.89, 0.02, 0.01, 0.94, 0.00, 0.87, 0.03, 0.91),
                datasetRef
        );

        CnnFeatureExtractionResult featureResult = extractor.analyzeInput(request);
        assertNotNull(featureResult.predictedLabel());
        assertFalse(featureResult.topFilterActivations().isEmpty());
        assertTrue(featureResult.contribution().contains("CNN Input Feature Extraction Result"));

        var trainProfiler = new TrainSetProfiler();
        var devEvaluator = new DevSetEvaluator();
        var shiftDetector = new DistributionShiftDetector(config);

        TrainDevDriftReport driftReport = shiftDetector.compareTrainAndDev(
                trainProfiler.profileTrainSet(datasetRef),
                devEvaluator.evaluateDevSet(datasetRef),
                devEvaluator.extractHardNegatives(datasetRef)
        );

        assertTrue(driftReport.significantOverfittingDetected());
        assertTrue(driftReport.covariateShiftDetected());
        assertFalse(driftReport.vulnerableClasses().isEmpty());
    }
}
