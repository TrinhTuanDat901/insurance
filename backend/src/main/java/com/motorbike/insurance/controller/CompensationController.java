package com.motorbike.insurance.controller;

import com.motorbike.insurance.dto.request.CompensationDecisionRequest;
import com.motorbike.insurance.dto.response.ApiResponse;
import com.motorbike.insurance.dto.response.CompensationResponse;
import com.motorbike.insurance.service.ICompensationService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/compensations")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CompensationController {

    ICompensationService service;

    @GetMapping("/my-compensations")
    public ApiResponse<List<CompensationResponse>> getMyCompensations() {
        return ApiResponse.<List<CompensationResponse>>builder()
                .code(1000).result(service.getMyCompensations()).build();
    }

    //viewAllCompensation(): List<Compensation> & searchCompensationDetail(string status)
    @GetMapping("/all")
    public ApiResponse<List<CompensationResponse>> viewAllCompensation(
            @RequestParam(required = false) String status) {
        return ApiResponse.<List<CompensationResponse>>builder()
                .code(1000)
                .result(service.getAllCompensation(status))
                .message("Compensations retrieved successfully")
                .build();
    }

    //viewCompensationDetail(): Compensation
    @GetMapping("/{compensationId}")
    public ApiResponse<CompensationResponse> viewCompensationDetail(@PathVariable Integer compensationId) {
        return ApiResponse.<CompensationResponse>builder()
                .code(1000)
                .result(service.getCompensationDetail(compensationId))
                .message("Compensation detail retrieved successfully")
                .build();
    }

    //createCompensation(): Compensation
    @PostMapping("/create")
    public ApiResponse<CompensationResponse> createCompensation(
            @RequestBody CompensationDecisionRequest request) {
        return ApiResponse.<CompensationResponse>builder()
                .code(1000)
                .result(service.createCompensation(request))
                .message("Compensation request created successfully")
                .build();
    }

    //resolveCompensation() & updateCompensation()
    @PutMapping("/resolve/{compensationId}")
    public ApiResponse<CompensationResponse> resolveCompensation(
            @PathVariable Integer compensationId,
            @RequestBody CompensationDecisionRequest request) {
        return ApiResponse.<CompensationResponse>builder()
                .code(1000)
                .result(service.resolveCompensation(compensationId, request))
                .message("Compensation approved and payment recorded successfully")
                .build();
    }

    //rejectCompensation()
    @PutMapping("/reject/{compensationId}")
    public ApiResponse<CompensationResponse> rejectCompensation(
            @PathVariable Integer compensationId,
            @RequestBody(required = false) CompensationDecisionRequest request) {
        CompensationDecisionRequest safeRequest = request != null ? request : new CompensationDecisionRequest();
        return ApiResponse.<CompensationResponse>builder()
                .code(1000)
                .result(service.rejectCompensation(compensationId, safeRequest))
                .message("Compensation rejected successfully")
                .build();
    }

    // deleteCompensation(): void
    @DeleteMapping("/{compensationId}")
    public ApiResponse<Void> deleteCompensation(@PathVariable Integer compensationId) {
        service.softDelete(compensationId);
        return ApiResponse.<Void>builder()
                .code(1000)
                .message("Compensation soft-deleted successfully")
                .build();
    }
}