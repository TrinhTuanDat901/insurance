package com.motorbike.insurance.repository;

import com.motorbike.insurance.entity.InsuranceCard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface InsuranceCardRepository extends JpaRepository<InsuranceCard, Integer> {
    Optional<InsuranceCard> findByContract_ContractId(Integer contractId);
}