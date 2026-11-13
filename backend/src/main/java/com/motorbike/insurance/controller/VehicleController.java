package com.motorbike.insurance.controller;

import com.motorbike.insurance.dto.request.VehicleCreateRequest;
import com.motorbike.insurance.dto.response.ApiResponse;
import com.motorbike.insurance.dto.response.VehicleResponse;
import com.motorbike.insurance.service.implement.VehicleService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/vehicles")
@RequiredArgsConstructor
public class VehicleController {
    private final VehicleService service;

    @GetMapping("/my-vehicles")
    public ApiResponse<List<VehicleResponse>> getMyVehicles() {
        return ApiResponse.<List<VehicleResponse>>builder()
                .code(1000)
                .result(service.getMyVehicles())
                .build();
    }

    @PostMapping("/add")
    public ApiResponse<VehicleResponse> addVehicle(@RequestBody VehicleCreateRequest request) {
        return ApiResponse.<VehicleResponse>builder()
                .code(1000)
                .result(service.addVehicle(request))
                .build();
    }
}