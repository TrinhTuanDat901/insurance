package com.motorbike.insurance.service.implement;

import com.motorbike.insurance.dto.request.ContractCreateRequest;
import com.motorbike.insurance.dto.request.ContractUpdateRequest;
import com.motorbike.insurance.dto.response.ContractResponse;
import com.motorbike.insurance.entity.*;
import com.motorbike.insurance.exception.AppException;
import com.motorbike.insurance.exception.ErrorCode;
import com.motorbike.insurance.repository.*;
import com.motorbike.insurance.service.IContractService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ContractService implements IContractService {

    ContractRepository contractRepository;
    VehicleRepository vehicleRepository;
    UserRepository userRepository;
    InsurancePackageRepository packageRepository;
    InsuranceCardRepository insuranceCardRepository;
    StaffRepository staffRepository;

    //viewContractList()
    @Override
    @PreAuthorize("hasRole('STAFF')")
    public List<ContractResponse> getAllContract() {
        return contractRepository.findAll().stream()
                .map(this::toContractResponse)
                .collect(Collectors.toList());
    }

    //viewContractDetail()
    @Override
    public ContractResponse getContractDetail(Integer contractId) {
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION));
        return toContractResponse(contract);
    }

    //createContract()
    @Override
    @Transactional
    @PreAuthorize("hasRole('STAFF')")
    public ContractResponse createContract(ContractCreateRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                .orElseThrow(() -> new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION));

        InsurancePackage pkg = packageRepository.findById(request.getPackageId())
                .orElseThrow(() -> new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION));

        BigDecimal fee = contractRepository.calculateFee(pkg.getPackageId());
        if (fee == null) {
            fee = pkg.getPrice();
        }

        LocalDate start = request.getStartDate() != null ? request.getStartDate() : LocalDate.now();
        LocalDate end = request.getEndDate() != null
                ? request.getEndDate()
                : start.plusMonths(pkg.getDurationMonths());

        String initialStatus = (request.getStatus() != null && !request.getStatus().isBlank())
                ? request.getStatus().toUpperCase()
                : "ACTIVE";

        Staff currentStaff = getCurrentStaff();
        String contractCode = "HĐ-" + LocalDate.now().getYear() + "-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();

        Contract contract = Contract.builder()
                .contractCode(contractCode)
                .user(user)
                .vehicle(vehicle)
                .insurancePackage(pkg)
                .createdByStaff(currentStaff)
                .approvedByStaff("ACTIVE".equals(initialStatus) ? currentStaff : null)
                .startDate(start)
                .endDate(end)
                .premiumAmount(fee)
                .status(initialStatus)
                .createdAt(LocalDateTime.now())
                .approvedAt("ACTIVE".equals(initialStatus) ? LocalDateTime.now() : null)
                .build();

        Contract savedContract = contractRepository.save(contract);

        if ("ACTIVE".equals(initialStatus)) {
            issueOrUpdateInsuranceCard(savedContract, "VALID");
        }

        return toContractResponse(savedContract);
    }

    //saveContract(contractId: int)
    @Override
    @Transactional
    @PreAuthorize("hasRole('STAFF')")
    public ContractResponse updateContract(Integer contractId, ContractUpdateRequest request) {
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION));

        if (request.getPackageId() != null) {
            InsurancePackage pkg = packageRepository.findById(request.getPackageId())
                    .orElseThrow(() -> new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION));
            contract.setInsurancePackage(pkg);
            contract.setPremiumAmount(pkg.getPrice());
        }

        if (request.getStartDate() != null) {
            contract.setStartDate(request.getStartDate());
        }
        if (request.getEndDate() != null) {
            contract.setEndDate(request.getEndDate());
        }
        if (request.getPremiumAmount() != null) {
            contract.setPremiumAmount(request.getPremiumAmount());
        }

        Contract updated = contractRepository.save(contract);
        return toContractResponse(updated);
    }

    //activeContract(contractId: int, status: string)
    @Override
    @Transactional
    @PreAuthorize("hasRole('STAFF')")
    public ContractResponse updateStatus(Integer contractId, String status) {
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION));

        String targetStatus = (status != null && !status.isBlank()) ? status.toUpperCase() : "ACTIVE";

        if ("ACTIVE".equals(targetStatus)) {
            if (!"PENDING".equalsIgnoreCase(contract.getStatus())) {
                throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
            }
            contract.setStatus("ACTIVE");
            contract.setApprovedAt(LocalDateTime.now());
            contract.setApprovedByStaff(getCurrentStaff());
            Contract saved = contractRepository.save(contract);
            issueOrUpdateInsuranceCard(saved, "VALID");
            return toContractResponse(saved);
        }

        contract.setStatus(targetStatus);
        return toContractResponse(contractRepository.save(contract));
    }

    //renewContract
    @Override
    @Transactional
    @PreAuthorize("hasRole('STAFF')")
    public ContractResponse renewContract(Integer contractId, LocalDate startDate, LocalDate endDate, Integer packageId) {
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION));

        if ("CANCELLED".equalsIgnoreCase(contract.getStatus())) {
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
        }

        if (packageId != null) {
            InsurancePackage pkg = packageRepository.findById(packageId)
                    .orElseThrow(() -> new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION));
            contract.setInsurancePackage(pkg);
            contract.setPremiumAmount(pkg.getPrice());
        }

        LocalDate newStart = startDate != null ? startDate : LocalDate.now();
        LocalDate newEnd = endDate != null
                ? endDate
                : newStart.plusMonths(contract.getInsurancePackage().getDurationMonths());

        // Theo SQL constraint: CHECK (status IN ('PENDING','ACTIVE','EXPIRED','CANCELLED','RENEWED'))
        contract.setStatus("RENEWED");
        contract.setStartDate(newStart);
        contract.setEndDate(newEnd);
        contract.setApprovedAt(LocalDateTime.now());
        contract.setApprovedByStaff(getCurrentStaff());

        Contract saved = contractRepository.save(contract);
        issueOrUpdateInsuranceCard(saved, "VALID");
        return toContractResponse(saved);
    }

    //cancellationContract(contractId: int)
    @Override
    @Transactional
    @PreAuthorize("hasRole('STAFF')")
    public ContractResponse softDelete(Integer contractId, String cancelReason) {
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION));

        contract.setStatus("CANCELLED");
        contract.setCancelledAt(LocalDateTime.now());
        contract.setCancelReason(cancelReason != null ? cancelReason : "Hủy hợp đồng theo nghiệp vụ chuyên viên");

        Contract saved = contractRepository.save(contract);
        issueOrUpdateInsuranceCard(saved, "REVOKED");
        return toContractResponse(saved);
    }

    private void issueOrUpdateInsuranceCard(Contract contract, String cardStatus) {
        InsuranceCard card = insuranceCardRepository
                .findByContract_ContractId(contract.getContractId())
                .orElseGet(() -> InsuranceCard.builder()
                        .contract(contract)
                        .cardNumber("THE-BHXM-" + contract.getContractId() + "-" + LocalDate.now().getYear())
                        .build());

        card.setIssueDate(contract.getStartDate());
        card.setExpiryDate(contract.getEndDate());
        card.setStatus(cardStatus);
        card.setQrCodeData(String.format("BHXM|%s|%s|%s|%s",
                contract.getContractCode(),
                contract.getVehicle().getPlateNumber(),
                cardStatus,
                contract.getEndDate()));

        insuranceCardRepository.save(card);
    }

    private Staff getCurrentStaff() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) return null;
        return staffRepository.findByUser_Email(auth.getName()).orElse(null);
    }

    private ContractResponse toContractResponse(Contract c) {
        InsuranceCard card = insuranceCardRepository
                .findByContract_ContractId(c.getContractId())
                .orElse(null);

        return ContractResponse.builder()
                .contractId(c.getContractId())
                .contractCode(c.getContractCode())
                .userId(c.getUser().getUserId())
                .customerFullName(c.getUser().getFullName())
                .customerPhone(c.getUser().getPhone())
                .vehicleId(c.getVehicle().getVehicleId())
                .vehicleName(c.getVehicle().getVehicleName())
                .plateNumber(c.getVehicle().getPlateNumber())
                .packageId(c.getInsurancePackage().getPackageId())
                .packageName(c.getInsurancePackage().getPackageName())
                .startDate(c.getStartDate())
                .endDate(c.getEndDate())
                .premiumAmount(c.getPremiumAmount())
                .status(c.getStatus())
                .createdAt(c.getCreatedAt())
                .approvedAt(c.getApprovedAt())
                .cancelledAt(c.getCancelledAt())
                .cancelReason(c.getCancelReason())
                .cardNumber(card != null ? card.getCardNumber() : null)
                .qrCodeData(card != null ? card.getQrCodeData() : null)
                .build();
    }

    @Override
    public List<ContractResponse> getMyContracts() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(email).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        return contractRepository.findByUser_UserId(currentUser.getUserId()).stream()
                .map(this::toContractResponse).collect(Collectors.toList());
    }
}