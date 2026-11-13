package com.motorbike.insurance.controller;

import com.motorbike.insurance.dto.request.RegisterRequest;
import com.motorbike.insurance.dto.request.UpdateRequest;
import com.motorbike.insurance.dto.response.ApiResponse;
import com.motorbike.insurance.dto.response.UserHistoryResponse;
import com.motorbike.insurance.dto.response.UserResponse;
import com.motorbike.insurance.service.IUserService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserController {

    IUserService IUserService;

    @PostMapping("/register")
    public ApiResponse<Optional<UserResponse>> registerUser(@RequestBody RegisterRequest request) {
        ApiResponse<Optional<UserResponse>> response = new ApiResponse<>();
        response.setResult(IUserService.register(request));
        response.setMessage("User registered successfully");
        return response;
    }

    @PostMapping("/update/{userId}")
    public ApiResponse<Optional<UserResponse>> updateUser(@PathVariable Integer userId, @RequestBody UpdateRequest request) {
        ApiResponse<Optional<UserResponse>> response = new ApiResponse<>();
        response.setResult(IUserService.update(userId, request));
        response.setMessage("User updated successfully");
        return response;
    }

    @GetMapping("/{userId}")
    public ApiResponse<Optional<UserResponse>> getUserById(@PathVariable Integer userId) {
        ApiResponse<Optional<UserResponse>> response = new ApiResponse<>();
        response.setResult(IUserService.getById(userId));
        response.setMessage("User retrieved successfully");
        return response;
    }

    @GetMapping("/all")
    public ApiResponse<List<UserResponse>> getAllUsers() {
        ApiResponse<List<UserResponse>> response = new ApiResponse<>();
        response.setResult(IUserService.getAllUsersExceptStaff());
        response.setMessage("Users retrieved successfully");
        return response;
    }

    @DeleteMapping("/{userId}")
    public ApiResponse<Void> deleteUser(@PathVariable Integer userId) {
        ApiResponse<Void> response = new ApiResponse<>();
        IUserService.deleteUser(userId);
        response.setMessage("User deleted successfully");
        return response;
    }

    @GetMapping("/my-info")
    public ApiResponse<UserResponse> getMyInfo() {
        return ApiResponse.<UserResponse>builder()
                .code(1000)
                .result(IUserService.getMyInfo())
                .message("Current user info retrieved successfully")
                .build();
    }

    @GetMapping("/my-history")
    public ApiResponse<UserHistoryResponse> getMyHistory() {
        return ApiResponse.<UserHistoryResponse>builder()
                .code(1000)
                .result(IUserService.getMyHistory())
                .message("Current user history retrieved successfully")
                .build();
    }

    @GetMapping("/history/{userId}")
    public ApiResponse<UserHistoryResponse> getUserHistory(@PathVariable Integer userId) {
        return ApiResponse.<UserHistoryResponse>builder()
                .code(1000)
                .result(IUserService.getUserHistory(userId))
                .message("User history retrieved successfully")
                .build();
    }
}
