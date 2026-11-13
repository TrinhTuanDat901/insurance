package com.motorbike.insurance.repository;

import com.motorbike.insurance.entity.Brand;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BrandRepository extends JpaRepository<Brand, Integer> {
}
