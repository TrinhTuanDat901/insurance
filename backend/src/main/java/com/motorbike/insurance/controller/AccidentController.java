package com.motorbike.insurance.controller;

import com.motorbike.insurance.dto.response.ApiResponse;
import com.motorbike.insurance.entity.Accident;
import com.motorbike.insurance.entity.Contract;
import com.motorbike.insurance.entity.User;
import com.motorbike.insurance.exception.AppException;
import com.motorbike.insurance.exception.ErrorCode;
import com.motorbike.insurance.repository.AccidentRepository;
import com.motorbike.insurance.repository.ContractRepository;
import com.motorbike.insurance.repository.UserRepository;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/accidents")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AccidentController {

    AccidentRepository accidentRepository;
    ContractRepository contractRepository;
    UserRepository userRepository;

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class AccidentPayload {
        Integer contractId;
        LocalDateTime accidentDate;
        String location;
        String description;
    }

    @PostMapping("/report")
    @Transactional
    public ApiResponse<Accident> reportAccident(@RequestBody AccidentPayload request) {
        User currentUser = getCurrentUser();
        Contract contract = contractRepository.findById(request.getContractId())
                .orElseThrow(() -> new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION));

        if (!contract.getUser().getUserId().equals(currentUser.getUserId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        Accident accident = Accident.builder()
                .contract(contract)
                .accidentDate(request.getAccidentDate() != null ? request.getAccidentDate() : LocalDateTime.now())
                .location(request.getLocation())
                .description(request.getDescription())
                .status("REPORTED")
                .reportedAt(LocalDateTime.now())
                .build();

        return ApiResponse.<Accident>builder()
                .code(1000)
                .result(accidentRepository.save(accident))
                .message("Accident reported successfully")
                .build();
    }

    @PutMapping("/update/{accidentId}")
    @Transactional
    public ApiResponse<Accident> updateAccident(
            @PathVariable Integer accidentId,
            @RequestBody AccidentPayload request) {
        User currentUser = getCurrentUser();
        Accident accident = accidentRepository.findById(accidentId)
                .orElseThrow(() -> new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION));

        if (!accident.getContract().getUser().getUserId().equals(currentUser.getUserId())
                || !"REPORTED".equalsIgnoreCase(accident.getStatus())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        if (request.getAccidentDate() != null) accident.setAccidentDate(request.getAccidentDate());
        if (request.getLocation() != null) accident.setLocation(request.getLocation());
        if (request.getDescription() != null) accident.setDescription(request.getDescription());

        return ApiResponse.<Accident>builder()
                .code(1000)
                .result(accidentRepository.save(accident))
                .message("Accident updated successfully")
                .build();
    }

    @DeleteMapping("/{accidentId}")
    @Transactional
    public ApiResponse<Void> deleteAccident(@PathVariable Integer accidentId) {
        User currentUser = getCurrentUser();
        Accident accident = accidentRepository.findById(accidentId)
                .orElseThrow(() -> new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION));

        if (!accident.getContract().getUser().getUserId().equals(currentUser.getUserId())
                || !"REPORTED".equalsIgnoreCase(accident.getStatus())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        accidentRepository.delete(accident);
        return ApiResponse.<Void>builder()
                .code(1000)
                .message("Accident deleted successfully")
                .build();
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
    }
}