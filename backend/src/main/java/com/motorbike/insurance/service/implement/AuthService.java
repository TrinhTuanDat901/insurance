package com.motorbike.insurance.service.implement;

import com.motorbike.insurance.dto.request.AuthRequest;
import com.motorbike.insurance.dto.request.IntrospectTokenRequest;
import com.motorbike.insurance.dto.request.LogoutRequest;
import com.motorbike.insurance.dto.request.RefreshRequest;
import com.motorbike.insurance.dto.response.AuthResponse;
import com.motorbike.insurance.dto.response.IntrospectTokenResponse;
import com.motorbike.insurance.entity.InvalidatedToken;
import com.motorbike.insurance.entity.User;
import com.motorbike.insurance.exception.AppException;
import com.motorbike.insurance.exception.ErrorCode;
import com.motorbike.insurance.repository.InvalidatedTokenRepository;
import com.motorbike.insurance.repository.UserRepository;
import com.motorbike.insurance.service.IAuthenticateService;
import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.JWSVerifier;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
//import org.springframework.expression.ParseException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.StringJoiner;
import java.util.UUID;
import java.text.ParseException;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
public class AuthService implements IAuthenticateService {

    UserRepository userRepository;
    PasswordEncoder passwordEncoder;
    InvalidatedTokenRepository invalidatedTokenRepository;

    @NonFinal
    @Value("${jwt.signer-key}")
    protected String SIGNER_KEY; // "8d97f2da61b6dde0d062f55113d215cabd33a855534946934dc79b7554f71edc";

    @NonFinal
    @Value("${jwt.refreshable-duration}")
    protected long REFRESHABLE_DURATION; // 604800L; // 7 days

    @NonFinal
    @Value("${jwt.valid-duration}")
    protected long VALID_DURATION; // 3600L; // 1 hour

    @Override
    public AuthResponse authenticate(AuthRequest dto) {
        User user = userRepository
                .findByEmail(dto.getEmail())
                .orElseThrow(() -> new AppException(ErrorCode.EMAIL_NOT_EXISTED));

        // PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
        boolean authenticated = passwordEncoder.matches(dto.getPassword(), user.getPassword());

        if (!authenticated) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        String token = generateToken(user);
        return AuthResponse.builder().token(token).authenticated(true).build();
    }

    @Override
    public IntrospectTokenResponse introspectToken(IntrospectTokenRequest dto) throws ParseException, JOSEException {

        boolean isValided = true;
        String token = dto.getToken();

        try {
            verifyToken(false, token);
        } catch (AppException e) {
            isValided = false;
        }
        return IntrospectTokenResponse.builder().valid(isValided).build();
    }

    // spotless: off
    private String generateToken(User user) {
        JWSHeader header = new JWSHeader(JWSAlgorithm.HS512);

        JWTClaimsSet jwtClaimsSet = new JWTClaimsSet.Builder()
                .subject(user.getEmail())
                .issuer("frog.com")
                .issueTime(new Date())
                .expirationTime(new Date(
                        Instant.now().plus(VALID_DURATION, ChronoUnit.SECONDS).toEpochMilli()))
                .jwtID(UUID.randomUUID().toString())
                .claim("scope", buildScope(user))
                .build();

        //        Payload payload = new Payload(jwtClaimSet.toJSONObject());
        //        JWSObject jwsObject = new JWSObject(header, payload);
        SignedJWT signedJWT = new SignedJWT(new JWSHeader(JWSAlgorithm.HS512), jwtClaimsSet);

        try {
            signedJWT.sign(new MACSigner(SIGNER_KEY.getBytes()));
            return signedJWT.serialize();
        } catch (Exception e) {
            log.error("Error signing the JWT token", e);
            throw new AppException(ErrorCode.UNGENERATED_TOKEN);
        }
    }
    // spotless: on

    @Override
    public AuthResponse refreshToken(RefreshRequest request) throws ParseException, JOSEException {

        // logout the old token
        SignedJWT signedJWT = verifyToken(true, request.getToken());
        String jit = signedJWT.getJWTClaimsSet().getJWTID();
        Date expiryTime = signedJWT.getJWTClaimsSet().getExpirationTime();

        InvalidatedToken invalidatedToken =
                InvalidatedToken.builder().tokenId(jit).expiryTime(expiryTime).build();

        invalidatedTokenRepository.save(invalidatedToken);

        // get user from the old token
        String email = signedJWT.getJWTClaimsSet().getSubject();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // generate new token
        String newToken = generateToken(user);

        return AuthResponse.builder().token(newToken).authenticated(true).build();
    }

    private SignedJWT verifyToken(boolean isRefresh, String token) throws JOSEException, ParseException {
        JWSVerifier verifier = new MACVerifier(SIGNER_KEY.getBytes());

        SignedJWT signedJWT = SignedJWT.parse(token);

        Date expiryTime = (isRefresh)
                ? new Date(signedJWT
                .getJWTClaimsSet()
                .getIssueTime()
                .toInstant()
                .plus(REFRESHABLE_DURATION, ChronoUnit.SECONDS)
                .toEpochMilli())
                : signedJWT.getJWTClaimsSet().getExpirationTime();

        boolean verified = signedJWT.verify(verifier);

        if (!(verified && expiryTime.after(new Date()))) throw new AppException(ErrorCode.UNAUTHENTICATED);

        if (invalidatedTokenRepository.existsById(signedJWT.getJWTClaimsSet().getJWTID())) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        return signedJWT;
    }

    @Override
    public void logout(LogoutRequest request) {
        try {
            SignedJWT signedJWT = verifyToken(true, request.getToken());
            String jit = signedJWT.getJWTClaimsSet().getJWTID();
            Date expiryTime = signedJWT.getJWTClaimsSet().getExpirationTime();

            InvalidatedToken invalidatedToken = InvalidatedToken.builder()
                    .tokenId(jit)
                    .expiryTime(expiryTime)
                    .build();

            invalidatedTokenRepository.save(invalidatedToken);

        } catch (JOSEException | ParseException e) {
            log.info("Token already invalidated or expired: " + e.getMessage());
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
    }

    private String buildScope(User user) {
        StringJoiner joiner = new StringJoiner(" ");
        if (!CollectionUtils.isEmpty(user.getRoles())) {
            user.getRoles().forEach(role -> {
                joiner.add("ROLE_" + role.getRoleName());
            });
        }
        return joiner.toString();
    }

}
