package com.motorbike.insurance.dto.request;

import com.motorbike.insurance.validator.EmailConstraint;
import com.motorbike.insurance.validator.PasswordConstraint;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RegisterRequest {

    @Size(min = 5, message = "INVALID_FIRST_NAME")
    String firstName;
    @Size(min = 5, message = "INVALID_LAST_NAME")
    String lastName;

    @EmailConstraint(message = "INVALID_EMAIL")
    String email;

    @PasswordConstraint(message = "INVALID_PASSWORD", min = 9)
    String password;

    String phone;
    String avatarPath = null;
}
