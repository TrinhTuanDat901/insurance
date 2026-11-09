package com.motorbike.insurance.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = "roles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class Role {

    @Id
    @Column(name = "role_name")
    String roleName;

    @Column(name = "role_description", nullable = false, unique = true)
    String roleDescription;
}
