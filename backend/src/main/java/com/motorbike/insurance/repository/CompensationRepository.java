package com.motorbike.insurance.repository;

import com.motorbike.insurance.entity.CompensationRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CompensationRepository extends JpaRepository<CompensationRequest, Integer> {

    List<CompensationRequest> findAllByStatus(String status);

    List<CompensationRequest> findByUser_UserId(Integer userId);

    Optional<CompensationRequest> findFirstByUser_UserIdAndContract_ContractIdAndStatus(
            Integer userId, Integer contractId, String status);
}