package agent_flow_tests;

import domain.input.DatasetReference;
import domain.input.ResearchInputRequest;
import domain.output.ComprehensiveResearchReport;
import domain.state.DatasetRefinementState;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests verifying Embabel's type-safe PromptContributor implementations
 * and rich domain object Markdown rendering without magic strings.
 */
class AgentPromptContributorTest {

    @Test
    void shouldFormatPromptContributionsAndMarkdownReportSafely() {
        var datasetRef = new DatasetReference(
                "bench-01", "./datasets/train_set", "./datasets/dev_set", "Acoustic Benchmark"
        );
        var request = new ResearchInputRequest(
                "req-100",
                "Evaluate dev_set covariate shift",
                "Improve SENSOR_DROPOUT recall",
                List.of(0.1, 0.5, 0.9),
                datasetRef
        );

        String promptContribution = request.contribution();
        assertTrue(promptContribution.contains("req-100"));
        assertTrue(promptContribution.contains("./datasets/train_set"));
        assertTrue(promptContribution.contains("./datasets/dev_set"));

        var refinement = new DatasetRefinementState(
                "High-frequency thermal noise in field dev_set",
                List.of("Add spectral burst augmentation to train_set"),
                List.of("Audit boundary labels on dev-edge-042"),
                List.of("Add dilated conv kernel (dilation=2) and AdaBN"),
                List.of("https://arxiv.org/abs/2501.09876")
        );
        assertTrue(refinement.contribution().contains("AdaBN"));

        var report = new ComprehensiveResearchReport(
                "CNN Train/Dev Drift & Input Analysis Report",
                "Executive summary of covariate shift.",
                "Conv1_Filter_2 showed peak energy.",
                "15.2% accuracy gap between train_set and dev_set.",
                refinement.trainSetAugmentationActions(),
                refinement.devSetCleaningActions(),
                refinement.cnnArchitectureAdjustments(),
                refinement.verifiedCitations()
        );

        String markdown = report.toMarkdown();
        assertTrue(markdown.startsWith("# CNN Train/Dev Drift & Input Analysis Report"));
        assertTrue(markdown.contains("https://arxiv.org/abs/2501.09876"));
    }
}
