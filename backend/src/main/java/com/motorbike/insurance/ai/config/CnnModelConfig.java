package com.motorbike.insurance.ai.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Type-safe configuration properties bound to config/cnn-architecture.yml.
 * Controls Convolutional Neural Network hyperparameters, receptive field geometry,
 * and statistical thresholds for train_set vs. dev_set drift detection.
 */

@ConfigurationProperties(prefix = "cnn.model")
public record CnnModelConfig(
        String architectureName,
        String weightsPath,
        int inputChannels,
        int conv1Filters,
        int conv2Filters,
        int kernelSize,
        int stride,
        int padding,
        int poolingSize,
        int embeddingDimension,
        double confidenceThreshold,
        double driftKlThreshold,
        int batchSize
) {
}
