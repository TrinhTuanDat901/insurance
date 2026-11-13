package com.motorbike.insurance.service.implement;

import com.motorbike.insurance.dto.mapper.UserMapper;
import com.motorbike.insurance.dto.request.RegisterRequest;
import com.motorbike.insurance.dto.request.UpdateRequest;
import com.motorbike.insurance.dto.response.UserHistoryResponse;
import com.motorbike.insurance.dto.response.UserResponse;
import com.motorbike.insurance.entity.Contract;
import com.motorbike.insurance.entity.Role;
import com.motorbike.insurance.exception.AppException;
import com.motorbike.insurance.exception.ErrorCode;
import com.motorbike.insurance.repository.*;
import com.motorbike.insurance.entity.User;

import com.motorbike.insurance.service.IUserService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserService implements IUserService {

    UserRepository userRepository;
    RoleRepository roleRepository;
    UserMapper userMapper;
    PasswordEncoder passwordEncoder;
    ContractRepository contractRepository;
    PaymentRepository paymentRepository;
    AccidentRepository accidentRepository;
    PunishmentRepository punishmentRepository;
    CompensationRepository compensationRepository;

    // create user
    @Override
    public Optional<UserResponse> register(RegisterRequest request) {
       if(userRepository.existsByEmail(request.getEmail())) {
           throw new AppException(ErrorCode.EMAIL_EXISTED);
       }

       User user = userMapper.toUser(request);
        // 123456
       String hashedPass = passwordEncoder.encode(user.getPassword());
       user.setPassword(hashedPass);
       Role userRole = roleRepository.findById("USER")
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));

       user.setRoles(Set.of(userRole));
       User savedUser = userRepository.save(user);

       if(savedUser != null) {
           UserResponse response = userMapper.toUserResponse(savedUser);
           return Optional.of(response);
       }
       return Optional.empty();
    }

    //update user info
    @Override
    public Optional<UserResponse> update(Integer userId, UpdateRequest request) {
        Optional<User> existsUser = userRepository.findById(userId);
        if(existsUser.isPresent()) {
            User user = existsUser.get();
            user.setFirstName(request.getFirstName());
            user.setLastName(request.getLastName());
            user.setEmail(request.getEmail());
            user.setPhone(request.getPhone());

            User updatedUser = userRepository.save(user);
            return Optional.of(userMapper.toUserResponse(updatedUser));
        }
        throw new AppException(ErrorCode.USER_NOT_FOUND);
    }

    // get user info by id
    @Override
    //@PostAuthorize("returnObject.email == authentication.name")
    public Optional<UserResponse> getById(Integer userId) {
        Optional<User> user = userRepository.findById(userId);
        if(user.isPresent()) {
            return Optional.of(userMapper.toUserResponse(user.get()));
        }
        throw new AppException(ErrorCode.USER_NOT_FOUND);
    }

    // get all users
    @Override
    @PreAuthorize("hasRole('STAFF')")
    public List<UserResponse> getAllUsersExceptStaff() {
        List<User> users = userRepository.findAll();

        if (users.isEmpty()) throw new AppException(ErrorCode.USER_NOT_FOUND);

        return users.stream()
                .filter(user -> !user.getRoles().stream().anyMatch(role -> "STAFF".equals(role.getRoleName())))
                .map(userMapper::toUserResponse)
                .collect(Collectors.toList());
    }

    //delete user by id
    @Override
    @PreAuthorize("hasRole('STAFF')")
    public void deleteUser(Integer userId) {
        userRepository.deleteById(userId);
    }

    @Override
    public UserResponse getMyInfo() {
        String email = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        return userMapper.toUserResponse(user);
    }

    @Override
    public UserHistoryResponse getMyHistory() {
        User currentUser = userRepository.findByEmail(
                SecurityContextHolder.getContext().getAuthentication().getName()
        ).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        return getUserHistory(currentUser.getUserId());
    }

    @Override
    public UserHistoryResponse getUserHistory(Integer userId) {
        List<Contract> userContracts = contractRepository.findByUser_UserId(userId);

        var contractItems = userContracts.stream()
                .map(c -> UserHistoryResponse.ContractHistoryItem.builder()
                        .contractId(c.getContractId())
                        .contractCode(c.getContractCode())
                        .plateNumber(c.getVehicle().getPlateNumber())
                        .vehicleName(c.getVehicle().getVehicleName())
                        .packageName(c.getInsurancePackage().getPackageName())
                        .startDate(c.getStartDate())
                        .endDate(c.getEndDate())
                        .premiumAmount(c.getPremiumAmount())
                        .status(c.getStatus())
                        .build())
                .collect(Collectors.toList());

        var paymentItems = userContracts.stream()
                .flatMap(c -> paymentRepository.findByContract_ContractId(c.getContractId()).stream())
                .map(p -> UserHistoryResponse.PaymentHistoryItem.builder()
                        .paymentId(p.getPaymentId())
                        .contractCode(p.getContract().getContractCode())
                        .amount(p.getAmount())
                        .paymentDate(p.getPaymentDate())
                        .paymentMethod(p.getPaymentMethod())
                        .status(p.getStatus())
                        .transactionRef(p.getTransactionRef())
                        .build())
                .collect(Collectors.toList());

        var accidentItems = userContracts.stream()
                .flatMap(c -> accidentRepository.findByContract_ContractId(c.getContractId()).stream())
                .map(a -> UserHistoryResponse.AccidentHistoryItem.builder()
                        .accidentId(a.getAccidentId())
                        .contractCode(a.getContract().getContractCode())
                        .plateNumber(a.getContract().getVehicle().getPlateNumber())
                        .accidentDate(a.getAccidentDate())
                        .location(a.getLocation())
                        .description(a.getDescription())
                        .status(a.getStatus())
                        .build())
                .collect(Collectors.toList());

        var punishmentItems = punishmentRepository.findByUser_UserId(userId).stream()
                .map(pu -> UserHistoryResponse.PunishmentHistoryItem.builder()
                        .punishmentId(pu.getPunishmentId())
                        .contractCode(pu.getContract() != null ? pu.getContract().getContractCode() : "—")
                        .punishmentDate(pu.getPunishmentDate())
                        .reason(pu.getReason())
                        .fineAmount(pu.getFineAmount())
                        .status(pu.getStatus())
                        .build())
                .collect(Collectors.toList());

        var compensationItems = compensationRepository.findByUser_UserId(userId).stream()
                .map(cm -> UserHistoryResponse.CompensationHistoryItem.builder()
                        .compensationId(cm.getCompensationId())
                        .contractCode(cm.getContract().getContractCode())
                        .requestDate(cm.getRequestDate())
                        .requestedAmount(cm.getRequestedAmount())
                        .approvedAmount(cm.getApprovedAmount())
                        .description(cm.getDescription())
                        .status(cm.getStatus())
                        .build())
                .collect(Collectors.toList());

        return UserHistoryResponse.builder()
                .contracts(contractItems)
                .payments(paymentItems)
                .accidents(accidentItems)
                .punishments(punishmentItems)
                .compensations(compensationItems)
                .build();
    }
}
