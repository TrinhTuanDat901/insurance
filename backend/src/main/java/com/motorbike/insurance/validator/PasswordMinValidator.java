package com.motorbike.insurance.validator;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

class PasswordMinValidator implements ConstraintValidator<PasswordConstraint, String> {

    private int min;

    @Override
    public void initialize(PasswordConstraint constraintAnnotation) {
        ConstraintValidator.super.initialize(constraintAnnotation);
        this.min = constraintAnnotation.min();
    }

    @Override
    public boolean isValid(String password, ConstraintValidatorContext context) {
        if (password == null) {
            return true; // để @NotNull/@NotBlank lo việc bắt buộc nhập
        }
        return password.length() >= min;
    }
}
