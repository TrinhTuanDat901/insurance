package com.motorbike.insurance.repository;

import com.motorbike.insurance.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<Category, Integer> {
}
