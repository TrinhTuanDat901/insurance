package com.motorbike.insurance.repository;

import com.motorbike.insurance.entity.Contract;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface ContractRepository extends JpaRepository<Contract, Integer> {

    List<Contract> findByUser_UserId(Integer userId);

    List<Contract> findByStatus(String status);

    Optional<Contract> findByContractIdAndStatus(Integer contractId, String status);

    // Tương ứng với hàm +calculateFee(): double trên ContractRepository trong Class Diagram
    @Query("SELECT p.price FROM InsurancePackage p WHERE p.packageId = :packageId")
    BigDecimal calculateFee(@Param("packageId") Integer packageId);
}