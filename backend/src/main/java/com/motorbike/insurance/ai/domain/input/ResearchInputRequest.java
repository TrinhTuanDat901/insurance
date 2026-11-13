package com.motorbike.insurance.ai.domain.input;

import java.util.List;

import org.springframework.lang.NonNull;

import com.embabel.common.ai.prompt.PromptContributor;

public record ResearchInputRequest(
        String requestId,
        String researchQuestion,
        String researchGoal,
        List<Double> rawInputSignal,
        DatasetReference datasetReference
) implements PromptContributor {

    @NonNull
    @Override
    public String contribution() {
        return """
                Research Input Request [%s]:
                - Research Question: %s
                - Desired Goal: %s
                - Input Signal Vector Length: %d elements
                %s
                """.formatted(
                requestId,
                researchQuestion,
                researchGoal,
                rawInputSignal != null ? rawInputSignal.size() : 0,
                datasetReference != null ? datasetReference.contribution() : ""
        );
    }
}
