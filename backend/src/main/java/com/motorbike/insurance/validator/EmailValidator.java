package com.motorbike.insurance.validator;

import java.util.regex.Pattern;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

// Each annotation should handle a specific validation logic.
// The EmailValidator class validate email addresses according to EmailConstraint annotation.
public class EmailValidator implements ConstraintValidator<EmailConstraint, String> {

    private static final Pattern EMAIL_PATTERN =
            Pattern.compile("^[a-zA-Z0-9_+&*-]+(?:\\.[a-zA-Z0-9_+&*-]+)*@" + "(?:[a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,7}$");

    @Override
    public void initialize(EmailConstraint constraintAnnotation) {
        ConstraintValidator.super.initialize(constraintAnnotation);
    }

    @Override
    public boolean isValid(String email, ConstraintValidatorContext context) {
        // Để null cho @NotBlank xử lý, validator này chỉ lo định dạng
        if (email == null || email.isBlank()) {
            return true;
        }
        return EMAIL_PATTERN.matcher(email).matches();
    }
}
