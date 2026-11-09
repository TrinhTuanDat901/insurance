package com.motorbike.insurance.config;

// import com.store.robot.app.entities.Users;
import java.util.Collections;
import java.util.Set;
import java.util.UUID;

import com.motorbike.insurance.entity.User;
import com.motorbike.insurance.dto.mapper.UserMapper;
import com.motorbike.insurance.entity.Role;
import com.motorbike.insurance.repository.RoleRepository;
import com.motorbike.insurance.repository.UserRepository;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@RequiredArgsConstructor
@Configuration
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ApplicationInitConfig {

    PasswordEncoder passwordEncoder;
    UserMapper userMapper;
    UserRepository userRepository;
    RoleRepository roleRepository;

    // static
    static String STAFF_ROLE = "STAFF";

    @Bean
    ApplicationRunner applicationRunner() {
        return args -> {
            // Ensure the ADMIN role exists before assigning it to any user,
            // otherwise inserting into user_roles violates FK_role.
            boolean userRoleExists = roleRepository.findAll().stream()
                    .anyMatch(role -> STAFF_ROLE.equalsIgnoreCase(role.getRoleName()));

            if (!userRoleExists) {
                roleRepository.save(Role.builder()
                        .roleName(STAFF_ROLE)
                        .roleDescription("Staff role")
                        .build());
                log.info("Seeded default role '{}'.", STAFF_ROLE);
            }

            if (userRepository.findByEmail("staff@example.com").isEmpty()) {
                User user = User.builder()
                        .firstName("Staff")
                        .lastName("User")
                        .email("staff@example.com")
                        // .phone("0000000000")
                        .password(passwordEncoder.encode("123456"))
                        .roles(Set.of(Role.builder().roleName(STAFF_ROLE).build()))
                        .build();

                User savedUser = userRepository.save(user);

                log.warn("Staff user created with default password '123456'. Please change it immediately!");
            }
        };
    }
}
