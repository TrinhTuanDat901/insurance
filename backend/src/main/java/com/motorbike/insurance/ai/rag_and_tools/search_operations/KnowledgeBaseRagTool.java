package com.motorbike.insurance.ai.rag_and_tools.search_operations;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Component;

import com.embabel.agent.api.annotation.LlmTool;
import com.embabel.agent.api.reference.LlmReference;
import com.embabel.agent.rag.service.SearchOperations;
import com.embabel.agent.rag.tools.ToolishRag;

/**
 * Embabel 1.5.4 RAG Tool using exact packages:
 * - com.embabel.agent.rag.service.SearchOperations
 * - com.embabel.agent.rag.tools.ToolishRag
 * - com.embabel.agent.api.annotation.LlmTool
 */
@Component
public class KnowledgeBaseRagTool {

    public record IndexedChunk(String chunkId, String sourceUri, String content) {}

    private final Map<String, IndexedChunk> store = new LinkedHashMap<>();
    private final SearchOperations searchOperations;

    public KnowledgeBaseRagTool(@Autowired(required = false) @Nullable SearchOperations searchOperations) {
        this.searchOperations = searchOperations;
    }

    public KnowledgeBaseRagTool() {
        this.searchOperations = null;
    }

    public void indexDocumentChunk(String chunkId, String sourceUri, String content) {
        store.put(chunkId, new IndexedChunk(chunkId, sourceUri, content));
    }

    public int indexedChunkCount() {
        return store.size();
    }

    public List<IndexedChunk> listAllChunks() {
        return new ArrayList<>(store.values());
    }

    public void clearIndex() {
        store.clear();
    }

    /**
     * If a SearchOperations bean (e.g., from embabel-agent-rag-lucene) is wired in the Spring context,
     * exposes it as an official Embabel ToolishRag LlmReference.
     */
    @Nullable
    public LlmReference asToolishRagIfAvailable() {
        if (searchOperations == null) {
            return null;
        }
        return new ToolishRag(
                "ml_cnn_knowledge_base",
                "Curated ML & CNN Diagnostic Research Papers, Architecture Notes, and Dataset Drift Remedies",
                searchOperations
        );
    }

    @LlmTool(description = "Search the local ML and CNN diagnostic knowledge base for train_set/dev_set drift remedies and citations")
    public List<String> searchKnowledgeBase(
            @LlmTool.Param(description = "Search query keywords about CNN drift, dropout, or regularization") String query
    ) {
        return store.values().stream()
                .filter(c -> matchesQuery(c.content(), query))
                .limit(5)
                .map(c -> String.format("[%s] (%s): %s", c.chunkId(), c.sourceUri(), c.content()))
                .toList();
    }

    private boolean matchesQuery(String content, String query) {
        if (query == null || query.isBlank()) return true;
        String lowerContent = content.toLowerCase();
        for (String token : query.toLowerCase().split("\\s+")) {
            if (token.length() > 3 && lowerContent.contains(token)) {
                return true;
            }
        }
        return true;
    }
}
