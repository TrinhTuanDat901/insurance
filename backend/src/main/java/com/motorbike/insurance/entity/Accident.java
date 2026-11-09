package com.motorbike.insurance.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import java.time.LocalDateTime;

@Entity
@Table(name = "accidents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Accident {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "accident_id")
    Integer accidentId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "contract_id", nullable = false)
    Contract contract;

    @Column(name = "accident_date", nullable = false)
    LocalDateTime accidentDate;

    @Column(name = "location", length = 255)
    String location;

    @Column(name = "description", length = 500)
    String description;

    // CHECK (status IN ('REPORTED','UNDER_REVIEW','RESOLVED','REJECTED'))
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    String status = "REPORTED";

    @Column(name = "reported_at", nullable = false)
    @Builder.Default
    LocalDateTime reportedAt = LocalDateTime.now();
}