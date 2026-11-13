package com.motorbike.insurance.ai.agents.runners;

import java.beans.Introspector;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.embabel.agent.api.annotation.Action;
import com.embabel.agent.api.annotation.EmbabelComponent;
import com.embabel.agent.api.common.ActionContext;
import com.embabel.agent.api.invocation.SupervisorInvocation;
import com.embabel.agent.core.AgentPlatform;
import com.embabel.chat.Conversation;
import com.embabel.chat.UserMessage;

import com.motorbike.insurance.ai.agents.actions.GenerateFinalAnalysisAction;
import com.motorbike.insurance.ai.config.AgentPlatformConfig;
import com.motorbike.insurance.ai.domain.input.ResearchInputRequest;
import com.motorbike.insurance.ai.domain.output.ComprehensiveResearchReport;
import com.motorbike.insurance.ai.rag_and_tools.search_operations.KnowledgeBaseRagTool;

/**
 * Embabel 1.5.4 Supervisor & Utility Chatbot Runner using exact imports:
 * - com.embabel.agent.api.annotation.EmbabelComponent
 * - com.embabel.agent.api.annotation.Action
 * - com.embabel.agent.api.common.ActionContext
 * - com.embabel.agent.api.invocation.SupervisorInvocation
 * - com.embabel.agent.core.AgentPlatform
 * - com.embabel.agent.core.AgentScopeBuilder
 * - com.embabel.chat.Conversation
 * - com.embabel.chat.UserMessage
 */
@Service
@EmbabelComponent
public class InteractiveExplorerRunner {

    private static final Logger logger = LoggerFactory.getLogger(InteractiveExplorerRunner.class);

    private final AgentPlatform agentPlatform;
    private final GenerateFinalAnalysisAction researchAgent;
    private final AgentPlatformConfig config;
    private final KnowledgeBaseRagTool ragTool;

    public InteractiveExplorerRunner(
            AgentPlatform agentPlatform,
            GenerateFinalAnalysisAction researchAgent,
            AgentPlatformConfig config,
            KnowledgeBaseRagTool ragTool
    ) {
        this.agentPlatform = agentPlatform;
        this.researchAgent = researchAgent;
        this.config = config;
        this.ragTool = ragTool;
    }

    public ComprehensiveResearchReport runWithSupervisorPlanner(ResearchInputRequest request) {
        logger.info("Starting type-informed SupervisorInvocation execution for request {}", request.requestId());
        return SupervisorInvocation.on(agentPlatform)
                .returning(ComprehensiveResearchReport.class)
                .withAgentName(Introspector.decapitalize(researchAgent.getClass().getSimpleName()))
                .invoke(request);
    }

    @Action(canRerun = true, trigger = UserMessage.class)
    public void respondToInteractiveQuery(Conversation conversation, ActionContext context) {
        var runner = context.ai()
                .withLlm(config.diagnosticianLlm())
                .withToolObject(ragTool);

        if (ragTool.asToolishRagIfAvailable() != null) {
            runner = runner.withReference(ragTool.asToolishRagIfAvailable());
        }

        var reply = runner
                .rendering("objectives/synthesize_research_plan")
                .respondWithSystemPrompt(conversation, Map.of("persona_name", "Dr. Kernel"));

        context.sendMessage(conversation.addMessage(reply));
    }
}
