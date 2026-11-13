package com.motorbike.insurance.ai.rag_and_tools.agentic_tools;

import java.util.List;

import org.springframework.stereotype.Component;

import com.embabel.agent.api.tool.Tool;

import com.motorbike.insurance.ai.rag_and_tools.search_operations.ExternalWebResearchTool;
import com.motorbike.insurance.ai.rag_and_tools.search_operations.KnowledgeBaseRagTool;

/**
 * Embabel 1.5.4 programmatic Tool using com.embabel.agent.api.tool.Tool.
 */
@Component
public class DeepLiteratureSearchTool {

    private final KnowledgeBaseRagTool knowledgeBaseRagTool;
    private final ExternalWebResearchTool externalWebResearchTool;

    public DeepLiteratureSearchTool(
            KnowledgeBaseRagTool knowledgeBaseRagTool,
            ExternalWebResearchTool externalWebResearchTool
    ) {
        this.knowledgeBaseRagTool = knowledgeBaseRagTool;
        this.externalWebResearchTool = externalWebResearchTool;
    }

    public Tool buildAgenticTool() {
        return Tool.create(
                "deep_literature_research_assistant",
                "Search both internal RAG knowledge base and external benchmarks for CNN anomalies and train/dev drift",
                Tool.InputSchema.of(
                        Tool.Parameter.string("query", "Technical query about CNN activations or train/dev drift")
                ),
                inputJson -> {
                    List<String> internalHits = knowledgeBaseRagTool.searchKnowledgeBase(inputJson);
                    List<String> externalHits = externalWebResearchTool.searchExternalBenchmarks(inputJson);
                    return Tool.Result.text("Internal RAG: " + internalHits + "\nExternal Benchmarks: " + externalHits);
                }
        );
    }
}
