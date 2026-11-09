package com.motorbike.insurance.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import java.math.BigDecimal;

@Entity
@Table(name = "insurance_packages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class InsurancePackage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "package_id")
    Integer packageId;

    @Column(name = "package_name", nullable = false, length = 100)
    String packageName;

    @Column(name = "description", length = 500)
    String description;

    @Column(name = "price", nullable = false, precision = 14, scale = 2)
    BigDecimal price;

    @Column(name = "duration_months", nullable = false)
    Short durationMonths;

    @Column(name = "coverage_amount", nullable = false, precision = 14, scale = 2)
    BigDecimal coverageAmount;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    Boolean isActive = true;
}