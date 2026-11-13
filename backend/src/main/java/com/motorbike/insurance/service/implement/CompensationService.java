package com.motorbike.insurance.service.implement;

import com.motorbike.insurance.dto.request.CompensationDecisionRequest;
import com.motorbike.insurance.dto.response.CompensationResponse;
import com.motorbike.insurance.entity.*;
import com.motorbike.insurance.exception.AppException;
import com.motorbike.insurance.exception.ErrorCode;
import com.motorbike.insurance.repository.*;
import com.motorbike.insurance.service.ICompensationService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CompensationService implements ICompensationService {

    CompensationRepository compensationRepo;
    ContractRepository contractRepository;
    AccidentRepository accidentRepo;
    UserRepository userRepo;
    PaymentRepository paymentRepository;
    StaffRepository staffRepository;

    @Override
    public List<CompensationResponse> getMyCompensations() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepo.findByEmail(email).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        return compensationRepo.findByUser_UserId(currentUser.getUserId()).stream()
                .map(this::toCompensationResponse).collect(Collectors.toList());
    }

    //searchCompensationDetail(string status)
    @Override
    @PreAuthorize("hasRole('STAFF')")
    public List<CompensationResponse> getAllCompensation(String status) {
        List<CompensationRequest> list;
        if (status == null || status.isBlank() || "ALL".equalsIgnoreCase(status)) {
            list = compensationRepo.findAll();
        } else {
            list = compensationRepo.findAllByStatus(status.toUpperCase());
        }
        return list.stream()
                .map(this::toCompensationResponse)
                .collect(Collectors.toList());
    }

    //getCompensationDetail
    @Override
    public CompensationResponse getCompensationDetail(Integer compensationId) {
        CompensationRequest comp = compensationRepo.findById(compensationId)
                .orElseThrow(() -> new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION));
        return toCompensationResponse(comp);
    }

    //createCompensation
    @Override
    @Transactional
    public CompensationResponse createCompensation(CompensationDecisionRequest request) {
        User user = userRepo.findById(request.getUserId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        Contract contract = contractRepository.findById(request.getContractId())
                .orElseThrow(() -> new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION));

        Accident accident = null;
        if (request.getAccidentId() != null) {
            accident = accidentRepo.findById(request.getAccidentId()).orElse(null);
        }

        CompensationRequest comp = CompensationRequest.builder()
                .user(user)
                .contract(contract)
                .accident(accident)
                .requestDate(LocalDateTime.now())
                .requestedAmount(request.getRequestedAmount() != null ? request.getRequestedAmount() : BigDecimal.ZERO)
                .description(request.getDescription())
                .status("PENDING")
                .build();

        return toCompensationResponse(compensationRepo.save(comp));
    }

    //resolveCompensation(userId: int, contractId: int, status: string)
    //setStatus("APPROVED")
    //setApprovedAmount(amount: double)
    //Insert into payments with Value (amount = amount_approved, ...)
    @Override
    @Transactional
    @PreAuthorize("hasRole('STAFF')")
    public CompensationResponse resolveCompensation(Integer compensationId, CompensationDecisionRequest request) {
        CompensationRequest comp = findTargetCompensation(compensationId, request);

        // alt: getStatus("PENDING") != null
        if (!"PENDING".equalsIgnoreCase(comp.getStatus())) {
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
        }

        BigDecimal approvedAmt = request.getApprovedAmount() != null
                ? request.getApprovedAmount()
                : comp.getRequestedAmount();

        comp.setStatus("APPROVED");
        comp.setApprovedAmount(approvedAmt);
        if (request.getDescription() != null && !request.getDescription().isBlank()) {
            comp.setDescription(request.getDescription());
        }
        comp.setResolvedByStaff(getCurrentStaff());
        comp.setResolvedAt(LocalDateTime.now());

        CompensationRequest savedComp = compensationRepo.save(comp);

        // Insert into payments with Value (amount = amount_approved, ...)
        Payment payout = Payment.builder()
                .contract(comp.getContract())
                .amount(approvedAmt)
                .paymentDate(LocalDateTime.now())
                .paymentMethod("BANK_TRANSFER")
                .status("SUCCESS")
                .transactionRef("COMP-PAY-" + savedComp.getCompensationId() + "-"
                        + UUID.randomUUID().toString().substring(0, 6).toUpperCase())
                .build();
        paymentRepository.save(payout);

        return toCompensationResponse(savedComp);
    }

    //rejectCompensation
    @Override
    @Transactional
    @PreAuthorize("hasRole('STAFF')")
    public CompensationResponse rejectCompensation(Integer compensationId, CompensationDecisionRequest request) {
        CompensationRequest comp = findTargetCompensation(compensationId, request);

        if (!"PENDING".equalsIgnoreCase(comp.getStatus())) {
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
        }

        comp.setStatus("REJECTED");
        comp.setApprovedAmount(BigDecimal.ZERO);
        if (request.getDescription() != null && !request.getDescription().isBlank()) {
            comp.setDescription(request.getDescription());
        }
        comp.setResolvedByStaff(getCurrentStaff());
        comp.setResolvedAt(LocalDateTime.now());

        return toCompensationResponse(compensationRepo.save(comp));
    }

    // softDelete(): void
    @Override
    @Transactional
    @PreAuthorize("hasRole('STAFF')")
    public void softDelete(Integer compensationId) {
        CompensationRequest comp = compensationRepo.findById(compensationId)
                .orElseThrow(() -> new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION));
        comp.setStatus("REJECTED");
        comp.setResolvedAt(LocalDateTime.now());
        compensationRepo.save(comp);
    }

    private CompensationRequest findTargetCompensation(Integer compensationId, CompensationDecisionRequest request) {
        if (compensationId != null && compensationId > 0) {
            return compensationRepo.findById(compensationId)
                    .orElseThrow(() -> new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION));
        }
        if (request != null && request.getUserId() != null && request.getContractId() != null) {
            return compensationRepo
                    .findFirstByUser_UserIdAndContract_ContractIdAndStatus(
                            request.getUserId(), request.getContractId(), "PENDING")
                    .orElseThrow(() -> new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION));
        }
        throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
    }

    private Staff getCurrentStaff() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) return null;
        return staffRepository.findByUser_Email(auth.getName()).orElse(null);
    }

    private CompensationResponse toCompensationResponse(CompensationRequest c) {
        return CompensationResponse.builder()
                .compensationId(c.getCompensationId())
                .claimCode(String.format("BT-2026-%04d", c.getCompensationId()))
                .contractId(c.getContract().getContractId())
                .contractCode(c.getContract().getContractCode())
                .accidentId(c.getAccident() != null ? c.getAccident().getAccidentId() : null)
                .userId(c.getUser().getUserId())
                .customerFullName(c.getUser().getFullName())
                .customerPhone(c.getUser().getPhone())
                .plateNumber(c.getContract().getVehicle().getPlateNumber())
                .requestDate(c.getRequestDate())
                .requestedAmount(c.getRequestedAmount())
                .approvedAmount(c.getApprovedAmount())
                .description(c.getDescription())
                .status(c.getStatus())
                .resolvedByStaffId(c.getResolvedByStaff() != null ? c.getResolvedByStaff().getStaffId() : null)
                .resolvedAt(c.getResolvedAt())
                .build();
    }
}