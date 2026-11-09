package com.motorbike.insurance.controller;

import com.motorbike.insurance.dto.request.ContractCreateRequest;
import com.motorbike.insurance.dto.request.ContractUpdateRequest;
import com.motorbike.insurance.dto.response.ApiResponse;
import com.motorbike.insurance.dto.response.ContractResponse;
import com.motorbike.insurance.service.IContractService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/contracts")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ContractController {

    IContractService service;

    //viewAllContract
    @GetMapping("/all")
    public ApiResponse<List<ContractResponse>> viewAllContract() {
        return ApiResponse.<List<ContractResponse>>builder()
                .code(1000)
                .result(service.getAllContract())
                .message("Contracts retrieved successfully")
                .build();
    }

    //viewContractDetail
    @GetMapping("/{contractId}")
    public ApiResponse<ContractResponse> viewContractDetail(@PathVariable Integer contractId) {
        return ApiResponse.<ContractResponse>builder()
                .code(1000)
                .result(service.getContractDetail(contractId))
                .message("Contract detail retrieved successfully")
                .build();
    }

    //createContract
    @PostMapping("/create")
    public ApiResponse<ContractResponse> createContract(@RequestBody ContractCreateRequest request) {
        return ApiResponse.<ContractResponse>builder()
                .code(1000)
                .result(service.createContract(request))
                .message("Contract created successfully")
                .build();
    }

    // updateContract
    @PutMapping("/update/{contractId}")
    public ApiResponse<ContractResponse> updateContract(
            @PathVariable Integer contractId,
            @RequestBody ContractUpdateRequest request) {
        return ApiResponse.<ContractResponse>builder()
                .code(1000)
                .result(service.updateContract(contractId, request))
                .message("Contract updated successfully")
                .build();
    }

    // activeContract
    @PutMapping("/active/{contractId}")
    public ApiResponse<ContractResponse> activeContract(
            @PathVariable Integer contractId,
            @RequestBody(required = false) ContractUpdateRequest request) {
        String status = (request != null && request.getStatus() != null) ? request.getStatus() : "ACTIVE";
        return ApiResponse.<ContractResponse>builder()
                .code(1000)
                .result(service.updateStatus(contractId, status))
                .message("Contract activated successfully")
                .build();
    }

    // renewContract
    @PutMapping("/renew/{contractId}")
    public ApiResponse<ContractResponse> renewContract(
            @PathVariable Integer contractId,
            @RequestBody ContractUpdateRequest request) {
        return ApiResponse.<ContractResponse>builder()
                .code(1000)
                .result(service.renewContract(
                        contractId,
                        request.getStartDate(),
                        request.getEndDate(),
                        request.getPackageId()))
                .message("Contract renewed successfully")
                .build();
    }

    // cancellationContract
    @PutMapping("/cancel/{contractId}")
    public ApiResponse<ContractResponse> deleteContract(
            @PathVariable Integer contractId,
            @RequestBody(required = false) ContractUpdateRequest request) {
        String reason = request != null ? request.getCancelReason() : null;
        return ApiResponse.<ContractResponse>builder()
                .code(1000)
                .result(service.softDelete(contractId, reason))
                .message("Contract cancelled successfully")
                .build();
    }
}