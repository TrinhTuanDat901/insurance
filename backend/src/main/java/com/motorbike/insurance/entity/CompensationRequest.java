package com.motorbike.insurance.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "compensation_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CompensationRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "compensation_id")
    Integer compensationId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "contract_id", nullable = false)
    Contract contract;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "accident_id")
    Accident accident;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    User user;

    @Column(name = "request_date", nullable = false)
    @Builder.Default
    LocalDateTime requestDate = LocalDateTime.now();

    @Column(name = "requested_amount", nullable = false, precision = 14, scale = 2)
    BigDecimal requestedAmount;

    @Column(name = "approved_amount", precision = 14, scale = 2)
    BigDecimal approvedAmount;

    @Column(name = "description", length = 500)
    String description;

    // CHECK (status IN ('PENDING','APPROVED','REJECTED','PAID'))
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    String status = "PENDING";

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resolved_by_staff_id")
    Staff resolvedByStaff;

    @Column(name = "resolved_at")
    LocalDateTime resolvedAt;
}
