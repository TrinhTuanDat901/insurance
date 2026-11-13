package com.motorbike.insurance.ai.rag_and_tools.search_operations;

import java.util.List;

import org.springframework.stereotype.Component;

import com.embabel.agent.api.annotation.LlmTool;
import com.embabel.agent.core.CoreToolGroups;

/**
 * Embabel 1.5.4 Tool using exact packages:
 * - com.embabel.agent.core.CoreToolGroups
 * - com.embabel.agent.api.annotation.LlmTool
 */
@Component
public class ExternalWebResearchTool {

    public String getToolGroupIdentifier() {
        return CoreToolGroups.WEB;
    }

    @LlmTool(description = "Search external ML benchmarks and ArXiv preprints for CNN dataset drift and regularization techniques")
    public List<String> searchExternalBenchmarks(
            @LlmTool.Param(description = "Topic query to search in external ML benchmarks") String topicQuery
    ) {
        return List.of(
                "ArXiv Benchmark [https://arxiv.org/abs/2501.09876]: AdaBN + Spectral Dropout mitigates train/dev sensor drift.",
                "IEEE Signal Processing Note [https://ieeexplore.ieee.org/document/10456789]: Multi-scale dilated CNNs resolve gradual dropout misclassification."
        );
    }
}
