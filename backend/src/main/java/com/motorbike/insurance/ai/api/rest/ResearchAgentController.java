package com.motorbike.insurance.ai.api.rest;

import com.motorbike.insurance.ai.agents.runners.DeterministicResearchRunner;
import com.motorbike.insurance.ai.agents.runners.InteractiveExplorerRunner;
import com.motorbike.insurance.ai.domain.input.DatasetReference;
import com.motorbike.insurance.ai.domain.input.ResearchInputRequest;
import com.motorbike.insurance.ai.domain.output.ComprehensiveResearchReport;
import com.motorbike.insurance.ai.domain.rules.MotorbikeBusinessRuleEngine;
import com.motorbike.insurance.ai.rag_and_tools.ingestion.ResearchPaperIngestor;
import com.motorbike.insurance.ai.rag_and_tools.search_operations.KnowledgeBaseRagTool;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping({"/api/research-agent", "/api/ai"})
public class ResearchAgentController {

    private final DeterministicResearchRunner deterministicRunner;
    private final InteractiveExplorerRunner interactiveRunner;
    private final ResearchPaperIngestor ingestor;
    private final KnowledgeBaseRagTool ragTool;
    private final MotorbikeBusinessRuleEngine businessRuleEngine;

    public ResearchAgentController(
            DeterministicResearchRunner deterministicRunner,
            InteractiveExplorerRunner interactiveRunner,
            ResearchPaperIngestor ingestor,
            KnowledgeBaseRagTool ragTool,
            MotorbikeBusinessRuleEngine businessRuleEngine
    ) {
        this.deterministicRunner = deterministicRunner;
        this.interactiveRunner = interactiveRunner;
        this.ingestor = ingestor;
        this.ragTool = ragTool;
        this.businessRuleEngine = businessRuleEngine;
    }

    // Các Record DTO phẳng, chỉ dùng List<...> đơn giản
    public record ChatMessage(
            String sender,
            String text
    ) {}

    public record ChatContextData(
            String currentView,
            String userRole,
            String userName,
            Boolean isStaffMode
    ) {}

    public record ChatRequestPayload(
            String message,
            String userRole,
            List<ChatMessage> history,
            ChatContextData contextData,
            List<Double> signalValues,
            String plannerMode
    ) {}

    public record ChatResponse(
            String reply,
            ComprehensiveResearchReport report,
            String source
    ) {}

    public record AnalyzeRequestPayload(
            String question,
            String goal,
            List<Double> signalValues,
            String plannerMode
    ) {}

    public record StageEvent(
            int step,
            String status,
            String message
    ) {}

    public record IngestResponse(
            String fileName,
            int ingestedChunks,
            int totalIndexedChunks
    ) {}

    @PostMapping("/chat")
    public ResponseEntity<ChatResponse> chatWithAiAgent(
            @RequestBody ChatRequestPayload payload
    ) {
        String message = payload.message() != null ? payload.message().trim() : "";
        String role = payload.userRole() != null ? payload.userRole() : "CUSTOMER";

        boolean triggerCnnPipeline = (payload.signalValues() != null && !payload.signalValues().isEmpty())
                || message.toLowerCase().contains("cnn")
                || message.toLowerCase().contains("train_set")
                || message.toLowerCase().contains("dev_set")
                || message.toLowerCase().contains("drift");

        if (triggerCnnPipeline) {
            try {
                AnalyzeRequestPayload analyzePayload = getAnalyzeRequestPayload(payload, message, role);
                ResearchInputRequest request = toResearchInputRequest(analyzePayload);
                ComprehensiveResearchReport report = "SUPERVISOR".equalsIgnoreCase(analyzePayload.plannerMode())
                        ? interactiveRunner.runWithSupervisorPlanner(request)
                        : deterministicRunner.runDeterministicAudit(request);

                String formattedReply = businessRuleEngine.formatReportWithBusinessRules(report, message, role);
                return ResponseEntity.ok(new ChatResponse(formattedReply, report, "cnn-embabel-agent"));
            } catch (Exception ex) {
                // Dự phòng xuống BusinessRuleEngine nếu pipeline CNN gặp lỗi
            }
        }

        String advisoryReply = businessRuleEngine.evaluateAdvisoryReply(message, role, ragTool);
        return ResponseEntity.ok(new ChatResponse(advisoryReply, null, "motorbike-business-rule-engine"));
    }

    private static AnalyzeRequestPayload getAnalyzeRequestPayload(
            ChatRequestPayload payload,
            String message,
            String role
    ) {
        List<Double> signals = (payload.signalValues() != null && !payload.signalValues().isEmpty())
                ? payload.signalValues()
                : List.of(0.12, 0.45, 0.78, 0.34, 0.91, 0.23, 0.56, 0.67);

        return new AnalyzeRequestPayload(
                message,
                "Thẩm định rủi ro & đối chiếu dữ liệu bảo hiểm xe máy cho vai trò " + role,
                signals,
                payload.plannerMode() != null ? payload.plannerMode() : "DETERMINISTIC"
        );
    }

    @PostMapping("/analyze")
    public ResponseEntity<ComprehensiveResearchReport> analyzeInputAndDatasets(
            @RequestBody AnalyzeRequestPayload payload
    ) {
        ResearchInputRequest request = toResearchInputRequest(payload);
        ComprehensiveResearchReport report = "SUPERVISOR".equalsIgnoreCase(payload.plannerMode())
                ? interactiveRunner.runWithSupervisorPlanner(request)
                : deterministicRunner.runDeterministicAudit(request);

        return ResponseEntity.ok(report);
    }

    @PostMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamAnalysisForReact(@RequestBody AnalyzeRequestPayload payload) {
        SseEmitter emitter = new SseEmitter(180_000L);
        ResearchInputRequest request = toResearchInputRequest(payload);

        CompletableFuture.runAsync(() -> {
            try {
                emitter.send(SseEmitter.event().name("stage").data(new StageEvent(
                        1,
                        "RUNNING_CNN",
                        "Đang trích xuất đặc trưng CNN và kiểm tra tập train_set / dev_set..."
                )));

                ComprehensiveResearchReport report = "SUPERVISOR".equalsIgnoreCase(payload.plannerMode())
                        ? interactiveRunner.runWithSupervisorPlanner(request)
                        : deterministicRunner.runDeterministicAudit(request);

                emitter.send(SseEmitter.event().name("complete").data(report));
                emitter.complete();
            } catch (Exception ex) {
                emitter.completeWithError(ex);
            }
        });

        return emitter;
    }

    @PostMapping("/ingest")
    public ResponseEntity<IngestResponse> uploadBusinessRuleDocument(
            @RequestParam("file") MultipartFile file
    ) throws Exception {
        Path tempFile = Files.createTempFile("upload-", "-" + file.getOriginalFilename());
        try {
            file.transferTo(tempFile);
            int chunks = ingestor.ingestFile(tempFile);
            return ResponseEntity.ok(new IngestResponse(
                    file.getOriginalFilename(),
                    chunks,
                    ragTool.indexedChunkCount()
            ));
        } finally {
            Files.deleteIfExists(tempFile);
        }
    }

    private ResearchInputRequest toResearchInputRequest(AnalyzeRequestPayload payload) {
        DatasetReference datasetRef = new DatasetReference(
                "industrial-sensor",
                "./datasets/train_set",
                "./datasets/dev_set",
                "1D/2D Industrial Acoustic & Vibration Sensor Signals"
        );
        return new ResearchInputRequest(
                UUID.randomUUID().toString(),
                payload.question(),
                payload.goal(),
                payload.signalValues(),
                datasetRef
        );
    }
}