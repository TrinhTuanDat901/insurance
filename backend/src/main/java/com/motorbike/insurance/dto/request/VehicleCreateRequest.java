package com.motorbike.insurance.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class VehicleCreateRequest {
    String vehicleName;
    String plateNumber;
    Integer brandId;
    Integer categoryId;
    String engineNumber;
    String chassisNumber;
    Short manufactureYear;
}