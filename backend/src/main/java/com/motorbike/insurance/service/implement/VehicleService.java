package com.motorbike.insurance.service.implement;

import com.motorbike.insurance.dto.request.VehicleCreateRequest;
import com.motorbike.insurance.dto.response.VehicleResponse;
import com.motorbike.insurance.entity.*;
import com.motorbike.insurance.exception.AppException;
import com.motorbike.insurance.exception.ErrorCode;
import com.motorbike.insurance.repository.*;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class VehicleService {

    VehicleRepository vehicleRepository;
    UserRepository userRepository;
    BrandRepository brandRepository; // Giả định bạn đã tạo JPA Repo cho Brand
    CategoryRepository categoryRepository; // Giả định bạn đã tạo JPA Repo cho Category
    ContractRepository contractRepository;
    InsuranceCardRepository insuranceCardRepository;

    public List<VehicleResponse> getMyVehicles() {
        User currentUser = getCurrentUser();
        List<Vehicle> vehicles = vehicleRepository.findByUser_UserId(currentUser.getUserId());
        return vehicles.stream().map(this::toVehicleResponse).collect(Collectors.toList());
    }

    public VehicleResponse addVehicle(VehicleCreateRequest request) {
        User currentUser = getCurrentUser();
        Brand brand = brandRepository.findById(request.getBrandId())
                .orElseThrow(() -> new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION));
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION));

        Vehicle vehicle = Vehicle.builder()
                .vehicleName(request.getVehicleName())
                .plateNumber(request.getPlateNumber().toUpperCase())
                .brand(brand)
                .category(category)
                .engineNumber(request.getEngineNumber())
                .chassisNumber(request.getChassisNumber())
                .manufactureYear(request.getManufactureYear())
                .user(currentUser)
                .build();

        return toVehicleResponse(vehicleRepository.save(vehicle));
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
    }

    private VehicleResponse toVehicleResponse(Vehicle v) {
        // Kiểm tra xem xe này có hợp đồng ACTIVE nào không
        List<Contract> contracts = contractRepository.findByUser_UserId(v.getUser().getUserId());
        Contract activeContract = contracts.stream()
                .filter(c -> c.getVehicle().getVehicleId().equals(v.getVehicleId()) && "ACTIVE".equals(c.getStatus()))
                .findFirst().orElse(null);

        String cardNumber = null;
        if (activeContract != null) {
            InsuranceCard card = insuranceCardRepository.findByContract_ContractId(activeContract.getContractId()).orElse(null);
            cardNumber = (card != null) ? card.getCardNumber() : null;
        }

        return VehicleResponse.builder()
                .vehicleId(v.getVehicleId())
                .vehicleName(v.getVehicleName())
                .plateNumber(v.getPlateNumber())
                .brandName(v.getBrand().getBrandName())
                .categoryName(v.getCategory().getCategoryName())
                .engineNumber(v.getEngineNumber())
                .chassisNumber(v.getChassisNumber())
                .manufactureYear(v.getManufactureYear())
                .hasActiveInsurance(activeContract != null)
                .activeCardNumber(cardNumber)
                .build();
    }
}