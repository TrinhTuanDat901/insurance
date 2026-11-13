//package com.motorbike.insurance.ai.api.cli;
//
//import com.motorbike.insurance.ai.agents.runners.DeterministicResearchRunner;
//import com.motorbike.insurance.ai.domain.input.DatasetReference;
//import com.motorbike.insurance.ai.domain.input.ResearchInputRequest;
//import org.springframework.shell.standard.ShellComponent;
//import org.springframework.shell.standard.ShellMethod;
//import org.springframework.shell.standard.ShellOption;
//import com.motorbike.insurance.ai.rag_and_tools.ingestion.ResearchPaperIngestor;
//import com.motorbike.insurance.ai.rag_and_tools.search_operations.KnowledgeBaseRagTool;
//
//import java.nio.file.Path;
//import java.util.List;
//import java.util.UUID;
//
///**
// * Interactive Spring Shell CLI commands modeled directly after https://github.com/embabel/ragbot:
// * supports ingest, info, chunks, clear, and analyze-train-dev.
// */
//@ShellComponent
//public class DatasetShellCommands {
//
//    private final ResearchPaperIngestor ingestor;
//    private final KnowledgeBaseRagTool ragTool;
//    private final DeterministicResearchRunner deterministicRunner;
//
//    public DatasetShellCommands(
//            ResearchPaperIngestor ingestor,
//            KnowledgeBaseRagTool ragTool,
//            DeterministicResearchRunner deterministicRunner
//    ) {
//        this.ingestor = ingestor;
//        this.ragTool = ragTool;
//        this.deterministicRunner = deterministicRunner;
//    }
//
//    @ShellMethod(key = "ingest", value = "Ingest research documents or seed default ML/CNN papers into the Lucene RAG store")
//    public String ingest(@ShellOption(defaultValue = "./datasets/raw") String path) {
//        int chunks = ingestor.ingestDirectory(Path.of(path));
//        return "Successfully ingested " + chunks + " chunks into the RAG store.";
//    }
//
//    @ShellMethod(key = "info", value = "Display RAG store chunk count and status")
//    public String info() {
//        return "Lucene / Vector RAG Store Status: " + ragTool.indexedChunkCount() + " chunks indexed.";
//    }
//
//    @ShellMethod(key = "chunks", value = "List all indexed chunks for debugging retrieval")
//    public String listChunks() {
//        return ragTool.listAllChunks().toString();
//    }
//
//    @ShellMethod(key = "analyze-train-dev", value = "Run full CNN input feature extraction and train_set vs. dev_set drift analysis")
//    public String analyzeTrainDev(
//            @ShellOption(defaultValue = "Why does SENSOR_DROPOUT F1 drop on dev_set?") String question
//    ) {
//        ingestor.seedDefaultCorpus();
//        var request = new ResearchInputRequest(
//                UUID.randomUUID().toString(),
//                question,
//                "Identify root cause of train_set vs dev_set generalization gap and recommend fixes",
//                List.of(0.89, 0.02, 0.01, 0.94, 0.00, 0.87, 0.03, 0.91),
//                new DatasetReference(
//                        "sensor-bench-2025",
//                        "./datasets/train_set",
//                        "./datasets/dev_set",
//                        "Industrial vibration & dropout benchmark"
//                )
//        );
//        return deterministicRunner.runDeterministicAudit(request).toMarkdown();
//    }
//}
