package com.motorbike.insurance.ai.domain.input;

import org.springframework.lang.NonNull;

import com.embabel.common.ai.prompt.PromptContributor;

public record DatasetReference(
        String datasetId,
        String trainSetPath,
        String devSetPath,
        String domainDescription
) implements PromptContributor {

    @NonNull
    @Override
    public String contribution() {
        return """
                Dataset Reference [%s]:
                - Domain Description: %s
                - Train Set Location: %s
                - Dev Set Location: %s
                """.formatted(datasetId, domainDescription, trainSetPath, devSetPath);
    }
}
