package com.motorbike.insurance.dto.mapper;

import com.motorbike.insurance.dto.request.RegisterRequest;
import com.motorbike.insurance.dto.response.UserResponse;
import com.motorbike.insurance.entity.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public User toUser(RegisterRequest request) {
        return User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(request.getPassword())
                .phone(request.getPhone())
                .avatarPath(request.getAvatarPath())
                .status("ACTIVE")
                .build();
    }

    public UserResponse toUserResponse(User user) {
        return UserResponse.builder()
                .userId(user.getUserId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .roles(user.getRoles())
                .avatarPath(user.getAvatarPath())
                .build();
    }
}
