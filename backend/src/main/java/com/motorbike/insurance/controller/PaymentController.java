package com.motorbike.insurance.controller;

import com.motorbike.insurance.dto.response.ApiResponse;
import com.motorbike.insurance.entity.Contract;
import com.motorbike.insurance.entity.Payment;
import com.motorbike.insurance.entity.User;
import com.motorbike.insurance.exception.AppException;
import com.motorbike.insurance.exception.ErrorCode;
import com.motorbike.insurance.repository.ContractRepository;
import com.motorbike.insurance.repository.PaymentRepository;
import com.motorbike.insurance.repository.UserRepository;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.UUID;

@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PaymentController {

    PaymentRepository paymentRepository;
    ContractRepository contractRepository;
    UserRepository userRepository;

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class PaymentCreateRequest {
        Integer contractId;
        String paymentMethod;
    }

    @PostMapping("/create")
    @Transactional
    public ApiResponse<Payment> createPayment(@RequestBody PaymentCreateRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        Contract contract = contractRepository.findById(request.getContractId())
                .orElseThrow(() -> new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION));

        if (!contract.getUser().getUserId().equals(currentUser.getUserId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        // Lấy trực tiếp premium_amount từ Contract trên Server (không tin số tiền từ client)
        Payment payment = Payment.builder()
                .contract(contract)
                .amount(contract.getPremiumAmount())
                .paymentDate(LocalDateTime.now())
                .paymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : "BANK_TRANSFER")
                .status("SUCCESS")
                .transactionRef("PAY-" + contract.getContractId() + "-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase())
                .build();

        return ApiResponse.<Payment>builder()
                .code(1000)
                .result(paymentRepository.save(payment))
                .message("Payment recorded successfully")
                .build();
    }
}