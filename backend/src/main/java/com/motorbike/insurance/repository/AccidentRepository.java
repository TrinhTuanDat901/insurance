package com.motorbike.insurance.repository;

import com.motorbike.insurance.entity.Accident;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AccidentRepository extends JpaRepository<Accident, Integer> {
    List<Accident> findByContract_ContractId(Integer contractId);
}