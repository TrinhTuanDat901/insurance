package com.motorbike.insurance.ai.domain.state;

import java.util.List;

import org.springframework.lang.NonNull;

import com.embabel.agent.api.annotation.State;
import com.embabel.common.ai.prompt.PromptContributor;

@State
public record DatasetRefinementState(
        String rootCauseSummary,
        List<String> trainSetAugmentationActions,
        List<String> devSetCleaningActions,
        List<String> cnnArchitectureAdjustments,
        List<String> verifiedCitations
) implements PromptContributor {

    @NonNull
    @Override
    public String contribution() {
        return """
                Validated Dataset & CNN Refinement Plan:
                - Root Cause Summary: %s
                - Train Set Augmentation Actions: %s
                - Dev Set Cleaning & Re-labeling Actions: %s
                - CNN Architecture Adjustments: %s
                - Verified Citations: %s
                """.formatted(
                rootCauseSummary,
                trainSetAugmentationActions,
                devSetCleaningActions,
                cnnArchitectureAdjustments,
                verifiedCitations
        );
    }
}
