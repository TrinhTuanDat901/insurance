package com.motorbike.insurance.repository;

import com.motorbike.insurance.entity.InsurancePackage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InsurancePackageRepository extends JpaRepository<InsurancePackage, Integer> {
}