package com.motorbike.insurance.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import java.time.LocalDate;

@Entity
@Table(name = "insurance_cards")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class InsuranceCard {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "card_id")
    Integer cardId;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "contract_id", nullable = false, unique = true)
    Contract contract;

    @Column(name = "card_number", nullable = false, unique = true, length = 30)
    String cardNumber;

    @Column(name = "issue_date", nullable = false)
    LocalDate issueDate;

    @Column(name = "expiry_date", nullable = false)
    LocalDate expiryDate;

    // CHECK (status IN ('VALID','EXPIRED','REVOKED'))
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    String status = "VALID";

    @Column(name = "qr_code_data", length = 255)
    String qrCodeData;
}