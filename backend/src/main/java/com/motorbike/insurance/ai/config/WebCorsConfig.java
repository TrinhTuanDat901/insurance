//package com.motorbike.insurance.ai.config;
//
//import com.motorbike.insurance.ai.config.AgentPlatformConfig;
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.web.servlet.config.annotation.CorsRegistry;
//import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
//
//import java.util.List;
//
///**
// * Configures CORS and async streaming support so the React + Tailwind CSS frontend
// * (running on localhost:5173 or localhost:3000) can invoke REST and SSE endpoints without CORS blocks.
// */
//
//@Configuration
//public class WebCorsConfig {
//
//    private final AgentPlatformConfig agentConfig;
//
//    public WebCorsConfig(AgentPlatformConfig agentConfig) {
//        this.agentConfig = agentConfig;
//    }
//
//    @Bean
//    public WebMvcConfigurer corsConfigurer() {
//        return new WebMvcConfigurer() {
//            @Override
//            public void addCorsMappings(CorsRegistry registry) {
//                List<String> origins = agentConfig.allowedOrigins() != null && !agentConfig.allowedOrigins().isEmpty()
//                        ? agentConfig.allowedOrigins()
//                        : List.of("http://localhost:5174");
//
//                registry.addMapping("/api/**")
//                        .allowedOrigins(origins.toArray(new String[0]))
//                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
//                        .allowedHeaders("*")
//                        .allowCredentials(true);
//            }
//        };
//    }
//}
