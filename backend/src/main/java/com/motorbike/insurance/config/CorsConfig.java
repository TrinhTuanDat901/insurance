//package com.motorbike.insurance.config;
//
//import org.springframework.context.annotation.Configuration;
//import org.springframework.web.servlet.config.annotation.CorsRegistry;
//import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
//
//@Configuration
//public class CorsConfig implements WebMvcConfigurer {
//    @Override
//    public void addCorsMappings(CorsRegistry registry) {
//        registry.addMapping("/**") // Áp dụng cho mọi API
//                .allowedOrigins("http://localhost:5173") // Cho phép React truy cập
//                .allowedMethods("GET", "POST", "PUT", "DELETE") // Cho phép các phương thức này
//                .allowedHeaders("*")
//                .allowCredentials(true);
//    }
//}
