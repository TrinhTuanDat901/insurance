package com.motorbike.insurance.ai.domain.output;

import com.motorbike.insurance.ai.domain.cnn_diagnostics.CnnFeatureExtractionResult;
import com.motorbike.insurance.ai.domain.cnn_diagnostics.TrainDevDriftReport;
import com.motorbike.insurance.ai.domain.input.ResearchInputRequest;
import com.motorbike.insurance.ai.domain.state.DatasetRefinementState;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Rich Domain Object representing the final output of the AI Research Agent.
 * Following Rod Johnson's rich domain modeling pattern, this record knows how to format
 * itself into a complete, publication-ready Markdown report with embedded citations.
 */
public record ComprehensiveResearchReport(
        String title,
        String executiveSummary,
        String inputSignalInterpretation,
        String trainDevDriftAnalysis,
        List<String> recommendedTrainSetActions,
        List<String> recommendedDevSetActions,
        List<String> cnnHyperparameterRecommendations,
        List<String> literatureCitations
) {
    public String toMarkdown() {
        String trainBullets = recommendedTrainSetActions.stream()
                .map(a -> "- " + a)
                .collect(Collectors.joining("\n"));
        String devBullets = recommendedDevSetActions.stream()
                .map(a -> "- " + a)
                .collect(Collectors.joining("\n"));
        String cnnBullets = cnnHyperparameterRecommendations.stream()
                .map(a -> "- " + a)
                .collect(Collectors.joining("\n"));
        String citationBullets = literatureCitations.stream()
                .map(c -> "- " + c)
                .collect(Collectors.joining("\n"));

        return """
                # %s

                ## 1. Executive Summary
                %s

                ## 2. CNN Input Signal & Activation Analysis
                %s

                ## 3. Train Set vs. Dev Set Distribution & Error Analysis
                %s

                ## 4. Recommended Train Set Improvements
                %s

                ## 5. Recommended Dev Set Validation & Cleaning
                %s

                ## 6. CNN Architectural & Regularization Tuning
                %s

                ## 7. Grounded Literature & Knowledge Base Citations
                %s
                """.formatted(
                title,
                executiveSummary,
                inputSignalInterpretation,
                trainDevDriftAnalysis,
                trainBullets,
                devBullets,
                cnnBullets,
                citationBullets
        );
    }
}
