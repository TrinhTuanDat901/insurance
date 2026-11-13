package com.motorbike.insurance.service;

import com.motorbike.insurance.dto.request.RegisterRequest;
import com.motorbike.insurance.dto.request.UpdateRequest;
import com.motorbike.insurance.dto.response.UserHistoryResponse;
import com.motorbike.insurance.dto.response.UserResponse;

import java.util.List;
import java.util.Optional;

public interface IUserService {
    Optional<UserResponse> register(RegisterRequest request);

    Optional<UserResponse> update(Integer userId, UpdateRequest request);

    Optional<UserResponse> getById(Integer userId);

    List<UserResponse> getAllUsersExceptStaff();

    void deleteUser(Integer userId);

    UserResponse getMyInfo();

    UserHistoryResponse getMyHistory();

    UserHistoryResponse getUserHistory(Integer userId);
}
