package com.motorbike.insurance.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "payment_id")
    Integer paymentId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "contract_id", nullable = false)
    Contract contract;

    @Column(name = "amount", nullable = false, precision = 14, scale = 2)
    BigDecimal amount;

    @Column(name = "payment_date", nullable = false)
    @Builder.Default
    LocalDateTime paymentDate = LocalDateTime.now();

    // CHECK (payment_method IN ('CASH','BANK_TRANSFER','CARD','E_WALLET'))
    @Column(name = "payment_method", nullable = false, length = 30)
    @Builder.Default
    String paymentMethod = "BANK_TRANSFER";

    // CHECK (status IN ('SUCCESS','FAILED','REFUNDED'))
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    String status = "SUCCESS";

    @Column(name = "transaction_ref", length = 100)
    String transactionRef;
}