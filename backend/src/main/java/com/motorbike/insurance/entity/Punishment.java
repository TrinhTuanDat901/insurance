// File: src/main/java/com/motorbike/insurance/entity/Punishment.java
package com.motorbike.insurance.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "punishments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Punishment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "punishment_id")
    Integer punishmentId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "contract_id")
    Contract contract;

    @Column(name = "punishment_date", nullable = false)
    LocalDate punishmentDate;

    @Column(name = "reason", nullable = false, length = 255)
    String reason;

    @Column(name = "fine_amount", precision = 14, scale = 2)
    BigDecimal fineAmount;

    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    String status = "OPEN";

    @Column(name = "resolved_at")
    LocalDateTime resolvedAt;
}