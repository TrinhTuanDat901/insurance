package com.motorbike.insurance.exception;

import com.motorbike.insurance.dto.response.ApiResponse;
import jakarta.validation.ConstraintViolation;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.security.access.AccessDeniedException;

import com.motorbike.insurance.dto.response.ApiResponse;

import java.util.Map;

@Slf4j
@ControllerAdvice
public class GlobalHandlerException {

    private static final String MIN_ATTRIBUTE = "min";

    // Handle uncategorized exceptions
    @ExceptionHandler(value = RuntimeException.class)
    public ResponseEntity<ApiResponse> handleException(RuntimeException e) {
        // error 400: error user caused, error 500: error server caused
        ApiResponse<String> response = new ApiResponse<>();

        response.setCode(ErrorCode.UNCATEGORIZED_EXCEPTION.getCode());
        response.setMessage(ErrorCode.UNCATEGORIZED_EXCEPTION.getMessage());
        response.setMessage(e.getMessage());

        return ResponseEntity.status(ErrorCode.UNCATEGORIZED_EXCEPTION.getHttpStatus())
                .body(response);
    }

    // Handle custom application exceptions
    @ExceptionHandler(value = AppException.class)
    public ResponseEntity<ApiResponse> handleAppException(AppException e) {

        ErrorCode errorCode = e.getErrorCode();
        ApiResponse<String> response = new ApiResponse<>();
        response.setCode(errorCode.getCode());
        response.setMessage(errorCode.getMessage());

        return ResponseEntity.status(errorCode.getHttpStatus()).body(response);
    }

    // Handle access denied exceptions
    @ExceptionHandler(value = AccessDeniedException.class)
    public ResponseEntity<ApiResponse> handleAccessDeniedException(AccessDeniedException e) {

        ApiResponse<String> response = new ApiResponse<>();
        response.setCode(ErrorCode.UNAUTHORIZED.getCode());
        response.setMessage(ErrorCode.UNAUTHORIZED.getMessage());

        return ResponseEntity.status(ErrorCode.UNAUTHORIZED.getHttpStatus()).body(response);
    }

    // Handle validation exceptions
    @ExceptionHandler(value = MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse> handleValidationException(MethodArgumentNotValidException e) {

        String enumKey = e.getFieldError().getDefaultMessage();
        ErrorCode errorCode = ErrorCode.INVALID_KEY; // Default error code
        Map<String, Object> attribute = null;

        try {
            errorCode = ErrorCode.valueOf(enumKey);

            ConstraintViolation<?> constraintViolation =
                    e.getBindingResult().getAllErrors().get(0).unwrap(ConstraintViolation.class); // getFirst() = get(0)

            attribute = constraintViolation.getConstraintDescriptor().getAttributes();

            log.info(attribute.toString());

        } catch (IllegalArgumentException ex) {
            // If the enum key is not found, keep the default error code
        }

        ApiResponse<String> response = new ApiResponse<>();
        response.setCode(errorCode.getCode());
        response.setMessage(
                attribute != null ? mapAttributes(errorCode.getMessage(), attribute) : errorCode.getMessage());

        return ResponseEntity.status(errorCode.getHttpStatus()).body(response);
    }

    private String mapAttributes(String message, Map<String, Object> attributes) {
        String minValue = String.valueOf(attributes.get(MIN_ATTRIBUTE)); // attributes.get(MIN_ATTRIBUTE) = Object
        return message.replace("{" + MIN_ATTRIBUTE + "}", minValue);
    }
}
