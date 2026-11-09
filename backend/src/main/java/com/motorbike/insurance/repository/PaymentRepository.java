package com.motorbike.insurance.repository;

import com.motorbike.insurance.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Integer> {
    List<Payment> findByContract_ContractId(Integer contractId);
}