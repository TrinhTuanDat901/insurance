package com.motorbike.insurance.service;

import com.motorbike.insurance.dto.request.AuthRequest;
import com.motorbike.insurance.dto.request.IntrospectTokenRequest;
import com.motorbike.insurance.dto.request.LogoutRequest;
import com.motorbike.insurance.dto.request.RefreshRequest;
import com.motorbike.insurance.dto.response.AuthResponse;
import com.motorbike.insurance.dto.response.IntrospectTokenResponse;
import java.text.ParseException;
import com.nimbusds.jose.JOSEException;

public interface IAuthenticateService {
    AuthResponse authenticate(AuthRequest dto);

    IntrospectTokenResponse introspectToken(IntrospectTokenRequest dto) throws ParseException, JOSEException;

    void logout(LogoutRequest request);

    AuthResponse refreshToken(RefreshRequest request) throws ParseException, JOSEException;
}
