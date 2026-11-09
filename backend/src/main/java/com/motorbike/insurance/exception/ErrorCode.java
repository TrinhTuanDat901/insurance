package com.motorbike.insurance.exception;

import lombok.Getter;
import lombok.Setter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {

    INVALID_KEY(1001, "Invalid key - Unknown error code", HttpStatus.BAD_REQUEST),
    DATA_ACCESS_EXCEPTION(9998, "Data access exception", HttpStatus.INTERNAL_SERVER_ERROR),
    UNCATEGORIZED_EXCEPTION(9999, "Uncategorized error", HttpStatus.INTERNAL_SERVER_ERROR),

    USER_EXISTED(1002, "User already exists", HttpStatus.BAD_REQUEST),
    EMAIL_EXISTED(1003, "Email already exists", HttpStatus.BAD_REQUEST),
    USER_CREATION_FAILED (1004, "Failed to create user", HttpStatus.INTERNAL_SERVER_ERROR),
    EMAIL_NOT_EXISTED(1006, "Email does not exist", HttpStatus.NOT_FOUND),
    UNAUTHENTICATED(1007, "Unauthorized access", HttpStatus.UNAUTHORIZED),
    UNVERIFIED_TOKEN(1008, "Token cannot be verified", HttpStatus.UNAUTHORIZED),

    USER_NOT_FOUND(1009, "User not found", HttpStatus.NOT_FOUND),
    UNAUTHORIZED(1010, "You are not permission to access this resource", HttpStatus.FORBIDDEN),
    LOGOUT_FAILED(1011, "Failed to logout", HttpStatus.INTERNAL_SERVER_ERROR),
    UNGENERATED_TOKEN(1012, "Token is not generated", HttpStatus.INTERNAL_SERVER_ERROR),
    ADMIN_CREATION_FAILED(1014, "Failed to create admin", HttpStatus.INTERNAL_SERVER_ERROR),

    ROLE_NOT_FOUND(1015, "Role not found", HttpStatus.NOT_FOUND),
    ROLE_CREATION_FAILED(1016, "Failed to create role", HttpStatus.INTERNAL_SERVER_ERROR),
    ROLE_DELETION_FAILED(1017, "Failed to delete role", HttpStatus.BAD_REQUEST),
    ROLE_UPDATE_FAILED(1018, "Failed to update role", HttpStatus.INTERNAL_SERVER_ERROR),

    INVALID_EMAIL(1020, "Invalid email format", HttpStatus.BAD_REQUEST),
    INVALID_PASSWORD(
            1021,
                    "Password must be at least {min} characters long "
                    + "and contain at least one uppercase letter, one lowercase letter, one digit, and one special character",
            HttpStatus.BAD_REQUEST),
    INVALID_FIRST_NAME(1022, "First name must be at least {min} characters long", HttpStatus.BAD_REQUEST),
    INVALID_LAST_NAME(1023, "Last name must be at least {min} characters long", HttpStatus.BAD_REQUEST),

    // Các mã lỗi nghiệp vụ cho Contract & Compensation
    CONTRACT_NOT_FOUND(1030, "Contract not found", HttpStatus.NOT_FOUND),
    INVALID_CONTRACT_STATUS(1031, "Invalid contract status for this operation", HttpStatus.BAD_REQUEST),
    VEHICLE_NOT_FOUND(1032, "Vehicle not found", HttpStatus.NOT_FOUND),
    PACKAGE_NOT_FOUND(1033, "Insurance package not found", HttpStatus.NOT_FOUND),
    COMPENSATION_NOT_FOUND(1040, "Compensation request not found", HttpStatus.NOT_FOUND),
    INVALID_COMPENSATION_STATUS(1041, "Only PENDING compensation requests can be resolved or rejected", HttpStatus.BAD_REQUEST);

    private int code;
    private String message;
    private HttpStatus httpStatus;

    ErrorCode(int code, String message, HttpStatus httpStatus) {
        this.code = code;
        this.message = message;
        this.httpStatus = httpStatus;
    }
}

