package com.motorbike.insurance.ai.domain.cnn_diagnostics;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.lang.NonNull;

import com.embabel.common.ai.prompt.PromptContributor;

public record HardNegativeSamples(
        List<MisclassifiedSample> samples
) implements PromptContributor {

    public record MisclassifiedSample(
            String sampleId,
            String groundTruthLabel,
            String predictedLabel,
            double lossValue,
            String dominantFilterSignature,
            String diagnosticNote
    ) {}

    @NonNull
    @Override
    public String contribution() {
        String rows = samples.stream()
                .map(s -> String.format(
                        "  - [%s] Truth: %s | Predicted: %s | Loss: %.4f | Dominant Filter: %s (%s)",
                        s.sampleId(), s.groundTruthLabel(), s.predictedLabel(),
                        s.lossValue(), s.dominantFilterSignature(), s.diagnosticNote()))
                .collect(Collectors.joining("\n"));

        return """
                Hard-Negative Samples Identified in Dev Set (%d critical errors):
                %s
                """.formatted(samples.size(), rows);
    }
}
