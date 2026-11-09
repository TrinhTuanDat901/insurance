package com.motorbike.insurance.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UpdateRequest {
    String firstName;
    String lastName;
    String email;
    String phone;
    String avatarPath = null;
}
