package com.motorbike.insurance.ai.agents.runners;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.embabel.agent.api.invocation.AgentInvocation;
import com.embabel.agent.core.AgentPlatform;
import com.embabel.agent.core.ProcessOptions;
import com.embabel.agent.core.Verbosity;

import com.motorbike.insurance.ai.domain.input.ResearchInputRequest;
import com.motorbike.insurance.ai.domain.output.ComprehensiveResearchReport;

/**
 * Embabel 1.5.4 Deterministic GOAP Runner using exact classes:
 * - com.embabel.agent.api.invocation.AgentInvocation
 * - com.embabel.agent.core.AgentPlatform
 * - com.embabel.agent.core.ProcessOptions
 * - com.embabel.agent.core.Verbosity
 */
@Service
public class DeterministicResearchRunner {

    private static final Logger logger = LoggerFactory.getLogger(DeterministicResearchRunner.class);

    private final AgentPlatform agentPlatform;

    public DeterministicResearchRunner(AgentPlatform agentPlatform) {
        this.agentPlatform = agentPlatform;
    }

    public ComprehensiveResearchReport runDeterministicAudit(ResearchInputRequest request) {
        logger.info("Starting deterministic GOAP + @State execution for request {}", request.requestId());
        var processOptions = new ProcessOptions()
                .withVerbosity(new Verbosity().withShowPrompts(true));

        var invocation = AgentInvocation.builder(agentPlatform)
                .options(processOptions)
                .build(ComprehensiveResearchReport.class);

        return invocation.invoke(request);
    }
}
