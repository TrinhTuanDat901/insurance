// File: src/main/java/com/motorbike/insurance/repository/PunishmentRepository.java
package com.motorbike.insurance.repository;

import com.motorbike.insurance.entity.Punishment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PunishmentRepository extends JpaRepository<Punishment, Integer> {
    List<Punishment> findByUser_UserId(Integer userId);
}