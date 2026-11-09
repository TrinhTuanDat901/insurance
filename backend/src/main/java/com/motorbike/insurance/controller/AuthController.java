package com.motorbike.insurance.controller;

import com.motorbike.insurance.dto.request.AuthRequest;
import com.motorbike.insurance.dto.request.IntrospectTokenRequest;
import com.motorbike.insurance.dto.request.LogoutRequest;
import com.motorbike.insurance.dto.request.RefreshRequest;
import com.motorbike.insurance.dto.response.ApiResponse;
import com.motorbike.insurance.dto.response.AuthResponse;
import com.motorbike.insurance.dto.response.IntrospectTokenResponse;
import com.motorbike.insurance.service.implement.AuthService;
import com.motorbike.insurance.service.implement.UserService;
import com.nimbusds.jose.JOSEException;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.text.ParseException;
import com.nimbusds.jose.JOSEException;

@RestController
@RequestMapping("/auth")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class AuthController {

    AuthService authService;

    @PostMapping("/login")
    public ApiResponse<AuthResponse> loginUser(@RequestBody AuthRequest dto) {
        AuthResponse isAuthenticated = authService.authenticate(dto);

        return ApiResponse.<AuthResponse>builder()
                .code(1000)
                .result(isAuthenticated)
                .message("User logged in successfully")
                .build();
    }

    @PostMapping("/introspect")
    public ApiResponse<IntrospectTokenResponse> introspectToken(@RequestBody IntrospectTokenRequest dto)
            throws ParseException, JOSEException {

        IntrospectTokenResponse verified = authService.introspectToken(dto);

        return ApiResponse.<IntrospectTokenResponse>builder()
                .result(verified)
                .message("Successfully introspected token")
                .build();
    }

    @PostMapping("/refresh")
    public ApiResponse<AuthResponse> authenticate(@RequestBody RefreshRequest request)
            throws ParseException, JOSEException {
        AuthResponse refreshed = authService.refreshToken(request);

        return ApiResponse.<AuthResponse>builder()
                .code(1000)
                .result(refreshed)
                .message("Token refreshed successfully")
                .build();
    }

    @PostMapping("/logout")
    public ApiResponse<Void> logout(@RequestBody LogoutRequest request) {
        authService.logout(request);
        return ApiResponse.<Void>builder()
                .message("User logged out successfully")
                .build();
    }
}
