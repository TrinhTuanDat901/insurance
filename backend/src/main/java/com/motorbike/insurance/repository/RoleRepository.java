package com.motorbike.insurance.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.motorbike.insurance.entity.Role;

@Repository
public interface RoleRepository extends JpaRepository<Role, String> {

}
